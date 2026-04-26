from datetime import datetime
from sqlalchemy.orm import Session
from models import (
    student_course_progress,
    student_lesson_progress,
    student_module_progress
)

from services.course_client import get_course_progress_rules
from services.assessment_client import (
    get_assignment_summary,
    get_assessment_summary
)

def evaluate_external_progress(course_id: str, token: str):

    # -----------------------------
    # FETCH DATA (SAFE)
    # -----------------------------
    try:
        rules = get_course_progress_rules(course_id)
    except:
        rules = {
            "require_assignments": False,
            "require_assessments": False,
            "min_assignments_required": 0,
            "min_assessments_required": 0
        }

    try:
        assignment_summary = get_assignment_summary(course_id, token)
    except:
        assignment_summary = {
            "total_assignments": 0,
            "submitted": 0
        }

    try:
        assessment_summary = get_assessment_summary(course_id, token)
    except:
        assessment_summary = {
            "total_assessments": 0,
            "attempted": 0,
            "submitted": 0
        }

    # -----------------------------
    # EXTRACT VALUES
    # -----------------------------
    total_assignments = assignment_summary.get("total_assignments", 0)
    submitted_assignments = assignment_summary.get("submitted", 0)

    total_assessments = assessment_summary.get("total_assessments", 0)
    submitted_assessments = assessment_summary.get("submitted", 0)

    # -----------------------------
    # ASSIGNMENT LOGIC
    # -----------------------------
    if not rules["require_assignments"]:
        assignments_ok = True
    else:
        # handle edge case: no assignments exist
        if total_assignments == 0:
            assignments_ok = True
        else:
            assignments_ok = (
                submitted_assignments >= rules["min_assignments_required"]
            )

    # -----------------------------
    # ASSESSMENT LOGIC
    # -----------------------------
    if not rules["require_assessments"]:
        assessments_ok = True
    else:
        # handle edge case: no assessments exist
        if total_assessments == 0:
            assessments_ok = True
        else:
            assessments_ok = (
                submitted_assessments >= rules["min_assessments_required"]
            )

    return {
        "assignments_ok": assignments_ok,
        "assessments_ok": assessments_ok,

        
        "assignment_summary": assignment_summary,
        "assessment_summary": assessment_summary,

        
        "assignment_progress": {
            "submitted": submitted_assignments,
            "required": rules["min_assignments_required"],
            "total": total_assignments
        },
        "assessment_progress": {
            "submitted": submitted_assessments,
            "required": rules["min_assessments_required"],
            "total": total_assessments
        }
    }

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
    token: str 
):
    # -----------------------------
    # LESSON + MODULE PROGRESS
    # -----------------------------
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

    # -----------------------------
    #  EXTERNAL PROGRESS 
    # -----------------------------
    external = evaluate_external_progress(course_id, token)

    assignments_ok = external["assignments_ok"]
    assessments_ok = external["assessments_ok"]

    # -----------------------------
    # FINAL COMPLETION LOGIC
    # -----------------------------
    is_completed = (
        total_lessons > 0 and
        completed_lessons == total_lessons and
        assignments_ok and
        assessments_ok
    )

    # -----------------------------
    # DB UPDATE
    # -----------------------------
    course_progress = db.query(student_course_progress.StudentCourseProgress).filter_by(
        student_id=student_id,
        course_id=course_id
    ).first()

    if not course_progress:
        course_progress = student_course_progress.StudentCourseProgress(
            id=f"{student_id}:{course_id}",
            student_id=student_id,
            course_id=course_id
        )
        db.add(course_progress)

    course_progress.completed_modules = completed_modules
    course_progress.total_modules = total_modules
    course_progress.completed_lessons = completed_lessons
    course_progress.total_lessons = total_lessons
    course_progress.progress_percentage = progress_percent

    
    course_progress.assessment_required = not assessments_ok
    course_progress.assessment_passed = assessments_ok

    course_progress.is_completed = is_completed

    # Certificate logic
    course_progress.certificate_eligible = is_completed

    course_progress.last_accessed_at = datetime.utcnow()

    if is_completed:
        course_progress.completed_at = datetime.utcnow()

    db.commit()