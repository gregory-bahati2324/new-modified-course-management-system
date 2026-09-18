"""
services/course_client.py (assessment_service)

Complements the existing services/enrollment_client.py (which answers
"what is *this* student enrolled in") with the inverse query: "who is
enrolled in *this* course" — needed to fan ASSIGNMENT_CREATED /
ASSESSMENT_CREATED notifications out to every enrolled student.

Mirrors marking_grading_service/services/course_client.py's
get_course_enrollments, kept as a separate small function here (rather
than importing across services, which this LMS's services never do)
and reduced to just the ids the notification client needs.
"""

import os
import logging
from typing import List

import requests

logger = logging.getLogger(__name__)

COURSE_SERVICE_URL = os.getenv("COURSE_SERVICE_URL", "http://course_service:8000")
TIMEOUT = 5


def get_course_enrolled_student_ids(course_id: str, token: str) -> List[str]:
    """Best-effort — returns [] on any failure. This must never block
    assignment/assessment creation, which has already succeeded and
    committed by the time this is called."""
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
