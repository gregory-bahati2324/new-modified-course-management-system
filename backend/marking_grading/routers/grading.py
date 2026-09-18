from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from database import get_db
from utils.auth import get_current_user_token

from schemas.grading import (
    AssignmentGradeCreate,
    AssignmentGradeResponse,
    AssessmentGradeCreate,
    AssessmentGradeResponse
)

from crud.grading import (
    get_assessment_grade_for_student,
    upsert_assignment_grade,
    get_assignment_grade,
    upsert_assessment_grade,
    get_assessment_grade,
    get_assignment_grade_for_student
)

from services.aggregator import (
    get_student_submission_details,
    get_submission_details
)
from services.notification_client import send_notification_event

router = APIRouter()

# -----------------------------
# DASHBOARD
# -----------------------------
@router.get("/dashboard")
def grading_dashboard(
    token=Depends(get_current_user_token),
    credentials: HTTPAuthorizationCredentials = Depends(HTTPBearer())
):
    raw_token = credentials.credentials
    return get_student_submission_details(raw_token)


# -----------------------------
# SUBMISSION DETAILS
# -----------------------------
@router.get("/submissions/{submission_id}")
def submission_details(
    submission_id: str,
    submission_type: str,
    token: str = Depends(get_current_user_token),
    credentials: HTTPAuthorizationCredentials = Depends(HTTPBearer())
):
    raw_token = credentials.credentials
    return get_submission_details(raw_token, submission_id, submission_type)


# -----------------------------
# ASSIGNMENT GRADING
# -----------------------------
@router.post("/assignments/grade", response_model=AssignmentGradeResponse)
def grade_assignment(
    payload: AssignmentGradeCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    token=Depends(get_current_user_token)
):
    instructor_id = token.sub

    grade = upsert_assignment_grade(
        db,
        payload.dict(),
        instructor_id
    )

    # ---- Notification: ASSIGNMENT_GRADED -> student (§7, §46) ----
    # Only when the instructor actually publishes the grade — an
    # unpublished/pending grade isn't visible to the student yet, so
    # notifying now would point them at something they can't see.
    if payload.is_published:
        background_tasks.add_task(
            send_notification_event,
            event_type="ASSIGNMENT_GRADED",
            source_service="marking_grading_service",
            recipient_ids=[payload.student_id],
            actor_id=instructor_id,
            entity_type="assignment_grade",
            entity_id=grade.id,
            course_id=payload.course_id,
            title="Assignment graded",
            message=f"Your assignment has been graded: {payload.score}/{payload.max_score}.",
            action_url="/student/grades",
            priority="HIGH",
        )

    return grade


@router.get("/assignments/{submission_id}/grade")
def get_assignment_grade_route(
    submission_id: str,
    db: Session = Depends(get_db)
):
    grade = get_assignment_grade_for_student(db, submission_id)

    if not grade:
        raise HTTPException(status_code=404, detail="Grade not found")

    return grade


# -----------------------------
# ASSESSMENT GRADING
# -----------------------------
@router.post("/assessments/grade", response_model=AssessmentGradeResponse)
def grade_assessment(
    payload: AssessmentGradeCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    token=Depends(get_current_user_token)
):
    instructor_id = token.sub

    grade = upsert_assessment_grade(
        db,
        payload.dict(),
        instructor_id
    )

    # ---- Notification: ASSESSMENT_GRADED -> student (§7, §46) ----
    if payload.is_published:
        background_tasks.add_task(
            send_notification_event,
            event_type="ASSESSMENT_GRADED",
            source_service="marking_grading_service",
            recipient_ids=[payload.student_id],
            actor_id=instructor_id,
            entity_type="assessment_grade",
            entity_id=grade.id,
            course_id=payload.course_id,
            title="Exam result published",
            message=f"Your exam has been graded: {payload.score}/{payload.max_score}.",
            action_url="/student/exam-history",
            priority="HIGH",
        )

    return grade


@router.get("/assessments/{attempt_id}/grade", response_model=AssessmentGradeResponse)
def get_assessment_grade_route(
    attempt_id: str,
    db: Session = Depends(get_db)
):
    grade = get_assessment_grade(db, attempt_id)

    if not grade:
        raise HTTPException(status_code=404, detail="Grade not found")

    return grade

@router.get("/grading/assessments/{attempt_id}/grade", response_model=AssessmentGradeResponse)
def get_assessment_grade_route(
    attempt_id: int,
    student_id: str,
    db: Session = Depends(get_db)
):
    grade = get_assessment_grade_for_student(db, attempt_id)

    if not grade:
        raise HTTPException(status_code=404, detail="Grade not found")

    return grade