from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import grading

app = FastAPI(title="Marking & Grading Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # change to frontend URL in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(grading.router, prefix="/grading", tags=["Grading"])