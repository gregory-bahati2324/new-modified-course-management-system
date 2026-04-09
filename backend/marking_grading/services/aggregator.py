# services/aggregator.py

from services.course_client import get_instructor_courses, get_course_enrollments
from services.assessment_client import (
    get_assignments,
    get_assessments,
    get_assignment_submission,
    get_attempt
)
from services.auth_student_client import get_student_info


def get_student_submission_details(token):
    courses = get_instructor_courses(token)

    all_submissions = []

    for course in courses:
        course_id = course["id"]
        course_name = course["title"]

        # 🔹 Get enrollments
        enrollments = get_course_enrollments(course_id, token)

        # 🔹 Get submissions directly (IMPORTANT FIX 🔥)
        assignment_submissions = get_assignments(token, course_id)
        assessment_submissions = get_assessments(token, course_id)

        # -------------------------------
        # 🔹 ASSIGNMENT SUBMISSIONS
        # -------------------------------
        for sub in assignment_submissions:
            student_id = sub["student_id"]

            # get student info
            student = get_student_info(token, student_id)

            all_submissions.append({
                "id": sub["id"],
                "student_id": student_id,
                "student_name": f"{student.get('first_name')} {student.get('last_name')}",

                "course_id": sub["course_id"],
                "course_name": course_name,

                "assignment_id": sub["assignment_id"],
                "assignment_title": sub.get("title"),

                "submitted_at": sub["submitted_at"],
                "file_url": sub.get("file_url"),

                "grade": sub.get("grade"),
                "feedback": sub.get("feedback"),

                "status": "graded" if sub.get("grade") else "pending",
                "type": "assignment",

                "max_score": sub.get("total_points", 100)
            })

        # -------------------------------
        # ASSESSMENT SUBMISSIONS
        # -------------------------------
        for sub in assessment_submissions:
            student_id = sub["student_id"]

            student = get_student_info(token, student_id)

            all_submissions.append({
                "id": sub["id"],
                "student_id": student_id,
                "student_name": f"{student.get('first_name')} {student.get('last_name')}",

                "course_id": sub["course_id"],
                "course_name": course_name,

                "assignment_id": sub["assessment_id"],  # ⚠️ normalized
                "assignment_title": sub.get("assessment_title"),

                "submitted_at": sub["submitted_at"],
                "file_url": None,

                "grade": sub.get("score"),
                "feedback": sub.get("feedback"),

                "status": sub.get("status", "pending"),
                "type": sub.get("type", "assessment"),

                "max_score": sub.get("passing_score", 100)
            })

    return all_submissions



def get_submission_details(token: str, submission_id: str):
    # -----------------------------
    # 1. Try assignment submission
    # -----------------------------
    try:
        submission = get_assignment_submission(token, submission_id)

        student_id = submission["student_id"]
        student = get_student_info(token, student_id)

        return {
            "submission": {
                "id": submission["id"],
                "studentName": f"{student.get('first_name')} {student.get('last_name')}",
                "registrationNumber": student.get("registration_number"),
                "courseName": submission.get("course_name"),
                "title": submission.get("assignment_title"),
                "submittedAt": submission.get("submitted_at"),
                "type": "assignment"
            },
            "assignment": {
                "files": submission.get("files", []),
                "text": submission.get("text"),
                "notes": submission.get("notes"),
                "maxScore": submission.get("total_points", 100)
            },
            "grading": {
                "score": submission.get("grade"),
                "feedback": submission.get("feedback"),
                "maxScore": submission.get("total_points", 100)
            }
        }

    except Exception:
        pass  # not assignment → try assessment

    # -----------------------------
    # 2. Try assessment attempt
    # -----------------------------
    attempt = get_attempt(token, submission_id)

    student_id = attempt["student_id"]
    student = get_student_info(token, student_id)

    return {
        "submission": {
            "id": attempt["id"],
            "studentName": f"{student.get('first_name')} {student.get('last_name')}",
            "registrationNumber": student.get("registration_number"),
            "courseName": attempt.get("course_name"),
            "title": attempt.get("assessment_title"),
            "submittedAt": attempt.get("submitted_at"),
            "type": "assessment"
        },
        "questions": attempt.get("questions", []),
        "grading": {
            "score": attempt.get("score"),
            "feedback": attempt.get("feedback"),
            "maxScore": attempt.get("max_score", 100)
        }
    }