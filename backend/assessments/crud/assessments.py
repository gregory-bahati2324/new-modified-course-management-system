from sqlalchemy.orm import Session
from models.assessments import Assessment, Question, StudentAnswer, StudentAssessmentAttempt
from schemas.assessments import AssessmentCreate
from datetime import datetime, timezone
from fastapi import HTTPException

# crud/assessments.py
from sqlalchemy.orm import Session
from models.assessments import Assessment
from schemas.assessments import AssessmentCreate
from datetime import datetime, timezone

def parse_due_date_utc(due_date):
    if due_date is None:
        return None
    if isinstance(due_date, str):
        try:
            # Try format "YYYY-MM-DD HH:MM:SS"
            dt = datetime.strptime(due_date, "%Y-%m-%d %H:%M:%S")
        except ValueError:
            # ISO format from browser
            dt = datetime.fromisoformat(due_date)
    elif isinstance(due_date, datetime):
        dt = due_date
    else:
        raise ValueError("Invalid due_date format")

    # Make sure it is UTC
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    else:
        dt = dt.astimezone(timezone.utc)
    return dt

def create_assessment(db: Session, data: AssessmentCreate, instructor_id: str):

    
    assessment = Assessment(
        title=data.title,
        type=data.type,
        description=data.description,
        course_id=data.course_id,
        module_id=data.module_id,
        due_date=parse_due_date_utc(data.due_date),
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
    
def get_assessments_for_courses(db: Session, course_ids: list[str]):
    return (
        db.query(Assessment)
        .filter(
            Assessment.course_id.in_(course_ids),
            Assessment.status == "published"
        )
        .all()
    )
    
def get_assessment_for_student(db: Session, assessment_id: int):
    return db.query(Assessment).filter(
        Assessment.id == assessment_id,
        Assessment.status == "published"
    ).first()    

# crud/assessments.py (excerpt)
def update_assessment(db: Session, assessment_id: int, instructor_id: str, data):
    assessment = get_assessment(db, assessment_id, instructor_id)
    if not assessment:
        return None

    update_data = data.dict(exclude_unset=True) if hasattr(data, "dict") else dict(data)
    update_data.pop("questions", None)

    if "due_date" in update_data:
        update_data["due_date"] = parse_due_date_utc(update_data["due_date"])

    for key, value in update_data.items():
        if hasattr(assessment, key) and value is not None:
            setattr(assessment, key, value)

    db.commit()
    db.refresh(assessment)
    return assessment

def start_exam(db: Session, student_id: str, assessment_id: int):

    # 🔥 1. Check if already submitted
    submitted_attempt = db.query(StudentAssessmentAttempt).filter(
        StudentAssessmentAttempt.student_id == student_id,
        StudentAssessmentAttempt.assessment_id == assessment_id,
        StudentAssessmentAttempt.status == "submitted"
    ).first()

    if submitted_attempt:
        raise HTTPException(status_code=400, detail="Exam already submitted")

    # 🔥 2. Check in_progress
    attempt = db.query(StudentAssessmentAttempt).filter(
        StudentAssessmentAttempt.student_id == student_id,
        StudentAssessmentAttempt.assessment_id == assessment_id,
        StudentAssessmentAttempt.status == "in_progress"
    ).first()

    if attempt:
        return attempt

    # 🔥 3. Create new attempt
    attempt = StudentAssessmentAttempt(
        student_id=student_id,
        assessment_id=assessment_id,
        status="in_progress"
    )

    db.add(attempt)
    db.commit()
    db.refresh(attempt)

    return attempt


def save_exam_progress(db: Session, attempt_id: int, student_id: str, answers: list):

    attempt = db.query(StudentAssessmentAttempt).filter(
        StudentAssessmentAttempt.id == attempt_id,
        StudentAssessmentAttempt.student_id == student_id
    ).first()

    if not attempt:
        raise HTTPException(status_code=404, detail="Attempt not found")

    # 🚨 BLOCK saving after submission
    if attempt.status == "submitted":
        raise HTTPException(status_code=400, detail="Cannot save, exam already submitted")

    for ans in answers:
        existing = db.query(StudentAnswer).filter(
            StudentAnswer.attempt_id == attempt_id,
            StudentAnswer.question_id == ans["question_id"]
        ).first()

        if existing:
            existing.answer = ans["answer"]
        else:
            new_ans = StudentAnswer(
                attempt_id=attempt_id,
                question_id=ans["question_id"],
                answer=ans["answer"]
            )
            db.add(new_ans)

    db.commit()
    

def submit_exam(db: Session, attempt_id: int, student_id: str, answers: list, time_taken: int):

    attempt = db.query(StudentAssessmentAttempt).filter(
        StudentAssessmentAttempt.id == attempt_id,
        StudentAssessmentAttempt.student_id == student_id
    ).first()

    if not attempt:
        raise HTTPException(status_code=404, detail="Attempt not found")

    # 🚨 BLOCK re-submission
    if attempt.status == "submitted":
        raise HTTPException(status_code=400, detail="Exam already submitted")

    # Save final answers
    save_exam_progress(db, attempt_id, student_id, answers)

    attempt.status = "submitted"
    attempt.submitted_at = datetime.utcnow()
    attempt.time_taken = time_taken

    db.commit()
    db.refresh(attempt)

    return attempt

def get_submission_for_course(db: Session, course_id: str):
    return (
        db.query(StudentAssessmentAttempt, Assessment)
        .join(Assessment, StudentAssessmentAttempt.assessment_id == Assessment.id)
        .filter(
            Assessment.course_id == course_id,
            StudentAssessmentAttempt.status == "submitted"
        )
        .all()
    )

def get_attempt_full_data(db: Session, attempt_id: int):
    
    # 🔹 1. Get attempt
    attempt = db.query(StudentAssessmentAttempt).filter(
        StudentAssessmentAttempt.id == attempt_id
    ).first()

    if not attempt:
        return None

    # 🔹 2. Get assessment
    assessment = db.query(Assessment).filter(
        Assessment.id == attempt.assessment_id
    ).first()

    # 🔹 3. Get questions
    questions = db.query(Question).filter(
        Question.assessment_id == attempt.assessment_id
    ).all()

    # 🔹 4. Get answers
    answers = db.query(StudentAnswer).filter(
        StudentAnswer.attempt_id == attempt_id
    ).all()

    # 🔹 5. Format questions
    formatted_questions = []
    for q in questions:
        formatted_questions.append({
            "question_id": q.id,
            "type": q.type,
            "question_text": q.question_text,
            "points": q.points,
            "correct_answer": q.correct_answer
        })

    # 🔹 6. Format answers
    formatted_answers = []
    for a in answers:
        formatted_answers.append({
            "question_id": a.question_id,
            "answer": a.answer
        })

    return {
        "attempt_id": attempt.id,
        "student_id": attempt.student_id,
        "assessment_id": attempt.assessment_id,
        "status": attempt.status,
        "time_taken": attempt.time_taken,

        "questions": formatted_questions,
        "answers": formatted_answers,

        "passing_score": assessment.passing_score if assessment else None
    }