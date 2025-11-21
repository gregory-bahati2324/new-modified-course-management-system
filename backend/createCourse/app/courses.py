# app/routers/courses.py
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List
from app import auth_utils
from app import crud, database, schemas

router = APIRouter(prefix="/courses", tags=["Courses"])

@router.post("", response_model=schemas.CourseOut, status_code=status.HTTP_201_CREATED,
             dependencies=[Depends(auth_utils.require_role(["instructor", "admin"]))])
def create_course(course_in: schemas.CourseCreate, db: Session = Depends(database.get_db),
                  token=Depends(auth_utils.get_current_user_token)):
    # token.sub contains instructor id
    # ensure unique code
    if crud.get_course_by_code(db, course_in.code):
        raise HTTPException(status_code=400, detail="Course code already exists")
    new = crud.create_course(db, course_in, instructor_id=token.sub)
    # convert tags string back to list
    out = schemas.CourseOut.from_orm(new)
    return out

@router.get("", response_model=List[schemas.CourseOut])
def list_courses(skip: int = 0, limit: int = 50, db: Session = Depends(database.get_db)):
    items = crud.list_courses_2(db, skip=skip, limit=limit)
    return [schemas.CourseOut.from_orm(i) for i in items]

@router.get("/me", response_model=List[schemas.CourseOut])
def list_my_courses(db: Session = Depends(database.get_db), token=Depends(auth_utils.get_current_user_token),
                    skip: int = 0, limit: int = 50):
    items = crud.list_my_courses(db, instructor_id=token.sub, skip=skip, limit=limit)
    return [schemas.CourseOut.from_orm(i) for i in items]


@router.get("/", response_model=List[schemas.CourseOut])
def list_my_filtered_courses(
    db: Session = Depends(database.get_db),
    token=Depends(auth_utils.get_current_user_token),
    category: str | None = None,
    department: str | None = None,
    level: str | None = None,
    type: str | None = None,
    skip: int = 0,
    limit: int = 50
):
    courses = crud.list_my_filtered_courses(
        db=db,
        instructor_id=token.sub,
        category=category,
        department=department,
        level=level,
        course_type=type,
        skip=skip,
        limit=limit
    )
    return [schemas.CourseOut.from_orm(c) for c in courses]


@router.get("/{course_id}", response_model=schemas.CourseOut)
def get_course(course_id: str, db: Session = Depends(database.get_db)):
    c = crud.get_course(db, course_id)
    if not c:
        raise HTTPException(status_code=404, detail="Course not found")
    return schemas.CourseOut.from_orm(c)

@router.put("/{course_id}", response_model=schemas.CourseOut, dependencies=[Depends(auth_utils.require_role(["instructor", "admin"]))])
def update_course(course_id: str, payload: schemas.CourseUpdate, db: Session = Depends(database.get_db), token=Depends(auth_utils.get_current_user_token)):
    c = crud.get_course(db, course_id)
    if not c:
        raise HTTPException(status_code=404, detail="Course not found")
    # only owner or admin can update
    if token.role != "admin" and c.instructor_id != token.sub:
        raise HTTPException(status_code=403, detail="Not allowed to update this course")
    updated = crud.update_course(db, course_id, payload)
    return schemas.CourseOut.from_orm(updated)

@router.delete("/{course_id}", status_code=status.HTTP_204_NO_CONTENT,
               dependencies=[Depends(auth_utils.require_role(["instructor", "admin"]))])
def delete_course(course_id: str, db: Session = Depends(database.get_db), token=Depends(auth_utils.get_current_user_token)):
    c = crud.get_course(db, course_id)
    if not c:
        raise HTTPException(status_code=404, detail="Course not found")
    if token.role != "admin" and c.instructor_id != token.sub:
        raise HTTPException(status_code=403, detail="Not allowed to delete")
    crud.delete_course(db, course_id)
    return None
