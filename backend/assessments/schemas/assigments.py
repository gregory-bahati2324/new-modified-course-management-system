from datetime import datetime
from pydantic import BaseModel, Field
from typing import Optional, Union, Literal

# -------------------------------
# Base Schema
# -------------------------------
class AssignmentBase(BaseModel):
    title: str
    description: Optional[str] = ""
    instructions: Optional[str] = ""
    course_id: str
    due_date: Union[datetime, str]
    total_points: Optional[Union[int, str]] = 0
    status: str = "draft"
    file_url: Optional[str] = None
# -------------------------------
# Create Schema
# -------------------------------
class AssignmentCreate(AssignmentBase):
    pass

# -------------------------------
# Response Schema
# -------------------------------
class AssignmentResponse(AssignmentBase):
    id: str
    file_url: Optional[str] = None  # ✅ NEW
    graded: bool = False
    submitted: bool = False
    instructor_id: str

    class Config:
        orm_mode = True
# -------------------------------
# Update Schema
# -------------------------------
class AssignmentUpdate(BaseModel):
    title: Optional[str] = None
    type: Optional[str] = None
    description: Optional[str] = None
    instructions: Optional[str] = None
    due_date: Optional[datetime] = None
    attempts: Optional[Union[int, str]] = None
    time_limit: Optional[Union[int, str]] = None
    total_points: Optional[Union[int, str]] = None
    status: Optional[str] = None
    

class StudentAssignmentResponse(BaseModel):
    id: str
    title: str
    description: Optional[str]
    instructions: Optional[str]

    course_id: str
    course_title: Optional[str] = None

    due_date: Optional[datetime]
    total_points: Optional[int]
    

    file_url: Optional[str]

    # Student-specific state (temporary for now)
    submitted: bool = False
    graded: bool = False
    status: str  # pending / submitted / overdue

    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True  
        
        
class SubmissionResponse(BaseModel):
    id: str
    assignment_id: str
    student_id: str
    submission_text: Optional[str]
    file_url: Optional[str]
    submitted_at: datetime

    class Config:
        orm_mode = True  
        
class SubmissionCourseResponse(StudentAssignmentResponse):
    id: str
    assignment_id: str
    student_id: str
    submission_text: Optional[str]
    file_url: Optional[str]
    submitted_at: datetime

    course_id: str
    course_title: Optional[str] = None

    class Config:
        orm_mode = True                


class AssignmentGradingResponse(BaseModel):
    submission_id: str
    student_id: str
    assignment_id: str

    submission_text: Optional[str]
    file_url: Optional[str]

    assignment: dict

    class Config:
        orm_mode = True