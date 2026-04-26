from services.course_client import get_course_details
from services.assessment_client import get_course_assessments
from services.grading_client import get_student_results


def evaluate_assessment_progress(student_id: str, course_id: str):
    # STEP 1: course rules
    course = get_course_details(course_id)

    require_assignments = course.get("require_assignments", False)
    require_assessments = course.get("require_assessments", False)

    min_assignments = course.get("min_assignments_required", 0)
    min_assessments = course.get("min_assessments_required", 0)

    # STEP 2: totals
    assessments = get_course_assessments(course_id)

    # STEP 3: student results
    results = get_student_results(student_id, course_id)

    completed_assignments = results.get("completed_assignments", 0)
    passed_assessments = results.get("passed_assessments", 0)

    # STEP 4: logic
    assignment_ok = (
        not require_assignments or
        completed_assignments >= min_assignments
    )

    assessment_ok = (
        not require_assessments or
        passed_assessments >= min_assessments
    )

    return {
        "assignment_ok": assignment_ok,
        "assessment_ok": assessment_ok,
        "assessment_passed": assignment_ok and assessment_ok
    }