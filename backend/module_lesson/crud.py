# crud/module.py
from sqlalchemy.orm import Session
from models.modules import Module
from models.lessons import Lesson
from schemas import ModuleCreate, LessonCreate
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

def create_lesson(db: Session, data: LessonCreate):
    lesson = Lesson(
        id=str(uuid.uuid4()),
        module_id=data.module_id,
        **data.model_dump(exclude={"module_id"})
    )
    db.add(lesson)
    db.commit()
    db.refresh(lesson)
    return lesson


def get_lessons_by_module(db: Session, module_id: str):
    return db.query(Lesson).filter(Lesson.module_id == module_id).all()


def get_lesson(db: Session, lesson_id: str):
    return db.query(Lesson).filter(Lesson.id == lesson_id).first()


def update_lesson(db: Session, lesson_id: str, data: LessonCreate):
    lesson = get_lesson(db, lesson_id)
    if not lesson:
        return None

    for key, value in data.model_dump(exclude={"module_id"}).items():
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
