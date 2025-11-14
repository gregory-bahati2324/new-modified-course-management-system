from fastapi import FastAPI
from database import Base, engine
from routers.modules import router as module_router
from starlette.middleware.cors import CORSMiddleware

app = FastAPI()

Base.metadata.create_all(bind=engine)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],  # MUST include OPTIONS
    allow_headers=["*"],
)

app.include_router(module_router)

@app.get("/")
def root():
    return {"message": "Module service running"}
