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
    
@router.get("/my")
def get_my_sessions(
    db: Session = Depends(get_db),
    user=Depends(require_role(["instructor"]))
):
    return crud.get_sessions_by_instructor(db, user.sub)


@router.get("/course/{course_id}")
def get_course_sessions(
    course_id: str,
    db: Session = Depends(get_db),
    user=Depends(get_current_user_token)
):
    return crud.get_sessions_by_course(db, course_id)

@router.put("/{session_id}")
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

    return crud.update_session(db, session_id, updates)

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

    return crud.delete_session(db, session_id)