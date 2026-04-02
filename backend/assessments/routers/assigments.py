# backend/assessments/routers/assignments.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Optional
from datetime import datetime

from schemas.assigments import AssignmentCreate, AssignmentResponse
from crud.assigments import create_assignment, delete_assignment, get_assignments_for_instructor, get_assignment, update_assignment
from database import get_db
from utils.auth import get_current_user_token, require_role

router = APIRouter(prefix="/assignments", tags=["Assignments"])

# Dependency to only allow instructors
get_current_instructor = require_role(["instructor", "admin"])


# CREATE ASSIGNMENT

from fastapi import UploadFile, File, Form
import os
import uuid

UPLOAD_DIR = "uploads/assignments"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("", response_model=AssignmentResponse)
async def create_assignment_route(
    title: str = Form(...),
    description: str = Form(""),
    instructions: str = Form(""),
    course_id: str = Form(...),
    due_date: str = Form(...),
    total_points: int = Form(0),
    status: str = Form("draft"),
    file: UploadFile = File(None),  # ✅ optional

    db: Session = Depends(get_db),
    token_data = Depends(get_current_instructor)
):
    instructor_id = token_data.sub

    file_url = None

    # ✅ HANDLE FILE
    if file:
        if file.content_type != "application/pdf":
            raise HTTPException(status_code=400, detail="Only PDF files allowed")

        filename = f"{uuid.uuid4()}.pdf"
        file_path = os.path.join(UPLOAD_DIR, filename)

        with open(file_path, "wb") as buffer:
            buffer.write(await file.read())

        file_url = f"/uploads/assignments/{filename}"

    # ✅ BUILD DATA DICT
    assignment_data = {
        "title": title,
        "description": description,
        "instructions": instructions,
        "course_id": course_id,
        "due_date": due_date,
        "total_points": total_points,
        "status": status,
        "file_url": file_url,
    }

    return create_assignment(db, assignment_data, instructor_id)
# -------------------------------
# GET ALL ASSIGNMENTS FOR LOGGED IN INSTRUCTOR
# -------------------------------
@router.get("", response_model=list[AssignmentResponse])
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

# -------------------------------
# UPDATE ASSIGNMENT
# -------------------------------
@router.put("/{assignment_id}/update", response_model=AssignmentResponse)
async def update_assignment_route(
    assignment_id: str,

    title: str = Form(None),
    description: str = Form(None),
    instructions: str = Form(None),
    due_date: str = Form(None),
    total_points: int = Form(None),
    status: str = Form(None),

    file: UploadFile = File(None),

    db: Session = Depends(get_db),
    token_data = Depends(get_current_instructor)
):
    instructor_id = token_data.sub

    assignment = get_assignment(db, assignment_id, instructor_id)

    if not assignment:
        raise HTTPException(status_code=404, detail="Assignment not found")

    update_data = {}

    # ---------------- FILE HANDLING ----------------
    if file:
        if file.content_type != "application/pdf":
            raise HTTPException(status_code=400, detail="Only PDF files allowed")

        # Delete old file if exists
        if assignment.file_url:
            old_path = assignment.file_url.replace("/uploads/", "uploads/")
            if os.path.exists(old_path):
                os.remove(old_path)

        # Save new file
        filename = f"{uuid.uuid4()}.pdf"
        file_path = os.path.join(UPLOAD_DIR, filename)

        with open(file_path, "wb") as buffer:
            buffer.write(await file.read())

        update_data["file_url"] = f"/uploads/assignments/{filename}"

    # ---------------- FIELD UPDATES ----------------
    if title is not None:
        update_data["title"] = title

    if description is not None:
        update_data["description"] = description

    if instructions is not None:
        update_data["instructions"] = instructions

    if due_date is not None:
        from datetime import datetime
        update_data["due_date"] = datetime.strptime(due_date, "%Y-%m-%d %H:%M:%S")

    if total_points is not None:
        update_data["total_points"] = total_points

    if status is not None:
        update_data["status"] = status

    # ---------------- DB UPDATE ----------------
    updated_assignment = update_assignment(
        db,
        assignment_id,
        instructor_id,
        update_data
    )

    return updated_assignment

@router.delete("/{assignment_id}/delete")
def delete_assignment_route(
    assignment_id: str,
    db: Session = Depends(get_db),
    token_data = Depends(get_current_instructor)
):
    instructor_id = token_data.sub

    result = delete_assignment(db, assignment_id, instructor_id)

    if not result:
        raise HTTPException(status_code=404, detail="Assignment not found")

    return {"message": "Assignment deleted successfully"}
