import requests
import os

GRADING_SERVICE_URL = os.getenv("GRADING_SERVICE_URL", "http://marking_grading_service:8000")

def get_assessment_grade(attempt_id: int, token: str):
    try:
        response = requests.get(
            f"{GRADING_SERVICE_URL}/assessments/{attempt_id}/grade",
            headers={"Authorization": f"Bearer {token}"}
        )

        if response.status_code == 404:
            return None

        response.raise_for_status()
        return response.json()

    except Exception as e:
        print("Grading service error:", str(e))
        return None