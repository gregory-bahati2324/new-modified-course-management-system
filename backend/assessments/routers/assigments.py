from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from typing import Optional
from datetime import datetime

from schemas.assigments import AssignmentCreate, AssignmentResponse, StudentAssignmentResponse, SubmissionResponse, SubmissionCourseResponse, AssignmentGradingResponse
from crud.assigments import build_assignment_summary, create_assignment, delete_assignment, get_assignments_for_instructor, get_assignment, get_submission_by_student_and_assignment, get_total_assignment_for_course, update_assignment, get_assignments_for_courses, get_student_assignment_detail, build_file_url, submit_assignment_service, get_submissions_for_course, get_submission_for_grading
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from services.enrollment_client import get_student_enrollments, get_course_details
from services.grading_client import get_assignment_grade
from services.course_client import get_course_enrolled_student_ids
from services.notification_client import send_notification_event
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
    background_tasks: BackgroundTasks,
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

    assignment = create_assignment(db, assignment_data, instructor_id)

    # ---- Notification: ASSIGNMENT_CREATED -> enrolled students (§5, §46) ----
    # Only for assignments that are actually visible to students — a
    # "draft" assignment shouldn't ping anyone (matches the existing
    # get_published_assignments()/status=="published" convention used
    # elsewhere in this file).
    if status == "published":
        recipient_ids = get_course_enrolled_student_ids(course_id, token_data.raw_token)
        if recipient_ids:
            background_tasks.add_task(
                send_notification_event,
                event_type="ASSIGNMENT_CREATED",
                source_service="assessment_service",
                recipient_ids=recipient_ids,
                actor_id=instructor_id,
                entity_type="assignment",
                entity_id=assignment.id,
                course_id=course_id,
                title="New assignment posted",
                message=f"A new assignment, \"{title}\", has been posted.",
                action_url="/student/assignments",
            )

    return assignment
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
async def get_student_assignments(
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
            course = await get_course_details(assignment.course_id, raw_token)
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
        grade = None
        if submission:
            grade = get_assignment_grade(submission.id)

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
            "submission_id": submission.id if submission else None,
            "score": grade["score"] if grade else None,
            "created_at": assignment.created_at,
            "updated_at": assignment.updated_at,
        })

    return results


@router.get("/student/{assignment_id}/details", response_model=StudentAssignmentResponse)
async def get_student_assignment_detail_route(
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
        course = await get_course_details(assignment.course_id, raw_token)
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
    background_tasks: BackgroundTasks,
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

    # ---- Notification: ASSIGNMENT_SUBMITTED -> instructor (§5, §46) ----
    assignment = submission.assignment  # relationship already loaded (see crud)
    if assignment and assignment.instructor_id:
        background_tasks.add_task(
            send_notification_event,
            event_type="ASSIGNMENT_SUBMITTED",
            source_service="assessment_service",
            recipient_ids=[assignment.instructor_id],
            actor_id=student_id,
            entity_type="assignment_submission",
            entity_id=submission.id,
            course_id=assignment.course_id,
            title="New submission to grade",
            message=f"A student submitted \"{assignment.title}\".",
            action_url="/instructor/grade",
        )

    return submission   

@router.get("/course/{course_id}/submissions", response_model=list[SubmissionCourseResponse])
def get_submissions_for_course_route(
    course_id: str,
    db: Session = Depends(get_db),
    token = Depends(get_current_instructor)
):
    submissions = get_submissions_for_course(db, course_id)

    results = []

    for sub in submissions:
        assignment = sub.assignment  # requires relationship (see below)
        grade = get_assignment_grade(sub.id)

        results.append({
            "id": sub.id,
            "assignment_id": sub.assignment_id,
            "student_id": sub.student_id,
            "submission_text": sub.submission_text,
            "file_url": build_file_url(sub.file_url),
            "submitted_at": sub.submitted_at,

            # Assignment fields
            "title": assignment.title,
            "description": assignment.description,
            "instructions": assignment.instructions,
            "course_id": assignment.course_id,
            "due_date": assignment.due_date,
            "total_points": assignment.total_points,
            "status": assignment.status,
            "created_at": assignment.created_at,
            "updated_at": assignment.updated_at,

            "course_title": None , # optional if not fetched
            "grade": grade
        })

    return results


@router.get("/submissions/{submission_id}/grading")
def get_submission_for_grading_route(
    submission_id: str,
    db: Session = Depends(get_db),
    token=Depends(get_current_instructor)
):
    submission = get_submission_for_grading(db, submission_id)

    if not submission:
        raise HTTPException(status_code=404, detail="Submission not found")

    assignment = submission.assignment

    return {
        "submission": {
            "id": submission.id,
            "student_id": submission.student_id,
            "submitted_at": submission.submitted_at,
            "submission_text": submission.submission_text,
            "file_url": build_file_url(submission.file_url),
        },
        "assignment": {
            "id": assignment.id,
            "title": assignment.title,
            "instructions": assignment.instructions,
            "course_id": assignment.course_id,
            "due_date": assignment.due_date,
            "total_points": assignment.total_points,
        }
    }
    
@router.get("/student/{course_id}/summary")
def get_student_assignment_summary(
    course_id: str,
    db: Session = Depends(get_db),
    token=Depends(get_current_user_token)
):
    student_id = token.sub

    return build_assignment_summary(db, course_id, student_id)