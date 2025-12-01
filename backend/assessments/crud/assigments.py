from sqlalchemy.orm import Session
from schemas.assigments import AssignmentCreate
from models.assigments import Assignment

# CREATE
def create_assignment(db: Session, data: AssignmentCreate, instructor_id: str):
    assignment = Assignment(
        title=data.title,
        type=data.type,
        description=data.description,
        instructions=data.instructions,
        course_id=data.course_id,
        module_id=data.module_id,
        due_date=data.due_date,
        attempts=data.attempts,
        time_limit=data.time_limit,
        total_points=data.total_points,
        status=data.status,
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