from datetime import datetime
from fastapi import HTTPException
from sqlalchemy.orm import Session
from models.results import AssignmentGrade
from models.results import AssessmentGrade



def upsert_assignment_grade(db: Session, data: dict, instructor_id: str):

    grade = db.query(AssignmentGrade).filter(
        AssignmentGrade.submission_id == data["submission_id"]
    ).first()

    if grade:
        #  UPDATE EXISTING
        grade.score = data["score"]
        grade.max_score = data["max_score"]
        grade.feedback = data.get("feedback")
        grade.is_published = data.get("is_published", False)
        grade.updated_at = datetime.utcnow()

        db.commit()
        db.refresh(grade)
        return grade

    #  CREATE NEW
    grade = AssignmentGrade(
        submission_id=data["submission_id"],
        assignment_id=data["assignment_id"],
        student_id=data["student_id"],
        course_id=data.get("course_id"),
        instructor_id=instructor_id,
        score=data["score"],
        max_score=data["max_score"],
        feedback=data.get("feedback"),
        is_published=data.get("is_published", False),
    )

    db.add(grade)
    db.commit()
    db.refresh(grade)

    return grade

def get_assignment_grade(db: Session, submission_id: str):
    return db.query(AssignmentGrade).filter(
        AssignmentGrade.submission_id == submission_id
    ).first()
    
def get_assignment_grade_for_student(db: Session, submission_id: str):
    data = db.query(AssignmentGrade).filter(
        AssignmentGrade.submission_id == submission_id
    ).first()
    
    if not data:
        raise HTTPException(status_code=404, detail="Grade not found")
    
    return {
        "score": data.score,
        "graded": data.is_published
    }        
    
def get_all_assignment_grades(db: Session, course_id: str = None):
    query = db.query(AssignmentGrade)

    if course_id:
        query = query.filter(AssignmentGrade.course_id == course_id)

    return query.all()    


def upsert_assessment_grade(db: Session, data: dict, instructor_id: str):

    grade = db.query(AssessmentGrade).filter(
        AssessmentGrade.attempt_id == data["attempt_id"]
    ).first()

    if grade:
        grade.score = data["score"]
        grade.max_score = data["max_score"]
        grade.pending_score = data.get("pending_score", 0)
        grade.feedback = data.get("feedback")
        grade.is_published = data.get("is_published", False)
        grade.updated_at = datetime.utcnow()

        db.commit()
        db.refresh(grade)
        return grade

    grade = AssessmentGrade(
        attempt_id=data["attempt_id"],
        assessment_id=data["assessment_id"],
        student_id=data["student_id"],
        course_id=data.get("course_id"),
        instructor_id=instructor_id,
        score=data["score"],
        max_score=data["max_score"],
        pending_score=data.get("pending_score", 0),
        feedback=data.get("feedback"),
        is_published=data.get("is_published", False),
    )

    db.add(grade)
    db.commit()
    db.refresh(grade)

    return grade

def get_assessment_grade(db: Session, attempt_id: int):
    return db.query(AssessmentGrade).filter(
        AssessmentGrade.attempt_id == attempt_id
    ).first()
    
    
def get_assessment_grade_for_student(db: Session, attempt_id: int):
    data = db.query(AssessmentGrade).filter(
        AssessmentGrade.attempt_id == attempt_id
    ).first()
    
    if not data:
        raise HTTPException(status_code=404, detail="Grade not found")
    
    return {
        "score": data.score,
        "graded": data.is_published
    }    