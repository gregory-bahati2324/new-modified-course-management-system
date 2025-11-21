# app/crud.py
import uuid
from sqlalchemy.orm import Session

from . import models
from . import schemas
import json

def _tags_to_str(tags: list | None):
    if tags is None:
        return None
    return json.dumps(tags)

def _str_to_tags(s: str | None):
    if not s:
        return []
    try:
        return json.loads(s)
    except Exception:
        return []

def create_course(db: Session, course_in: schemas.CourseCreate, instructor_id: str):
    new = models.Course(
        id=str(uuid.uuid4()),
        code=course_in.code,
        title=course_in.title,
        description=course_in.description,
        category=course_in.category,
        department=course_in.department,
        level=course_in.level,
        course_type=course_in.course_type,
        duration=course_in.duration,
        instructor_id=instructor_id,
        is_published=course_in.is_published or False,
        prerequisites=course_in.prerequisites,
        learning_outcomes=course_in.learning_outcomes,
        allow_self_enrollment=course_in.allow_self_enrollment if course_in.allow_self_enrollment is not None else True,
        certificate=course_in.certificate if course_in.certificate is not None else True,
        max_students=course_in.max_students,
        tags=_tags_to_str(course_in.tags),
    )
    db.add(new)
    db.commit()
    db.refresh(new)
    return new


def get_course(db: Session, course_id: str):
    return db.query(models.Course).filter(models.Course.id == course_id).first()

def get_course_by_code(db: Session, code: str):
    return db.query(models.Course).filter(models.Course.code == code).first()

def list_courses_2(db: Session, skip: int = 0, limit: int = 50):
    return db.query(models.Course).offset(skip).limit(limit).all()

def list_my_filtered_courses(
    db: Session,
    instructor_id: str,
    category: str | None,
    department: str | None,
    level: str | None,
    course_type: str | None,
    skip: int = 0,
    limit: int = 50
):
    query = db.query(models.Course).filter(models.Course.instructor_id == instructor_id)

    if category:
        query = query.filter(models.Course.category == category)
    if department:
        query = query.filter(models.Course.department == department)
    if level:
        query = query.filter(models.Course.level == level)
    if course_type:
        query = query.filter(models.Course.course_type == course_type)

    return query.offset(skip).limit(limit).all()


def list_my_courses(db: Session, instructor_id: str, skip: int = 0, limit: int = 50):
    return db.query(models.Course).filter(models.Course.instructor_id == instructor_id).offset(skip).limit(limit).all()

def update_course(db: Session, course_id: str, data: schemas.CourseUpdate):
    course = get_course(db, course_id)
    if not course:
        return None
    for k, v in data.dict(exclude_unset=True).items():
        if k == "tags":
            setattr(course, "tags", _tags_to_str(v))
        else:
            setattr(course, k, v)
    db.commit()
    db.refresh(course)
    return course

def delete_course(db: Session, course_id: str):
    course = get_course(db, course_id)
    if not course:
        return False
    db.delete(course)
    db.commit()
    return True
