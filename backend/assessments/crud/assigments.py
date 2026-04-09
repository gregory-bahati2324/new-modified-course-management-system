from fastapi import HTTPException, UploadFile
from sqlalchemy.orm import Session
from schemas.assigments import AssignmentCreate
from models.assigments import Assignment, AssignmentSubmission
import os
from typing import List
import uuid
from datetime import datetime

# CREATE
def create_assignment(db: Session, data: dict, instructor_id: str):
    from datetime import datetime

    due_date = data.get("due_date")

    if isinstance(due_date, str):
        due_date = datetime.strptime(due_date, "%Y-%m-%d %H:%M:%S")

    assignment = Assignment(
        title=data.get("title"),
        description=data.get("description"),
        instructions=data.get("instructions"),
        course_id=data.get("course_id"),
        due_date=due_date,
        total_points=data.get("total_points", 0),
        status=data.get("status", "draft"),
        file_url=data.get("file_url"),  # ✅ NEW
        instructor_id=instructor_id
    )

    db.add(assignment)
    db.commit()
    db.refresh(assignment)
    return assignment

# GET ALL BY INSTRUCTOR
def get_assignments_for_instructor(db: Session, instructor_id: str):
    return db.query(Assignment).filter(Assignment.instructor_id == instructor_id).all()

# GET ONE
def get_assignment(db: Session, assignment_id: str, instructor_id: str):
    return db.query(Assignment).filter(
        Assignment.id == assignment_id,
        Assignment.instructor_id == instructor_id
    ).first()
    
def get_student_assignment_detail(db: Session, assignment_id: str, course_ids: List[str]):
    if not course_ids:
        return None

    return db.query(Assignment).filter(
        Assignment.id == assignment_id,
        Assignment.course_id.in_(course_ids),
        Assignment.status == "published"
    ).first()
    


BASE_FILE_URL = os.getenv("BASE_FILE_URL", "http://localhost:8003")


def build_file_url(file_path: str):
    if not file_path:
        return None
    return f"{BASE_FILE_URL}/{file_path.lstrip('/')}"
        
# UPDATE
def update_assignment(db: Session, assignment_id: str, instructor_id: str, data:    dict):
    assignment = get_assignment(db, assignment_id, instructor_id)
    if not assignment:
        return None
    for key, value in data.items():
        if value is not None:
            setattr(assignment, key, value)
    db.commit()
    db.refresh(assignment)
    return assignment



UPLOAD_BASE_DIR = "uploads"

def delete_assignment(db: Session, assignment_id: str, instructor_id: str):
    # Get assignment
    assignment = db.query(Assignment).filter(
        Assignment.id == assignment_id,
        Assignment.instructor_id == instructor_id
    ).first()

    if not assignment:
        return None

    # ---------------- DELETE FILE ----------------
    if assignment.file_url:
        try:
            file_path = assignment.file_url.replace("/uploads/", "uploads/")
            if os.path.exists(file_path):
                os.remove(file_path)
        except Exception as e:
            print(f"File deletion error: {e}")

    # ---------------- DELETE DB ----------------
    db.delete(assignment)
    db.commit()

    return True



def get_assignments_for_courses(db: Session, course_ids: List[str]):
    if not course_ids:
        return []

    return db.query(Assignment).filter(
        Assignment.course_id.in_(course_ids),
        Assignment.status == "published"
    ).all()
    

def create_submission(db: Session, data: dict):
    existing_submission = db.query(AssignmentSubmission).filter(
        AssignmentSubmission.assignment_id == data["assignment_id"],
        AssignmentSubmission.student_id == data["student_id"]
    ).first()

    if existing_submission:
        raise HTTPException(
            status_code=400,
            detail="You have already submitted this assignment"
        )

    submission = AssignmentSubmission(**data)
    db.add(submission)
    db.commit()
    db.refresh(submission)

    return submission


UPLOAD_SUBMISSION_DIR = "uploads/submissions"
os.makedirs(UPLOAD_SUBMISSION_DIR, exist_ok=True)


async def submit_assignment_service(
    db: Session,
    assignment_id: str,
    student_id: str,
    submission_text: str,
    file: UploadFile = None
):
    # ---------------- CHECK ASSIGNMENT ----------------
    assignment = db.query(Assignment).filter(
        Assignment.id == assignment_id,
        Assignment.status == "published"
    ).first()

    if not assignment:
        return None
    
    # ---------------- 🚨 BLOCK OVERDUE ----------------
    now = datetime.utcnow()

    if assignment.due_date and assignment.due_date < now:
        raise HTTPException(
            status_code=400,
            detail="Submission deadline has passed. You cannot submit this assignment."
        )


    file_url = None

    # ---------------- HANDLE FILE ----------------
    if file:
        filename = f"{uuid.uuid4()}_{file.filename}"
        file_path = os.path.join(UPLOAD_SUBMISSION_DIR, filename)

        with open(file_path, "wb") as buffer:
            buffer.write(await file.read())

        file_url = f"/uploads/submissions/{filename}"

    # ---------------- SAVE ----------------
    submission_data = {
        "assignment_id": assignment_id,
        "student_id": student_id,
        "submission_text": submission_text,
        "file_url": file_url,
    }

    submission = create_submission(db, submission_data)

    # ---------------- UPDATE ASSIGNMENT ----------------
    assignment.submitted = True
    db.commit()

    return submission    

def get_submission_by_student_and_assignment(
    db: Session,
    assignment_id: str,
    student_id: str
):
    return db.query(AssignmentSubmission).filter(
        AssignmentSubmission.assignment_id == assignment_id,
        AssignmentSubmission.student_id == student_id
    ).first()
    
def get_submissions_for_course(db: Session, course_id: str):
    return (
        db.query(AssignmentSubmission)
        .join(Assignment, AssignmentSubmission.assignment_id == Assignment.id)
        .filter(Assignment.course_id == course_id)
        .all()
    )       
    
def get_submission_for_grading(db: Session, submission_id: str):
    submission = (
        db.query(AssignmentSubmission)
        .join(Assignment, AssignmentSubmission.assignment_id == Assignment.id)
        .filter(AssignmentSubmission.id == submission_id)
        .first()
    )

    if not submission:
        return None

    return submission    