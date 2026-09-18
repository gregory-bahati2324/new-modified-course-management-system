"""
services/course_client.py (scheduling_service)

scheduling_service didn't have a services/ directory before this
integration — it talks to nothing else today (see router/sessions.py,
crud/sessions.py). This is the one addition needed to resolve "which
students are enrolled in this session's course" for notification
fan-out, mirroring the pattern already used in marking_grading_service
and assessment_service.
"""

import os
import logging
from typing import List

import requests

logger = logging.getLogger(__name__)

COURSE_SERVICE_URL = os.getenv("COURSE_SERVICE_URL", "http://course_service:8000")
TIMEOUT = 5


def get_course_enrolled_student_ids(course_id: str, token: str) -> List[str]:
    try:
        response = requests.get(
            f"{COURSE_SERVICE_URL}/api/courses/enrollments/course/{course_id}",
            headers={"Authorization": f"Bearer {token}"},
            timeout=TIMEOUT,
        )
        if response.status_code != 200:
            logger.info(
                "could not resolve enrolled students | course_id=%s status=%s",
                course_id, response.status_code,
            )
            return []
        enrollments = response.json()
        return [e["student_id"] for e in enrollments if e.get("student_id")]
    except requests.RequestException as exc:
        logger.warning(
            "course_service unreachable while resolving enrolled students | course_id=%s error=%s",
            course_id, exc,
        )
        return []
