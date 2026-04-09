import requests
from fastapi import HTTPException

ASSESSMENT_SERVICE_URL = "http://assessment_service:8000"

def get_assignments(token, course_id=None):
    response = requests.get(
        f"{ASSESSMENT_SERVICE_URL}/assignments/course/{course_id}/submissions",
        headers={"Authorization": f"Bearer {token}"}
    )
    if response.status_code != 200:
        raise HTTPException(status_code=response.status_code, detail=f"Failed to fetch assignments: {response.text}")
    return response.json()

def get_assessments(token, course_id=None):
    response = requests.get(
        f"{ASSESSMENT_SERVICE_URL}/assessments/course/{course_id}/submissions",
        headers={"Authorization": f"Bearer {token}"}
    )
    if response.status_code != 200:
        raise HTTPException(status_code=response.status_code, detail=f"Failed to fetch assessments: {response.text}")
    return response.json()

def get_attempt(token, attempt_id):
    response = requests.get(
        f"{ASSESSMENT_SERVICE_URL}/assessments/attempts/{attempt_id}",
        headers={"Authorization": f"Bearer {token}"}
    )
    if response.status_code != 200:
        raise HTTPException(status_code=response.status_code, detail=f"Failed to fetch attempt: {response.text}")
    return response.json()

def get_assignment_submission(token, submission_id):
    response = requests.get(
        f"{ASSESSMENT_SERVICE_URL}/assignments/submissions/{submission_id}/grading",
        headers={"Authorization": f"Bearer {token}"}
    )
    if response.status_code != 200:
        raise HTTPException(status_code=response.status_code, detail=f"Failed to fetch assignment submission: {response.text}")
    return response.json()