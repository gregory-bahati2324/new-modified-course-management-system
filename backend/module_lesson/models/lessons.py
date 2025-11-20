from sqlalchemy import Column, String, Text, ForeignKey, DateTime, func
from sqlalchemy.dialects.sqlite import JSON
from sqlalchemy.orm import relationship
from database import Base

class Lesson(Base):
    __tablename__ = "lessons"

    id = Column(String, primary_key=True)
    module_id = Column(String, ForeignKey("modules.id"), nullable=False)

    title = Column(String, nullable=False)
    objectives = Column(Text)
    prerequisites = Column(Text)
    estimatedDuration = Column(String)
    difficulty = Column(String)
    tags = Column(JSON)  # store as list of strings

    contentBlocks = Column(JSON, default=[])  # list of content blocks
    quizQuestions = Column(JSON, default=[])  # list of quiz questions

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    module = relationship("Module", back_populates="lessons")
