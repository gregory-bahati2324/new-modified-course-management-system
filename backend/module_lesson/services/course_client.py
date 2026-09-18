"""
services/course_client.py (module_lesson_service)

module_lesson_service has no auth of its own (see routers/modules.py —
none of its routes currently require a token). Notification recipient
resolution here is therefore best-effort: if the caller's request
happened to include a Bearer token (the frontend always sends one, even
though this service doesn't enforce it — see utils/optional_auth.py),
we forward it to course_service to resolve the course's enrolled
students. If there's no token, we simply skip the notification rather
than blocking the create/update operation, which matches this service's
existing behaviour of not requiring auth at all.
"""

import os
import logging
from typing import List, Optional

import requests

logger = logging.getLogger(__name__)

COURSE_SERVICE_URL = os.getenv("COURSE_SERVICE_URL", "http://course_service:8000")
TIMEOUT = 5


def get_course_enrolled_student_ids(course_id: str, token: Optional[str]) -> List[str]:
    if not token:
        return []
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
