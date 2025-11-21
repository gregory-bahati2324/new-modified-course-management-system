from sqlalchemy import Column, String, Text, ForeignKey, DateTime, Boolean, Integer, func
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
    tags = Column(JSON)  # list of strings

    contentBlocks = Column(JSON, default=[])
    quizQuestions = Column(JSON, default=[])

    # ---------------- New fields ----------------
    discussion = Column(JSON, default={})  # {enabled: bool, prompt: str}
    progressSettings = Column(JSON, default={})  # {completion: bool, timeSpent: bool, quizScore: bool}
    accessibility = Column(JSON, default={})  # {darkMode, fontSize, transcriptEnabled, transcriptText}
    feedbackSettings = Column(JSON, default={})  # {ratings, reviews, customQuestions}
    order = Column(Integer, default=1)
    # -------------------------------------------

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    module = relationship("Module", back_populates="lessons")
