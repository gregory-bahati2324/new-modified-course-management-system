import uuid
from sqlalchemy import Column, ForeignKey, String, Text, DateTime, Integer,Float, Boolean, func
from database import Base

class AssignmentGrade(Base):
    __tablename__ = "assignment_grades"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))

    
    submission_id = Column(String, nullable=False)
    assignment_id = Column(String, nullable=False)
    course_id = Column(String, nullable=True)

    student_id = Column(String, nullable=False)


    instructor_id = Column(String, nullable=False)

    score = Column(Float, nullable=False)
    max_score = Column(Float, nullable=False)
    feedback = Column(Text, nullable=True)

    
    is_published = Column(Boolean, default=False)


    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, onupdate=func.now())
    
class AssessmentGrade(Base):
    __tablename__ = "assessment_grades"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))

    # 🔗 External references
    attempt_id = Column(Integer, nullable=False)
    assessment_id = Column(Integer, nullable=False)
    course_id = Column(String, nullable=True)

    student_id = Column(String, nullable=False)
    instructor_id = Column(String, nullable=False)

    score = Column(Float, nullable=False)
    max_score = Column(Float, nullable=False)
    pending_score = Column(Float, default=0)

    feedback = Column(Text, nullable=True)

    is_published = Column(Boolean, default=False)

    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, onupdate=func.now())