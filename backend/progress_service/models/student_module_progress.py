# models/student_module_progress.py
from sqlalchemy import Column, String, Integer, Boolean, DateTime, func
from database import Base

class StudentModuleProgress(Base):
    __tablename__ = "student_module_progress"

    id = Column(String, primary_key=True)
    student_id = Column(String, nullable=False)
    course_id = Column(String, nullable=False)
    module_id = Column(String, nullable=False)

    completed_lessons = Column(Integer, default=0)
    total_lessons = Column(Integer, default=0)
    progress_percentage = Column(Integer, default=0)

    is_completed = Column(Boolean, default=False)
    completed_at = Column(DateTime, nullable=True)
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
