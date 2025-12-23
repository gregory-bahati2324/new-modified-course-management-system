# models/student_lesson_progress.py
from sqlalchemy import Column, String, Boolean, Integer, DateTime, func
from database import Base

class StudentLessonProgress(Base):
    __tablename__ = "student_lesson_progress"

    id = Column(String, primary_key=True)
    student_id = Column(String, nullable=False)

    course_id = Column(String, nullable=False)
    module_id = Column(String, nullable=False)
    lesson_id = Column(String, nullable=False)

    is_completed = Column(Boolean, default=False)
    quiz_score = Column(Integer, nullable=True)
    time_spent_seconds = Column(Integer, nullable=True)

    completed_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, onupdate=func.now())
