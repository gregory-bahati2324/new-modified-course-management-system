"""
services/notification_client.py

Reusable internal notification publisher, following the same shape as
this service's existing inter-service clients (see
services/enrollment_client.py, services/grading_client.py): plain
`requests`, a configurable base URL, a short timeout, and — critically —
every failure is caught, logged, and swallowed rather than raised.

Golden rule (§19/§47): a notification failure must NEVER break the
business operation that triggered it. Call this AFTER the triggering
operation's database transaction has committed (post-commit, per §48),
ideally from a FastAPI BackgroundTask so it doesn't add latency to the
response either.

Usage from a router, after the crud call that already committed:

    from fastapi import BackgroundTasks
    from services.notification_client import send_notification_event

    @router.post("/{assignment_id}/submit")
    def submit_assignment(..., background_tasks: BackgroundTasks):
        submission = submit_assignment_service(...)   # already commits
        background_tasks.add_task(
            send_notification_event,
            event_type="ASSIGNMENT_SUBMITTED",
            source_service="assessment_service",
            recipient_ids=[instructor_id],
            actor_id=student_id,
            entity_type="assignment",
            entity_id=assignment_id,
            course_id=course_id,
            title="New assignment submission",
            message=f"{student_name} submitted \"{assignment_title}\".",
            action_url="/instructor/grade",
        )
        return submission
"""

import os
import uuid
import logging
from datetime import datetime, timezone
from typing import Optional, List, Dict, Any

import requests

logger = logging.getLogger(__name__)

NOTIFICATION_SERVICE_URL = os.getenv(
    "NOTIFICATION_SERVICE_URL", "http://notification_service:8000"
)
NOTIFICATION_INTERNAL_API_KEY = os.getenv(
    "NOTIFICATION_INTERNAL_API_KEY", "change-this-internal-notification-key"
)
TIMEOUT = float(os.getenv("NOTIFICATION_CLIENT_TIMEOUT", "3"))


def send_notification_event(
    event_type: str,
    source_service: str,
    recipient_ids: List[str],
    title: str,
    message: str,
    actor_id: Optional[str] = None,
    entity_type: Optional[str] = None,
    entity_id: Optional[str] = None,
    course_id: Optional[str] = None,
    action_url: Optional[str] = None,
    priority: Optional[str] = None,
    category: Optional[str] = None,
    data: Optional[Dict[str, Any]] = None,
    event_id: Optional[str] = None,
) -> Optional[dict]:
    """
    Fire-and-forget publish to the notification service. Returns the
    ingestion result dict on success, or None on any failure (network
    error, timeout, non-2xx response) — callers should not branch on the
    return value for anything business-critical; it exists mainly for
    logging/tests.
    """
    if not recipient_ids:
        return None

    payload = {
        "event_id": event_id or str(uuid.uuid4()),
        "event_type": event_type,
        "source_service": source_service,
        "actor_id": actor_id,
        "recipient_ids": recipient_ids,
        "entity_type": entity_type,
        "entity_id": entity_id,
        "course_id": course_id,
        "title": title,
        "message": message,
        "action_url": action_url,
        "priority": priority,
        "category": category,
        "data": data or {},
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }

    try:
        response = requests.post(
            f"{NOTIFICATION_SERVICE_URL}/internal/notifications/events",
            json=payload,
            headers={"X-Internal-Api-Key": NOTIFICATION_INTERNAL_API_KEY},
            timeout=TIMEOUT,
        )
        if response.status_code >= 400:
            logger.warning(
                "notification event rejected | event_type=%s status=%s body=%s",
                event_type, response.status_code, response.text[:300],
            )
            return None
        return response.json()
    except requests.RequestException as exc:
        # Notification service is down/unreachable/slow. Swallow it — the
        # caller's business transaction already succeeded; losing a
        # notification is acceptable, losing (or slowing) the transaction
        # that triggered it is not.
        logger.warning(
            "notification service unreachable | event_type=%s error=%s", event_type, exc
        )
        return None
