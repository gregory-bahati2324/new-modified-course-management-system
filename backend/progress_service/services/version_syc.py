from sqlalchemy.orm import Session
from models import student_lesson_progress
from services.module_client import get_lesson_version


def sync_lesson_versions(
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

    updated = False

    for progress in progresses:

        current_version = get_lesson_version(progress.lesson_id)

        if progress.lesson_version != current_version:

            progress.lesson_version = current_version
            progress.is_completed = False
            progress.completed_at = None
            updated = True

    if updated:
        db.commit()