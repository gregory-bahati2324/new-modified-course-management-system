from pydantic import BaseModel, field_validator
from typing import Optional, List
from datetime import datetime
import json

class CourseBase(BaseModel):
    code: str
    title: str
    description: Optional[str] = None
    category: Optional[str] = None
    level: Optional[str] = None
    duration: Optional[str] = None
    is_published: Optional[bool] = False
    allow_self_enrollment: Optional[bool] = True
    certificate: Optional[bool] = True
    max_students: Optional[int] = None
    tags: Optional[List[str]] = []

class CourseCreate(CourseBase):
    prerequisites: Optional[str] = None
    learning_outcomes: Optional[str] = None

class CourseUpdate(CourseBase):
    pass

class CourseOut(CourseBase):
    id: str
    instructor_id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

    @field_validator("tags", mode="before")
    def parse_tags(cls, v):
        if isinstance(v, str):
            try:
                return json.loads(v)
            except:
                return []
        return v
