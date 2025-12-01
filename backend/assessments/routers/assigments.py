# backend/assessments/routers/assignments.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Optional
from datetime import datetime

from schemas.assigments import AssignmentCreate, AssignmentResponse
from crud.assigments import create_assignment, get_assignments_for_instructor, get_assignment
from database import get_db
from utils.auth import get_current_user_token, require_role

router = APIRouter(prefix="/assignments", tags=["Assignments"])

# Dependency to only allow instructors
get_current_instructor = require_role(["instructor", "admin"])

# -------------------------------
# CREATE ASSIGNMENT
# -------------------------------
@router.post("/", response_model=AssignmentResponse)
def create_assignment_route(
    data: AssignmentCreate,
    db: Session = Depends(get_db),
    token_data = Depends(get_current_instructor)
):
    instructor_id = token_data.sub  # instructor_id comes from JWT 'sub' field
    return create_assignment(db, data, instructor_id)

# -------------------------------
# GET ALL ASSIGNMENTS FOR LOGGED IN INSTRUCTOR
# -------------------------------
@router.get("/", response_model=list[AssignmentResponse])
def get_instructor_assignments(
    db: Session = Depends(get_db),
    token_data = Depends(get_current_instructor)
):
    instructor_id = token_data.sub
    return get_assignments_for_instructor(db, instructor_id)

# -------------------------------
# GET SINGLE ASSIGNMENT
# -------------------------------
@router.get("/{assignment_id}", response_model=AssignmentResponse)
def get_assignment_route(
    assignment_id: str,
    db: Session = Depends(get_db),
    token_data = Depends(get_current_instructor)
):
    instructor_id = token_data.sub
    assignment = get_assignment(db, assignment_id, instructor_id)
    if not assignment:
        raise HTTPException(status_code=404, detail="Assignment not found")
    return assignment
