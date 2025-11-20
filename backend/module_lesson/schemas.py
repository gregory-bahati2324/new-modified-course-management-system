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
    id: Optional[int] = None
    type: str
    title: Optional[str] = None
    content: Optional[str] = None  # file path or text

class QuizQuestion(BaseModel):
    id: Optional[int] = None
    question: str
    options: List[str]
    correctAnswer: int

class LessonBase(BaseModel):
    title: str
    objectives: Optional[str] = None
    prerequisites: Optional[str] = None
    estimatedDuration: Optional[str] = None
    difficulty: Optional[str] = None
    tags: Optional[List[str]] = []  # changed from str
    contentBlocks: Optional[List[ContentBlock]] = []
    quizQuestions: Optional[List[QuizQuestion]] = []

class LessonCreate(LessonBase):
    module_id: str

class LessonUpdate(BaseModel):
    title: Optional[str] = None
    objectives: Optional[str] = None
    prerequisites: Optional[str] = None
    estimatedDuration: Optional[str] = None
    difficulty: Optional[str] = None
    tags: Optional[List[str]] = None
    contentBlocks: Optional[List[ContentBlock]] = None
    quizQuestions: Optional[List[QuizQuestion]] = None

class LessonResponse(LessonBase):
    id: str
    module_id: str
    created_at: Optional[str]
    updated_at: Optional[str]

    class Config:
        orm_mode = True
