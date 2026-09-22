import os

from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from database import Base, engine
from routers.assigments import router as assignment_router
from routers.assessments import router as assessment_router
from routers import questions as questions_router

# StaticFiles() raises at import time if its directory is missing, which would crash the
# container on a fresh server / fresh volume. Create every upload folder first.
for _d in ("uploads", "uploads/assignments", "uploads/submissions", "uploads/questions", "uploads/uploadAnswers"):
    os.makedirs(_d, exist_ok=True)

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Assessment Service")

app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")
app.mount(
    "/uploads/assignments",
    StaticFiles(directory="uploads/assignments"),
    name="assignment_files"
)
app.mount(
    "/uploads/submissions",
    StaticFiles(directory="uploads/submissions"),
    name="submission_files"
)

# Comma separated list, or "*". The browser normally talks to this service through the nginx
# reverse proxy on the SAME origin, in which case CORS is not involved at all.
origins = [o.strip() for o in os.getenv(
    "CORS_ORIGINS", "http://localhost:5173,http://localhost:8080,http://localhost:3000"
).split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.mount("/static/questions", StaticFiles(directory="uploads/questions"), name="question_files")
app.include_router(assignment_router)
app.include_router(assessment_router)
app.include_router(questions_router.router)


@app.get("/")
def root():
    return {"message": "Assessment service running"}


@app.get("/health")
def health():
    return {"status": "ok"}
