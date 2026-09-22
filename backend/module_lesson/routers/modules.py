from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, BackgroundTasks
from fastapi import Request
from sqlalchemy.orm import Session
from database import get_db
from crud import public_base_url
from crud import (
    create_module, get_modules, get_module, update_module, delete_module, get_course_modules,
    create_lesson, get_lessons_by_module, get_lesson, update_lesson, delete_lesson, reorder_lessons,
    reorder_modules, get_course_modules_with_lessons
)
from schemas import ( ModuleCreate, LessonCreate, LessonUpdate, LessonResponse,
    LessonReorderRequest, ModuleReorderRequest)
from typing import List
import shutil
import os
import uuid

from services.notification_client import send_notification_event
from services.course_client import get_course_enrolled_student_ids
from utils.optional_auth import get_bearer_token, get_actor_id_best_effort

router = APIRouter()

# ---------------------
# MODULE ROUTES
# ---------------------
module_router = APIRouter(prefix="/modules", tags=["Modules"])

@module_router.post("", summary="Create module")
@module_router.post("/", include_in_schema=False)
def create_module_route(data: ModuleCreate, request: Request, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    module = create_module(db, data)

    # ---- Notification: MODULE_CREATED -> enrolled students (§4, §46) ----
    # Best-effort: only fires if the request carried a usable Bearer token
    # (see utils/optional_auth.py) and course_service can be reached.
    # Neither failure blocks module creation, which has already committed.
    token = get_bearer_token(request)
    recipient_ids = get_course_enrolled_student_ids(module.course_id, token)
    if recipient_ids:
        background_tasks.add_task(
            send_notification_event,
            event_type="MODULE_CREATED",
            source_service="module_lesson_service",
            recipient_ids=recipient_ids,
            actor_id=get_actor_id_best_effort(token),
            entity_type="module",
            entity_id=module.id,
            course_id=module.course_id,
            title="New module added",
            message=f"A new module, \"{module.title}\", was added to your course.",
            action_url=f"/student/course/{module.course_id}/learn",
        )

    return module

@module_router.get("", summary="Get all modules")
@module_router.get("/", include_in_schema=False)
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
    return modules

@module_router.get(
    "/course/{course_id}/with-lessons",
    summary="Get course modules with lesson names"
)
def get_course_modules_with_lessons_route(
    course_id: str,
    db: Session = Depends(get_db)
):
    return get_course_modules_with_lessons(db, course_id)


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
def create_lesson_route(data: LessonCreate, module_id: str, request: Request, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    lesson = create_lesson(db, module_id, data)

    # ---- Notification: LESSON_CREATED -> enrolled students (§4, §46) ----
    module = get_module(db, module_id)
    if module:
        token = get_bearer_token(request)
        recipient_ids = get_course_enrolled_student_ids(module.course_id, token)
        if recipient_ids:
            background_tasks.add_task(
                send_notification_event,
                event_type="LESSON_CREATED",
                source_service="module_lesson_service",
                recipient_ids=recipient_ids,
                actor_id=get_actor_id_best_effort(token),
                entity_type="lesson",
                entity_id=lesson.id,
                course_id=module.course_id,
                title="New lesson available",
                message=f"A new lesson, \"{lesson.title}\", is now available.",
                action_url=f"/student/course/{module.course_id}/learn",
            )

    return lesson

@module_router.get("/{module_id}/lessons", response_model=List[LessonResponse])
def get_lessons_by_module_route(module_id: str, request: Request, db: Session = Depends(get_db)):
    base_url = public_base_url()
    
    # ✅ Use the updated CRUD function with base_url
    lessons = get_lessons_by_module(db, module_id, base_url=base_url)
    return lessons

@module_router.get("/lessons/{lesson_id}", response_model=LessonResponse)
def get_one_lesson_route(lesson_id: str, request: Request, db: Session = Depends(get_db)):
    base_url = public_base_url()
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

    # Root-relative unless PUBLIC_BASE_URL is set (see crud.public_base_url)
    file_url = public_base_url() + f"/uploads/{filename}"

    return {"lesson_id": lesson_id, "filename": filename, "url": file_url, "filepath": filepath}
# ---------------------
# INCLUDE ALL ROUTERS
# ---------------------
router.include_router(module_router)

