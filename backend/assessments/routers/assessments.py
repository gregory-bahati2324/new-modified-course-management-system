from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from schemas.assessments import AssessmentCreate, AssessmentResponse
from crud.assessments import create_assessment, get_assessments_for_instructor, get_assessment, update_assessment
from utils.auth import require_role

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
    assessment = update_assessment(db, assessment_id, instructor_id, data.dict())
    if not assessment:
        raise HTTPException(status_code=404, detail="Assessment not found")
    return assessment
