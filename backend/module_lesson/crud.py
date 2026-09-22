# crud/module.py
from sqlalchemy.orm import Session
from typing import Optional
from models.modules import Module
from models.lessons import Lesson
from schemas import ModuleCreate, LessonCreate, LessonUpdate, LessonReorderItem, ModuleReorderItem
from typing import List
import os
import re
import uuid

# ---------------------------------------------------------------------------
# Public media URLs
#
# Lesson content blocks store the *path* of an uploaded file ("uploads/x.mp4").
# When lessons are read back we turn that into a URL the browser can load.
#
# PUBLIC_BASE_URL is optional. Left empty (the default) the URL is root-relative
# ("/uploads/x.mp4"), so it always resolves against whatever host/scheme the
# page was loaded from (IP, domain, load balancer...) and can never end up as
# http:// on an https:// page or point at localhost / an internal docker name.
# ---------------------------------------------------------------------------
MEDIA_TYPES = ["image", "video", "audio", "pdf", "ppt", "pptx", "doc", "docx", "document"]

# an absolute URL that points at one of OUR uploaded files, e.g. one that was
# stored by an older version with http://localhost:8000/uploads/abc.mp4
_OWN_UPLOAD_URL = re.compile(r"^https?://[^/]+(/uploads/.+)$", re.IGNORECASE)


def public_base_url() -> str:
    return os.getenv("PUBLIC_BASE_URL", "").strip().rstrip("/")


def resolve_media_url(content, base_url: Optional[str] = None):
    """Return a browser-loadable URL for a media block's `content` value."""
    if not content or not isinstance(content, str):
        return content
    if content.startswith(("data:", "blob:")):
        return content

    base = public_base_url() if base_url is None else base_url.rstrip("/")

    m = _OWN_UPLOAD_URL.match(content)
    if m:                                   # legacy absolute URL -> re-base it
        return f"{base}{m.group(1)}"
    if content.lower().startswith(("http://", "https://")):
        return content                      # external (YouTube, CDN, ...)

    path = content if content.startswith("/") else f"/{content}"
    return f"{base}{path}"


def resolve_content_blocks(blocks, base_url: Optional[str] = None):
    out = []
    for block in blocks or []:
        if not block:
            continue
        block = block.copy()
        if block.get("type") in MEDIA_TYPES:
            block["content"] = resolve_media_url(block.get("content"), base_url)
        out.append(block)
    return out


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

def get_course_modules_with_lessons(db: Session, course_id: str):
    modules = (
        db.query(Module)
        .filter(Module.course_id == course_id)
        .order_by(Module.order)
        .all()
    )

    result = []

    for module in modules:
        lessons = (
            db.query(Lesson)
            .filter(Lesson.module_id == module.id)
            .order_by(Lesson.order)
            .all()
        )

        result.append({
            "id": module.id,
            "course_id": module.course_id,
            "title": module.title,
            "description": module.description,
            "order": module.order,
            "visibility": module.visibility,
            "completed": False,  # progress service will override later
            "lessons": [
                {
                    "id": lesson.id,
                    "title": lesson.title,
                    "order": lesson.order
                }
                for lesson in lessons
            ]
        })

    return result



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





def get_lessons_by_module(db: Session, module_id: str, base_url: Optional[str] = None):
    lessons = db.query(Lesson).filter(Lesson.module_id == module_id).order_by(Lesson.order).all()
    
    result = []
    for lesson in lessons:
        # Convert ORM to dict - SAME as get_lesson but without extra fields
        lesson_data = {
            "id": lesson.id,
            "module_id": lesson.module_id,
            "title": lesson.title,
            "objectives": lesson.objectives,
            "prerequisites": lesson.prerequisites,
            "estimatedDuration": lesson.estimatedDuration,
            "difficulty": lesson.difficulty,
            "tags": lesson.tags or [],
            "contentBlocks": lesson.contentBlocks or [],
            "quizQuestions": lesson.quizQuestions or [],
            "discussion": lesson.discussion or {},
            "progressSettings": lesson.progressSettings or {},
            "accessibility": lesson.accessibility or {},
            "feedbackSettings": lesson.feedbackSettings or {},
            "order": lesson.order,
            "version": lesson.version,
            "created_at": lesson.created_at,
            "updated_at": lesson.updated_at,
        }
        
        lesson_data["contentBlocks"] = resolve_content_blocks(lesson_data.get("contentBlocks"), base_url)
        
        result.append(lesson_data)
    
    return result


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
        "version": lesson_obj.version
    }

    lesson_data["contentBlocks"] = resolve_content_blocks(lesson_data.get("contentBlocks"), base_url)

    return lesson_data


def get_lesson_instance(db: Session, lesson_id: str) -> Optional[Lesson]:
    return db.query(Lesson).filter(Lesson.id == lesson_id).first()

def get_lesson_version(db: Session, lesson_id: str) -> Optional[int]:
    lesson = get_lesson_instance(db, lesson_id)
    return lesson.version if lesson else None

      
  

def update_lesson(db: Session, lesson_id: str, data: LessonUpdate):
    lesson = get_lesson_instance(db, lesson_id)
    if not lesson:
        return None

    for key, value in data.dict(exclude_unset=True).items():
        if key in ['contentBlocks', 'quizQuestions', 'discussion', 'progressSettings', 'accessibility', 'feedbackSettings'] and value is not None:
            setattr(lesson, key, value.dict() if hasattr(value, 'dict') else value)
        else:
            setattr(lesson, key, value)

    # ✅ Increment version on content change
    lesson.version += 1

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
    Ensures proper lesson reordering with flush & refresh.
    Avoids duplicate order conflicts.
    """
    # STEP 1 — Set a temporary order to avoid duplicates
    for item in lessons_order:
        lesson = db.query(Lesson).filter(
            Lesson.id == item.lesson_id,
            Lesson.module_id == module_id
        ).first()

        if lesson:
            lesson.order = -1  # temporary value

    db.flush()

    # STEP 2 — Apply correct final order
    for item in lessons_order:
        lesson = db.query(Lesson).filter(
            Lesson.id == item.lesson_id,
            Lesson.module_id == module_id
        ).first()

        if lesson:
            lesson.order = item.order

    db.commit()
    return True

