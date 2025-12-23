from fastapi import FastAPI
from database import engine, Base
from routers.progress import router as progress_router

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Progress Service")

app.include_router(progress_router)


@app.get("/")
def health():
    return {"status": "Progress Service running"}
