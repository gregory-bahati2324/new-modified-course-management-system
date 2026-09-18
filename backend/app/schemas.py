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

# ----------------------------------------------------------------------
# Account management (Settings > Security)
# ----------------------------------------------------------------------

# Request body for changing the logged-in user's password
class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str

# Request body for deleting the logged-in user's account.
# Requiring the password again (even though they're already authenticated)
# guards against someone deleting an account from a session left open on
# a shared/unlocked device.
class DeleteAccountRequest(BaseModel):
    password: str

# Generic simple message response, used by the two endpoints above
class MessageResponse(BaseModel):
    message: str