from sqlalchemy import Column, String, Text, DateTime, Integer, Boolean, func
from database import Base
import uuid

class Assignment(Base):
    __tablename__ = "assignments"

    id = Column(String, primary_key=True, index=True, default=lambda: str(uuid.uuid4()))

    # Core fields
    title = Column(String, nullable=False)
    type = Column(String, default="assignment")        # matches frontend type
    description = Column(Text, default="")
    instructions = Column(Text, default="")

    # Relations
    course_id = Column(String, nullable=False)
    module_id = Column(String, nullable=True)          # optional

    # Settings
    due_date = Column(DateTime, nullable=False)
    #attempts = Column(Integer, default=1)
    #time_limit = Column(Integer, nullable=True)
    total_points = Column(Integer, default=0)
    status = Column(String, default="draft")          # draft, published, closed

    # Tracking
    #graded = Column(Boolean, default=False)
    #submitted = Column(Boolean, default=False)

    # Ownership
    instructor_id = Column(String, nullable=False)
    created_at = Column(DateTime, nullable=False, server_default=func.now())
    updated_at = Column(DateTime, nullable=False, server_default=func.now(), onupdate=func.now())