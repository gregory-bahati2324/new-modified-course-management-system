from http.client import HTTPException

import requests
import os

AUTHENTICATION_SERVICE_URL = os.getenv(
    "AUTHENTICATION_SERVICE_URL",
    "http://auth_service:8000"
)

def get_student_info(token: str, student_id: str):
    url = f"{AUTHENTICATION_SERVICE_URL}/auth/student/{student_id}/details"
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.get(url, headers=headers)
    if response.status_code != 200:
        raise Exception(f"Failed to fetch student info: {response.status_code}, {response.text}")
    # 🔴 2. Handle invalid JSON
    try:
        data = response.json()
    except Exception:
        raise HTTPException(
            status_code=500,
            detail=f"Invalid JSON response from student info service: {response.text}"
        )

    # 🔴 3. Handle EMPTY DATA (your case 🔥)
    if not data:
        raise HTTPException(
            status_code=404,
            detail="No student info found for this student"
        )

    return data