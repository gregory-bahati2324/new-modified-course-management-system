from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from database import get_db
from core.auth import get_current_user_token, require_role, TokenData
from core.config import settings
from core.constants import CATEGORIES
from schemas.notification import (
    NotificationResponse,
    NotificationListResponse,
    UnreadCountResponse,
    MessageResponse,
    NotificationCreate,
    BulkNotificationCreate,
)
from services import notification_service as svc

router = APIRouter(prefix="/notifications", tags=["Notifications"])
require_admin = require_role(["admin"])


@router.get("", response_model=NotificationListResponse)
def get_notifications(
    page: int = Query(1, ge=1),
    limit: int = Query(settings.DEFAULT_PAGE_SIZE, ge=1, le=settings.MAX_PAGE_SIZE),
    unread_only: bool = Query(False),
    category: Optional[str] = Query(None, description="Filter by category, e.g. ASSIGNMENT"),
    type: Optional[str] = Query(None, description="Filter by exact notification type"),
    db: Session = Depends(get_db),
    token: TokenData = Depends(get_current_user_token),
):
    if category and category not in CATEGORIES:
        raise HTTPException(status_code=400, detail=f"Unknown category '{category}'")

    items, total, unread_count = svc.list_notifications(
        db, recipient_id=token.sub, page=page, limit=limit,
        unread_only=unread_only, category=category, notif_type=type,
    )
    return NotificationListResponse(
        items=items, total=total, page=page, limit=limit, unread_count=unread_count,
    )


@router.get("/unread", response_model=NotificationListResponse)
def get_unread_notifications(
    page: int = Query(1, ge=1),
    limit: int = Query(settings.DEFAULT_PAGE_SIZE, ge=1, le=settings.MAX_PAGE_SIZE),
    db: Session = Depends(get_db),
    token: TokenData = Depends(get_current_user_token),
):
    items, total, unread_count = svc.list_notifications(
        db, recipient_id=token.sub, page=page, limit=limit, unread_only=True,
    )
    return NotificationListResponse(
        items=items, total=total, page=page, limit=limit, unread_count=unread_count,
    )


@router.get("/count", response_model=UnreadCountResponse)
def get_unread_count(
    db: Session = Depends(get_db),
    token: TokenData = Depends(get_current_user_token),
):
    return UnreadCountResponse(unread_count=svc.get_unread_count(db, token.sub))


@router.post("", response_model=NotificationResponse, status_code=201)
def create_notification(
    data: NotificationCreate,
    db: Session = Depends(get_db),
    _: TokenData = Depends(require_admin),
):
    """
    Admin-authored, single-recipient notification (e.g. a targeted
    SYSTEM_ANNOUNCEMENT). Not for general business events — those go
    through POST /internal/notifications/events from a trusted backend
    service instead (§17). This endpoint exists for §11's
    admin-to-user/role/course announcement concept.
    """
    return svc.create_manual_notification(db, data)


@router.post("/bulk", response_model=list[NotificationResponse], status_code=201)
def create_bulk_notifications(
    data: BulkNotificationCreate,
    db: Session = Depends(get_db),
    _: TokenData = Depends(require_admin),
):
    return svc.create_bulk_notifications(db, data)


@router.get("/{notification_id}", response_model=NotificationResponse)
def get_notification(
    notification_id: str,
    db: Session = Depends(get_db),
    token: TokenData = Depends(get_current_user_token),
):
    notification = svc.get_notification(db, notification_id, token.sub)
    if not notification:
        # Deliberately identical to "not yours" — see PATCH/DELETE below —
        # to avoid leaking whether the id exists at all (§52).
        raise HTTPException(status_code=404, detail="Notification not found")
    return notification


@router.patch("/read-all", response_model=MessageResponse)
def mark_all_read(
    db: Session = Depends(get_db),
    token: TokenData = Depends(get_current_user_token),
):
    count = svc.mark_all_read(db, token.sub)
    return MessageResponse(message=f"Marked {count} notification(s) as read")


@router.patch("/{notification_id}/read", response_model=NotificationResponse)
def mark_notification_read(
    notification_id: str,
    db: Session = Depends(get_db),
    token: TokenData = Depends(get_current_user_token),
):
    notification = svc.mark_read(db, notification_id, token.sub)
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")
    return notification


@router.delete("/{notification_id}", response_model=MessageResponse)
def delete_notification(
    notification_id: str,
    db: Session = Depends(get_db),
    token: TokenData = Depends(get_current_user_token),
):
    deleted = svc.delete_notification(db, notification_id, token.sub)
    if not deleted:
        raise HTTPException(status_code=404, detail="Notification not found")
    return MessageResponse(message="Notification deleted")
