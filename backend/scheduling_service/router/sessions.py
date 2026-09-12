from fastapi import APIRouter, Depends
from core.auth_utils import get_current_user_token, require_role
from fastapi import HTTPException
from sqlalchemy.orm import Session
from database import get_db
import crud.sessions as crud
import schemas.sessions as schemas

router = APIRouter(prefix="/sessions", tags=["Sessions"])


@router.post("/create", response_model=schemas.SessionOut)
def create_session(
    session: schemas.SessionCreate,
    db: Session = Depends(get_db),
    user=Depends(require_role(["instructor"]))
):
    try:
        return crud.create_session(db, session, user.sub)

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    
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
    db: Session = Depends(get_db),
    user=Depends(require_role(["instructor"]))
):
    db_session = crud.get_session(db, session_id)

    if not db_session:
        raise HTTPException(status_code=404, detail="Session not found")

    #  OWNER CHECK
    if db_session.instructor_id != user.sub:
        raise HTTPException(status_code=403, detail="Not allowed")

    try:
        return crud.update_session(db, session_id, updates)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.delete("/{session_id}")
def delete_session(
    session_id: str,
    db: Session = Depends(get_db),
    user=Depends(require_role(["instructor"]))
):
    db_session = crud.get_session(db, session_id)

    if not db_session:
        raise HTTPException(status_code=404, detail="Session not found")

    if db_session.instructor_id != user.sub:
        raise HTTPException(status_code=403, detail="Not allowed")

    # Don't return the deleted ORM object: after commit its attributes are
    # expired, and SQLAlchemy trying to refresh them from a now-deleted row
    # raises ObjectDeletedError. A plain confirmation is all the caller needs.
    crud.delete_session(db, session_id)
    return {"message": "Session deleted successfully", "id": session_id}