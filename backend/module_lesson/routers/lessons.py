from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from crud import create_lesson, get_lessons_by_module, get_lesson, update_lesson, delete_lesson
from schemas import LessonCreate, LessonUpdate, LessonResponse
from typing import List

router = APIRouter(prefix="/lessons", tags=["Lessons"])

# Create lesson
@router.post("/", response_model=LessonResponse)
def create_lesson_route(data: LessonCreate, db: Session = Depends(get_db)):
    return create_lesson(db, data)

# Get lessons by module
@router.get("/module/{module_id}", response_model=List[LessonResponse])
def get_lessons_by_module_route(module_id: str, db: Session = Depends(get_db)):
    return get_lessons_by_module(db, module_id)

# Get single lesson
@router.get("/{lesson_id}", response_model=LessonResponse)
def get_one_lesson_route(lesson_id: str, db: Session = Depends(get_db)):
    lesson = get_lesson(db, lesson_id)
    if not lesson:
        raise HTTPException(404, "Lesson not found")
    return lesson

# Update lesson
@router.put("/{lesson_id}", response_model=LessonResponse)
def update_lesson_route(lesson_id: str, data: LessonUpdate, db: Session = Depends(get_db)):
    lesson = update_lesson(db, lesson_id, data)
    if not lesson:
        raise HTTPException(404, "Lesson not found")
    return lesson

# Delete lesson
@router.delete("/{lesson_id}")
def delete_lesson_route(lesson_id: str, db: Session = Depends(get_db)):
    success = delete_lesson(db, lesson_id)
    if not success:
        raise HTTPException(404, "Lesson not found")
    return {"message": "Lesson deleted"}
