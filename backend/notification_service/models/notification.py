import uuid
from sqlalchemy import (
    Column, String, Text, DateTime, Boolean, Integer, JSON, func, Index, UniqueConstraint
)
from database import Base


def gen_uuid() -> str:
    return str(uuid.uuid4())


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(String, primary_key=True, default=gen_uuid)

    # Who this notification is for / who (if anyone) caused it.
    recipient_id = Column(String, nullable=False, index=True)
    actor_id = Column(String, nullable=True)

    # Classification
    type = Column(String, nullable=False, index=True)       # e.g. ASSIGNMENT_GRADED
    category = Column(String, nullable=False, index=True)   # e.g. ASSIGNMENT
    priority = Column(String, nullable=False, default="NORMAL")  # LOW/NORMAL/HIGH/URGENT

    # Content
    title = Column(String, nullable=False)
    message = Column(Text, nullable=False)
    action_url = Column(String, nullable=True)

    # Read state
    status = Column(String, nullable=False, default="UNREAD")  # UNREAD / READ
    is_read = Column(Boolean, nullable=False, default=False, index=True)
    read_at = Column(DateTime(timezone=True), nullable=True)

    # Provenance / idempotency support
    source_service = Column(String, nullable=True)
    source_entity_type = Column(String, nullable=True)
    source_entity_id = Column(String, nullable=True)
    event_id = Column(String, nullable=True, index=True)

    # Free-form extra data for the frontend (assignment id, course id, etc.)
    extra_metadata = Column(JSON, nullable=True, default=dict)

    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    expires_at = Column(DateTime(timezone=True), nullable=True)

    __table_args__ = (
        # Primary read pattern: "give me this user's notifications, newest
        # first, optionally filtered to unread" — covered by one composite index.
        Index("ix_notifications_recipient_created", "recipient_id", "created_at"),
        Index("ix_notifications_recipient_unread", "recipient_id", "is_read"),
        Index("ix_notifications_recipient_category", "recipient_id", "category"),
        # IDEMPOTENCY: a DB-level guarantee (not just an application-level
        # check-then-insert, which would race under concurrent delivery)
        # that the same event never creates two notifications for the same
        # recipient. event_id is NULL-able (e.g. for admin-authored
        # announcements with no upstream event), and Postgres treats NULLs
        # as distinct for uniqueness purposes, so this constraint is a
        # no-op for those rows — which is fine, they aren't event-sourced.
        UniqueConstraint(
            "event_id", "recipient_id", "type",
            name="uq_notifications_event_recipient_type",
        ),
    )
