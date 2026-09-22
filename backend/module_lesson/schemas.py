# schemas/module.py
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

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

class ModuleReorderItem(BaseModel):
    module_id: str
    order: int

class ModuleReorderRequest(BaseModel):
    modules: List[ModuleReorderItem]

class ModuleResponse(ModuleBase):
    id: str

    class Config:
        orm_mode = True


# ----------------------------
# LESSON SCHEMAS
# ----------------------------

class ContentBlock(BaseModel):
    type: str
    title: Optional[str] = None
    content: Optional[str] = None

class QuizQuestion(BaseModel):
    id: Optional[int] = None
    question: str
    options: List[str]
    correctAnswer: int

# Defaults below match the Lesson model's column default ({}), so a lesson created without
# these settings (or created before they existed) still serializes instead of raising a
# ResponseValidationError / 500 when it's read back.
class DiscussionSettings(BaseModel):
    enabled: bool = False
    prompt: Optional[str] = None

class ProgressSettings(BaseModel):
    completion: bool = False
    timeSpent: bool = False
    quizScore: bool = False

class AccessibilitySettings(BaseModel):
    darkMode: bool = False
    fontSize: str = "medium"  # 'small' | 'medium' | 'large'
    transcriptEnabled: bool = False
    transcriptText: Optional[str] = None

class FeedbackSettings(BaseModel):
    ratings: bool = False
    reviews: bool = False
    customQuestions: List[str] = []

# -------------------------
# Base Lesson Schema
# -------------------------

class LessonBase(BaseModel):
    title: str
    objectives: Optional[str] = None
    prerequisites: Optional[str] = None
    estimatedDuration: Optional[str] = None
    difficulty: Optional[str] = None
    tags: Optional[List[str]] = []
    contentBlocks: Optional[List[ContentBlock]] = []
    quizQuestions: Optional[List[QuizQuestion]] = []

    # New advanced fields
    discussion: Optional[DiscussionSettings] = None
    progressSettings: Optional[ProgressSettings] = None
    accessibility: Optional[AccessibilitySettings] = None
    feedbackSettings: Optional[FeedbackSettings] = None
    order: Optional[int] = 1

# -------------------------
# Lesson Create & Update
# -------------------------

class LessonCreate(LessonBase):
    pass  # required to link lesson to module

class LessonUpdate(BaseModel):
    title: Optional[str] = None
    objectives: Optional[str] = None
    prerequisites: Optional[str] = None
    estimatedDuration: Optional[str] = None
    difficulty: Optional[str] = None
    tags: Optional[List[str]] = None
    contentBlocks: Optional[List[ContentBlock]] = None
    quizQuestions: Optional[List[QuizQuestion]] = None
    discussion: Optional[DiscussionSettings] = None
    progressSettings: Optional[ProgressSettings] = None
    accessibility: Optional[AccessibilitySettings] = None
    feedbackSettings: Optional[FeedbackSettings] = None
    order: Optional[int] = None
    
class LessonReorderItem(BaseModel):
    lesson_id: str
    order: int

class LessonReorderRequest(BaseModel):
    lessons: List[LessonReorderItem]    

# -------------------------
# Lesson Response
# -------------------------

from datetime import datetime

class LessonResponse(LessonBase):
    id: str
    module_id: str
    version: int
    created_at: Optional[datetime]
    updated_at: Optional[datetime]

    class Config:
        orm_mode = True