from sqlalchemy import Column, String, Boolean
from .database import Base

class User(Base):
    __tablename__ = "users"
    id = Column(String, primary_key=True, index=True)
    first_name = Column(String, nullable=False)
    last_name = Column(String, nullable=False)
    registrationNumber = Column(String, unique=True, index=True, nullable=False)
    password = Column(String, nullable=False)
    role = Column(String, default="student")
    program = Column(String, nullable=True)
    newsletter = Column(Boolean, default=True)
