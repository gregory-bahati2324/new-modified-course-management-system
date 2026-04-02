from sqlalchemy.orm import Session
from schemas.assigments import AssignmentCreate
from models.assigments import Assignment
import os

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