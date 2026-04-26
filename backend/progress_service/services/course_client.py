import requests

COURSE_SERVICE_URL = "http://course_service:8000"

def get_course_progress_rules(course_id: str):
    response = requests.get(
        f"{COURSE_SERVICE_URL}/api/courses/{course_id}/progress-rules"
    )
    response.raise_for_status()
    return response.json()