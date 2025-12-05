from sqlalchemy import Column, Integer, String, Boolean, Date, Time, ForeignKey, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from sqlalchemy import DateTime
from database import Base

class Assessment(Base):
    __tablename__ = "assessments"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    type = Column(String, default="quiz")
    description = Column(String, nullable=True)
    course_id = Column(String, nullable=True)
    module_id = Column(String, nullable=True)
    instructor_id = Column(String, nullable=False)
    due_date = Column(Date, nullable=True)
    due_time = Column(Time, nullable=True)
    time_limit = Column(Integer, nullable=True)
    attempts = Column(String, default="1")  # can be "1", "2", "unlimited"
    passing_score = Column(Integer, default=70)
    shuffle_questions = Column(Boolean, default=False)
    show_answers = Column(Boolean, default=True)
    status = Column(String, default="draft")  # draft, published, closed
    
    created_at = Column(DateTime, nullable=False, server_default=func.now())
    updated_at = Column(DateTime, nullable=False, server_default=func.now(), onupdate=func.now())


    questions = relationship("Question", back_populates="assessment", cascade="all, delete-orphan")


class Question(Base):
    __tablename__ = "assessment_questions"

    id = Column(Integer, primary_key=True, index=True)
    assessment_id = Column(Integer, ForeignKey("assessments.id", ondelete="CASCADE"))
    type = Column(String, nullable=False)
    question_text = Column(String, nullable=False)
    points = Column(Integer, default=1)
    options = Column(JSON, nullable=True)
    correct_answer = Column(JSON, nullable=True)
    model_answer = Column(String, nullable=True)
    test_cases = Column(JSON, nullable=True)
    reference_file = Column(String, nullable=True)
    matching_pairs = Column(JSON, nullable=True)
    correct_order = Column(JSON, nullable=True)

    assessment = relationship("Assessment", back_populates="questions")
