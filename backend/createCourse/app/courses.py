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


@router.get("/{category}/{department}/{level}/{type}", response_model=List[schemas.CourseOut])
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

@router.get("/student", response_model=List[schemas.CourseOut])
def student_filtered_courses(
    db: Session = Depends(database.get_db),
    category: str | None = Query(None),
    department: str | None = Query(None),
    level: str | None = Query(None),
    type: str | None = Query(None),
    duration: str | None = Query(None),
    skip: int = 0,
    limit: int = 50,
):
    courses = crud.student_filtered_courses(
        db=db,
        category=category,
        department=department,
        level=level,
        course_type=type,
        duration=duration,
        skip=skip,
        limit=limit,
    )
    return [schemas.CourseOut.from_orm(c) for c in courses]


@router.get("/all", response_model=List[schemas.CourseOut])
def get_all_courses(db: Session = Depends(database.get_db)):
    courses = crud.get_all_courses(db)
    return [schemas.CourseOut.from_orm(c) for c in courses]


@router.get("/{course_id}/detail", response_model=schemas.CourseOut)
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

@router.post("/{course_id}/enroll", 
             response_model=schemas.EnrollmentOut, 
             status_code=status.HTTP_201_CREATED,
             dependencies=[Depends(auth_utils.require_role(["student", "admin"]))])
def enroll_in_course(course_id: str, db: Session = Depends(database.get_db),
                     token=Depends(auth_utils.get_current_user_token)):

    enrollment_in = schemas.EnrollmentCreate(
        course_id=course_id,
        student_id=token.sub
    )
    enrollment = crud.create_enrollment(db, enrollment_in)
    return schemas.EnrollmentOut.from_orm(enrollment)

@router.get("/enrollments/student", response_model=List[schemas.EnrollmentOut],
            dependencies=[Depends(auth_utils.require_role(["student", "instructor", "admin"]))])
def list_enrollments(db: Session = Depends(database.get_db),
                     token=Depends(auth_utils.get_current_user_token)): 
    # students can only see their own enrollments
    student_id = token.sub
    if token.role == "student" and token.sub != student_id:
        raise HTTPException(status_code=403, detail="Not allowed to view these enrollments")
    enrollments = crud.list_enrollments_by_student(db, student_id)      
    return [schemas.EnrollmentOut.from_orm(e) for e in enrollments]

@router.get("/enrollments/course/{course_id}", response_model=List[schemas.EnrollmentOut],
            dependencies=[Depends(auth_utils.require_role(["instructor", "admin"]))])
def list_course_enrollments(course_id: str, db: Session = Depends(database.get_db),
                            token=Depends(auth_utils.get_current_user_token)):
    # only the course instructor or admin can view enrollments
    course = crud.get_course(db, course_id)
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    if token.role != "admin" and course.instructor_id != token.sub:
        raise HTTPException(status_code=403, detail="Not allowed to view enrollments for this course")
    enrollments = crud.list_enrollments_by_course(db, course_id)
    return [schemas.EnrollmentOut.from_orm(e) for e in enrollments]

@router.get("/enrollments/detail/{course_id}/{student_id}", response_model=schemas.EnrollmentOut,
            dependencies=[Depends(auth_utils.require_role(["student", "instructor", "admin"]))])
def get_enrollment_detail(course_id: str, student_id: str, db: Session = Depends(database.get_db),
                          token=Depends(auth_utils.get_current_user_token)):
    enrollment = crud.get_student_enrollment(db, course_id, student_id)
    if not enrollment:
        raise HTTPException(status_code=404, detail="Enrollment not found")
    # students can only view their own enrollment
    if token.role == "student" and enrollment.student_id != token.sub:
        raise HTTPException(status_code=403, detail="Not allowed to view this enrollment")
    # instructors can only view enrollments for their courses
    if token.role == "instructor":
        course = crud.get_course(db, enrollment.course_id)
        if course.instructor_id != token.sub:
            raise HTTPException(status_code=403, detail="Not allowed to view this enrollment")
    return schemas.EnrollmentOut.from_orm(enrollment)

@router.put("/enrollments/{enrollment_id}", response_model=schemas.EnrollmentOut,
            dependencies=[Depends(auth_utils.require_role(["student", "instructor", "admin"]))])
def update_enrollment(enrollment_id: str, payload: schemas.EnrollmentBase, db: Session = Depends(database.get_db),
                      token=Depends(auth_utils.get_current_user_token)):
    enrollment = crud.get_enrollment(db, enrollment_id)
    if not enrollment:
        raise HTTPException(status_code=404, detail="Enrollment not found")
    # students can only update their own enrollments
    if token.role == "student" and enrollment.student_id != token.sub:
        raise HTTPException(status_code=403, detail="Not allowed to update this enrollment")
    # instructors can only update enrollments for their courses
    if token.role == "instructor":
        course = crud.get_course(db, enrollment.course_id)
        if course.instructor_id != token.sub:
            raise HTTPException(status_code=403, detail="Not allowed to update this enrollment")
    updated = crud.update_enrollment(db, enrollment_id, payload)
    return schemas.EnrollmentOut.from_orm(updated)  
