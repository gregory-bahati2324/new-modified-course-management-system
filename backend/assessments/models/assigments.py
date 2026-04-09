from sqlalchemy import Column, ForeignKey, String, Text, DateTime, Integer, Boolean, func
from database import Base
import uuid
from sqlalchemy.orm import relationship

class Assignment(Base):
    __tablename__ = "assignments"

    id = Column(String, primary_key=True, index=True, default=lambda: str(uuid.uuid4()))

    # Core fields
    title = Column(String, nullable=False)
    description = Column(Text, default="")
    instructions = Column(Text, default="")
    file_url = Column(String, nullable=True)  

    # Relations
    course_id = Column(String, nullable=False)

    # Settings
    due_date = Column(DateTime, nullable=False)
    total_points = Column(Integer, default=0)
    status = Column(String, default="draft")       
    

    # Tracking
    graded = Column(Boolean, default=False)
    submitted = Column(Boolean, default=False)

    # Ownership
    instructor_id = Column(String, nullable=False)
    created_at = Column(DateTime, nullable=False, server_default=func.now())
    updated_at = Column(DateTime, nullable=False, server_default=func.now(), onupdate=func.now())
    
    
class AssignmentSubmission(Base):
    __tablename__ = "assignment_submissions"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))

    assignment_id = Column(String, ForeignKey("assignments.id"), nullable=False)
    student_id = Column(String, nullable=False)

    submission_text = Column(Text, nullable=True)
    file_url = Column(String, nullable=True)

    submitted_at = Column(DateTime, server_default=func.now())  
    assignment = relationship("Assignment", backref="submissions")  