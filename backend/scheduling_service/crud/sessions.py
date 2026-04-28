from sqlalchemy.orm import Session
from models.sessions import Session as SessionModel
from schemas.sessions import SessionCreate, SessionUpdate

def create_session(db, session_data, instructor_id: str):

    # 🚨 VALIDATION RULE
    if session_data.is_online and not session_data.meeting_link:
        raise ValueError("Online sessions must have a meeting link (Zoom/Google Meet)")

    new_session = SessionModel(
        title=session_data.title,
        course_id=session_data.course_id,
        date=session_data.date,
        start_time=session_data.start_time,
        end_time=session_data.end_time,
        location=session_data.location,
        type=session_data.type,
        description=session_data.description,
        capacity=session_data.capacity,
        is_online=session_data.is_online,
        meeting_link=session_data.meeting_link,  # ✅ ADD THIS
        instructor_id=instructor_id
    )

    db.add(new_session)
    db.commit()
    db.refresh(new_session)
    return new_session


def get_sessions_by_instructor(db: Session, instructor_id: str):
    return db.query(SessionModel).filter(SessionModel.instructor_id == instructor_id).all()


def get_sessions_by_course(db: Session, course_id: str):
    return db.query(SessionModel).filter(SessionModel.course_id == course_id).all()


def get_session(db: Session, session_id: str):
    return db.query(SessionModel).filter(SessionModel.id == session_id).first()


def update_session(db: Session, session_id: str, updates: SessionUpdate):
    db_session = get_session(db, session_id)
    if not db_session:
        return None
    
    if updates.is_online is not None and updates.is_online and not updates.meeting_link:
        raise ValueError("Online sessions must have a meeting link (Zoom/Google Meet)")

    for key, value in updates.dict(exclude_unset=True).items():
        setattr(db_session, key, value)

    db.commit()
    db.refresh(db_session)
    return db_session


def delete_session(db: Session, session_id: str):
    db_session = get_session(db, session_id)
    if not db_session:
        return None

    db.delete(db_session)
    db.commit()
    return db_session