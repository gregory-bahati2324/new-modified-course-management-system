from pydantic import BaseModel
from datetime import date, time
from typing import Optional


class SessionBase(BaseModel):
    title: str
    course_id: str

    date: date
    start_time: time
    end_time: time

    location: str
    is_online: bool = False
    meeting_link: Optional[str] = None

    type: str
    description: Optional[str] = None
    capacity: Optional[int] = None


class SessionCreate(SessionBase):
    pass


class SessionUpdate(SessionBase):
    pass
    


class SessionOut(SessionBase):
    id: str
    status: str

    class Config:
        from_attributes = True