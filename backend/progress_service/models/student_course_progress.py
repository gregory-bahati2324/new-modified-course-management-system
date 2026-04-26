from sqlalchemy import Column, String, Integer, Boolean, DateTime, func
from database import Base

class StudentCourseProgress(Base):
    __tablename__ = "student_course_progress"

    id = Column(String, primary_key=True)
    student_id = Column(String, nullable=False, index=True)
    course_id = Column(String, nullable=False, index=True)

    completed_lessons = Column(Integer, default=0)
    total_lessons = Column(Integer, default=0)

    completed_modules = Column(Integer, default=0)
    total_modules = Column(Integer, default=0)

    progress_percentage = Column(Integer, default=0)
    is_completed = Column(Boolean, default=False)

    # 🔗 ASSESSMENT INTEGRATION
    assessment_required = Column(Boolean, default=False)
    assessment_passed = Column(Boolean, default=False)
    
    assignment_required = Column(Boolean, default=False)
    assignment_completed = Column(Boolean, default=False)
    assessment_completed = Column(Boolean, default=False)

    # 🎓 CERTIFICATE INTEGRATION
    certificate_eligible = Column(Boolean, default=False)
    certificate_issued = Column(Boolean, default=False)

    last_accessed_at = Column(DateTime)
    started_at = Column(DateTime, server_default=func.now())
    completed_at = Column(DateTime)
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
