# app/models.py
from sqlalchemy import Column, String, Text, Integer, Boolean, DateTime
from sqlalchemy.sql import func
from .database import Base

class Course(Base):
    __tablename__ = "courses"

    id = Column(String, primary_key=True, index=True)   # will use uuid strings
    code = Column(String, unique=True, index=True, nullable=False)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    category = Column(String, nullable=True)
    department = Column(String, nullable=True)
    level = Column(String, nullable=True)
    course_type = Column(String, nullable=True)
    duration = Column(String, nullable=True)  # e.g. "12 weeks" or number
    instructor_id = Column(String, nullable=False, index=True)
    is_published = Column(Boolean, default=False)
    allow_self_enrollment = Column(Boolean, default=True)
    certificate = Column(Boolean, default=True)
    max_students = Column(Integer, nullable=True)
    prerequisites = Column(Text, nullable=True)  # store as comma-separated or JSON string
    learning_outcomes = Column(Text, nullable=True)  # store as comma-separated or JSON
    tags = Column(Text, nullable=True)  # store as comma-separated or JSON string
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), server_default=func.now())


class Enrollment(Base):
    __tablename__ = "enrollments"

    id = Column(String, primary_key=True, index=True)  # uuid string
    course_id = Column(String, nullable=False, index=True)
    student_id = Column(String, nullable=False, index=True)
    enrolled_at = Column(DateTime(timezone=True), server_default=func.now())
    progress = Column(Integer, default=0)  # percentage of course completed
    completed = Column(Boolean, default=False)
    certificate_issued = Column(Boolean, default=False)