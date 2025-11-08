"""
Authentication and Utility Functions for FastAPI Backend
Handles JWT tokens, password hashing, and role-based permissions.
"""

from datetime import datetime, timedelta
from typing import Optional, List
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy.orm import Session
from .models import User
from .database import get_db

# ============================================================================
# CONFIGURATION
# ============================================================================

SECRET_KEY = "your-secret-key-here-change-in-production"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30
REFRESH_TOKEN_EXPIRE_DAYS = 7

# Create bcrypt password context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# OAuth2 scheme - token will come from "Authorization: Bearer <token>"
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

# ============================================================================
# PASSWORD UTILITIES
# ============================================================================

def hash_password(password: str) -> str:
    """Hash a plain password using bcrypt"""
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify if plain password matches the hashed password"""
    return pwd_context.verify(plain_password, hashed_password)

# ============================================================================
# JWT UTILITIES
# ============================================================================

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Create JWT access token with expiration"""
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def create_refresh_token(data: dict) -> str:
    """Create JWT refresh token"""
    expire = timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    return create_access_token(data, expires_delta=expire)

def decode_token(token: str) -> dict:
    """Decode and verify JWT token"""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )

# ============================================================================
# AUTHENTICATION DEPENDENCIES
# ============================================================================

def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> User:
    """Extract current user from JWT and fetch from database"""
    payload = decode_token(token)
    user_id: str = payload.get("sub")
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid token")

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

def get_current_active_user(current_user: User = Depends(get_current_user)) -> User:
    """Check if the current user is active (extendable in the future)"""
    return current_user

# ============================================================================
# ROLE-BASED ACCESS CONTROL
# ============================================================================

class RoleChecker:
    """
    Dependency for restricting access to certain roles.

    Example:
        require_admin = RoleChecker(["admin"])

        @router.get("/admin/dashboard")
        def admin_dashboard(current_user: User = Depends(require_admin)):
            return {"message": "Welcome, admin!"}
    """
    def __init__(self, allowed_roles: List[str]):
        self.allowed_roles = allowed_roles

    def __call__(self, current_user: User = Depends(get_current_active_user)) -> User:
        if current_user.role not in self.allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions"
            )
        return current_user

# Common role dependencies
require_student = RoleChecker(["student"])
require_instructor = RoleChecker(["instructor", "admin"])
require_admin = RoleChecker(["admin"])
