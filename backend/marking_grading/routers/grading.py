from fastapi import APIRouter, Depends
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from utils.auth import get_current_user_token
from services.aggregator import (get_student_submission_details,
                                 get_submission_details)

router = APIRouter()

@router.get("/dashboard")
def grading_dashboard(token=Depends(get_current_user_token), 
        credentials: HTTPAuthorizationCredentials = Depends(HTTPBearer())):
    raw_token = credentials.credentials
    return get_student_submission_details(raw_token)

@router.get("/submissions/{submission_id}")
def submission_details(
    submission_id: str,
    token: str = Depends(get_current_user_token),
    credentials: HTTPAuthorizationCredentials = Depends(HTTPBearer())
):
    raw_token = credentials.credentials
    return get_submission_details(raw_token, submission_id)