from fastapi import FastAPI
from database import engine, Base
from routers.progress import router as progress_router
from fastapi.middleware.cors import CORSMiddleware

Base.metadata.create_all(bind=engine)



app = FastAPI(title="Progress Service")

app.include_router(progress_router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8080"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def health():
    return {"status": "Progress Service running"}
