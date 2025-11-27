# crud/module.py
from sqlalchemy.orm import Session
from typing import Optional
from models.modules import Module
from models.lessons import Lesson
from schemas import ModuleCreate, LessonCreate, LessonUpdate, LessonReorderItem, ModuleReorderItem
from typing import List
import uuid


# -----------------------
# MODULE CRUD
# -----------------------

def create_module(db: Session, data: ModuleCreate):
    module = Module(id=str(uuid.uuid4()), **data.model_dump())
    db.add(module)
    db.commit()
    db.refresh(module)
    return module


def get_modules(db: Session):
    return db.query(Module).all()


def get_module(db: Session, module_id: str):
    return db.query(Module).filter(Module.id == module_id).first()

def get_course_modules(db: Session, course_id: str):
    return db.query(Module).filter(Module.course_id == course_id).order_by(Module.order).all()

def update_module(db: Session, module_id: str, data: ModuleCreate):
    module = get_module(db, module_id)
    if not module:
        return None

    for key, value in data.model_dump().items():
        setattr(module, key, value)

    db.commit()
    db.refresh(module)
    return module


def delete_module(db: Session, module_id: str):
    module = get_module(db, module_id)
    if not module:
        return None

    db.delete(module)
    db.commit()
    return True

def reorder_modules(db: Session, modules_order: List[ModuleReorderItem]):
    """
    Update the order of modules based on the list of { module_id, order }.
    """
    for item in modules_order:
        module = db.query(Module).filter(Module.id == item.module_id).first()
        if module:
            module.order = item.order

    db.commit()
    return True


# -----------------------
# LESSON CRUD
# -----------------------

def create_lesson(db: Session, module_id: str, data: LessonCreate) -> Lesson:
    """
    Create a new lesson with automatic ordering and full nested settings.
    """

    # 1. Count existing lessons under this module
    existing_lessons = (
        db.query(Lesson)
        .filter(Lesson.module_id == module_id)
        .count()
    )

    # 2. New lesson order (1, 2, 3, ...)
    new_order = existing_lessons + 1

    # 3. Create lesson object
    lesson = Lesson(
        id=str(uuid.uuid4()),
        module_id=module_id,
        title=data.title,
        objectives=data.objectives,
        prerequisites=data.prerequisites,
        estimatedDuration=data.estimatedDuration,
        difficulty=data.difficulty,
        tags=data.tags or [],
        contentBlocks=[block.dict() for block in data.contentBlocks] if data.contentBlocks else [],
        quizQuestions=[q.dict() for q in data.quizQuestions] if data.quizQuestions else [],
        discussion=data.discussion.dict() if data.discussion else {},
        progressSettings=data.progressSettings.dict() if data.progressSettings else {},
        accessibility=data.accessibility.dict() if data.accessibility else {},
        feedbackSettings=data.feedbackSettings.dict() if data.feedbackSettings else {},
        
        # 🔥 Automatically assigned order
        order=new_order
    )

    db.add(lesson)
    db.commit()
    db.refresh(lesson)
    return lesson



def get_lessons_by_module(db: Session, module_id: str):
    return db.query(Lesson).filter(Lesson.module_id == module_id).order_by(Lesson.order).all()

Base_url = "http://localhost:8000"


def get_lesson(db: Session, lesson_id: str, base_url: Optional[str] = None):
    # Return an ORM object or a dict with full content URLs
    lesson_obj = db.query(Lesson).filter(Lesson.id == lesson_id).first()
    if not lesson_obj:
        return None

    # Convert ORM to dict (only include fields you want)
    lesson_data = {
        "id": lesson_obj.id,
        "module_id": lesson_obj.module_id,
        "title": lesson_obj.title,
        "objectives": lesson_obj.objectives,
        "prerequisites": lesson_obj.prerequisites,
        "estimatedDuration": lesson_obj.estimatedDuration,
        "difficulty": lesson_obj.difficulty,
        "tags": lesson_obj.tags or [],
        "contentBlocks": lesson_obj.contentBlocks or [],
        "quizQuestions": lesson_obj.quizQuestions or [],
        "discussion": lesson_obj.discussion or {},
        "progressSettings": lesson_obj.progressSettings or {},
        "accessibility": lesson_obj.accessibility or {},
        "feedbackSettings": lesson_obj.feedbackSettings or {},
        "order": lesson_obj.order,
        "created_at": lesson_obj.created_at,
        "updated_at": lesson_obj.updated_at,
    }

    # If base_url provided, convert local upload paths to absolute URLs
    if base_url:
        cb = []
        MEDIA_TYPES = ["image", "video", "audio", "pdf", "ppt", "pptx", "doc", "docx", "document"]
        for block in lesson_data.get("contentBlocks", []):
            if not block:
                continue
            block = block.copy()
            content = block.get("content")
            
            if content and block.get("type") in MEDIA_TYPES and not content.startswith("http"):
                # ensure leading slash for safety
                path = content if content.startswith("/") else f"/{content}"
                block["content"] = f"{base_url.rstrip('/')}{path}"
            cb.append(block)
        lesson_data["contentBlocks"] = cb

    return lesson_data


def get_lesson_instance(db: Session, lesson_id: str) -> Optional[Lesson]:
    return db.query(Lesson).filter(Lesson.id == lesson_id).first()

      
  

def update_lesson(db: Session, lesson_id: str, data: LessonUpdate):
    lesson = get_lesson_instance(db, lesson_id)
    if not lesson:
        return None

    for key, value in data.dict(exclude_unset=True).items():
        if key in ['contentBlocks', 'quizQuestions', 'discussion', 'progressSettings', 'accessibility', 'feedbackSettings'] and value is not None:
            setattr(lesson, key, value.dict() if hasattr(value, 'dict') else value)
        else:
            setattr(lesson, key, value)

    db.commit()
    db.refresh(lesson)
    return lesson

def delete_lesson(db: Session, lesson_id: str):
    lesson = get_lesson_instance(db, lesson_id)
    if not lesson:
        return None

    db.delete(lesson)
    db.commit()
    return True

def reorder_lessons(db: Session, module_id: str, lessons_order: List[LessonReorderItem]):
    """
    Update the order of lessons in a module.
    `lessons_order` is a list of { lesson_id, order }.
    """
    for item in lessons_order:
        lesson = db.query(Lesson).filter(Lesson.id == item.lesson_id, Lesson.module_id == module_id).first()
        if lesson:
            lesson.order = item.order

    db.commit()
    return True
