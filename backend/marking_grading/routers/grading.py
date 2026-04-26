from fastapi import APIRouter, Depends, HTTPException
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
    db: Session = Depends(get_db),
    token=Depends(get_current_user_token)
):
    instructor_id = token.sub

    return upsert_assignment_grade(
        db,
        payload.dict(),
        instructor_id
    )


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
    db: Session = Depends(get_db),
    token=Depends(get_current_user_token)
):
    instructor_id = token.sub

    return upsert_assessment_grade(
        db,
        payload.dict(),
        instructor_id
    )


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