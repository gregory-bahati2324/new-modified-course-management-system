# app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import engine, Base
from app import courses

# Create all tables in the database
Base.metadata.create_all(bind=engine)

# Initialize FastAPI app
app = FastAPI(
    title="Course Microservice",
    description="Microservice for managing courses",
    version="1.0.0",
)

# =========================
# CORS CONFIGURATION
# =========================
# Allow your frontend origins. Add more if needed
origins = [
    "http://localhost:5173",  # Vite dev server
    "http://localhost:8080",  # React dev server (optional)
    "http://localhost:3000",  # React dev server (optional)
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],    # Allow GET, POST, PUT, DELETE, etc.
    allow_headers=["*"],    # Allow all headers
)

# =========================
# ROUTERS
# =========================
# All course routes prefixed with /api
app.include_router(courses.router, prefix="/api", tags=["Courses"])

# =========================
# ROOT ROUTE
# =========================
@app.get("/", tags=["Root"])
def root():
    return {"message": "Course microservice running"}
