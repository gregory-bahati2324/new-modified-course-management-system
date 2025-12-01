# utils/auth.py
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError
from typing import Optional
from pydantic import BaseModel

# ============================================================================
# CONFIGURATION  (IMPORTANT: Same secret + algorithm as your Auth Service)
# ============================================================================
SECRET_KEY = "your-secret-key-here-change-in-production"
ALGORITHM = "HS256"

# Use HTTPBearer to read JWT from Authorization: Bearer <token>
security = HTTPBearer()

# ============================================================================
# TOKEN DATA MODEL
# ============================================================================
class TokenData(BaseModel):
    sub: Optional[str] = None   # user id
    role: Optional[str] = None  # instructor / student / admin

# ============================================================================
# TOKEN DECODER
# ============================================================================
def decode_token(token: str) -> TokenData:
    """
    Decode JWT token and return user data.
    """
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        role = payload.get("role")

        return TokenData(sub=user_id, role=role)

    except JWTError:
        raise HTTPException(
            status_code=401,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )

# ============================================================================
# GET CURRENT USER (NO DATABASE NEEDED)
# ============================================================================
def get_current_user_token(
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> TokenData:
    """
    Extract user info from the Authorization header.
    """
    token = credentials.credentials
    td = decode_token(token)

    if not td.sub:
        raise HTTPException(401, "Invalid token: missing subject")

    return td

# ============================================================================
# ROLE CHECKER
# ============================================================================
def require_role(allowed_roles: list):
    """
    Restrict endpoints to certain user roles.
    """
    def wrapper(td: TokenData = Depends(get_current_user_token)):
        if td.role not in allowed_roles:
            raise HTTPException(
                status_code=403,
                detail="Insufficient permissions"
            )
        return td

    return wrapper
