from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from schemas.assessments import AssessmentCreate, AssessmentResponse, StudentAssessmentResponse
from crud.assessments import create_assessment, get_assessments_for_instructor, get_assessment, update_assessment, get_assessments_for_courses
from utils.auth import require_role, get_current_user_token, security
from services.enrollment_client import get_student_enrollments, get_course_details
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

router = APIRouter(prefix="/assessments", tags=["Assessments"])

get_current_instructor = require_role(["instructor", "admin"])

@router.post("", response_model=AssessmentResponse)
def create_assessment_route(
    data: AssessmentCreate,
    db: Session = Depends(get_db),
    token_data = Depends(get_current_instructor)
):
    instructor_id = token_data.sub
    return create_assessment(db, data, instructor_id)

@router.get("", response_model=list[AssessmentResponse])
def get_instructor_assessments(
    db: Session = Depends(get_db),
    token_data = Depends(get_current_instructor)
):
    instructor_id = token_data.sub
    return get_assessments_for_instructor(db, instructor_id)

@router.get("/{assessment_id}", response_model=AssessmentResponse)
def get_assessment_route(
    assessment_id: int,
    db: Session = Depends(get_db),
    token_data = Depends(get_current_instructor)
):
    instructor_id = token_data.sub
    assessment = get_assessment(db, assessment_id, instructor_id)
    if not assessment:
        raise HTTPException(status_code=404, detail="Assessment not found")
    return assessment

@router.put("/{assessment_id}", response_model=AssessmentResponse)
def update_assessment_route(
    assessment_id: int,
    data: AssessmentCreate,
    db: Session = Depends(get_db),
    token_data = Depends(get_current_instructor)
):
    instructor_id = token_data.sub
    assessment = update_assessment(db, assessment_id, instructor_id, data)

    if not assessment:
        raise HTTPException(status_code=404, detail="Assessment not found")

    return assessment

"""@router.get("/student", response_model=list[StudentAssessmentResponse])
def get_student_assessments(
    db: Session = Depends(get_db),
    token_data = Depends(get_current_user_token),
    credentials: HTTPAuthorizationCredentials = Depends(HTTPBearer())
):
    raw_token = credentials.credentials
    print("ROLE:", token_data.role)

    
    enrollments = get_student_enrollments(raw_token)

    if not enrollments:
        return []

    course_ids = [e["course_id"] for e in enrollments]
    assessments = get_assessments_for_courses(db, course_ids)

    results = []

    for assessment in assessments:
        try:
            course = get_course_details(
                assessment.course_id,
                raw_token
            )
        except Exception:
            course = None

        results.append({
            "id": assessment.id,
            "title": assessment.title,
            "type": assessment.type,
            "description": assessment.description,
            "course_id": assessment.course_id,
            "instructor_id": assessment.instructor_id,
            "due_date": assessment.due_date,
            "time_limit": assessment.time_limit,
            "attempts": assessment.attempts,
            "passing_score": assessment.passing_score,
            "shuffle_questions": assessment.shuffle_questions,
            "show_answers": assessment.show_answers,
            "status": assessment.status,
            "course_title": course.get("title") if course else None,
            "course_code": course.get("code") if course else None,
            "instructor_name": course.get("instructor_name") if course else None,
            "created_at": assessment.created_at,
            "updated_at": assessment.updated_at,
        })

    return results"""
    
    
@router.get("/students/asess", response_model=list[StudentAssessmentResponse])
def get_student_assessments_for_course(
    db: Session = Depends(get_db),
    token_data = Depends(get_current_user_token),
    credentials: HTTPAuthorizationCredentials = Depends(HTTPBearer())
):
    """
    Return all published assessments for a single course.
    No external service calls; only uses the assessments table.
    """
    raw_token = credentials.credentials
    enrollments = get_student_enrollments(raw_token)
    
    if not enrollments:
        return []

    course_ids = [e["course_id"] for e in enrollments]
    
    assessments = get_assessments_for_courses(db, course_ids)  # reuse CRUD function

    results = []

    for assessment in assessments:
        
        try:
            course = get_course_details(
                assessment.course_id,
                raw_token
            )
        except Exception:
            course = None

        results.append({
            "id": assessment.id,
            "title": assessment.title,
            "type": assessment.type,
            "description": assessment.description,
            "course_id": assessment.course_id,
            "instructor_id": assessment.instructor_id,
            "due_date": assessment.due_date,
            "time_limit": assessment.time_limit,
            "attempts": assessment.attempts,
            "passing_score": assessment.passing_score,
            "shuffle_questions": assessment.shuffle_questions,
            "show_answers": assessment.show_answers,
            "status": assessment.status,
            "course_title": course.get("title") if course else None,
            "course_code": course.get("code") if course else None,
            "instructor_name": course.get("instructor_name") if course else None,
            "created_at": assessment.created_at,
            "updated_at": assessment.updated_at,
        })

    return results
    





