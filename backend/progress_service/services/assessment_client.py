import requests

LEARNING_SERVICE_URL = "http://assessment_service:8000"  


# -----------------------------
# ASSIGNMENT SUMMARY
# -----------------------------
def get_assignment_summary(course_id: str, token: str):
    response = requests.get(
        f"{LEARNING_SERVICE_URL}/assignments/student/{course_id}/summary",
        headers={
            "Authorization": f"Bearer {token}"
        }
    )
    response.raise_for_status()
    return response.json()


# -----------------------------
# ASSESSMENT SUMMARY
# -----------------------------
def get_assessment_summary(course_id: str, token: str):
    response = requests.get(
        f"{LEARNING_SERVICE_URL}/assessments/student/{course_id}/summary",
        headers={
            "Authorization": f"Bearer {token}"
        }
    )
    response.raise_for_status()
    return response.json()