# routers/module.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from crud import (
    create_module, get_modules, get_module, update_module, delete_module,
    create_lesson, get_lessons_by_module, get_lesson, update_lesson, delete_lesson
)
from schemas import ModuleCreate, LessonCreate

router = APIRouter(prefix="/modules", tags=["Modules"])


# ---------------------
# MODULE ROUTES
# ---------------------

@router.post("/", summary="Create module")
def create_module_route(data: ModuleCreate, db: Session = Depends(get_db)):
    return create_module(db, data)


@router.get("/", summary="Get all modules")
def get_all_modules_route(db: Session = Depends(get_db)):
    return get_modules(db)


@router.get("/{module_id}", summary="Get module by ID")
def get_module_route(module_id: str, db: Session = Depends(get_db)):
    module = get_module(db, module_id)
    if not module:
        raise HTTPException(404, "Module not found")
    return module


@router.put("/{module_id}", summary="Update module")
def update_module_route(module_id: str, data: ModuleCreate, db: Session = Depends(get_db)):
    module = update_module(db, module_id, data)
    if not module:
        raise HTTPException(404, "Module not found")
    return module


@router.delete("/{module_id}", summary="Delete module")
def delete_module_route(module_id: str, db: Session = Depends(get_db)):
    success = delete_module(db, module_id)
    if not success:
        raise HTTPException(404, "Module not found")
    return {"message": "Module deleted"}


# ---------------------
# LESSON ROUTES
# ---------------------

@router.post("/lesson", summary="Create lesson")
def create_lesson_route(data: LessonCreate, db: Session = Depends(get_db)):
    return create_lesson(db, data)


@router.get("/{module_id}/lessons", summary="Get lessons in module")
def get_lessons_route(module_id: str, db: Session = Depends(get_db)):
    return get_lessons_by_module(db, module_id)


@router.get("/lesson/{lesson_id}", summary="Get single lesson")
def get_one_lesson_route(lesson_id: str, db: Session = Depends(get_db)):
    lesson = get_lesson(db, lesson_id)
    if not lesson:
        raise HTTPException(404, "Lesson not found")
    return lesson


@router.put("/lesson/{lesson_id}", summary="Update lesson")
def update_lesson_route(lesson_id: str, data: LessonCreate, db: Session = Depends(get_db)):
    lesson = update_lesson(db, lesson_id, data)
    if not lesson:
        raise HTTPException(404, "Lesson not found")
    return lesson


@router.delete("/lesson/{lesson_id}", summary="Delete lesson")
def delete_lesson_route(lesson_id: str, db: Session = Depends(get_db)):
    success = delete_lesson(db, lesson_id)
    if not success:
        raise HTTPException(404, "Lesson not found")
    return {"message": "Lesson deleted"}
