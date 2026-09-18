import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import Base, engine
import models  # noqa: F401 — registers models on Base before create_all
from routers import notifications, internal, health

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(name)s | %(message)s",
)
logger = logging.getLogger("notification_service")

# See NOTIFICATION_INTEGRATION.md "Database migrations" for why this
# project keeps Base.metadata.create_all() for v1 rather than introducing
# Alembic (the rest of the LMS doesn't use migrations either — every other
# service here uses create_all the same way, e.g.
# backend/module_lesson/main.py, backend/createCourse/app/main.py).
#
# Guarded by an env var (rather than unconditional, like the other
# services) purely so this module stays importable in tests without a
# live Postgres connection — tests build their own schema against an
# in-memory SQLite engine (see tests/conftest.py) and never hit this path.
import os
if os.getenv("NOTIFICATION_SKIP_AUTO_CREATE") != "1":
    Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Notification Microservice",
    description=(
        "Owns in-app notifications for the LMS. Receives trusted events "
        "from other backend services via /internal/notifications/events "
        "and serves them to the frontend via /notifications/*. "
        "See NOTIFICATION_INTEGRATION.md for the full event contract."
    ),
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # matches the permissive CORS already used by
    allow_credentials=True,  # every other service in this LMS (see
    allow_methods=["*"],     # backend/module_lesson/main.py,
    allow_headers=["*"],     # backend/createCourse/app/main.py, etc.)
)

app.include_router(health.router)
app.include_router(notifications.router)
app.include_router(internal.router)


@app.get("/")
def root():
    return {"message": "Notification microservice running"}
