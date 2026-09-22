import os

from fastapi import FastAPI
from database import engine, Base
from routers.progress import router as progress_router
from fastapi.middleware.cors import CORSMiddleware

Base.metadata.create_all(bind=engine)



app = FastAPI(title="Progress Service")

app.include_router(progress_router)

def _cors_origins(default):
    raw = os.getenv("CORS_ORIGINS")
    if raw is None:
        return default
    return [o.strip() for o in raw.split(",") if o.strip()]


app.add_middleware(
    CORSMiddleware,
    allow_origins=_cors_origins(["http://localhost:8080"]),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def health():
    return {"status": "Progress Service running"}


@app.get("/health")
def health_check():
    return {"status": "ok"}
