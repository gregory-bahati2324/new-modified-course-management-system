from datetime import datetime
from pydantic import BaseModel, Field
from typing import Optional, Union, Literal

# -------------------------------
# Base Schema
# -------------------------------
class AssignmentBase(BaseModel):
    title: str
    type: str = "assignment"  # accept string directly from frontend
    description: Optional[str] = ""
    instructions: Optional[str] = ""
    course_id: str
    module_id: Optional[str] = None  # frontend may send empty string
    due_date: Union[datetime, str]
    attempts: Union[int, str] = 1    # accept number or string ('1','2','unlimited')
    time_limit: Optional[Union[int, str]] = None  # accept number or string
    total_points: Optional[Union[int, str]] = 0
    status: str = "draft"  # accept string directly from frontend

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
