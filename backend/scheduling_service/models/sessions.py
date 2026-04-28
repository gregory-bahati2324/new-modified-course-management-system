import uuid
from sqlalchemy import Column, String, Boolean, Date, Time, Integer, Text, DateTime
from sqlalchemy.sql import func
from database import Base

class Session(Base):
    __tablename__ = "sessions"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))

    title = Column(String, nullable=False)
    course_id = Column(String, nullable=False)
    instructor_id = Column(String, nullable=False)

    date = Column(Date, nullable=False)
    start_time = Column(Time, nullable=False)
    end_time = Column(Time, nullable=False)

    location = Column(String, nullable=False)
    is_online = Column(Boolean, default=False)
    meeting_link = Column(String, nullable=True)

    type = Column(String, nullable=False)
    description = Column(Text, nullable=True)

    capacity = Column(Integer, nullable=True)

    status = Column(String, default="scheduled")

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())