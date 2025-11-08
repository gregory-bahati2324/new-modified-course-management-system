from fastapi import FastAPI
from app.database import Base, engine
from app.models import User
from app.auth import router as auth_router
from fastapi.middleware.cors import CORSMiddleware

Base.metadata.create_all(bind=engine)

app = FastAPI(title="MUST LMS Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # or your frontend origin like "http://localhost:5173"
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)

@app.get("/")
def root():
    return {"message": "Welcome to the MUST LMS API!"}
