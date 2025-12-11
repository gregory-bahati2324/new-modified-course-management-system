from sqlalchemy.orm import Session
from models.assessments import Assessment, Question
from schemas.assessments import AssessmentCreate

# crud/assessments.py
from sqlalchemy.orm import Session
from models.assessments import Assessment
from schemas.assessments import AssessmentCreate
from datetime import datetime

def create_assessment(db: Session, data: AssessmentCreate, instructor_id: str):

    # Normalize due_date input
    due_date = data.due_date
    if isinstance(due_date, str):
        try:
            due_date = datetime.strptime(due_date, "%Y-%m-%d %H:%M:%S")
        except:
            # Accept browser ISO format: 2025-12-12T08:40:00
            due_date = datetime.fromisoformat(due_date)

    # Create assessment only (questions handled separately)
    assessment = Assessment(
        title=data.title,
        type=data.type,
        description=data.description,
        course_id=data.course_id,
        module_id=data.module_id,
        due_date=due_date,
        time_limit=data.time_limit,
        attempts=data.attempts,
        passing_score=data.passing_score,
        shuffle_questions=data.shuffle_questions,
        show_answers=data.show_answers,
        status=data.status,
        instructor_id=instructor_id
    )

    db.add(assessment)
    db.commit()
    db.refresh(assessment)

    return assessment


def get_assessments_for_instructor(db: Session, instructor_id: str):
    return db.query(Assessment).filter(Assessment.instructor_id == instructor_id).all()

def get_assessment(db: Session, assessment_id: int, instructor_id: str):
    return db.query(Assessment).filter(
        Assessment.id == assessment_id,
        Assessment.instructor_id == instructor_id
    ).first()

# crud/assessments.py (excerpt)
def update_assessment(db: Session, assessment_id: int, instructor_id: str, data):
    assessment = get_assessment(db, assessment_id, instructor_id)
    if not assessment:
        return None

    # data may be a pydantic model or dict — ensure we get a dict
    update_data = data.dict(exclude_unset=True) if hasattr(data, "dict") else dict(data)

    # DO NOT set questions directly (they should be managed via question CRUD)
    update_data.pop("questions", None)

    for key, value in update_data.items():
        if hasattr(assessment, key) and value is not None:
            setattr(assessment, key, value)

    db.commit()
    db.refresh(assessment)
    return assessment

