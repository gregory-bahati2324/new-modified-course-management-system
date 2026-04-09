import requests
import os
from fastapi import HTTPException

COURSE_SERVICE_URL = "http://course_service:8000"

def get_instructor_courses(token):
    response = requests.get(
        f"{COURSE_SERVICE_URL}/api/courses/me",
        headers={"Authorization": f"Bearer {token}"}
    )
    if response.status_code != 200:
        raise HTTPException(status_code=response.status_code, detail=f"Failed to fetch instructor courses: {response.text}")
    
    try:
        data = response.json()
    except Exception:
        raise HTTPException(
            status_code=500,
            detail=f"Invalid JSON response from course service: {response.text}"
        )

    
    if not data:
        raise HTTPException(
            status_code=404,
            detail="No courses found for this instructor"
        )

    return data

def get_course_enrollments(course_id, token):
    response = requests.get(
        f"{COURSE_SERVICE_URL}/api/courses/enrollments/course/{course_id}",
        headers={"Authorization": f"Bearer {token}"}
    )
    if response.status_code != 200:
        raise HTTPException(status_code=response.status_code, detail=f"Failed to fetch course enrollments: {response.text}")
    # 🔴 2. Handle invalid JSON
    try:
        data = response.json()
    except Exception:
        raise HTTPException(
            status_code=500,
            detail=f"Invalid JSON response from course enrollments service: {response.text}"
        )

    # 🔴 3. Handle EMPTY DATA (your case 🔥)
    if not data:
        raise HTTPException(
            status_code=404,
            detail="No enrollments found for this course"
        )

    return data