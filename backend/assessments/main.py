from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import Base, engine
from routers.assigments import router as assignment_router
from routers.assessments import router as assessment_router

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Assessment Service")

origins = [
    "http://localhost:5173",
    "http://localhost:8080",
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(assignment_router)
app.include_router(assessment_router)
