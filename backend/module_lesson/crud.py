# crud/module.py
from sqlalchemy.orm import Session
from models.modules import Module
from models.lessons import Lesson
from schemas import ModuleCreate, LessonCreate, LessonUpdate
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
    return db.query(Module).filter(Module.course_id == course_id).all()

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


# -----------------------
# LESSON CRUD
# -----------------------

def create_lesson(db: Session, module_id: str, data: LessonCreate) -> Lesson:
    """
    Create a new lesson with full nested settings support.
    """
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
        order=data.order or 1
    )

    db.add(lesson)
    db.commit()
    db.refresh(lesson)
    return lesson


def get_lessons_by_module(db: Session, module_id: str):
    return db.query(Lesson).filter(Lesson.module_id == module_id).all()

def get_lesson(db: Session, lesson_id: str):
    return db.query(Lesson).filter(Lesson.id == lesson_id).first()

def update_lesson(db: Session, lesson_id: str, data: LessonUpdate):
    lesson = get_lesson(db, lesson_id)
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
    lesson = get_lesson(db, lesson_id)
    if not lesson:
        return None

    db.delete(lesson)
    db.commit()
    return True