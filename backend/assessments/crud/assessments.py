from sqlalchemy.orm import Session
from models.assessments import Assessment, Question
from schemas.assessments import AssessmentCreate

def create_assessment(db: Session, data: AssessmentCreate, instructor_id: str):
    assessment = Assessment(
        title=data.title,
        type=data.type,
        description=data.description,
        course_id=data.course_id,
        module_id=data.module_id,
        due_date=data.due_date,
        due_time=data.due_time,
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

    # create questions if any
    for q in data.questions or []:
        question = Question(
            assessment_id=assessment.id,
            type=q.type,
            question_text=q.question_text,
            points=q.points or 1,
            options=q.options,
            correct_answer=q.correct_answer,
            model_answer=q.model_answer,
            test_cases=q.test_cases,
            reference_file=q.reference_file,
            matching_pairs=q.matching_pairs,
            correct_order=q.correct_order
        )
        db.add(question)
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

def update_assessment(db: Session, assessment_id: int, instructor_id: str, data: dict):
    assessment = get_assessment(db, assessment_id, instructor_id)
    if not assessment:
        return None
    for key, value in data.items():
        if value is not None:
            setattr(assessment, key, value)
    db.commit()
    db.refresh(assessment)
    return assessment
