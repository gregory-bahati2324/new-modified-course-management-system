# database.py
import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from sqlalchemy.pool import QueuePool

# ----------------------------
# DATABASE URL
# ----------------------------
DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise Exception("DATABASE_URL is not set in environment variables")

# ----------------------------
# ENGINE (optimized for microservice load)
# ----------------------------
engine = create_engine(
    DATABASE_URL,
    poolclass=QueuePool,      # handles concurrent grading requests
    pool_size=10,             # number of persistent connections
    max_overflow=20,          # extra connections when busy
    pool_pre_ping=True,       # avoids stale connections
    echo=False                
)

# ----------------------------
# SESSION
# ----------------------------
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

# ----------------------------
# BASE MODEL
# ----------------------------
Base = declarative_base()

# ----------------------------
# DEPENDENCY (FASTAPI)
# ----------------------------
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()