from sqlalchemy import Column, String, Boolean, UniqueConstraint
from database import Base


class NotificationPreference(Base):
    """
    Minimal, forward-looking preference model (§50). Not wired into any
    UI in v1 — the LMS has no existing settings surface for this — but
    the shape is here so that in-app category muting (and later,
    per-channel opt-out once email/SMS exist) can be added without a
    schema migration surprise. If a row doesn't exist for a
    (user_id, category) pair, the default is "enabled".
    """
    __tablename__ = "notification_preferences"

    id = Column(String, primary_key=True)
    user_id = Column(String, nullable=False, index=True)
    category = Column(String, nullable=False)  # e.g. "ASSIGNMENT", "SCHEDULE"
    in_app_enabled = Column(Boolean, nullable=False, default=True)

    __table_args__ = (
        UniqueConstraint("user_id", "category", name="uq_pref_user_category"),
    )
