import uuid
from sqlalchemy.orm import Session
from .models import User
from .schemas import RegisterRequest
from .backend_auth_utilities import hash_password, verify_password
from fastapi import HTTPException as HttpException

def create_user(db: Session, user_data: RegisterRequest):
    db_user = User(
        id=str(uuid.uuid4()),
        first_name=user_data.first_name,
        last_name=user_data.last_name,
        registrationNumber=user_data.registrationNumber,
        password=hash_password(user_data.password),
        role=user_data.role,
        newsletter=user_data.newsletter,
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


def authenticate_user(db: Session, registrationNumber: str, password: str):
    user = db.query(User).filter(User.registrationNumber == registrationNumber).first()
    if not user:
        raise HttpException(status_code=400, detail="Invalid registration number or password")
    if not verify_password(password, user.password):
        raise HttpException(status_code=400, detail="Invalid registration number or password")
    return user