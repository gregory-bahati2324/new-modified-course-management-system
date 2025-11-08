from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from .schemas import RegisterRequest, RegisterResponse, UserResponse, LoginRequest, LoginResponse, RefreshTokenRequest, RefreshTokenResponse
from .database import get_db
from .crud import create_user, authenticate_user
from .models import User
from .backend_auth_utilities import decode_token, get_current_user, create_access_token, create_refresh_token  # you need JWT helper functions

router = APIRouter(prefix="/auth", tags=["Auth"])

@router.post("/register", response_model=RegisterResponse)
def register(user: RegisterRequest, db: Session = Depends(get_db)):
    # Check if email already exists
    if db.query(User).filter(User.registrationNumber == user.registrationNumber).first():
        raise HTTPException(status_code=400, detail="Email already registered")

    # Create user in DB
    new_user: User = create_user(db, user)

    # Generate JWT tokens (replace with your JWT logic)
    access_token = create_access_token({"sub": str(new_user.id)})
    refresh_token = create_refresh_token({"sub": str(new_user.id)})

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
        raise HTTPException(status_code=401, detail="Invalid email or password")

    access_token = create_access_token({"sub": str(user.id),
                                        "role": user.role})
    refresh_token = create_refresh_token({"sub": str(user.id),
                                          "role": user.role})

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
    """
    try:
        # Decode refresh token
        payload = decode_token(data.refresh_token)
        user_id: str = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token")

        # Verify user exists
        user = db.query(get_current_user.__annotations__['return']).filter_by(id=user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        # Generate new access token
        access_token = create_access_token({"sub": str(user.id)})
        return RefreshTokenResponse(access_token=access_token, token_type="bearer")
    
    except Exception:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired refresh token")     
