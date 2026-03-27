import os
import requests

ENROLLMENT_SERVICE_URL = os.getenv(
    "ENROLLMENT_SERVICE_URL",
    "http://course_service:8000/api"
)

TIMEOUT = 5


def get_student_enrollments(token: str):
    url = f"{ENROLLMENT_SERVICE_URL}/courses/enrollments/student"
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.get(url, headers=headers, timeout=TIMEOUT)
    if response.status_code != 200:
        raise Exception(f"Failed to fetch enrollments: {response.status_code}, {response.text}")
    return response.json()


def get_course_details(course_id: str, token: str):
    import requests
    response = requests.get(
        f"{ENROLLMENT_SERVICE_URL}/courses/{course_id}/detail",
        headers={"Authorization": f"Bearer {token}"}
    )
    if response.status_code != 200:
        return None
    return response.json()

