"""
utils/optional_auth.py (module_lesson_service)

module_lesson_service doesn't authenticate requests at all today (see
routers/modules.py) — this file deliberately does NOT change that. It
only opportunistically reads whatever Bearer token the frontend already
sends (it always does — see frontend/src/services/moduleLessonapi.ts),
purely so notification recipient resolution has something to forward to
course_service. If the header is missing or unparsable, everything
still works exactly as before; the caller just gets no `actor_id`/no
notification fan-out for that request.

This is intentionally NOT a `Depends(...)` auth guard — adding one would
enforce authentication where none exists today, which would change
existing behaviour (§42/§56, "don't modify unrelated files/behaviour").
"""

from typing import Optional
from fastapi import Request



def get_bearer_token(request: Request) -> Optional[str]:
    auth_header = request.headers.get("authorization") or request.headers.get("Authorization")
    if not auth_header or not auth_header.lower().startswith("bearer "):
        return None
    return auth_header.split(" ", 1)[1].strip() or None


def get_actor_id_best_effort(token: Optional[str]) -> Optional[str]:
    """Decode just enough to get `sub` for the notification's actor_id.
    Never raises — an invalid/expired token just means no actor_id."""
    if not token:
        return None
    try:
        from jose import jwt

        payload = jwt.decode(
            token,
            "your-secret-key-here-change-in-production",
            algorithms=["HS256"],
            options={"verify_exp": False},
        )
        return payload.get("sub")
    except Exception:
        return None
