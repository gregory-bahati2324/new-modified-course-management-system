"""
database.py
Owns its own connection/session — the notification service never
touches another service's tables. Follows the exact same
create_engine/sessionmaker/get_db pattern used by every other
service in this LMS (see backend/createCourse/app/database.py,
backend/module_lesson/database.py, etc.) for consistency.
"""

import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql+psycopg2://postgres:postgres@postgres:5432/notification_db",
)

if not DATABASE_URL:
    raise ValueError("DATABASE_URL is not set")

engine = create_engine(DATABASE_URL, pool_pre_ping=True)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
