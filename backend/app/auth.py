from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from .schemas import (
    RegisterRequest, RegisterResponse, UserResponse, LoginRequest, LoginResponse,
    RefreshTokenRequest, RefreshTokenResponse, ChangePasswordRequest,
    DeleteAccountRequest, MessageResponse,
)
from .database import get_db
from .crud import create_user, authenticate_user, get_student_by_id, update_user_password, delete_user
from .models import User
from .backend_auth_utilities import decode_token, get_current_user, create_access_token, create_refresh_token, verify_password  # you need JWT helper functions
import os
from fastapi import Header

router = APIRouter(prefix="/auth", tags=["Auth"])

@router.post("/register", response_model=RegisterResponse)
def register(user: RegisterRequest, db: Session = Depends(get_db)):
    if db.query(User).filter(User.registrationNumber == user.registrationNumber).first():
        raise HTTPException(status_code=400, detail="Registration Number Present")

    # Create user in DB
    new_user: User = create_user(db, user)

    # Generate JWT tokens
    access_token = create_access_token({
    "sub": str(new_user.id),
    "role": new_user.role
    })

    refresh_token = create_refresh_token(new_user.id)

    user_data = UserResponse(
        id=new_user.id,
        registrationNumber=new_user.registrationNumber,
        first_name=new_user.first_name,
        last_name=new_user.last_name,
        program=new_user.program,
        role=new_user.role,
        newsletter=new_user.newsletter
    )

    return RegisterResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer",
        user=user_data
    )
    
    
@router.post("/login", response_model=LoginResponse)
def login(data: LoginRequest, db: Session = Depends(get_db)):
    user = authenticate_user(db, data.registrationNumber, data.password)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid Registration Number or password")

    full_name = f"{user.first_name} {user.last_name}"
    access_token = create_access_token({
        "sub": str(user.id),
        "role": user.role,
        "name": full_name,
        "reg_no": user.registrationNumber
    })
    refresh_token = create_refresh_token(user.id)

    user_data = UserResponse(
        id=user.id,
        registrationNumber=user.registrationNumber,
        first_name=user.first_name,
        last_name=user.last_name,
        role=user.role,
        newsletter=user.newsletter
    )

    return LoginResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer",
        user=user_data
    )   
    
    
@router.post("/refresh", response_model=RefreshTokenResponse)
def refresh_token(data: RefreshTokenRequest, db: Session = Depends(get_db)):
    """
    Accepts a refresh token and returns a new access token.

    The new access token carries the SAME claims as the one issued at login
    (sub/role/name/reg_no). Every other microservice authorises requests from
    the `role` claim, so a token without it would be rejected with 403.
    """
    try:
        payload = decode_token(data.refresh_token)
        if payload.get("type") != "refresh":
            raise HTTPException(status_code=401, detail="Invalid token type")

        user_id: str = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token")

        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        access_token = create_access_token({
            "sub": str(user.id),
            "role": user.role,
            "name": f"{user.first_name} {user.last_name}",
            "reg_no": user.registrationNumber,
        })
        return RefreshTokenResponse(access_token=access_token, token_type="bearer")

    except Exception:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired refresh token")

@router.get("/student/{student_id}/details", response_model=UserResponse)
def get_student_details(student_id: str, db: Session = Depends(get_db)):
    student = get_student_by_id(db, student_id)
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    
    return UserResponse(
        id=student.id,
        registrationNumber=student.registrationNumber,
        first_name=student.first_name,
        last_name=student.last_name,
        role=student.role,
        newsletter=student.newsletter
    )       


# ----------------------------------------------------------------------
# Account management (Settings > Security / header "user details")
# All three routes below use get_current_user, i.e. they act on whoever
# owns the Bearer token in the request — never on an id passed by the
# client — so the frontend never has to (and never should) send a user
# id for "my own" account actions.
# ----------------------------------------------------------------------

@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    """Returns the currently authenticated user's real data from the DB."""
    return UserResponse(
        id=current_user.id,
        registrationNumber=current_user.registrationNumber,
        first_name=current_user.first_name,
        last_name=current_user.last_name,
        role=current_user.role,
        newsletter=current_user.newsletter
    )


@router.put("/change-password", response_model=MessageResponse)
def change_password(
    data: ChangePasswordRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if not verify_password(data.current_password, current_user.password):
        raise HTTPException(status_code=400, detail="Current password is incorrect")

    if len(data.new_password) < 8:
        raise HTTPException(status_code=400, detail="New password must be at least 8 characters long")

    if verify_password(data.new_password, current_user.password):
        raise HTTPException(status_code=400, detail="New password must be different from the current password")

    update_user_password(db, current_user, data.new_password)
    return MessageResponse(message="Password updated successfully")


@router.delete("/me", response_model=MessageResponse)
def delete_my_account(
    data: DeleteAccountRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if not verify_password(data.password, current_user.password):
        raise HTTPException(status_code=400, detail="Password is incorrect")

    delete_user(db, current_user)
    return MessageResponse(message="Account deleted successfully")