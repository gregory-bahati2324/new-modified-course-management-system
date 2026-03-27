from datetime import datetime, timedelta, timezone

def calculate_student_status(assessment, student_attempt=None):
    """
    Returns assessment status for a student.
    Statuses:
    - "upcoming": before start_time
    - "available": between start_time and end_time
    - "completed": after end_time
    """
    # Current UTC time
    now = datetime.now(timezone.utc)

    # Assessment start (due) time
    start_time = assessment.due_date
    time_limit = assessment.time_limit

    # Ensure start_time is timezone-aware in UTC
    if start_time is not None:
        if start_time.tzinfo is None:
            start_time = start_time.replace(tzinfo=timezone.utc)
        else:
            start_time = start_time.astimezone(timezone.utc)
    else:
        # If start_time is missing, consider it upcoming (or adjust logic)
        return "upcoming"

    # End time = start + time limit
    end_time = start_time + timedelta(minutes=time_limit) if time_limit else start_time

    # Determine status
    if now < start_time:
        return "upcoming"
    elif start_time <= now <= end_time:
        return "available"
    else:  # now > end_time
        return "completed"