from fastapi import APIRouter, Depends, BackgroundTasks
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from core.auth_utils import get_current_user_token, require_role
from fastapi import HTTPException
from sqlalchemy.orm import Session
from database import get_db
import crud.sessions as crud
import schemas.sessions as schemas
from services.notification_client import send_notification_event
from services.course_client import get_course_enrolled_student_ids

router = APIRouter(prefix="/sessions", tags=["Sessions"])
bearer_scheme = HTTPBearer()


@router.post("/create", response_model=schemas.SessionOut)
def create_session(
    session: schemas.SessionCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    user=Depends(require_role(["instructor"])),
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
):
    try:
        new_session = crud.create_session(db, session, user.sub)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    # ---- Notification: LIVE_SESSION_CREATED -> enrolled students (§9, §46) ----
    recipient_ids = get_course_enrolled_student_ids(new_session.course_id, credentials.credentials)
    if recipient_ids:
        background_tasks.add_task(
            send_notification_event,
            event_type="LIVE_SESSION_CREATED",
            source_service="scheduling_service",
            recipient_ids=recipient_ids,
            actor_id=user.sub,
            entity_type="session",
            entity_id=new_session.id,
            course_id=new_session.course_id,
            title="New live session scheduled",
            message=f"\"{new_session.title}\" has been scheduled for {new_session.date}.",
            action_url="/student/schedule",
        )

    return new_session
    
@router.get("/my", response_model=list[schemas.SessionOut])
def get_my_sessions(
    db: Session = Depends(get_db),
    user=Depends(require_role(["instructor"]))
):
    return crud.get_sessions_by_instructor(db, user.sub)


@router.get("/course/{course_id}", response_model=list[schemas.SessionOut])
def get_course_sessions(
    course_id: str,
    db: Session = Depends(get_db),
    user=Depends(get_current_user_token)
):
    return crud.get_sessions_by_course(db, course_id)

@router.put("/{session_id}", response_model=schemas.SessionOut)
def update_session(
    session_id: str,
    updates: schemas.SessionUpdate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    user=Depends(require_role(["instructor"])),
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
):
    db_session = crud.get_session(db, session_id)

    if not db_session:
        raise HTTPException(status_code=404, detail="Session not found")

    #  OWNER CHECK
    if db_session.instructor_id != user.sub:
        raise HTTPException(status_code=403, detail="Not allowed")

    try:
        updated_session = crud.update_session(db, session_id, updates)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    # ---- Notification: LIVE_SESSION_UPDATED -> enrolled students (§9, §46) ----
    recipient_ids = get_course_enrolled_student_ids(updated_session.course_id, credentials.credentials)
    if recipient_ids:
        background_tasks.add_task(
            send_notification_event,
            event_type="LIVE_SESSION_UPDATED",
            source_service="scheduling_service",
            recipient_ids=recipient_ids,
            actor_id=user.sub,
            entity_type="session",
            entity_id=updated_session.id,
            course_id=updated_session.course_id,
            title="Live session updated",
            message=f"\"{updated_session.title}\" has been updated. Please check the new details.",
            action_url="/student/schedule",
        )

    return updated_session

@router.delete("/{session_id}")
def delete_session(
    session_id: str,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    user=Depends(require_role(["instructor"])),
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
):
    db_session = crud.get_session(db, session_id)

    if not db_session:
        raise HTTPException(status_code=404, detail="Session not found")

    if db_session.instructor_id != user.sub:
        raise HTTPException(status_code=403, detail="Not allowed")

    # ---- Notification: LIVE_SESSION_CANCELLED -> enrolled students (§9, §46) ----
    # Resolved BEFORE delete_session() removes the row, since we need its
    # course_id/title for the message.
    course_id = db_session.course_id
    title = db_session.title
    recipient_ids = get_course_enrolled_student_ids(course_id, credentials.credentials)

    # Don't return the deleted ORM object: after commit its attributes are
    # expired, and SQLAlchemy trying to refresh them from a now-deleted row
    # raises ObjectDeletedError. A plain confirmation is all the caller needs.
    crud.delete_session(db, session_id)

    if recipient_ids:
        background_tasks.add_task(
            send_notification_event,
            event_type="LIVE_SESSION_CANCELLED",
            source_service="scheduling_service",
            recipient_ids=recipient_ids,
            actor_id=user.sub,
            entity_type="session",
            entity_id=session_id,
            course_id=course_id,
            title="Live session cancelled",
            message=f"\"{title}\" has been cancelled.",
            action_url="/student/schedule",
            priority="HIGH",
        )

    return {"message": "Session deleted successfully", "id": session_id}