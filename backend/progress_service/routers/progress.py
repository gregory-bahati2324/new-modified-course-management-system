from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session
from database import get_db
from auth_utils import get_current_user_token, TokenData
from schemas.progress import (
    LessonProgressCreate,
    LessonProgressResponse,
    ModuleProgressResponse,
    CourseProgressResponse
)
from crud.progress import (
    start_lesson,
    complete_lesson,
    reset_lesson_progress,
    get_module_progress,
    get_course_progress,
    get_course_lessons_progress,
    get_course_id_for_module
)
from services.calculator import (
    recalculate_module_progress,
    recalculate_course_progress
)

from services.course_stucture import (
    get_total_modules,
    get_total_lessons_in_course,
    get_total_lessons_in_module
)
from services.version_syc import sync_lesson_versions
from services.notification_client import send_notification_event

# Milestones worth telling a student about (§8) — deliberately NOT every
# percentage tick, only these four.
PROGRESS_MILESTONES = (25, 50, 75, 100)


router = APIRouter(prefix="/progress", tags=["Progress"])


# -----------------------------
# LESSON ENDPOINTS
# -----------------------------

@router.post("/lessons/{lesson_id}/start")
def start_lesson_route(
    lesson_id: str,
    db: Session = Depends(get_db),
    currentuser: TokenData = Depends(get_current_user_token),
    course_id: str = "demo-course",
    module_id: str = "demo-module"
):
    student_id = currentuser.sub
    return start_lesson(
        db, student_id, course_id, module_id, lesson_id
    )


@router.post("/lessons/{lesson_id}/complete", response_model=LessonProgressResponse)
def complete_lesson_route(
    lesson_id: str,
    data: LessonProgressCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: TokenData = Depends(get_current_user_token),
    credentials: HTTPAuthorizationCredentials = Depends(HTTPBearer()
    )):
    student_id = current_user.sub
    token = credentials.credentials

    sync_lesson_versions(db, student_id, data.course_id)

    progress = complete_lesson(
        db=db,
        student_id=student_id,
        course_id=data.course_id,
        module_id=data.module_id,
        lesson_id=lesson_id,
        quiz_score=data.quiz_score,
        time_spent_seconds=data.time_spent_seconds,
    )

    total_lessons_module = get_total_lessons_in_module(data.module_id)
    total_modules_course = get_total_modules(data.course_id)
    total_lessons_course = get_total_lessons_in_course(data.course_id)

    recalculate_module_progress(
        db=db,
        student_id=student_id,
        course_id=data.course_id,
        module_id=data.module_id,
        total_lessons=total_lessons_module
    )

    course_progress = recalculate_course_progress(
        db=db,
        student_id=student_id,
        course_id=data.course_id,
        total_modules=total_modules_course,
        total_lessons=total_lessons_course,
        token=token
    )

    # ---- Notification: COURSE_PROGRESS_MILESTONE / COURSE_COMPLETED (§8, §46) ----
    # Only fires from the "complete a lesson" action, not from every
    # course-progress page load (get_course_progress_route below also
    # calls recalculate_course_progress, but merely viewing progress
    # shouldn't generate a notification).
    old_pct = course_progress.previous_progress_percentage
    new_pct = course_progress.progress_percentage
    just_completed = course_progress.is_completed and not course_progress.was_completed

    if just_completed:
        background_tasks.add_task(
            send_notification_event,
            event_type="COURSE_COMPLETED",
            source_service="progress_service",
            recipient_ids=[student_id],
            entity_type="course",
            entity_id=data.course_id,
            course_id=data.course_id,
            title="Course completed!",
            message="Congratulations — you've completed the course.",
            action_url="/student/grades",
            priority="HIGH",
        )
    else:
        crossed = [m for m in PROGRESS_MILESTONES if old_pct < m <= new_pct]
        if crossed:
            milestone = max(crossed)
            background_tasks.add_task(
                send_notification_event,
                event_type="COURSE_PROGRESS_MILESTONE",
                source_service="progress_service",
                recipient_ids=[student_id],
                entity_type="course",
                entity_id=data.course_id,
                course_id=data.course_id,
                title="Progress milestone reached",
                message=f"You've reached {milestone}% course completion. Keep going!",
                action_url=f"/student/course/{data.course_id}/learn",
                data={"milestone": milestone},
            )

    return progress



@router.delete("/lessons/{lesson_id}/reset")
def reset_lesson_route(
    lesson_id: str,
    db: Session = Depends(get_db),
    current_user: TokenData = Depends(get_current_user_token)
):
    student_id = current_user.sub
    success = reset_lesson_progress(db, student_id, lesson_id)
    if not success:
        raise HTTPException(404, "Lesson progress not found")
    return {"message": "Lesson progress reset"}


# -----------------------------
# MODULE ENDPOINTS
# -----------------------------

@router.get("/modules/{module_id}", response_model=ModuleProgressResponse)
def get_module_progress_route(
    module_id: str,
    db: Session = Depends(get_db),
    current_user: TokenData = Depends(get_current_user_token),
):
    student_id = current_user.sub

    course_id = get_course_id_for_module(module_id)

    # 🔥 sync versions before recalculation
    sync_lesson_versions(db, student_id, course_id)

    total_lessons = get_total_lessons_in_module(module_id)

    recalculate_module_progress(
        db=db,
        student_id=student_id,
        course_id=course_id,
        module_id=module_id,
        total_lessons=total_lessons
    )

    progress = get_module_progress(db, student_id, module_id)

    if not progress:
        return {
            "module_id": module_id,
            "completed_lessons": 0,
            "total_lessons": total_lessons,
            "progress_percentage": 0,
            "is_completed": False,
            "assignment_required": None,
            "completed_at": None
        }

    return progress


# -----------------------------
# COURSE ENDPOINTS
# -----------------------------

@router.get("/courses/{course_id}", response_model=CourseProgressResponse)
def get_course_progress_route(
    course_id: str,
    db: Session = Depends(get_db),
    current_user: TokenData = Depends(get_current_user_token),
    credentials: HTTPAuthorizationCredentials = Depends(HTTPBearer())
):
    student_id = current_user.sub
    token = credentials.credentials

    # STEP 1: sync
    sync_lesson_versions(db, student_id, course_id)

    # STEP 2: structure
    total_modules = get_total_modules(course_id)
    total_lessons = get_total_lessons_in_course(course_id)

    # STEP 3: recalc
    recalculate_course_progress(
        db=db,
        student_id=student_id,
        course_id=course_id,
        total_modules=total_modules,
        total_lessons=total_lessons,
        token=token
    )

    # STEP 4: DB data
    progress = get_course_progress(db, student_id, course_id)

    # STEP 5: external data 🔥
    from services.calculator import evaluate_external_progress

    external = evaluate_external_progress(course_id, token)

    if not progress:
        return {
            "course_id": course_id,
            "completed_modules": 0,
            "total_modules": total_modules,
            "completed_lessons": 0,
            "total_lessons": total_lessons,
            "progress_percentage": 0,
            "is_completed": False,
            "last_accessed_at": None,

            "assignment_summary": external["assignment_summary"],
            "assessment_summary": external["assessment_summary"]
        }

    #  MERGE DB + EXTERNAL
    return {
        **progress.__dict__,
        "assignment_summary": external["assignment_summary"],
        "assessment_summary": external["assessment_summary"]
    }
        
@router.get(
    "/courses/{course_id}/lessons",
    response_model=list[LessonProgressResponse]
)
def get_course_lessons_progress_route(
    course_id: str,
    db: Session = Depends(get_db),
    student_id: TokenData = Depends(get_current_user_token)
):
    student_id = student_id.sub
    return get_course_lessons_progress(
        db=db,
        student_id=student_id,
        course_id=course_id
    )
        

    
