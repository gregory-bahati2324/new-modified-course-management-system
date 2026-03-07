import uuid
from datetime import datetime
from sqlalchemy.orm import Session
from models import (
    student_lesson_progress,
    student_course_progress,
    student_module_progress
)
from services.module_client import get_lesson_version, get_module_info

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
    current_version = get_lesson_version(lesson_id)

    progress = get_lesson_progress(db, student_id, lesson_id)

    if progress:
        # 🔥 VERSION CHECK
        if progress.lesson_version != current_version:
            progress.lesson_version = current_version
            progress.is_completed = False
            progress.completed_at = None
            db.commit()
            db.refresh(progress)

        return progress

    progress = student_lesson_progress.StudentLessonProgress(
        id=str(uuid.uuid4()),
        student_id=student_id,
        course_id=course_id,
        module_id=module_id,
        lesson_id=lesson_id,
        lesson_version=current_version,
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
    current_version = get_lesson_version(lesson_id)

    progress = get_lesson_progress(db, student_id, lesson_id)

    if not progress:
        progress = start_lesson(
            db, student_id, course_id, module_id, lesson_id
        )

    # 🔥 VERSION MISMATCH CHECK
    if progress.lesson_version != current_version:
        progress.lesson_version = current_version
        progress.is_completed = False
        progress.completed_at = None

    if progress.lesson_version is None:
        progress.lesson_version = current_version

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
    
    
def get_course_id_for_module(module_id: str):
    module = get_module_info(module_id)
    return module["course_id"]

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
    
    


def get_course_lessons_progress(
    db: Session,
    student_id: str,
    course_id: str
):
    progresses = db.query(
        student_lesson_progress.StudentLessonProgress
    ).filter_by(
        student_id=student_id,
        course_id=course_id
    ).all()

    for progress in progresses:
        current_version = get_lesson_version(progress.lesson_id)

        if progress.lesson_version != current_version:
            progress.lesson_version = current_version
            progress.is_completed = False
            progress.completed_at = None

    db.commit()
    return progresses