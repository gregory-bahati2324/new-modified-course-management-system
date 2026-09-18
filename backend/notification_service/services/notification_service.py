"""
services/notification_service.py
All notification persistence/business logic lives here — routers stay thin.
"""

import logging
from datetime import datetime
from typing import List, Optional, Tuple

from sqlalchemy import func
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from models.notification import Notification
from core.constants import EVENT_TYPE_MAP
from schemas.notification import NotificationEvent, NotificationCreate, BulkNotificationCreate

logger = logging.getLogger("notification_service")


def _resolve_defaults(event_type: str) -> Tuple[str, str, Optional[str]]:
    """Look up (category, priority, action_url_template) for a known event
    type, falling back to sane defaults for types this service doesn't
    recognize yet (new producing-service event types shouldn't be dropped —
    see core/constants.py docstring)."""
    category, priority, url_template = EVENT_TYPE_MAP.get(
        event_type, ("SYSTEM", "NORMAL", None)
    )
    return category, priority, url_template


def _render_action_url(template: Optional[str], event: NotificationEvent) -> Optional[str]:
    if event.action_url:
        return event.action_url
    if not template:
        return None
    try:
        return template.format(course_id=event.course_id or "")
    except Exception:
        return template


def process_event(db: Session, event: NotificationEvent) -> Tuple[List[Notification], int]:
    """
    Fan an inbound business event out into one Notification row per
    recipient, idempotently.

    Idempotency: relies on the DB-level UNIQUE(event_id, recipient_id, type)
    constraint on the notifications table (see models/notification.py) —
    not a check-then-insert race. If the same event is delivered twice
    (at-least-once delivery, retried HTTP call, etc.) the duplicate insert
    is rejected by Postgres and quietly skipped, per recipient.

    Returns (created_notifications, skipped_count).
    """
    category, default_priority, url_template = _resolve_defaults(event.event_type)
    category = event.category or category
    priority = event.priority or default_priority
    action_url = _render_action_url(url_template, event)

    created: List[Notification] = []
    skipped = 0

    # De-dupe recipient list defensively — a producing service might send
    # the same id twice (e.g. a student who is also listed as a TA).
    seen_recipients = set()

    for recipient_id in event.recipient_ids:
        if recipient_id in seen_recipients:
            continue
        seen_recipients.add(recipient_id)

        notification = Notification(
            recipient_id=recipient_id,
            actor_id=event.actor_id,
            type=event.event_type,
            category=category,
            priority=priority,
            title=event.title,
            message=event.message,
            action_url=action_url,
            source_service=event.source_service,
            source_entity_type=event.entity_type,
            source_entity_id=event.entity_id,
            event_id=event.event_id,
            extra_metadata={
                **event.data,
                **({"course_id": event.course_id} if event.course_id else {}),
            },
        )

        # Each recipient gets its own tiny transaction so that one
        # duplicate (or one bad recipient id) can't roll back the whole
        # batch — required for realistic bulk fan-out (§51/§37).
        savepoint = db.begin_nested()
        try:
            db.add(notification)
            db.flush()
            savepoint.commit()
            created.append(notification)
        except IntegrityError:
            savepoint.rollback()
            skipped += 1
            logger.info(
                "notification skipped because duplicate | event_id=%s recipient_id=%s type=%s",
                event.event_id, recipient_id, event.event_type,
            )
        except Exception:
            savepoint.rollback()
            skipped += 1
            logger.exception(
                "notification creation failed for recipient | event_id=%s recipient_id=%s",
                event.event_id, recipient_id,
            )

    db.commit()
    for n in created:
        db.refresh(n)

    logger.info(
        "event processed | event_id=%s event_type=%s source_service=%s created=%d skipped=%d",
        event.event_id, event.event_type, event.source_service, len(created), skipped,
    )

    return created, skipped


def create_manual_notification(db: Session, data: NotificationCreate) -> Notification:
    notification = Notification(
        recipient_id=data.recipient_id,
        type=data.type,
        category=data.category,
        priority=data.priority,
        title=data.title,
        message=data.message,
        action_url=data.action_url,
        source_service="manual",
        extra_metadata=data.metadata,
    )
    db.add(notification)
    db.commit()
    db.refresh(notification)
    logger.info("notification created | id=%s recipient_id=%s type=%s", notification.id, notification.recipient_id, notification.type)
    return notification


def create_bulk_notifications(db: Session, data: BulkNotificationCreate) -> List[Notification]:
    created = []
    for recipient_id in dict.fromkeys(data.recipient_ids):  # de-dupe, preserve order
        notification = Notification(
            recipient_id=recipient_id,
            type=data.type,
            category=data.category,
            priority=data.priority,
            title=data.title,
            message=data.message,
            action_url=data.action_url,
            source_service="manual",
            extra_metadata=data.metadata,
        )
        db.add(notification)
        created.append(notification)
    db.commit()
    for n in created:
        db.refresh(n)
    logger.info("bulk notifications created | count=%d type=%s", len(created), data.type)
    return created


# ---------------------------------------------------------------------------
# Read-side queries
# ---------------------------------------------------------------------------

def list_notifications(
    db: Session,
    recipient_id: str,
    page: int = 1,
    limit: int = 20,
    unread_only: bool = False,
    category: Optional[str] = None,
    notif_type: Optional[str] = None,
) -> Tuple[List[Notification], int, int]:
    query = db.query(Notification).filter(Notification.recipient_id == recipient_id)

    if unread_only:
        query = query.filter(Notification.is_read.is_(False))
    if category:
        query = query.filter(Notification.category == category)
    if notif_type:
        query = query.filter(Notification.type == notif_type)

    total = query.count()

    items = (
        query.order_by(Notification.created_at.desc())
        .offset((page - 1) * limit)
        .limit(limit)
        .all()
    )

    unread_count = get_unread_count(db, recipient_id)

    return items, total, unread_count


def get_unread_count(db: Session, recipient_id: str) -> int:
    return (
        db.query(func.count(Notification.id))
        .filter(Notification.recipient_id == recipient_id, Notification.is_read.is_(False))
        .scalar()
        or 0
    )


def get_notification(db: Session, notification_id: str, recipient_id: str) -> Optional[Notification]:
    """Ownership-scoped lookup — a user can never fetch another user's
    notification by guessing an id (§52 enumeration protection)."""
    return (
        db.query(Notification)
        .filter(Notification.id == notification_id, Notification.recipient_id == recipient_id)
        .first()
    )


def mark_read(db: Session, notification_id: str, recipient_id: str) -> Optional[Notification]:
    notification = get_notification(db, notification_id, recipient_id)
    if not notification:
        return None
    if not notification.is_read:
        notification.is_read = True
        notification.status = "READ"
        notification.read_at = datetime.utcnow()
        db.commit()
        db.refresh(notification)
    return notification


def mark_all_read(db: Session, recipient_id: str) -> int:
    now = datetime.utcnow()
    updated = (
        db.query(Notification)
        .filter(Notification.recipient_id == recipient_id, Notification.is_read.is_(False))
        .update({"is_read": True, "status": "READ", "read_at": now}, synchronize_session=False)
    )
    db.commit()
    return updated


def delete_notification(db: Session, notification_id: str, recipient_id: str) -> bool:
    notification = get_notification(db, notification_id, recipient_id)
    if not notification:
        return False
    db.delete(notification)
    db.commit()
    return True
