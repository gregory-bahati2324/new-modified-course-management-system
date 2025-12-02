from fastapi import FastAPI
from database import Base, engine
from routers.assigments import router as assignment_router
from fastapi.middleware.cors import CORSMiddleware


Base.metadata.create_all(bind=engine)

app = FastAPI(title="Assessment Service")

origins = [
    "http://localhost:5173",  # Vite dev server
    "http://localhost:8080",  # React dev server (optional)
    "http://localhost:3000",  # React dev server
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],   # allow POST, GET, PUT, DELETE, OPTIONS
    allow_headers=["*"],   # allow Authorization, Content-Type, etc.
)

app.include_router(assignment_router)

