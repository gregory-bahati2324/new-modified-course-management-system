from sqlalchemy import Column, String, Text, DateTime, Integer, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from database import Base
import uuid

class Assignment(Base):
    __tablename__ = "assignments"

    id = Column(String, primary_key=True, index=True, default=lambda: str(uuid.uuid4()))

    title = Column(String)
    type = Column(String)
    description = Column(Text)
    instructions = Column(Text)

    course_id = Column(String, nullable=False)

    module_id = Column(String, nullable=True)

    due_date = Column(DateTime)
    attempts = Column(Integer, default=1)
    time_limit = Column(Integer, nullable=True)

    total_points = Column(Integer, default=0)
    status = Column(String, default="draft")

    graded = Column(Boolean, default=False)
    submitted = Column(Boolean, default=False)

    instructor_id = Column(String, nullable=False)

    