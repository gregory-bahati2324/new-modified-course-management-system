from sqlalchemy.orm import Session
from schemas.assigments import AssignmentCreate
from models.assigments import Assignment

# CREATE
def create_assignment(db: Session, data: AssignmentCreate, instructor_id: str):
    # ensure module_id is None if empty
    module_id = data.module_id if data.module_id not in ("", None) else None

    # ensure attempts
    attempts = 0 if data.attempts is not None and data.attempts == 0 else data.attempts

    # time_limit
    time_limit = data.time_limit if data.time_limit not in (None, '') else None

    # total_points
    total_points = data.total_points if data.total_points not in (None, '') else 0

    # due_date: convert from str to datetime if needed
    due_date = data.due_date
    if isinstance(due_date, str):
        from datetime import datetime
        # Parse "YYYY-MM-DD HH:MM:SS"
        due_date = datetime.strptime(due_date, "%Y-%m-%d %H:%M:%S")


    assignment = Assignment(
        title=data.title,
        type=data.type,
        description=data.description,
        instructions=data.instructions,
        course_id=data.course_id,
        module_id=module_id,
        due_date=due_date,
        attempts=attempts,
        time_limit=time_limit,
        total_points=total_points,
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