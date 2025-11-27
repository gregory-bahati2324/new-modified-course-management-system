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

class DiscussionSettings(BaseModel):
    enabled: bool
    prompt: Optional[str] = None

class ProgressSettings(BaseModel):
    completion: bool
    timeSpent: bool
    quizScore: bool

class AccessibilitySettings(BaseModel):
    darkMode: bool
    fontSize: str  # 'small' | 'medium' | 'large'
    transcriptEnabled: bool
    transcriptText: Optional[str] = None

class FeedbackSettings(BaseModel):
    ratings: bool
    reviews: bool
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
    created_at: Optional[datetime]
    updated_at: Optional[datetime]

    class Config:
        orm_mode = True