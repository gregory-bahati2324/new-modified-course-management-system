"""
core/config.py
Central place for the notification service's environment-driven
configuration. Mirrors the lightweight, no-framework config style
already used elsewhere in this project (e.g. scheduling_service/core/config.py).
"""

import os


class Settings:
    # --- JWT (same secret/algorithm as every other service in this LMS —
    # see backend/app/backend_auth_utilities.py and
    # backend/createCourse/app/auth_utils.py. Kept identical so a normal
    # user's Bearer token issued by auth_service works here unmodified.) ---
    SECRET_KEY: str = os.getenv(
        "JWT_SECRET_KEY", "your-secret-key-here-change-in-production"
    )
    ALGORITHM: str = os.getenv("JWT_ALGORITHM", "HS256")

    # --- Internal service-to-service authentication ---
    # Shared secret that trusted backend services attach to internal event
    # calls. This is intentionally a simple shared-secret header rather than
    # a new auth system: it's the smallest mechanism that satisfies
    # "internal ingestion must not be publicly writable by arbitrary users"
    # without introducing OAuth client-credentials flows, mTLS, or a service
    # registry that nothing else in this LMS currently has.
    INTERNAL_API_KEY: str = os.getenv(
        "NOTIFICATION_INTERNAL_API_KEY", "change-this-internal-notification-key"
    )

    # --- Pagination / limits ---
    DEFAULT_PAGE_SIZE: int = int(os.getenv("NOTIFICATION_DEFAULT_PAGE_SIZE", "20"))
    MAX_PAGE_SIZE: int = int(os.getenv("NOTIFICATION_MAX_PAGE_SIZE", "100"))
    RECENT_LIMIT: int = int(os.getenv("NOTIFICATION_RECENT_LIMIT", "10"))

    # --- Bulk event ingestion limits (defensive payload-size cap, §52) ---
    MAX_RECIPIENTS_PER_EVENT: int = int(os.getenv("NOTIFICATION_MAX_RECIPIENTS", "5000"))

    # --- Retention (optional; used only if a cleanup task is run) ---
    DEFAULT_EXPIRY_DAYS: int = int(os.getenv("NOTIFICATION_DEFAULT_EXPIRY_DAYS", "90"))


settings = Settings()
