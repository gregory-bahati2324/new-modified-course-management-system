# schemas/assessments.py
from pydantic import BaseModel
from typing import Dict, List, Optional, Union
from datetime import datetime
from typing import Any

class QuestionCreate(BaseModel):
    type: str
    question_text: str
    points: Optional[int] = 1

    # ✅ FILE URLS (returned, not uploaded here)
    question_file_url: Optional[str] = None
    answer_file_url: Optional[str] = None

    options: Optional[List[str]] = None
    correct_answer: Optional[Union[int, str, List[str]]] = None
    model_answer: Optional[str] = None
    test_cases: Optional[List[dict]] = None
    matching_pairs: Optional[List[dict]] = None
    correct_order: Optional[List[str]] = None

class QuestionUpdate(QuestionCreate):
    # optional id for existing questions
    id: Optional[int] = None

class AssessmentCreate(BaseModel):
    title: str
    type: str
    description: Optional[str] = None
    course_id: Optional[str] = None
    module_id: Optional[str] = None
    due_date: Optional[datetime] = None
    time_limit: Optional[int] = None
    attempts: Optional[str] = "1"
    passing_score: Optional[int] = 70
    shuffle_questions: Optional[bool] = False
    show_answers: Optional[bool] = True
    status: Optional[str] = "draft"
    

class QuestionResponse(QuestionCreate):
    id: int
    question_file_url: Optional[str] = None
    answer_file_url: Optional[str] = None

    class Config:
        orm_mode = True

class AssessmentResponse(AssessmentCreate):
    id: int
    instructor_id: str
    questions: List[QuestionResponse] = []
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True
        
class StudentAssessmentResponse(BaseModel):
    id: int
    title: str
    type: str
    description: Optional[str]
    course_id: Optional[str]
    instructor_id: str

    due_date: Optional[datetime]
    time_limit: Optional[int]
    attempts: Optional[str]
    passing_score: Optional[int]
    shuffle_questions: Optional[bool]
    show_answers: Optional[bool]
    status: str

    # course info
    course_title: Optional[str]
    course_code: Optional[str]
    instructor_name: Optional[str]

    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True
        
        
class ExamQuestion(BaseModel):
    id: int
    type: str
    question_text: str
    points: int

    options: Optional[List[str]]
    test_cases: Optional[List[dict]]
    matching_pairs: Optional[List[dict]]
    correct_order: Optional[List[str]]
    
    question_file_url: Optional[str] = None
    answer_file_url: Optional[str] = None

    class Config:
        orm_mode = True
        
        
class ExamDetails(BaseModel):

    id: int
    title: str
    course_title: Optional[str] = None

    time_limit: Optional[int]

    questions: List[ExamQuestion]

    class Config:
        orm_mode = True
        
        
class ExamAnswer(BaseModel):
    question_id: int
    answer: Any
    
class SaveProgressRequest(BaseModel):
    attempt_id: int
    answers: List[ExamAnswer]


class SubmitExamRequest(BaseModel):
    attempt_id: int
    answers: List[ExamAnswer]
    time_taken: int
    
class AssessmentSubmissionResponse(BaseModel):
    id: int
    student_id: str
    assessment_id: int
    assessment_title: str
    course_id: str
    submitted_at: Optional[datetime]
    status: str
    time_taken: Optional[int]
    type: str
    passing_score: Optional[int]

    class Config:
        orm_mode = True 
    


class AttemptAnswer(BaseModel):
    question_id: int
    answer: Any


class AttemptQuestion(BaseModel):
    question_id: int
    type: str
    question_text: str
    points: int
    correct_answer: Optional[Any]


class AssessmentAttemptDetail(BaseModel):
    attempt_id: int
    student_id: str
    assessment_id: int
    status: str
    time_taken: Optional[int]

    questions: List[AttemptQuestion]
    answers: List[AttemptAnswer]

    passing_score: Optional[int]