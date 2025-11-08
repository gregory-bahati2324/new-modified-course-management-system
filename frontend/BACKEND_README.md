# MUST Learning Hub - Backend API Documentation

This folder contains the complete FastAPI backend schemas and endpoint definitions generated from your frontend application.

## 📁 Files Overview

### 1. `backend_schemas.py`
Contains all Pydantic models for request/response validation, organized by domain:

- **Authentication** (Login, Register)
- **User Profiles** (Student, Instructor, Admin)
- **Courses** (Create, Update, List)
- **Modules** (Course modules and lessons)
- **Assignments** (Create, Submit, Grade)
- **Messaging** (Instructor to student communication)
- **Schedule** (Class sessions and meetings)
- **Grades** (Student grades and GPA)
- **Learning Content** (Course progress tracking)
- **Enrollment** (Course enrollment management)
- **Certificates** (Course completion certificates)
- **Forums** (Discussion boards)
- **Analytics** (Course and student analytics)
- **Admin** (System administration)

### 2. `backend_endpoints_example.py`
Complete FastAPI application with all endpoint definitions:

- 60+ endpoints covering all frontend features
- RESTful API design
- Proper HTTP methods and status codes
- Request/response models from `backend_schemas.py`
- Authentication dependencies
- Role-based access control

### 3. `backend_auth_utilities.py`
Authentication and utility functions:

- **Password Hashing**: bcrypt-based secure password storage
- **JWT Tokens**: Access and refresh token generation
- **Authentication Dependencies**: `get_current_user`, role checkers
- **Role-Based Access Control**: `RoleChecker` class for permissions
- **Validation Utilities**: Email, file, course code validation
- **Grade Calculations**: Letter grades, GPA, weighted grades
- **Pagination Helpers**: Paginate query results
- **Error Handling**: Custom exception classes

## 🚀 Getting Started

### Prerequisites

```bash
pip install fastapi
pip install uvicorn[standard]
pip install pydantic[email]
pip install python-jose[cryptography]
pip install passlib[bcrypt]
pip install python-multipart
```

### Run the API

```bash
# Development server with auto-reload
uvicorn backend_endpoints_example:app --reload --host 0.0.0.0 --port 8000

# Access interactive documentation
# Swagger UI: http://localhost:8000/docs
# ReDoc: http://localhost:8000/redoc
```

## 📋 Frontend-to-Backend Mapping

### Authentication Pages

#### `src/pages/auth/Login.tsx`
- **POST** `/api/auth/login` - Login with email/password
- **Request**: `LoginRequest`
- **Response**: `LoginResponse`

#### `src/pages/auth/Register.tsx`
- **POST** `/api/auth/register` - User registration
- **Request**: `RegisterRequest`
- **Response**: `RegisterResponse`

---

### Instructor Pages

#### `src/pages/instructor/CreateCourse.tsx`
- **POST** `/api/courses` - Create new course
- **Request**: `CourseCreateRequest`
- **Response**: `CourseResponse`

#### `src/pages/instructor/AddModule.tsx`
- **POST** `/api/courses/{course_id}/modules` - Add module
- **Request**: `ModuleCreateRequest`
- **Response**: `ModuleResponse`

#### `src/pages/instructor/CreateAssignment.tsx`
- **POST** `/api/courses/{course_id}/assignments` - Create assignment
- **Request**: `AssignmentCreateRequest`
- **Response**: `AssignmentResponse`

#### `src/pages/instructor/GradeAssignment.tsx`
- **POST** `/api/submissions/{submission_id}/grade` - Grade submission
- **Request**: `AssignmentGradeRequest`
- **Response**: `SubmissionResponse`

#### `src/pages/instructor/MessageStudents.tsx`
- **POST** `/api/messages` - Send message to students
- **Request**: `MessageCreateRequest`
- **Response**: `MessageResponse`

#### `src/pages/instructor/Schedule.tsx`
- **GET** `/api/instructor/schedule` - Get instructor schedule
- **Response**: `List[SessionResponse]`

#### `src/pages/instructor/ScheduleSession.tsx`
- **POST** `/api/sessions` - Schedule new session
- **Request**: `SessionCreateRequest`
- **Response**: `SessionResponse`

#### `src/pages/instructor/Analytics.tsx`
- **GET** `/api/instructor/analytics/{course_id}` - Course analytics
- **Response**: `CourseAnalytics`

---

### Student Pages

#### `src/pages/student/Courses.tsx`
- **GET** `/api/student/courses` - Get enrolled courses
- **Response**: `List[CourseResponse]`

#### `src/pages/student/CourseLearn.tsx`
- **GET** `/api/courses/{course_id}/learn` - Course learning content
- **Response**: `CourseLearnResponse`
- **POST** `/api/courses/{course_id}/progress` - Mark lesson complete
- **Request**: `MarkLessonCompleteRequest`

#### `src/pages/student/Assignments.tsx`
- **GET** `/api/student/assignments` - Get all assignments
- **Response**: `List[AssignmentResponse]`
- **POST** `/api/assignments/{assignment_id}/submit` - Submit assignment
- **Request**: `AssignmentSubmitRequest`

#### `src/pages/student/Grades.tsx`
- **GET** `/api/student/grades` - Get all grades
- **Response**: `GradesOverview`

#### `src/pages/student/Schedule.tsx`
- **GET** `/api/student/schedule` - Get student schedule
- **Response**: `List[SessionResponse]`

#### `src/pages/student/Profile.tsx`
- **GET** `/api/users/me` - Get current user profile
- **Response**: `StudentProfile`

---

### Common Components

#### `src/components/ModuleView.tsx`
- **GET** `/api/courses/{course_id}/modules` - List modules
- **Response**: `List[ModuleResponse]`
- **PUT** `/api/modules/{module_id}` - Update module
- **Request**: `ModuleUpdateRequest`

#### `src/components/CourseSearchModule.tsx`
- **GET** `/api/search/courses?query={query}` - Search courses
- **Response**: `List[CourseListItem]`

---

### General Pages

#### `src/pages/Courses.tsx`
- **GET** `/api/courses` - List all courses
- **Response**: `List[CourseListItem]`

#### `src/pages/CourseDetail.tsx`
- **GET** `/api/courses/{course_id}` - Get course details
- **Response**: `CourseResponse`
- **POST** `/api/courses/{course_id}/enroll` - Enroll in course
- **Request**: `EnrollmentRequest`

#### `src/pages/Certificates.tsx`
- **GET** `/api/student/certificates` - Get certificates
- **Response**: `List[CertificateResponse]`

#### `src/pages/Forums.tsx`
- **GET** `/api/forums/posts` - List forum posts
- **POST** `/api/forums/posts` - Create post
- **Request**: `ForumPostCreate`

---

## 🔐 Authentication & Authorization

### JWT Token Authentication

All protected endpoints require a valid JWT token in the Authorization header:

```bash
curl -H "Authorization: Bearer <your_jwt_token>" \
     http://localhost:8000/api/protected-endpoint
```

### User Roles

- **STUDENT**: Can enroll in courses, submit assignments, view grades
- **INSTRUCTOR**: Can create courses, grade assignments, message students
- **ADMIN**: Full system access

### Protected Endpoint Example

```python
from fastapi import Depends
from backend_auth_utilities import get_current_user, require_instructor

# Require any authenticated user
@app.get("/api/profile")
async def get_profile(current_user = Depends(get_current_user)):
    return current_user

# Require instructor role
@app.post("/api/courses")
async def create_course(
    course_data: CourseCreateRequest,
    current_user = Depends(require_instructor)
):
    # Only instructors can create courses
    pass
```

## 📊 Data Flow Examples

### Student Submits Assignment

1. **Frontend**: Student clicks "Submit Assignment" in `src/pages/student/Assignments.tsx`
2. **API Call**: `POST /api/assignments/{assignment_id}/submit`
3. **Request Body**: `AssignmentSubmitRequest` with files and text
4. **Backend**: Validates student enrollment, saves submission
5. **Response**: `SubmissionResponse` with submission details

### Instructor Grades Submission

1. **Frontend**: Instructor enters grade in `src/pages/instructor/GradeAssignment.tsx`
2. **API Call**: `POST /api/submissions/{submission_id}/grade`
3. **Request Body**: `AssignmentGradeRequest` with score and feedback
4. **Backend**: Validates instructor permission, saves grade, sends notification
5. **Response**: `SubmissionResponse` with updated grade

### Student Views Course Content

1. **Frontend**: Student opens course in `src/pages/student/CourseLearn.tsx`
2. **API Call**: `GET /api/courses/{course_id}/learn`
3. **Backend**: Returns modules, lessons, and progress
4. **Response**: `CourseLearnResponse` with complete course structure
5. **Frontend**: Renders modules with progress indicators

## 🔄 Database Integration

This schema is designed to work with any database. Recommended ORMs:

### SQLAlchemy (Recommended)
```python
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

engine = create_engine("postgresql://user:pass@localhost/mustlms")
SessionLocal = sessionmaker(bind=engine)
Base = declarative_base()
```

### Tortoise ORM
```python
from tortoise import Tortoise

await Tortoise.init(
    db_url='postgres://user:pass@localhost/mustlms',
    modules={'models': ['app.models']}
)
```

## 🧪 Testing

### Example Test with pytest

```python
from fastapi.testclient import TestClient
from backend_endpoints_example import app

client = TestClient(app)

def test_create_course():
    # Login first
    login_response = client.post("/api/auth/login", json={
        "email": "instructor@must.ac.tz",
        "password": "password123",
        "role": "instructor"
    })
    token = login_response.json()["access_token"]
    
    # Create course
    response = client.post(
        "/api/courses",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "title": "Advanced Database Systems",
            "code": "CS 401",
            "description": "Database course",
            "category": "computer-science",
            "level": "advanced"
        }
    )
    
    assert response.status_code == 201
    assert response.json()["title"] == "Advanced Database Systems"
```

## 📦 Deployment

### Environment Variables

Create a `.env` file:

```env
# Security
SECRET_KEY=your-super-secret-key-change-this
ALGORITHM=HS256

# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/mustlms

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password

# Storage
STORAGE_TYPE=s3
AWS_ACCESS_KEY_ID=your-key
AWS_SECRET_ACCESS_KEY=your-secret
S3_BUCKET_NAME=must-lms-files

# Frontend URL (for CORS)
FRONTEND_URL=https://your-frontend-domain.com
```

### Production Deployment

#### With Docker

```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["uvicorn", "backend_endpoints_example:app", "--host", "0.0.0.0", "--port", "8000"]
```

#### With Gunicorn

```bash
gunicorn backend_endpoints_example:app \
    --workers 4 \
    --worker-class uvicorn.workers.UvicornWorker \
    --bind 0.0.0.0:8000
```

## 🔧 Customization

### Adding New Endpoints

1. Define Pydantic models in `backend_schemas.py`
2. Add endpoint in `backend_endpoints_example.py`
3. Add authentication/authorization as needed

Example:

```python
# In backend_schemas.py
class NotificationCreate(BaseModel):
    title: str
    message: str
    user_ids: List[str]

# In backend_endpoints_example.py
@app.post("/api/notifications")
async def send_notification(
    notification: NotificationCreate,
    current_user = Depends(require_admin)
):
    # Send notification logic
    return {"success": True}
```

## 📚 Additional Resources

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Pydantic Documentation](https://docs.pydantic.dev/)
- [JWT Best Practices](https://tools.ietf.org/html/rfc7519)
- [RESTful API Design](https://restfulapi.net/)

## 🐛 Common Issues

### Issue: 401 Unauthorized
- **Cause**: Invalid or expired JWT token
- **Solution**: Login again to get fresh token

### Issue: 403 Forbidden
- **Cause**: User doesn't have required role
- **Solution**: Check user role matches endpoint requirements

### Issue: 422 Validation Error
- **Cause**: Request body doesn't match Pydantic schema
- **Solution**: Check request matches schema definition

## 💡 Best Practices

1. **Always validate input**: Pydantic models handle this automatically
2. **Use type hints**: Enables better IDE support and validation
3. **Handle errors gracefully**: Return appropriate HTTP status codes
4. **Log important events**: Use Python's logging module
5. **Test thoroughly**: Write tests for all critical endpoints
6. **Document changes**: Update this README when adding features

## 📞 Support

For questions or issues:
- Review the inline comments in code files
- Check FastAPI's excellent documentation
- Refer to frontend components for expected data structures

---

**Generated from MUST Learning Hub Frontend**  
Frontend Framework: React + TypeScript  
Backend Framework: FastAPI + Pydantic  
Last Updated: 2024
