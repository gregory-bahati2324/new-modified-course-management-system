import logging

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import get_db
from core.auth import verify_internal_api_key
from schemas.notification import NotificationEvent, EventIngestResult
from services import notification_service as svc

logger = logging.getLogger("notification_service")

router = APIRouter(prefix="/internal/notifications", tags=["Internal - Event Ingestion"])


@router.post("/events", response_model=EventIngestResult, status_code=201)
def ingest_event(
    event: NotificationEvent,
    db: Session = Depends(get_db),
    _: bool = Depends(verify_internal_api_key),
):
    """
    Every other microservice in this LMS calls this endpoint (via its own
    notification_client.py) after a business operation completes. See
    NOTIFICATION_INTEGRATION.md for the full event contract and the list
    of producing services.

    Guarantees:
    - Idempotent: redelivering the same event_id/recipient/type is a no-op
      (enforced at the DB layer, not just in application logic).
    - Never raises 5xx for a "normal" duplicate — duplicates are reported
      in the response, not as an error, so a retried caller doesn't need
      special-case handling.
    - A malformed payload (missing required fields) is rejected by Pydantic
      with a 422 before it reaches this function at all.
    """
    logger.info(
        "event received | event_id=%s event_type=%s source_service=%s recipients=%d",
        event.event_id, event.event_type, event.source_service, len(event.recipient_ids),
    )

    created, skipped = svc.process_event(db, event)

    return EventIngestResult(
        event_id=event.event_id,
        created=len(created),
        skipped_duplicates=skipped,
        notification_ids=[n.id for n in created],
    )
