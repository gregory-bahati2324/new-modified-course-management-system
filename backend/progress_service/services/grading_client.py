import requests

GRADING_SERVICE_URL = "http://marking_grading_service:8000"

def get_student_results(student_id: str, course_id: str):
    response = requests.get(
        f"{GRADING_SERVICE_URL}/grading/student/{student_id}/course/{course_id}"
    )
    response.raise_for_status()
    return response.json()