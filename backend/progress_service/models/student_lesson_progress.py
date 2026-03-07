from sqlalchemy import Column, String, Boolean, Integer, DateTime, func
from database import Base

class StudentLessonProgress(Base):
    __tablename__ = "student_lesson_progress"

    id = Column(String, primary_key=True)
    student_id = Column(String, nullable=False, index=True)

    course_id = Column(String, nullable=False)
    module_id = Column(String, nullable=False)
    lesson_id = Column(String, nullable=False, index=True)
    lesson_version = Column(Integer, nullable=False, default=1)

    is_completed = Column(Boolean, default=False)
    quiz_score = Column(Integer)
    time_spent_seconds = Column(Integer)

    completed_at = Column(DateTime)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, onupdate=func.now())
