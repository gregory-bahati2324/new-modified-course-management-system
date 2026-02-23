from datetime import datetime, timezone

def calculate_student_status(assessment, student_attempt=None):
    now = datetime.now(timezone.utc)

    if assessment.status != "published":
        return None

    if assessment.due_date:
        if now < assessment.due_date:
            return "upcoming"

        if student_attempt and student_attempt.completed:
            return "completed"

        return "missed"

    return "available"