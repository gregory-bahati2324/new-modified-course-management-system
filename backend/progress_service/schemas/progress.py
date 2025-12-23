from pydantic import BaseModel
from typing import Optional
from datetime import datetime

# ------------------------
# LESSON PROGRESS
# ------------------------

class LessonProgressCreate(BaseModel):
    quiz_score: Optional[int] = None
    time_spent_seconds: Optional[int] = None


class LessonProgressResponse(BaseModel):
    lesson_id: str
    is_completed: bool
    quiz_score: Optional[int]
    time_spent_seconds: Optional[int]
    completed_at: Optional[datetime]

    class Config:
        orm_mode = True


# ------------------------
# MODULE PROGRESS
# ------------------------

class ModuleProgressResponse(BaseModel):
    module_id: str
    completed_lessons: int
    total_lessons: int
    progress_percentage: int
    is_completed: bool


# ------------------------
# COURSE PROGRESS
# ------------------------

class CourseProgressResponse(BaseModel):
    course_id: str

    completed_modules: int
    total_modules: int

    completed_lessons: int
    total_lessons: int

    progress_percentage: int
    is_completed: bool
    last_accessed_at: Optional[datetime]
