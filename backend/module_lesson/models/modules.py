# models/module.py
from sqlalchemy import Column, String, Integer, Text
from sqlalchemy.orm import relationship
from database import Base

class Module(Base):
    __tablename__ = "modules"

    id = Column(String, primary_key=True)
    title = Column(String, nullable=False)
    description = Column(Text)
    order = Column(Integer, default=1)
    visibility = Column(String, default="public")
    course_id = Column(String, nullable=False)  # FK to course service

    lessons = relationship("Lesson", back_populates="module", cascade="all, delete-orphan")
