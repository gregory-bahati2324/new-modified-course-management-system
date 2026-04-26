import requests
import os
from fastapi import HTTPException

GRADING_SERVICE_URL = os.getenv("GRADING_SERVICE_URL", "http://marking_grading_service:8000")

def get_assessment_grade(attempt_id: int):
    try:
        response = requests.get(
            f"{GRADING_SERVICE_URL}/grading/assessments/{attempt_id}/grade"
        )

        if response.status_code != 200:
            raise HTTPException(status_code=response.status_code, detail="Failed to fetch grade from grading service")
        response.raise_for_status()
        return response.json()

    except Exception as e:
        print("Grading service error:", str(e))
        return None
    
    
def get_assignment_grade(submission_id: str):
    try:
        response = requests.get(
            f"{GRADING_SERVICE_URL}/grading/assignments/{submission_id}/grade"
        )

        if response.status_code != 200:
            raise HTTPException(
                status_code=response.status_code,
                detail="Failed to fetch assignment grade from grading service"
            )

        return response.json()

    except Exception as e:
        print("Assignment grading service error:", str(e))
        return None    