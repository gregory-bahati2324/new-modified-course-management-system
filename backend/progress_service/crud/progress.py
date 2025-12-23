import uuid
from datetime import datetime
from sqlalchemy.orm import Session
from models import (
    student_lesson_progress,
    student_course_progress,
    student_module_progress
)

# --------------------------------
# LESSON PROGRESS
# --------------------------------

def get_lesson_progress(
    db: Session,
    student_id: str,
    lesson_id: str
):
    return db.query(student_lesson_progress.StudentLessonProgress).filter_by(
        student_id=student_id,
        lesson_id=lesson_id
    ).first()


def start_lesson(
    db: Session,
    student_id: str,
    course_id: str,
    module_id: str,
    lesson_id: str
):
    progress = get_lesson_progress(db, student_id, lesson_id)

    if progress:
        return progress

    progress = student_lesson_progress.StudentLessonProgress(
        id=str(uuid.uuid4()),
        student_id=student_id,
        course_id=course_id,
        module_id=module_id,
        lesson_id=lesson_id,
        is_completed=False
    )

    db.add(progress)
    db.commit()
    db.refresh(progress)
    return progress


def complete_lesson(
    db: Session,
    student_id: str,
    course_id: str,
    module_id: str,
    lesson_id: str,
    quiz_score: int | None,
    time_spent_seconds: int | None
):
    progress = get_lesson_progress(db, student_id, lesson_id)

    if not progress:
        progress = start_lesson(
            db, student_id, course_id, module_id, lesson_id
        )

    # Idempotency: do nothing if already completed
    if progress.is_completed:
        return progress

    progress.quiz_score = quiz_score
    progress.time_spent_seconds = time_spent_seconds
    progress.is_completed = True
    progress.completed_at = datetime.utcnow()

    db.commit()
    db.refresh(progress)
    return progress


def reset_lesson_progress(
    db: Session,
    student_id: str,
    lesson_id: str
):
    progress = get_lesson_progress(db, student_id, lesson_id)
    if not progress:
        return None

    db.delete(progress)
    db.commit()
    return True


# --------------------------------
# MODULE PROGRESS
# --------------------------------

def get_module_progress(
    db: Session,
    student_id: str,
    module_id: str
):
    return db.query(student_module_progress.StudentModuleProgress).filter_by(
        student_id=student_id,
        module_id=module_id
    ).first()


# --------------------------------
# COURSE PROGRESS
# --------------------------------

def get_course_progress(
    db: Session,
    student_id: str,
    course_id: str
):
    return db.query(student_course_progress.StudentCourseProgress).filter_by(
        student_id=student_id,
        course_id=course_id
    ).first()
