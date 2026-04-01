# crud/questions.py
from sqlalchemy.orm import Session
from fastapi import UploadFile
from models.assessments import Question
from schemas.assessments import QuestionCreate, QuestionUpdate
from typing import List, Dict, Any
import os
import shutil
import time

# ===============================
# CONFIG
# ===============================
UPLOAD_DIR = "uploads/questions"
BASE_FILE_URL = "/static/questions"

os.makedirs(UPLOAD_DIR, exist_ok=True)

# ===============================
# HELPERS
# ===============================
def attach_file_urls(question: Question) -> Question:
    if question.question_file:
        question.question_file_url = f"{BASE_FILE_URL}/{question.question_file}"
    else:
        question.question_file_url = None

    if question.answer_file:
        question.answer_file_url = f"{BASE_FILE_URL}/{question.answer_file}"
    else:
        question.answer_file_url = None

    return question

import os

def attach_file_urls_exam(q: Question):
    BASE_FILE_URL = os.getenv(
        "BASE_FILE_URL",
        "http://localhost:8003/static/questions"
    )

    return {
        "id": q.id,
        "type": q.type,
        "question_text": q.question_text,
        "points": q.points,
        "options": q.options,
        "matching_pairs": q.matching_pairs,
        "correct_order": q.correct_order,
        "test_cases": q.test_cases,

        # FILE URLS
        "question_file_url": f"{BASE_FILE_URL}/{q.question_file}" if q.question_file else None,
        "answer_file_url": f"{BASE_FILE_URL}/{q.answer_file}" if q.answer_file else None,
    }

def delete_physical_file(filename: str | None):
    if not filename:
        return
    path = os.path.join(UPLOAD_DIR, filename)
    if os.path.exists(path):
        os.remove(path)

# ===============================
# CRUD
# ===============================
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

            # ✅ NEW
            question_file=None,
            answer_file=None,

            matching_pairs=q.matching_pairs,
            correct_order=q.correct_order,
        )
    db.add(question)
    db.commit()
    db.refresh(question)
    return attach_file_urls(question)


def get_question(db: Session, question_id: int) -> Question | None:
    q = db.query(Question).filter(Question.id == question_id).first()
    return attach_file_urls(q) if q else None


def list_questions_for_assessment(db: Session, assessment_id: int):
    questions = db.query(Question).filter(
        Question.assessment_id == assessment_id
    ).all()
    return [attach_file_urls_exam(q) for q in questions]


def update_question(db: Session, question_id: int, qdata: Dict[str, Any]) -> Question | None:
    question = db.query(Question).filter(Question.id == question_id).first()
    if not question:
        return None

    for key, val in qdata.items():
        if hasattr(question, key) and val is not None:
            setattr(question, key, val)

    db.commit()
    db.refresh(question)
    return attach_file_urls(question)


def delete_question(db: Session, question_id: int) -> bool:
    """
    Deletes BOTH:
    - DB record
    - Uploaded file (if exists)
    """
    question = db.query(Question).filter(Question.id == question_id).first()
    if not question:
        return False

    delete_physical_file(question.question_file)
    delete_physical_file(question.answer_file)

    db.delete(question)
    db.commit()
    return True


def sync_questions_for_assessment(
    db: Session,
    assessment_id: int,
    questions: List[QuestionUpdate]
):
    """
    SAFE sync:
    - Updates existing
    - Creates new
    - Deletes missing (and files)
    """

    existing = db.query(Question).filter(
        Question.assessment_id == assessment_id
    ).all()

    existing_map = {q.id: q for q in existing}
    incoming_ids = set()
    results = []

    for q in questions or []:
        if q.id and q.id in existing_map:
            incoming_ids.add(q.id)
            obj = existing_map[q.id]

            for k, v in q.dict(exclude_unset=True, exclude={"id"}).items():
                setattr(obj, k, v)

            results.append(obj)

        else:
            new_q = Question(
                assessment_id=assessment_id,
                type=q.type,
                question_text=q.question_text,
                points=q.points or 1,
                options=q.options,
                correct_answer=q.correct_answer,
                model_answer=q.model_answer,
                test_cases=q.test_cases,
                reference_file=None,
                matching_pairs=q.matching_pairs,
                correct_order=q.correct_order,
            )
            db.add(new_q)
            db.flush()
            results.append(new_q)

    # Delete removed questions + files
    for q in existing:
        if q.id not in incoming_ids:
            delete_physical_file(q.question_file)
            delete_physical_file(q.answer_file)
            db.delete(q)

    db.commit()

    final = db.query(Question).filter(
        Question.assessment_id == assessment_id
    ).all()

    return [attach_file_urls(q) for q in final]


def upload_question_file(db: Session, question_id: int, file: UploadFile):
    question = db.query(Question).filter(Question.id == question_id).first()
    if not question:
        return None

    delete_physical_file(question.question_file)

    ext = os.path.splitext(file.filename)[1]
    filename = f"question_{question_id}_{int(time.time())}{ext}"
    file_path = os.path.join(UPLOAD_DIR, filename)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    question.question_file = filename  # ✅ CORRECT FIELD
    db.commit()
    db.refresh(question)

    return attach_file_urls(question)

def upload_answer_file(db: Session, question_id: int, file: UploadFile):
    question = db.query(Question).filter(Question.id == question_id).first()
    if not question:
        return None

    delete_physical_file(question.answer_file)

    ext = os.path.splitext(file.filename)[1]
    filename = f"answer_{question_id}_{int(time.time())}{ext}"
    file_path = os.path.join(UPLOAD_DIR, filename)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    question.answer_file = filename  # ✅ CORRECT
    db.commit()
    db.refresh(question)

    return attach_file_urls(question)

def delete_question_file(db: Session, question_id: int):
    q = db.query(Question).filter(Question.id == question_id).first()
    if not q or not q.question_file:
        return False

    delete_physical_file(q.question_file)
    q.question_file = None
    db.commit()
    return True

def delete_answer_file(db: Session, question_id: int):
    q = db.query(Question).filter(Question.id == question_id).first()
    if not q or not q.answer_file:
        return False

    delete_physical_file(q.answer_file)
    q.answer_file = None
    db.commit()
    return True
