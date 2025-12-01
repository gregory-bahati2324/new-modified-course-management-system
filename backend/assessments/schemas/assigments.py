from datetime import datetime
from pydantic import BaseModel, Field
from typing import Optional

class AssignmentBase(BaseModel):
    title: str
    type: str
    description: Optional[str] = ""
    instructions: Optional[str] = ""
    course_id: str
    module_id: Optional[str] = None
    due_date: datetime
    attempts: int = 1
    time_limit: Optional[int] = None
    total_points: Optional[int] = 0
    status: str = "draft"

class AssignmentCreate(AssignmentBase):
    pass

class AssignmentResponse(AssignmentBase):
    id: str
    graded: bool = False
    submitted: bool = False
    instructor_id: str

    class Config:
        orm_mode = True
class AssignmentUpdate(BaseModel):
    title: Optional[str] = None
    type: Optional[str] = None
    description: Optional[str] = None
    instructions: Optional[str] = None
    due_date: Optional[datetime] = None
    attempts: Optional[int] = None
    time_limit: Optional[int] = None
    total_points: Optional[int] = None
    status: Optional[str] = None