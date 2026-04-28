# app/main.py

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.exc import OperationalError
import time

from database import engine, Base
from router import sessions


# =========================
# DATABASE STARTUP CHECK
# =========================
def wait_for_db():
    for i in range(10):
        try:
            engine.connect()
            print("Database connected")
            return
        except OperationalError:
            print(" Database not ready, retrying...")
            time.sleep(2)
    raise Exception(" Database connection failed")


# =========================
# INITIALIZE APP
# =========================
app = FastAPI(
    title="Scheduling Microservice",
    description="Microservice for managing sessions and schedules",
    version="1.0.0",
)


# =========================
# STARTUP EVENT
# =========================
@app.on_event("startup")
def startup():
    wait_for_db()
    Base.metadata.create_all(bind=engine)
    print("🚀 Scheduling Service Started")


# =========================
# CORS CONFIGURATION
# =========================
origins = [
    "http://localhost:5173",
    "http://localhost:3000",
    "http://localhost:8080",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =========================
# ROUTERS
# =========================
app.include_router(sessions.router, tags=["Sessions"])


# =========================
# HEALTH CHECK
# =========================
@app.get("/", tags=["Root"])
def root():
    return {"message": "Scheduling microservice running"}


@app.get("/health", tags=["Health"])
def health_check():
    return {"status": "ok"}