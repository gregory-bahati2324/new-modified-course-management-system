# app/auth_utils.py
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError
from typing import Optional
from pydantic import BaseModel

# ==============================
# CONFIG
# ==============================
# IMPORTANT: use same SECRET_KEY and ALGORITHM as your Auth Service
SECRET_KEY = "your-secret-key-here-change-in-production"
ALGORITHM = "HS256"

# HTTPBearer = simpler security scheme (works perfectly with JWT tokens)
security = HTTPBearer()

# ==============================
# TOKEN DATA MODEL
# ==============================
class TokenData(BaseModel):
    sub: Optional[str] = None
    role: Optional[str] = None

# ==============================
# TOKEN DECODING FUNCTION
# ==============================
def decode_token(token: str) -> TokenData:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        role: str = payload.get("role")
        return TokenData(sub=user_id, role=role)
    except JWTError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        ) from e

# ==============================
# CURRENT USER TOKEN DEPENDENCY
# ==============================
def get_current_user_token(credentials: HTTPAuthorizationCredentials = Depends(security)) -> TokenData:
    token = credentials.credentials
    td = decode_token(token)
    if not td.sub:
        raise HTTPException(status_code=401, detail="Invalid token: missing subject")
    return td

# ==============================
# ROLE CHECK DEPENDENCY
# ==============================
def require_role(allowed_roles: list):
    def dependency(td: TokenData = Depends(get_current_user_token)):
        if td.role not in allowed_roles:
            raise HTTPException(status_code=403, detail="Insufficient permissions")
        return td
    return dependency
