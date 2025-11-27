from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from fastapi import Request
from sqlalchemy.orm import Session
from database import get_db
from crud import (
    create_module, get_modules, get_module, update_module, delete_module, get_course_modules,
    create_lesson, get_lessons_by_module, get_lesson, update_lesson, delete_lesson, reorder_lessons,
    reorder_modules
)
from schemas import ( ModuleCreate, LessonCreate, LessonUpdate, LessonResponse,
    LessonReorderRequest, ModuleReorderRequest)
from typing import List
import shutil
import os
import uuid

router = APIRouter()

# ---------------------
# MODULE ROUTES
# ---------------------
module_router = APIRouter(prefix="/modules", tags=["Modules"])

@module_router.post("/", summary="Create module")
def create_module_route(data: ModuleCreate, db: Session = Depends(get_db)):
    return create_module(db, data)

@module_router.get("/", summary="Get all modules")
def get_all_modules_route(db: Session = Depends(get_db)):
    return get_modules(db)

@module_router.get("/{module_id}", summary="Get module by ID")
def get_module_route(module_id: str, db: Session = Depends(get_db)):
    module = get_module(db, module_id)
    if not module:
        raise HTTPException(404, "Module not found")
    return module

@module_router.get("/course/{course_id}")
def query_course_modules(course_id: str, db: Session = Depends(get_db)):
    modules = get_course_modules(course_id=course_id, db=db)
    if not modules:
        raise HTTPException(404, "No Module found")
    return modules

@module_router.put("/update/{module_id}", summary="Update module")
def update_module_route(module_id: str, data: ModuleCreate, db: Session = Depends(get_db)):
    module = update_module(db, module_id, data)
    if not module:
        raise HTTPException(404, "Module not found")
    return module

@module_router.delete("/{module_id}", summary="Delete module")
def delete_module_route(module_id: str, db: Session = Depends(get_db)):
    success = delete_module(db, module_id)
    if not success:
        raise HTTPException(404, "Module not found")
    return {"message": "Module deleted"}

@module_router.put("/reorder", summary="Reorder modules in bulk")
def reorder_modules_route(data: ModuleReorderRequest, db: Session = Depends(get_db)):
    success = reorder_modules(db, data.modules)
    if not success:
        raise HTTPException(status_code=400, detail="Failed to reorder modules")
    return {"message": "Modules reordered successfully"}

# ---------------------
# LESSON ROUTES
# ---------------------

@module_router.post("/{module_id}/lessons", response_model=LessonResponse)
def create_lesson_route(data: LessonCreate, module_id: str, db: Session = Depends(get_db)):
    return create_lesson(db, module_id, data)

@module_router.get("/lessons/{module_id}/lessons", response_model=List[LessonResponse])
def get_lessons_by_module_route(module_id: str, db: Session = Depends(get_db)):
    return get_lessons_by_module(db, module_id)

@module_router.get("/lessons/{lesson_id}", response_model=LessonResponse)
def get_one_lesson_route(lesson_id: str, request: Request, db: Session = Depends(get_db)):
    base_url = str(request.base_url).rstrip("/")
    lesson = get_lesson(db, lesson_id, base_url=base_url)
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")

    return lesson


@module_router.put("/lessons/update/{lesson_id}", response_model=LessonResponse)
def update_lesson_route(lesson_id: str, data: LessonUpdate, db: Session = Depends(get_db)):
    lesson = update_lesson(db, lesson_id, data)
    if not lesson:
        raise HTTPException(404, "Lesson not found")
    return lesson

@module_router.delete("/lessons/delete/{lesson_id}")
def delete_lesson_route(lesson_id: str, db: Session = Depends(get_db)):
    success = delete_lesson(db, lesson_id)
    if not success:
        raise HTTPException(404, "Lesson not found")
    return {"message": "Lesson deleted"}

@module_router.put("/{module_id}/lessons/reorder")
def reorder_lessons_route(module_id: str, data: LessonReorderRequest, db: Session = Depends(get_db)):
    success = reorder_lessons(db, module_id, data.lessons)
    if not success:
        raise HTTPException(status_code=400, detail="Failed to reorder lessons")
    return {"message": "Lessons reordered successfully"}


# ---------------------
# FILE UPLOAD ROUTES
# ---------------------


UPLOAD_DIR = "uploads"


@module_router.post("/lessons/uploads/{lesson_id}/file")
def upload_lesson_file(lesson_id: str, request: Request, file: UploadFile = File(...)):
    filename = f"{uuid.uuid4()}_{file.filename}"
    filepath = os.path.join(UPLOAD_DIR, filename)

    with open(filepath, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # Build absolute URL using request.base_url
    file_url = str(request.base_url).rstrip("/") + f"/uploads/{filename}"

    return {"lesson_id": lesson_id, "filename": filename, "url": file_url, "filepath": filepath}
# ---------------------
# INCLUDE ALL ROUTERS
# ---------------------
router.include_router(module_router)

