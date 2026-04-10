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
                "submission_type": "assignment",

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
                "submission_type": "assessment",

                "max_score": sub.get("passing_score", 100)
            })

    return all_submissions



def get_submission_details(token: str, submission_id: str, submission_type: str):

    # -----------------------------
    # ASSIGNMENT
    # -----------------------------
    if submission_type == "assignment":
        submission = get_assignment_submission(token, submission_id)

        if not submission:
            raise ValueError("Submission not found")

        student_id = submission["student_id"]
        student = get_student_info(token, student_id)

        #  Normalize file structure for frontend
        files = []
        if submission.get("file_url"):
            files.append({
                "name": "Submitted File",
                "url": submission.get("file_url"),
                "size": "Unknown"
            })

        return {
            "submission": {
                "id": submission.get("submission_id"),
                "studentName": f"{student.get('first_name', '')} {student.get('last_name', '')}".strip(),
                "registrationNumber": student.get("registration_number"),
                "courseName": submission.get("course_name"),
                "title": submission.get("assignment_title"),
                "submittedAt": submission.get("submitted_at"),
                "type": "assignment"
            },
            "assignment": {
                "files": files,
                "text": submission.get("submission_text"),   # 🔥 FIXED KEY
                "notes": submission.get("notes"),
                "maxScore": submission.get("total_points", 100)
            },
            "grading": {
                "score": submission.get("grade", 0),
                "feedback": submission.get("feedback", ""),
                "maxScore": submission.get("total_points", 100)
            }
        }

    # -----------------------------
    # ASSESSMENT
    # -----------------------------
    elif submission_type == "assessment":
        attempt = get_attempt(token, int(submission_id))

        if not attempt:
            raise ValueError("Attempt not found")

        student_id = attempt["student_id"]
        student = get_student_info(token, student_id)

        # ✅ USE PRE-FORMATTED QUESTIONS DIRECTLY
        formatted_questions = [
                {
                    **q,
                    "earnedPoints": q.get("earnedPoints") or 0,
                    "maxPoints": q.get("maxPoints") or 0,
                    "isCorrect": q.get("isCorrect", None),
                }
                for q in attempt.get("questions", [])
            ]

        return {
            "submission": {
                "id": attempt.get("attempt_id"),
                "studentName": f"{student.get('first_name', '')} {student.get('last_name', '')}".strip(),
                "registrationNumber": student.get("registration_number"),
                "courseName": attempt.get("course_name"),
                "title": attempt.get("assessment_title"),
                "submittedAt": attempt.get("submitted_at"),
                "type": "assessment"
            },

            # ✅ DIRECT PASS (NO PROCESSING)
            "questions": formatted_questions,

            "grading": {
                "score": attempt.get("graded_score", 0),
                "pendingScore": attempt.get("pending_score", 0),
                "maxScore": attempt.get("max_score", 0)
                },
            "progress": {
                    "gradedQuestions": len([
                        q for q in attempt.get("questions", [])
                        if q.get("isAutoGraded") is True
                    ]),
                    "totalQuestions": len(attempt.get("questions", []))
}
        }

    # -----------------------------
    # INVALID TYPE
    # -----------------------------
    else:
        raise ValueError("Invalid submission_type")