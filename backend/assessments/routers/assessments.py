from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from models.assessments import Question
from database import get_db
from schemas.assessments import AssessmentCreate, SaveProgressRequest,SubmitExamRequest, AssessmentResponse, StudentAssessmentResponse, ExamDetails
from crud.assessments import create_assessment,save_exam_progress, submit_exam, get_assessment_for_student, get_assessments_for_instructor, get_assessment, start_exam, update_assessment, get_assessments_for_courses
from crud.questions import list_questions_for_assessment
from utils.auth import require_role, get_current_user_token, security
from services.enrollment_client import get_student_enrollments, get_course_details
from services.assessment_status import calculate_student_status
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
            
        student_status = calculate_student_status(assessment)    

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
            "status": student_status,
            "course_title": course.get("title") if course else None,
            "course_code": course.get("code") if course else None,
            "instructor_name": course.get("instructor_name") if course else None,
            "created_at": assessment.created_at,
            "updated_at": assessment.updated_at,
        })

    return results
    

@router.get("/{assessment_id}/exam", response_model=ExamDetails)
def get_exam(
    assessment_id: int,
    db: Session = Depends(get_db),
    token = Depends(get_current_user_token)
):

    assessment = get_assessment_for_student(db, assessment_id)

    if not assessment:
        raise HTTPException(404)

    questions = list_questions_for_assessment(db, assessment_id)

    return {
        "id": assessment.id,
        "title": assessment.title,
        "time_limit": assessment.time_limit,
        "questions": questions
    }  
    
    
@router.post("/{assessment_id}/start")
def start_exam_route(
    assessment_id: int,
    db: Session = Depends(get_db),
    token = Depends(get_current_user_token)
):

    student_id = token.sub

    attempt = start_exam(db, student_id, assessment_id)

    return {"attempt_id": attempt.id}   


@router.post("/attempts/save")
def save_progress_route(
    data: SaveProgressRequest,
    db: Session = Depends(get_db),
    token = Depends(get_current_user_token)
):
    save_exam_progress(
        db,
        data.attempt_id,
        token.sub,  # 🔥 ADD THIS
        [a.dict() for a in data.answers]
    )

    return {"message": "Progress saved"}

@router.post("/attempts/submit")
def submit_exam_route(
    data: SubmitExamRequest,
    db: Session = Depends(get_db),
    token = Depends(get_current_user_token)
):

    attempt = submit_exam(
        db,
        data.attempt_id,
        token.sub, 
        [a.dict() for a in data.answers],
        data.time_taken
    )

    return {
        "message": "Exam submitted successfully",
        "attempt_id": attempt.id,
        "status": attempt.status,
        "submitted_at": attempt.submitted_at
    }