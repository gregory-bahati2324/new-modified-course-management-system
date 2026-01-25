from fastapi import APIRouter, Depends, HTTPException
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
    get_course_lessons_progress
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


router = APIRouter(prefix="/progress", tags=["Progress"])


# -----------------------------
# LESSON ENDPOINTS
# -----------------------------

@router.post("/lessons/{lesson_id}/start")
def start_lesson_route(
    lesson_id: str,
    db: Session = Depends(get_db),
    student_id: str = "demo-student",
    course_id: str = "demo-course",
    module_id: str = "demo-module"
):
    return start_lesson(
        db, student_id, course_id, module_id, lesson_id
    )


@router.post("/lessons/{lesson_id}/complete", response_model=LessonProgressResponse)
def complete_lesson_route(
    lesson_id: str,
    data: LessonProgressCreate,
    db: Session = Depends(get_db),
    current_user: TokenData = Depends(get_current_user_token),
):
    student_id = current_user.sub

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

    recalculate_course_progress(
        db=db,
        student_id=student_id,
        course_id=data.course_id,
        total_modules=total_modules_course,
        total_lessons=total_lessons_course,
        #assessment_required=data.assessment_required
    )

    return progress



@router.delete("/lessons/{lesson_id}/reset")
def reset_lesson_route(
    lesson_id: str,
    db: Session = Depends(get_db),
    student_id: str = get_current_user_token
):
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
    student_id: str = get_current_user_token
):
    progress = get_module_progress(db, student_id, module_id)
    if not progress:
        raise HTTPException(404, "Module progress not found")
    return progress


# -----------------------------
# COURSE ENDPOINTS
# -----------------------------

@router.get("/courses/{course_id}", response_model=CourseProgressResponse)
def get_course_progress_route(
    course_id: str,
    db: Session = Depends(get_db),
    current_user: TokenData = Depends(get_current_user_token)
):
    student_id = current_user.sub

    progress = get_course_progress(db, student_id, course_id)

    if not progress:
        return {
            "course_id": course_id,
            "completed_modules": 0,
            "total_modules": 0,
            "completed_lessons": 0,
            "total_lessons": 0,
            "progress_percentage": 0,
            "is_completed": False,
            "last_accessed_at": None
        }

    return progress

        
        
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
        

    
