"""
FastAPI Pydantic Schemas for MUST Learning Hub
Generated based on frontend components and forms
"""

from typing import Optional, List, Literal, Annotated
from datetime import datetime, date, time
from pydantic import BaseModel, EmailStr, Field, conint, constr
from enum import Enum


# ============================================================================
# AUTHENTICATION SCHEMAS (Login.tsx, Register.tsx)
# ============================================================================

class UserRole(str, Enum):
    STUDENT = "student"
    INSTRUCTOR = "instructor"
    ADMIN = "admin"


class LoginRequest(BaseModel):
    """Login form data - src/pages/auth/Login.tsx"""
    email: EmailStr
    password: str
    remember_me: bool = False
    role: UserRole = UserRole.STUDENT


class LoginResponse(BaseModel):
    """Login response with tokens"""
    access_token: str
    refresh_token: Optional[str] = None
    token_type: str = "bearer"
    user: "UserProfile"
    role: UserRole


class RegisterRequest(BaseModel):
    """Registration form data - src/pages/auth/Register.tsx"""
    first_name: str = Field(..., min_length=1, max_length=100)
    last_name: str = Field(..., min_length=1, max_length=100)
    email: EmailStr
    password: str = Field(..., min_length=8)
    confirm_password: str
    program: str  # computer-science, engineering, business, etc.
    accept_terms: bool = True
    accept_privacy: bool = True
    newsletter: bool = True


class RegisterResponse(BaseModel):
    """Registration response"""
    message: str
    user_id: str
    email: str
    verification_sent: bool = True


# ============================================================================
# USER PROFILE SCHEMAS
# ============================================================================

class UserProfile(BaseModel):
    """User profile information"""
    id: str
    email: EmailStr
    first_name: str
    last_name: str
    role: UserRole
    program: Optional[str] = None
    avatar: Optional[str] = None
    created_at: datetime
    is_active: bool = True
    is_verified: bool = False


class StudentProfile(UserProfile):
    """Extended student profile - src/pages/student/Profile.tsx"""
    student_id: str
    enrollment_date: Optional[date] = None
    gpa: Optional[float] = None
    total_credits: Optional[int] = None
    enrolled_courses: List[str] = []


class InstructorProfile(UserProfile):
    """Extended instructor profile"""
    instructor_id: str
    department: Optional[str] = None
    courses_teaching: List[str] = []
    bio: Optional[str] = None


# ============================================================================
# COURSE SCHEMAS (CreateCourse.tsx, Courses.tsx, CourseDetail.tsx)
# ============================================================================

class CourseCategory(str, Enum):
    COMPUTER_SCIENCE = "computer-science"
    ENGINEERING = "engineering"
    MATHEMATICS = "mathematics"
    BUSINESS = "business"
    OTHER = "other"


class CourseLevel(str, Enum):
    BEGINNER = "beginner"
    INTERMEDIATE = "intermediate"
    ADVANCED = "advanced"


class CourseStatus(str, Enum):
    DRAFT = "draft"
    PUBLISHED = "published"
    ARCHIVED = "archived"


class CourseCreateRequest(BaseModel):
    """Create course form - src/pages/instructor/CreateCourse.tsx"""
    title: str = Field(..., min_length=1, max_length=200)
    code: str = Field(..., min_length=1, max_length=20)
    description: str
    category: CourseCategory
    level: CourseLevel
    duration: Optional[int] = None  # weeks
    max_students: Optional[int] = None
    prerequisites: Optional[str] = None
    objectives: Optional[str] = None
    tags: List[str] = []
    is_published: bool = False
    allow_self_enrollment: bool = True
    certificate: bool = True


class CourseUpdateRequest(BaseModel):
    """Update course (partial updates allowed)"""
    title: Optional[str] = None
    description: Optional[str] = None
    category: Optional[CourseCategory] = None
    level: Optional[CourseLevel] = None
    duration: Optional[int] = None
    max_students: Optional[int] = None
    prerequisites: Optional[str] = None
    objectives: Optional[str] = None
    tags: Optional[List[str]] = None
    is_published: Optional[bool] = None
    allow_self_enrollment: Optional[bool] = None
    certificate: Optional[bool] = None


class CourseResponse(BaseModel):
    """Course details response"""
    id: str
    title: str
    code: str
    description: str
    category: CourseCategory
    level: CourseLevel
    duration: Optional[int] = None
    max_students: Optional[int] = None
    enrolled_students: int = 0
    prerequisites: Optional[str] = None
    objectives: Optional[str] = None
    tags: List[str] = []
    instructor: "InstructorBasicInfo"
    status: CourseStatus
    is_published: bool
    allow_self_enrollment: bool
    certificate: bool
    created_at: datetime
    updated_at: datetime
    progress: Optional[float] = None  # for student view
    thumbnail: Optional[str] = None


class CourseListItem(BaseModel):
    """Simplified course for listings"""
    id: str
    title: str
    code: str
    description: str
    category: str
    level: str
    instructor_name: str
    enrolled_students: int
    thumbnail: Optional[str] = None
    rating: Optional[float] = None


class InstructorBasicInfo(BaseModel):
    """Basic instructor information"""
    id: str
    name: str
    email: EmailStr
    avatar: Optional[str] = None


# ============================================================================
# MODULE SCHEMAS (AddModule.tsx, ModuleView.tsx)
# ============================================================================

class ModuleStatus(str, Enum):
    DRAFT = "draft"
    ACTIVE = "active"
    COMPLETED = "completed"
    PUBLISHED = "published"


class LessonType(str, Enum):
    VIDEO = "video"
    READING = "reading"
    QUIZ = "quiz"
    ASSIGNMENT = "assignment"
    LAB = "lab"


class LessonCreate(BaseModel):
    """Individual lesson within a module"""
    title: str
    description: Optional[str] = None
    type: LessonType
    duration: Optional[str] = None  # e.g., "30 min"
    order: int = 0
    content_url: Optional[str] = None


class LessonResponse(LessonCreate):
    """Lesson with additional fields"""
    id: str
    completed: bool = False


class ModuleCreateRequest(BaseModel):
    """Create module form - src/pages/instructor/AddModule.tsx"""
    title: str = Field(..., min_length=1, max_length=200)
    description: str
    order: int
    duration: Optional[str] = None  # e.g., "2 weeks"
    objectives: Optional[str] = None
    status: ModuleStatus = ModuleStatus.DRAFT
    lessons: List[LessonCreate] = []


class ModuleUpdateRequest(BaseModel):
    """Update module (partial)"""
    title: Optional[str] = None
    description: Optional[str] = None
    order: Optional[int] = None
    duration: Optional[str] = None
    objectives: Optional[str] = None
    status: Optional[ModuleStatus] = None
    lessons: Optional[List[LessonCreate]] = None


class ModuleResponse(BaseModel):
    """Module details - src/components/ModuleView.tsx"""
    id: int
    title: str
    description: str
    duration: str
    order: int
    objectives: str
    instructor: InstructorBasicInfo
    created_at: datetime
    status: ModuleStatus
    lessons: List[LessonResponse] = []
    completed: bool = False
    locked: bool = False


# ============================================================================
# ASSIGNMENT SCHEMAS (CreateAssignment.tsx, GradeAssignment.tsx, student/Assignments.tsx)
# ============================================================================

class AssignmentType(str, Enum):
    ASSIGNMENT = "assignment"
    QUIZ = "quiz"
    EXAM = "exam"
    PROJECT = "project"
    DISCUSSION = "discussion"


class AssignmentStatus(str, Enum):
    DRAFT = "draft"
    PUBLISHED = "published"
    CLOSED = "closed"


class SubmissionStatus(str, Enum):
    PENDING = "pending"
    IN_PROGRESS = "in-progress"
    SUBMITTED = "submitted"
    GRADED = "graded"
    URGENT = "urgent"


class AssignmentCreateRequest(BaseModel):
    """Create assignment - src/pages/instructor/CreateAssignment.tsx"""
    title: str = Field(..., min_length=1, max_length=200)
    type: AssignmentType
    description: str
    instructions: str
    due_date: date
    due_time: Optional[time] = None
    points: int = 100
    attempts: str = "1"  # "1", "2", "3", "unlimited"
    time_limit: Optional[int] = None  # minutes
    module_id: Optional[str] = None
    course_id: str
    status: AssignmentStatus = AssignmentStatus.DRAFT


class AssignmentUpdateRequest(BaseModel):
    """Update assignment (partial)"""
    title: Optional[str] = None
    type: Optional[AssignmentType] = None
    description: Optional[str] = None
    instructions: Optional[str] = None
    due_date: Optional[date] = None
    due_time: Optional[time] = None
    points: Optional[int] = None
    attempts: Optional[str] = None
    time_limit: Optional[int] = None
    module_id: Optional[str] = None
    status: Optional[AssignmentStatus] = None


class AssignmentResponse(BaseModel):
    """Assignment details"""
    id: str
    title: str
    type: AssignmentType
    description: str
    instructions: str
    due_date: date
    due_time: Optional[time] = None
    points: int
    attempts: str
    time_limit: Optional[int] = None
    module_id: Optional[str] = None
    course_id: str
    course_name: str
    status: AssignmentStatus
    created_at: datetime
    
    # Student-specific fields (for student view)
    days_left: Optional[int] = None
    submission_status: Optional[SubmissionStatus] = None
    submitted: bool = False
    submitted_date: Optional[datetime] = None
    grade: Optional[float] = None
    feedback: Optional[str] = None


class SubmissionFile(BaseModel):
    """File attachment"""
    name: str
    size: str  # e.g., "2.4 MB"
    type: str  # e.g., "pdf", "docx"
    url: Optional[str] = None


class AssignmentSubmitRequest(BaseModel):
    """Student submits assignment"""
    assignment_id: str
    submission_text: Optional[str] = None
    files: List[SubmissionFile] = []
    attempt_number: int = 1


class RubricGrade(BaseModel):
    """Individual rubric criterion grade"""
    criterion_id: str
    criterion_name: str
    max_points: float
    earned_points: float


class AssignmentGradeRequest(BaseModel):
    """Instructor grades assignment - src/pages/instructor/GradeAssignment.tsx"""
    submission_id: str
    score: float
    feedback: str
    rubric_grades: Optional[List[RubricGrade]] = None


class SubmissionResponse(BaseModel):
    """Assignment submission details"""
    id: str
    assignment_id: str
    student: "StudentBasicInfo"
    submitted_at: datetime
    status: SubmissionStatus
    attempts: int
    files: List[SubmissionFile] = []
    submission_text: Optional[str] = None
    grade: Optional[float] = None
    feedback: Optional[str] = None
    rubric_grades: Optional[List[RubricGrade]] = None


class StudentBasicInfo(BaseModel):
    """Basic student info"""
    id: str
    student_id: str
    name: str
    email: EmailStr
    avatar: Optional[str] = None


# ============================================================================
# MESSAGING SCHEMAS (MessageStudents.tsx)
# ============================================================================

class MessageRecipientType(str, Enum):
    INDIVIDUAL = "individual"
    COURSE = "course"
    ALL = "all"


class MessageCreateRequest(BaseModel):
    """Send message to students - src/pages/instructor/MessageStudents.tsx"""
    subject: str = Field(..., min_length=1, max_length=200)
    message: str
    recipient_type: MessageRecipientType
    recipient_ids: List[str] = []  # student IDs or course IDs
    course_id: Optional[str] = None
    attachments: Optional[List[str]] = []


class MessageResponse(BaseModel):
    """Message details"""
    id: str
    subject: str
    message: str
    sender: InstructorBasicInfo
    recipients_count: int
    sent_at: datetime
    read_count: int = 0


# ============================================================================
# SCHEDULE SCHEMAS (instructor/Schedule.tsx, ScheduleSession.tsx)
# ============================================================================

class SessionType(str, Enum):
    LECTURE = "lecture"
    LAB = "lab"
    PRESENTATION = "presentation"
    WORKSHOP = "workshop"
    DISCUSSION = "discussion"
    EXAM = "exam"


class SessionStatus(str, Enum):
    SCHEDULED = "scheduled"
    ONLINE = "online"
    CANCELLED = "cancelled"
    COMPLETED = "completed"


class SessionCreateRequest(BaseModel):
    """Schedule a session - src/pages/instructor/ScheduleSession.tsx"""
    title: str =  Field(..., min_length=1, max_length=200)
    course_id: str
    date: date
    start_time: time
    end_time: time
    location: str
    type: SessionType
    description: Optional[str] = None
    online_meeting_url: Optional[str] = None


class SessionUpdateRequest(BaseModel):
    """Update session (partial)"""
    title: Optional[str] = None
    date: date 
    start_time: Optional[time] = None
    end_time: Optional[time] = None
    location: Optional[str] = None
    type: Optional[SessionType] = None
    description: Optional[str] = None
    online_meeting_url: Optional[str] = None
    status: Optional[SessionStatus] = None


class SessionResponse(BaseModel):
    """Session details - src/pages/instructor/Schedule.tsx"""
    id: str
    title: str
    course_id: str
    course_code: str
    course_title: str
    date: date
    start_time: time
    end_time: time
    time: str  # formatted "10:00 AM - 12:00 PM"
    location: str
    type: SessionType
    description: Optional[str] = None
    students_count: int
    status: SessionStatus
    online_meeting_url: Optional[str] = None
    created_at: datetime


# ============================================================================
# GRADES SCHEMAS (student/Grades.tsx)
# ============================================================================

class AssignmentGrade(BaseModel):
    """Individual assignment grade"""
    name: str
    grade: float  # percentage
    weight: float  # percentage of total grade
    max_points: float
    earned_points: float


class CourseGrade(BaseModel):
    """Student's grade in a course - src/pages/student/Grades.tsx"""
    course_id: str
    course_name: str
    course_code: str
    instructor: str
    grade: str  # letter grade: A, A-, B+, etc.
    percentage: float
    credits: int
    assignments: List[AssignmentGrade]


class GradesOverview(BaseModel):
    """Overall student grades"""
    gpa: float
    total_credits: int
    average_percentage: float
    courses: List[CourseGrade]


# ============================================================================
# LEARNING / COURSE CONTENT SCHEMAS (student/CourseLearn.tsx)
# ============================================================================

class LessonProgress(BaseModel):
    """Student's progress on a lesson"""
    lesson_id: str
    completed: bool
    completed_at: Optional[datetime] = None
    time_spent: Optional[int] = None  # minutes


class ModuleProgress(BaseModel):
    """Student's progress on a module"""
    module_id: int
    completed: bool
    locked: bool
    lessons_progress: List[LessonProgress]


class CourseLearnResponse(BaseModel):
    """Course learning view - src/pages/student/CourseLearn.tsx"""
    course_id: str
    title: str
    instructor: str
    progress: float  # percentage
    total_modules: int
    completed_modules: int
    modules: List[ModuleResponse]
    current_module_id: Optional[int] = None
    current_lesson_id: Optional[str] = None


class MarkLessonCompleteRequest(BaseModel):
    """Mark a lesson as complete"""
    course_id: str
    module_id: int
    lesson_id: str


# ============================================================================
# ANALYTICS SCHEMAS (instructor/Analytics.tsx)
# ============================================================================

class CourseAnalytics(BaseModel):
    """Course analytics data"""
    course_id: str
    total_students: int
    active_students: int
    completion_rate: float
    average_grade: float
    assignments_submitted: int
    assignments_pending: int
    engagement_score: float


class StudentPerformance(BaseModel):
    """Individual student performance"""
    student_id: str
    student_name: str
    email: EmailStr
    overall_grade: float
    assignments_completed: int
    assignments_pending: int
    last_active: datetime
    at_risk: bool = False


# ============================================================================
# ENROLLMENT SCHEMAS
# ============================================================================

class EnrollmentRequest(BaseModel):
    """Student enrolls in a course"""
    course_id: str
    enrollment_key: Optional[str] = None


class EnrollmentResponse(BaseModel):
    """Enrollment confirmation"""
    enrollment_id: str
    course_id: str
    student_id: str
    enrolled_at: datetime
    status: str  # active, dropped, completed


class UnenrollRequest(BaseModel):
    """Student drops a course"""
    course_id: str
    reason: Optional[str] = None


# ============================================================================
# CERTIFICATE SCHEMAS (Certificates.tsx)
# ============================================================================

class CertificateResponse(BaseModel):
    """Certificate details"""
    id: str
    course_id: str
    course_name: str
    student_id: str
    student_name: str
    issue_date: date
    certificate_url: str
    verification_code: str
    grade: str
    instructor_name: str


# ============================================================================
# FORUM/DISCUSSION SCHEMAS (Forums.tsx)
# ============================================================================

class ForumPostCreate(BaseModel):
    """Create a forum post"""
    course_id: str
    title: str = Field(..., min_length=1, max_length=200)
    content: str
    category: Optional[str] = None


class ForumPostResponse(BaseModel):
    """Forum post details"""
    id: str
    course_id: str
    title: str
    content: str
    author: UserProfile
    created_at: datetime
    updated_at: datetime
    replies_count: int
    likes_count: int
    is_pinned: bool = False
    is_locked: bool = False


class ForumReplyCreate(BaseModel):
    """Reply to a forum post"""
    post_id: str
    content: str


class ForumReplyResponse(BaseModel):
    """Forum reply details"""
    id: str
    post_id: str
    content: str
    author: UserProfile
    created_at: datetime
    likes_count: int


# ============================================================================
# ADMIN SCHEMAS (admin/Dashboard.tsx)
# ============================================================================

class AdminStats(BaseModel):
    """Admin dashboard statistics"""
    total_users: int
    total_students: int
    total_instructors: int
    total_courses: int
    active_courses: int
    total_enrollments: int
    system_health: str  # "good", "warning", "critical"


class UserManagementResponse(BaseModel):
    """User management data"""
    id: str
    email: EmailStr
    first_name: str
    last_name: str
    role: UserRole
    is_active: bool
    is_verified: bool
    created_at: datetime
    last_login: Optional[datetime] = None


# ============================================================================
# PAGINATION & COMMON SCHEMAS
# ============================================================================

class PaginationParams(BaseModel):
    """Standard pagination parameters"""
    page: Annotated[int, Field(ge=1)] = 1
    page_size: Annotated[int, Field(ge=1, le=100)] = 20
    sort_by: Optional[str] = None
    sort_order: Literal["asc", "desc"] = "desc"


class PaginatedResponse(BaseModel):
    """Generic paginated response"""
    items: List[dict]  # Should be replaced with specific type
    total: int
    page: int
    page_size: int
    total_pages: int


class SuccessResponse(BaseModel):
    """Generic success response"""
    success: bool = True
    message: str
    data: Optional[dict] = None


class ErrorResponse(BaseModel):
    """Generic error response"""
    success: bool = False
    error: str
    detail: Optional[str] = None
    code: Optional[str] = None


# Update forward references
LoginResponse.model_rebuild()
CourseResponse.model_rebuild()
SubmissionResponse.model_rebuild()
