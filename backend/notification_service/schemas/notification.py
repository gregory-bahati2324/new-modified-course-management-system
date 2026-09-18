from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field, field_validator

from core.constants import CATEGORIES, PRIORITIES


# ---------------------------------------------------------------------------
# Outbound (what the frontend reads)
# ---------------------------------------------------------------------------

class NotificationResponse(BaseModel):
    id: str
    recipient_id: str
    actor_id: Optional[str] = None
    type: str
    category: str
    priority: str
    title: str
    message: str
    action_url: Optional[str] = None
    status: str
    is_read: bool
    read_at: Optional[datetime] = None
    source_service: Optional[str] = None
    source_entity_type: Optional[str] = None
    source_entity_id: Optional[str] = None
    metadata: Dict[str, Any] = Field(default_factory=dict, validation_alias="extra_metadata", serialization_alias="metadata")
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
        populate_by_name = True


class NotificationListResponse(BaseModel):
    items: List[NotificationResponse]
    total: int
    page: int
    limit: int
    unread_count: int


class UnreadCountResponse(BaseModel):
    unread_count: int


class MessageResponse(BaseModel):
    message: str


# ---------------------------------------------------------------------------
# Manual creation (admin-authored announcements, §11 SYSTEM_ANNOUNCEMENT)
# ---------------------------------------------------------------------------

class NotificationCreate(BaseModel):
    recipient_id: str
    type: str = "SYSTEM_ANNOUNCEMENT"
    category: str = "SYSTEM"
    priority: str = "NORMAL"
    title: str
    message: str
    action_url: Optional[str] = None
    metadata: Dict[str, Any] = Field(default_factory=dict)

    @field_validator("category")
    @classmethod
    def category_must_be_known(cls, v):
        if v not in CATEGORIES:
            raise ValueError(f"Unknown category '{v}'. Must be one of {CATEGORIES}")
        return v

    @field_validator("priority")
    @classmethod
    def priority_must_be_known(cls, v):
        if v not in PRIORITIES:
            raise ValueError(f"Unknown priority '{v}'. Must be one of {PRIORITIES}")
        return v


class BulkNotificationCreate(BaseModel):
    recipient_ids: List[str] = Field(..., min_length=1)
    type: str = "SYSTEM_ANNOUNCEMENT"
    category: str = "SYSTEM"
    priority: str = "NORMAL"
    title: str
    message: str
    action_url: Optional[str] = None
    metadata: Dict[str, Any] = Field(default_factory=dict)


# ---------------------------------------------------------------------------
# Internal event ingestion contract (§17) — what every other microservice
# sends to POST /internal/notifications/events
# ---------------------------------------------------------------------------

class NotificationEvent(BaseModel):
    event_id: str = Field(..., description="Unique ID for this business event, used for idempotency")
    event_type: str = Field(..., description="e.g. ASSIGNMENT_GRADED")
    source_service: str = Field(..., description="e.g. marking_grading_service")

    actor_id: Optional[str] = Field(None, description="User who caused the event, if any")
    recipient_ids: List[str] = Field(..., min_length=1, max_length=5000)

    entity_type: Optional[str] = Field(None, description="e.g. assignment, assessment, session")
    entity_id: Optional[str] = Field(None, description="e.g. the assignment id")
    course_id: Optional[str] = None

    title: str
    message: str
    action_url: Optional[str] = Field(None, description="Frontend route, e.g. /student/grades")
    priority: Optional[str] = None   # falls back to EVENT_TYPE_MAP default if omitted
    category: Optional[str] = None   # falls back to EVENT_TYPE_MAP default if omitted

    data: Dict[str, Any] = Field(default_factory=dict, description="Extra metadata for the frontend")
    timestamp: Optional[datetime] = None


class EventIngestResult(BaseModel):
    event_id: str
    created: int
    skipped_duplicates: int
    notification_ids: List[str]
