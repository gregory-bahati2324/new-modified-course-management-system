from fastapi import APIRouter
from sqlalchemy import text

from database import SessionLocal

router = APIRouter(tags=["Health"])


@router.get("/health")
def health_check():
    """Distinguishes service-alive from database-available (§39)."""
    db_status = "ok"
    try:
        db = SessionLocal()
        try:
            db.execute(text("SELECT 1"))
        finally:
            db.close()
    except Exception as e:
        db_status = f"unavailable: {e}"

    overall = "healthy" if db_status == "ok" else "degraded"
    return {
        "status": overall,
        "service": "notification_service",
        "database": db_status,
    }
