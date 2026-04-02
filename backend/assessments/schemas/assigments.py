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
