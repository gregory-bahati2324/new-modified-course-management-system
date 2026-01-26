from pydantic import BaseModel
from typing import Optional
from datetime import datetime

# ------------------------
# LESSON PROGRESS
# ------------------------

# ------------------------
# LESSON PROGRESS
# ------------------------

class LessonProgressCreate(BaseModel):
    course_id: str
    module_id: str

    # optional metrics
    quiz_score: Optional[int] = None
    time_spent_seconds: Optional[int] = None


class LessonProgressResponse(BaseModel):
    lesson_id: str
    is_completed: bool

    quiz_score: Optional[int]
    time_spent_seconds: Optional[int]

    completed_at: Optional[datetime]

    class Config:
        from_attributes = True



# ------------------------
# MODULE PROGRESS
# ------------------------

class ModuleProgressResponse(BaseModel):
    module_id: str

    completed_lessons: int
    total_lessons: int
    progress_percentage: int

    is_completed: bool

    # 🔗 Assignment integration
    assignment_required: bool | None = None

    completed_at: Optional[datetime] | None = None

    class Config:
        from_attributes = True

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

    assessment_required: bool | None = None
    assessment_passed: bool | None = None

    certificate_eligible: bool | None = None
    certificate_issued: bool | None = None

    completed_at: datetime | None = None
    last_accessed_at: datetime | None = None

    class Config:
        orm_mode = True
        

        
        
class InstructorCourseProgressResponse(BaseModel):
    student_id: str
    course_id: str

    progress_percentage: int
    is_completed: bool

    assessment_passed: bool
    certificate_issued: bool

    class Config:
        from_attributes = True        