# routers/questions.py
from fastapi import APIRouter, Depends, HTTPException, Path
from sqlalchemy.orm import Session
from database import get_db
from schemas.assessments import QuestionCreate, QuestionUpdate, QuestionResponse
from crud import questions as questions_crud
from utils.auth import require_role

router = APIRouter(prefix="/questions", tags=["Questions"])
get_current_instructor = require_role(["instructor", "admin"])

@router.post("/assessments/{assessment_id}", response_model=QuestionResponse)
def create_question_route(
    assessment_id: int,
    data: QuestionCreate,
    db: Session = Depends(get_db),
    token_data = Depends(get_current_instructor),
):
    # You could optionally verify instructor owns assessment
    q = questions_crud.create_question(db, assessment_id, data)
    return q

@router.get("/assessments/{assessment_id}", response_model=list[QuestionResponse])
def list_questions_route(
    assessment_id: int,
    db: Session = Depends(get_db),
    token_data = Depends(get_current_instructor),
):
    return questions_crud.list_questions_for_assessment(db, assessment_id)

@router.put("/{question_id}", response_model=QuestionResponse)
def update_question_route(
    question_id: int,
    data: QuestionUpdate,
    db: Session = Depends(get_db),
    token_data = Depends(get_current_instructor),
):
    updated = questions_crud.update_question(
    db,
    question_id,
    data.dict(exclude_unset=True)
)

    if not updated:
        raise HTTPException(status_code=404, detail="Question not found")
    return updated

@router.delete("/{question_id}", response_model=dict)
def delete_question_route(
    question_id: int,
    db: Session = Depends(get_db),
    token_data = Depends(get_current_instructor),
):
    ok = questions_crud.delete_question(db, question_id)
    if not ok:
        raise HTTPException(status_code=404, detail="Question not found")
    return {"ok": True}

# Sync endpoint (optional)
@router.post("/assessments/{assessment_id}/sync", response_model=list[QuestionResponse])
def sync_questions_route(
    assessment_id: int,
    questions: list[QuestionUpdate],
    db: Session = Depends(get_db),
    token_data = Depends(get_current_instructor),
):
    updated_list = questions_crud.sync_questions_for_assessment(db, assessment_id, questions)
    return updated_list
