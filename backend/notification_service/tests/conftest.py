import os
import sys

os.environ.setdefault("NOTIFICATION_SKIP_AUTO_CREATE", "1")
os.environ.setdefault("DATABASE_URL", "sqlite:///:memory:")

# Ensure the service root (which uses bare `import models`, `import database`,
# etc. — matching this LMS's existing per-service import style, e.g.
# backend/module_lesson/main.py's `from database import Base, engine`) is
# importable when pytest is run from anywhere.
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import pytest
from datetime import timedelta
from jose import jwt
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from fastapi.testclient import TestClient

from database import Base, get_db
from core.config import settings
import main as app_module


@pytest.fixture()
def db_engine():
    engine = create_engine(
        "sqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    Base.metadata.create_all(bind=engine)
    yield engine
    Base.metadata.drop_all(bind=engine)


@pytest.fixture()
def db_session(db_engine):
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=db_engine)
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()


@pytest.fixture()
def client(db_engine):
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=db_engine)

    def override_get_db():
        db = TestingSessionLocal()
        try:
            yield db
        finally:
            db.close()

    app_module.app.dependency_overrides[get_db] = override_get_db
    with TestClient(app_module.app) as c:
        yield c
    app_module.app.dependency_overrides.clear()


def make_token(sub: str, role: str = "student") -> str:
    return jwt.encode(
        {"sub": sub, "role": role},
        settings.SECRET_KEY,
        algorithm=settings.ALGORITHM,
    )


@pytest.fixture()
def student_headers():
    return {"Authorization": f"Bearer {make_token('student-1', 'student')}"}


@pytest.fixture()
def other_student_headers():
    return {"Authorization": f"Bearer {make_token('student-2', 'student')}"}


@pytest.fixture()
def admin_headers():
    return {"Authorization": f"Bearer {make_token('admin-1', 'admin')}"}


@pytest.fixture()
def internal_headers():
    return {"X-Internal-Api-Key": settings.INTERNAL_API_KEY}
