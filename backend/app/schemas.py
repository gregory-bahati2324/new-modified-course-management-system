from pydantic import BaseModel, EmailStr
from typing import Optional

# Request body for registration
class RegisterRequest(BaseModel):
    first_name: str
    last_name: str
    registrationNumber: str
    password: str
    newsletter: Optional[bool] = True
    role: Optional[str] = "student"  # Default role

# User object returned in response
class UserResponse(BaseModel):
    id: str
    registrationNumber: str
    first_name: str
    last_name: str
    role: str
    newsletter: bool

# Response for registration (matches authService expectations)
class RegisterResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str
    user: UserResponse
    
# Request body for login
class LoginRequest(BaseModel):
    registrationNumber: str
    password: str

# Response for login
class LoginResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str
    user: 'UserResponse'  # Use forward reference if UserResponse is already defined    
    
    
# Request body for refreshing token
class RefreshTokenRequest(BaseModel):
    refresh_token: str

# Response for refresh token
class RefreshTokenResponse(BaseModel):
    access_token: str
    token_type: str    
