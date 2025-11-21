# models/lesson.py
from sqlalchemy import Column, String, Text, ForeignKey
from sqlalchemy.dialects.sqlite import JSON
from sqlalchemy.orm import relationship
from database import Base

class Lesson(Base):
    __tablename__ = "lessons"

    id = Column(String, primary_key=True)
    module_id = Column(String, ForeignKey("modules.id"))

    title = Column(String, nullable=False)
    objectives = Column(Text)
    prerequisites = Column(Text)
    estimatedDuration = Column(String)
    difficulty = Column(String)
    tags = Column(String)

    contentBlocks = Column(JSON)
    quizQuestions = Column(JSON)

    module = relationship("Module", back_populates="lessons")
