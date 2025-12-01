from fastapi import FastAPI
from database import Base, engine
from routers.assigments import router as assignment_router


Base.metadata.create_all(bind=engine)

app = FastAPI(title="Assessment Service")

app.include_router(assignment_router)
