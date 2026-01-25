from datetime import datetime
from sqlalchemy.orm import Session
from models import (
    student_course_progress,
    student_lesson_progress,
    student_module_progress
)

def recalculate_module_progress(
    db: Session,
    student_id: str,
    course_id: str,
    module_id: str,
    total_lessons: int,
    assignment_required: bool = False
):
    completed_lessons = db.query(student_lesson_progress.StudentLessonProgress).filter(
        student_lesson_progress.StudentLessonProgress.student_id == student_id,
        student_lesson_progress.StudentLessonProgress.module_id == module_id,
        student_lesson_progress.StudentLessonProgress.is_completed.is_(True)
    ).count()

    progress_percent = int((completed_lessons / total_lessons) * 100) if total_lessons else 0

    module_progress = db.query(student_module_progress.StudentModuleProgress).filter_by(
        student_id=student_id,
        module_id=module_id
    ).first()

    if not module_progress:
        module_progress = student_module_progress.StudentModuleProgress(
            id=f"{student_id}:{module_id}",
            student_id=student_id,
            course_id=course_id,
            module_id=module_id,
            assignment_required=assignment_required
        )
        db.add(module_progress)

    module_progress.completed_lessons = completed_lessons
    module_progress.total_lessons = total_lessons
    module_progress.progress_percentage = progress_percent
    module_progress.is_completed = completed_lessons == total_lessons

    if module_progress.is_completed:
        module_progress.completed_at = datetime.utcnow()

    db.commit()


def recalculate_course_progress(
    db: Session,
    student_id: str,
    course_id: str,
    total_modules: int,
    total_lessons: int,
    assessment_required: bool = False,
    assessment_passed: bool = False
):
    completed_modules = db.query(student_module_progress.StudentModuleProgress).filter(
        student_module_progress.StudentModuleProgress.student_id == student_id,
        student_module_progress.StudentModuleProgress.course_id == course_id,
        student_module_progress.StudentModuleProgress.is_completed.is_(True)
    ).count()

    completed_lessons = db.query(student_lesson_progress.StudentLessonProgress).filter(
        student_lesson_progress.StudentLessonProgress.student_id == student_id,
        student_lesson_progress.StudentLessonProgress.course_id == course_id,
        student_lesson_progress.StudentLessonProgress.is_completed.is_(True)
    ).count()

    progress_percent = int((completed_lessons / total_lessons) * 100) if total_lessons else 0

    course_progress = db.query(student_course_progress.StudentCourseProgress).filter_by(
        student_id=student_id,
        course_id=course_id
    ).first()

    if not course_progress:
        course_progress = student_course_progress.StudentCourseProgress(
            id=f"{student_id}:{course_id}",
            student_id=student_id,
            course_id=course_id,
            assessment_required=assessment_required
        )
        db.add(course_progress)

    course_progress.completed_modules = completed_modules
    course_progress.total_modules = total_modules
    course_progress.completed_lessons = completed_lessons
    course_progress.total_lessons = total_lessons
    course_progress.progress_percentage = progress_percent
    course_progress.assessment_passed = assessment_passed
    course_progress.is_completed = (
        completed_lessons == total_lessons and
        (not assessment_required or assessment_passed)
    )

    # 🎓 Certificate logic
    course_progress.certificate_eligible = course_progress.is_completed
    course_progress.last_accessed_at = datetime.utcnow()

    if course_progress.is_completed:
        course_progress.completed_at = datetime.utcnow()

    db.commit()
