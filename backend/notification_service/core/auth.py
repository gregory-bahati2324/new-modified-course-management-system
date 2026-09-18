"""
core/auth.py
Authentication for the notification service's two audiences:

1. End users (student/instructor/admin) reading/managing their own
   notifications — plain JWT Bearer auth, decoded locally exactly like
   backend/createCourse/app/auth_utils.py and backend/assessments/utils/auth.py
   do. No call back to auth_service's database; the token is trusted the
   same way every other microservice in this LMS already trusts it.

2. Trusted backend services posting events into
   POST /internal/notifications/events — a shared internal API key
   (X-Internal-Api-Key header), checked against NOTIFICATION_INTERNAL_API_KEY.
   This keeps the internal endpoint from being publicly writable by
   arbitrary end users without inventing a new service-auth system.
"""

from typing import Optional, List

from fastapi import Depends, HTTPException, status, Header
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError
from pydantic import BaseModel

from core.config import settings

security = HTTPBearer()


class TokenData(BaseModel):
    sub: Optional[str] = None
    role: Optional[str] = None


def decode_token(token: str) -> TokenData:
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        return TokenData(sub=payload.get("sub"), role=payload.get("role"))
    except JWTError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        ) from e


def get_current_user_token(
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> TokenData:
    token_data = decode_token(credentials.credentials)
    if not token_data.sub:
        raise HTTPException(status_code=401, detail="Invalid token: missing subject")
    return token_data


def require_role(allowed_roles: List[str]):
    def dependency(token_data: TokenData = Depends(get_current_user_token)):
        if token_data.role not in allowed_roles:
            raise HTTPException(status_code=403, detail="Insufficient permissions")
        return token_data

    return dependency


def verify_internal_api_key(x_internal_api_key: Optional[str] = Header(default=None)):
    """
    Guards the internal event-ingestion endpoint. Any other backend
    service that wants to publish a notification event must send this
    header. Arbitrary end users (who only ever hold a normal user JWT)
    cannot satisfy this check.
    """
    if not x_internal_api_key or x_internal_api_key != settings.INTERNAL_API_KEY:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or missing internal service credentials",
        )
    return True
