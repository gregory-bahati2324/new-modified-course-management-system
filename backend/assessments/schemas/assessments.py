from pydantic import BaseModel
from typing import List, Optional, Union
from datetime import datetime

class QuestionCreate(BaseModel):
    type: str
    question_text: str
    points: Optional[int] = 1
    options: Optional[List[str]] = None
    correct_answer: Optional[Union[int, str, List[str]]] = None
    model_answer: Optional[str] = None
    test_cases: Optional[List[dict]] = None
    reference_file: Optional[str] = None
    matching_pairs: Optional[List[dict]] = None
    correct_order: Optional[List[str]] = None

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
    questions: Optional[List[QuestionCreate]] = []

class QuestionResponse(QuestionCreate):
    id: int

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
