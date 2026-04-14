from pydantic import BaseModel
from typing import Optional
from datetime import datetime

# -----------------------------
# ASSIGNMENT
# -----------------------------
class AssignmentGradeBase(BaseModel):
    submission_id: str
    assignment_id: str
    student_id: str
    course_id: Optional[str] = None

    score: float
    max_score: float
    feedback: Optional[str] = None
    is_published: Optional[bool] = False


class AssignmentGradeCreate(AssignmentGradeBase):
    pass


class AssignmentGradeResponse(AssignmentGradeBase):
    id: str
    instructor_id: str
    created_at: Optional[datetime]
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True   # 🔥 important for SQLAlchemy


# -----------------------------
# ASSESSMENT
# -----------------------------
class AssessmentGradeBase(BaseModel):
    attempt_id: int
    assessment_id: int
    student_id: str
    course_id: Optional[str] = None

    score: float
    max_score: float
    pending_score: Optional[float] = 0
    feedback: Optional[str] = None
    is_published: Optional[bool] = False


class AssessmentGradeCreate(AssessmentGradeBase):
    pass


class AssessmentGradeResponse(AssessmentGradeBase):
    id: str
    instructor_id: str
    created_at: Optional[datetime]
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True