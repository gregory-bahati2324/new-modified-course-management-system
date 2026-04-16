from sqlalchemy.orm import Session
from models.assessments import Assessment, Question, StudentAnswer, StudentAssessmentAttempt
from schemas.assessments import AssessmentCreate
from datetime import datetime, timezone
from fastapi import HTTPException
from sqlalchemy.orm import Session
from models.assessments import Assessment
from schemas.assessments import AssessmentCreate
from datetime import datetime, timezone
from services.enrollment_client import get_course_details
from services.grading_client import get_assessment_grade

import os

BASE_FILE_URL = os.getenv("BASE_FILE_URL", "http://localhost:8003")

def build_file_url(file_path: str):
    if not file_path:
        return None
    return f"{BASE_FILE_URL}/uploads/{file_path}"

def build_file_url_2(file_path: str):
    if not file_path:
        return None

    if file_path.startswith("/app/uploads/"):
        file_path = file_path.replace("/app/uploads/", "")

    # remove leading slash if exists
    file_path = file_path.lstrip("/")

    return f"{BASE_FILE_URL}/uploads/{file_path}"

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
    attempt = db.query(StudentAssessmentAttempt).filter_by(id=attempt_id).first()

    if not attempt:
        return None

    assessment = db.query(Assessment).filter_by(id=attempt.assessment_id).first()

    questions = db.query(Question).filter_by(assessment_id=assessment.id).all()

    answers = db.query(StudentAnswer).filter_by(attempt_id=attempt.id).all()
    

    # Map answers
    answers_map = {a.question_id: a.answer for a in answers}

    formatted_questions = []

    for index, q in enumerate(questions):

        student_answer = answers_map.get(q.id)

        correct_answer = None
        correct_file = None

        if q.type in ["multiple-choice", "true-false"]:
            correct_answer = q.correct_answer
            
        if q.type == "matching":
            correct_answer = {
                    pair["left"]: pair["right"]
                    for pair in (q.matching_pairs or [])
                }
        elif q.type == "ordering":
            correct_answer = q.correct_order        

        elif q.type in ["short-answer", "essay"]:
            correct_answer = q.model_answer   

        elif q.type == "file-upload":
            correct_file = q.answer_file      

        #  HANDLE FILE UPLOAD QUESTIONS
        file_url = None
        file_name = None

        if q.type == "file-upload" and student_answer:
            file_url = build_file_url_2(student_answer)
            file_name = student_answer.split("/")[-1]
            

        correct_file_url = None
        correct_file_name = None

        if q.type == "file-upload" and correct_file:
            correct_file_url = build_file_url_2(correct_file)
            correct_file_name = correct_file.split("/")[-1]
            
        #  HANDLE MATCHING
        matching_pairs = q.matching_pairs or []
        student_matching = student_answer if isinstance(student_answer, dict) else {}

        #  HANDLE ORDERING
        correct_order = q.correct_order or []
        student_order = student_answer if isinstance(student_answer, list) else []

        #  HANDLE CODING TEST CASES
        test_cases = q.test_cases or []

        #  AUTO CORRECTNESS
        is_correct = False

        if q.type in ["multiple-choice", "true-false"]:
            is_correct = str(student_answer).strip() == str(correct_answer).strip()

        elif q.type == "ordering":
            total_items = len(correct_order)

            if total_items > 0:
                points_per_item = q.points / total_items
                correct_count = 0

                for i in range(total_items):
                    if i < len(student_order) and student_order[i] == correct_order[i]:
                        correct_count += 1

                earned_points = round(correct_count * points_per_item, 2)
                is_correct = correct_count == total_items
            else:
                earned_points = 0
                is_correct = False

        elif q.type == "matching":
            correct_map = {
                    pair["left"]: pair["right"]
                    for pair in matching_pairs
                }
            total_items = len(correct_map)

            if total_items > 0:
                points_per_item = q.points / total_items
                correct_count = 0

                for left, right in correct_map.items():
                    if student_matching.get(left) == right:
                        correct_count += 1

                earned_points = round(correct_count * points_per_item, 2)
                is_correct = correct_count == total_items
            else:
                earned_points = 0
                is_correct = False

        #  POINTS
        if q.type in ["multiple-choice", "true-false"]:
            earned_points = q.points if is_correct else 0
            is_auto_graded = True

        elif q.type in ["matching", "ordering"]:
            is_auto_graded = True
            # earned_points already calculated above

        else:
            earned_points = None
            is_auto_graded = False

        formatted_questions.append({
            "question_id": q.id,
            "questionNumber": index + 1,
            "questionType": q.type,
            "question": q.question_text,

            "studentAnswer": student_answer,
            "correctAnswer": correct_answer,
            "isAutoGraded": is_auto_graded,

            "earnedPoints": earned_points,
            "maxPoints": q.points,

            "isCorrect": is_correct,

            #  TYPE-SPECIFIC DATA
            "options": q.options or [],

            "fileUrl": file_url,
            "fileName": file_name,
            
            "fileUrl": file_url,
            "fileName": file_name,

            "correctFileUrl": correct_file_url,
            "correctFileName": correct_file_name,

            "matchingPairs": matching_pairs,
            "studentMatching": student_matching,

            "correctOrder": correct_order,
            "studentOrder": student_order,

            "testCases": test_cases,

            "feedback": "",
            "aiSuggestion": ""
        })

    return {
        "attempt_id": attempt.id,
        "student_id": attempt.student_id,
        "course_id": assessment.course_id,  # you may enrich later
        "assessment_title": assessment.title,
        "assessment_id": attempt.assessment_id,
        "submitted_at": attempt.submitted_at,

        "questions": formatted_questions,

        "graded_score": sum(
            q["earnedPoints"]
            for q in formatted_questions
            if q["earnedPoints"] is not None
        ),
        "pending_score": sum(
            q["maxPoints"]
            for q in formatted_questions
            if q["earnedPoints"] is None
        ),
        "max_score": sum(q["maxPoints"] for q in formatted_questions),
        
    }
    
def get_student_attempt(db: Session, student_id: str, assessment_id: int):
    return db.query(StudentAssessmentAttempt).filter(
        StudentAssessmentAttempt.student_id == student_id,
        StudentAssessmentAttempt.assessment_id == assessment_id
    ).first()    
    
    
    
def enrich_with_grade(attempt_id: int):
    grade_data = get_assessment_grade(attempt_id)

    if not grade_data:
        return {
            "score": None,
            "graded": False
        }

    return {
        "score": grade_data["score"],
        "graded": True
    }    