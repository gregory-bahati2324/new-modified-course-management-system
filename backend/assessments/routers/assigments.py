from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Optional
from datetime import datetime

from schemas.assigments import AssignmentCreate, AssignmentResponse, StudentAssignmentResponse, SubmissionResponse
from crud.assigments import create_assignment, delete_assignment, get_assignments_for_instructor, get_assignment, get_submission_by_student_and_assignment, update_assignment, get_assignments_for_courses, get_student_assignment_detail, build_file_url, submit_assignment_service
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from services.enrollment_client import get_student_enrollments, get_course_details
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




@router.get("/student/assignments", response_model=list[StudentAssignmentResponse])
def get_student_assignments(
    db: Session = Depends(get_db),
    token_data = Depends(get_current_user_token),
    credentials: HTTPAuthorizationCredentials = Depends(HTTPBearer())
):
    raw_token = credentials.credentials

    # ---------------- GET ENROLLMENTS ----------------
    enrollments = get_student_enrollments(raw_token)

    if not enrollments:
        return []

    course_ids = [e.get("course_id") for e in enrollments if e.get("course_id")]

    # ---------------- GET ASSIGNMENTS ----------------
    assignments = get_assignments_for_courses(db, course_ids)

    results = []

    for assignment in assignments:

        # ---------------- COURSE DETAILS ----------------
        try:
            course = get_course_details(assignment.course_id, raw_token)
        except Exception:
            course = None

        # ---------------- STATUS LOGIC ----------------
        now = datetime.utcnow()

        student_id = token_data.sub

        submission = get_submission_by_student_and_assignment(
            db,
            assignment.id,
            student_id
        )

        if submission:
            status = "submitted"
        elif assignment.due_date and assignment.due_date < now:
            status = "overdue"
        else:
            status = "pending"

        # ---------------- RESPONSE ----------------
        results.append({
            "id": assignment.id,
            "title": assignment.title,
            "description": assignment.description,
            "instructions": assignment.instructions,
            "course_id": assignment.course_id,
            "course_title": course.get("title") if course else None,
            "due_date": assignment.due_date,
            "total_points": assignment.total_points,
            "file_url": assignment.file_url,
            "submitted": assignment.submitted,
            "graded": assignment.graded,
            "status": status,
            "created_at": assignment.created_at,
            "updated_at": assignment.updated_at,
        })

    return results


@router.get("/student/{assignment_id}/details", response_model=StudentAssignmentResponse)
def get_student_assignment_detail_route(
    assignment_id: str,
    db: Session = Depends(get_db),
    token_data = Depends(get_current_user_token),
    credentials: HTTPAuthorizationCredentials = Depends(HTTPBearer())
):
    raw_token = credentials.credentials

    # ---------------- GET ENROLLMENTS ----------------
    enrollments = get_student_enrollments(raw_token)
    course_ids = [e.get("course_id") for e in enrollments if e.get("course_id")]

    # ---------------- GET ASSIGNMENT (CRUD) ----------------
    assignment = get_student_assignment_detail(db, assignment_id, course_ids)

    if not assignment:
        raise HTTPException(status_code=404, detail="Assignment not found")

    # ---------------- COURSE DETAILS ----------------
    try:
        course = get_course_details(assignment.course_id, raw_token)
    except Exception:
        course = None

    # ---------------- STATUS LOGIC ----------------
    now = datetime.utcnow()

    student_id = token_data.sub

    submission = get_submission_by_student_and_assignment(
        db,
        assignment_id,
        student_id
    )

    if submission:
        status = "submitted"
    elif assignment.due_date and assignment.due_date < now:
        status = "overdue"
    else:
        status = "pending"
    # ---------------- RESPONSE ----------------
    return {
        "id": assignment.id,
        "title": assignment.title,
        "description": assignment.description,
        "instructions": assignment.instructions,
        "course_id": assignment.course_id,
        "course_title": course.get("title") if course else None,
        "due_date": assignment.due_date,
        "total_points": assignment.total_points,
        "file_url": build_file_url(assignment.file_url),
        "submitted": submission is not None,
        "graded": assignment.graded,
        "status": status,
        "created_at": assignment.created_at,
        "updated_at": assignment.updated_at,
    }
    

@router.post("/{assignment_id}/submit", response_model=SubmissionResponse)
async def submit_assignment(
    assignment_id: str,
    submission_text: str = Form(""),
    file: UploadFile = File(None),

    db: Session = Depends(get_db),
    token_data = Depends(get_current_user_token)
):
    student_id = token_data.sub

    submission = await submit_assignment_service(
        db=db,
        assignment_id=assignment_id,
        student_id=student_id,
        submission_text=submission_text,
        file=file
    )

    if not submission:
        raise HTTPException(status_code=404, detail="Assignment not found")

    return submission    