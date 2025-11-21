# schemas/module.py
from pydantic import BaseModel
from typing import List, Optional

# ----------------------------
# MODULE SCHEMAS
# ----------------------------
class ModuleBase(BaseModel):
    title: str
    description: Optional[str] = None
    order: Optional[int] = 1
    visibility: Optional[str] = "public"
    course_id: str

class ModuleCreate(ModuleBase):
    pass

class ModuleResponse(ModuleBase):
    id: str

    class Config:
        orm_mode = True


# ----------------------------
# LESSON SCHEMAS
# ----------------------------

class ContentBlock(BaseModel):
    id: int
    type: str
    title: Optional[str] = None
    content: Optional[str] = None


class QuizQuestion(BaseModel):
    id: int
    question: str
    options: List[str]
    correctAnswer: int


class LessonBase(BaseModel):
    title: str
    objectives: Optional[str] = None
    prerequisites: Optional[str] = None
    estimatedDuration: Optional[str] = None
    difficulty: Optional[str] = None
    tags: Optional[str] = None
    contentBlocks: List[ContentBlock]
    quizQuestions: List[QuizQuestion]


class LessonCreate(LessonBase):
    module_id: str


class LessonResponse(LessonBase):
    id: str
    module_id: str

    class Config:
        orm_mode = True
