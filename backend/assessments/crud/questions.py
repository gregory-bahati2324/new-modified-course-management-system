# crud/questions.py
from sqlalchemy.orm import Session
from models.assessments import Question, Assessment
from schemas.assessments import QuestionCreate, QuestionUpdate
from typing import List, Dict, Any

def create_question(db: Session, assessment_id: int, q: QuestionCreate) -> Question:
    question = Question(
        assessment_id=assessment_id,
        type=q.type,
        question_text=q.question_text,
        points=q.points or 1,
        options=q.options,
        correct_answer=q.correct_answer,
        model_answer=q.model_answer,
        test_cases=q.test_cases,
        reference_file=q.reference_file,
        matching_pairs=q.matching_pairs,
        correct_order=q.correct_order
    )
    db.add(question)
    db.commit()
    db.refresh(question)
    return question

def get_question(db: Session, question_id: int) -> Question | None:
    return db.query(Question).filter(Question.id == question_id).first()

def update_question(db: Session, question_id: int, qdata: Dict[str, Any]) -> Question | None:
    question = get_question(db, question_id)
    if not question:
        return None
    for key, val in qdata.items():
        # only set attributes that exist in model
        if hasattr(question, key) and val is not None:
            setattr(question, key, val)
    db.commit()
    db.refresh(question)
    return question

def delete_question(db: Session, question_id: int) -> bool:
    question = get_question(db, question_id)
    if not question:
        return False
    db.delete(question)
    db.commit()
    return True

def list_questions_for_assessment(db: Session, assessment_id: int) -> List[Question]:
    return db.query(Question).filter(Question.assessment_id == assessment_id).all()

def sync_questions_for_assessment(db: Session, assessment_id: int, questions: List[QuestionUpdate]) -> List[Question]:
    """
    Synchronize questions for an assessment:
     - If an item has id -> update that question
     - If no id -> create new question
     - Any existing DB questions not listed -> delete
    Returns the resulting list of Question ORM objects.
    """
    # load existing
    existing = db.query(Question).filter(Question.assessment_id == assessment_id).all()
    existing_by_id = {q.id: q for q in existing}

    incoming_ids = set()
    result = []

    # process incoming: update or create
    for q in questions or []:
        if getattr(q, "id", None):
            incoming_ids.add(q.id)
            qobj = existing_by_id.get(q.id)
            if qobj:
                # update fields
                update_fields = q.dict(exclude_unset=True, exclude={"id"})
                for k, v in update_fields.items():
                    if hasattr(qobj, k):
                        setattr(qobj, k, v)
                result.append(qobj)
            else:
                # incoming referenced id not found -> ignore or create new
                # here we create new without id
                new_q = Question(
                    assessment_id=assessment_id,
                    type=q.type,
                    question_text=q.question_text,
                    points=q.points or 1,
                    options=q.options,
                    correct_answer=q.correct_answer,
                    model_answer=q.model_answer,
                    test_cases=q.test_cases,
                    reference_file=q.reference_file,
                    matching_pairs=q.matching_pairs,
                    correct_order=q.correct_order
                )
                db.add(new_q)
                db.flush()  # ensure id assigned
                result.append(new_q)
        else:
            # new question
            new_q = Question(
                assessment_id=assessment_id,
                type=q.type,
                question_text=q.question_text,
                points=q.points or 1,
                options=q.options,
                correct_answer=q.correct_answer,
                model_answer=q.model_answer,
                test_cases=q.test_cases,
                reference_file=q.reference_file,
                matching_pairs=q.matching_pairs,
                correct_order=q.correct_order
            )
            db.add(new_q)
            db.flush()
            result.append(new_q)

    # delete DB questions that were not present in incoming list
    to_delete = [q for q in existing if q.id not in incoming_ids]
    for q in to_delete:
        db.delete(q)

    db.commit()

    # refresh results
    final = db.query(Question).filter(Question.assessment_id == assessment_id).all()
    return final
