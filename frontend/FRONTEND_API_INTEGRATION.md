# Frontend API Integration Guide

## Overview

The frontend is now fully prepared for backend integration with a FastAPI backend. All components use centralized API services that can toggle between **mock data** (for development/demo) and **real backend API calls**.

## Quick Start

### Environment Setup

1. Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

2. Configure environment variables in `.env`:
```env
# API Base URL - Point to your FastAPI backend
VITE_API_BASE_URL=http://localhost:8000

# Toggle between mock data and real API
# Set to 'true' for mock data, 'false' for real backend
VITE_USE_MOCK_DATA=true
```

### Switching Between Mock and Real Data

**Using Mock Data (Development/Demo):**
```env
VITE_USE_MOCK_DATA=true
```

**Using Real Backend:**
```env
VITE_USE_MOCK_DATA=false
VITE_API_BASE_URL=http://localhost:8000  # Your FastAPI backend URL
```

## Architecture

### Service Layer Structure

```
src/
├── config/
│   └── api.config.ts          # API configuration & endpoints
├── services/
│   ├── api.ts                 # Base axios client with JWT interceptors
│   ├── authService.ts         # Authentication (login, register, logout)
│   ├── courseService.ts       # Course management
│   ├── assignmentService.ts   # Assignment operations
│   ├── gradeService.ts        # Grade management
│   ├── scheduleService.ts     # Schedule/calendar events
│   └── index.ts               # Centralized exports
```

## Authentication Flow

### JWT Token Management

The authentication system uses JWT tokens with automatic refresh:

1. **Login:** User submits credentials → Backend returns `access_token` & `refresh_token`
2. **Storage:** Tokens stored in `localStorage`
3. **Auto-Attach:** Every API request automatically includes: `Authorization: Bearer <token>`
4. **Auto-Refresh:** When token expires (401 error), automatically refreshes using `refresh_token`
5. **Auto-Logout:** If refresh fails, user is logged out and redirected to login

### Using Auth Service

```typescript
import { authService } from '@/services/authService';

// Login
const response = await authService.login({
  email: 'user@example.com',
  password: 'password123',
  role: 'student' // or 'instructor', 'admin'
});

// Access user data
console.log(response.user);
console.log(response.access_token);

// Get current user
const currentUser = await authService.getCurrentUser();

// Logout
await authService.logout();

// Check if authenticated
const isLoggedIn = authService.isAuthenticated();
```

## Using API Services

### Course Service

```typescript
import { courseService } from '@/services/courseService';

// Get all courses
const { courses, total } = await courseService.getCourses({
  category: 'Computer Science',
  level: 'Advanced',
  search: 'web development',
  page: 1,
  page_size: 20
});

// Get course details
const course = await courseService.getCourseById('course-id');

// Create course (instructor only)
const newCourse = await courseService.createCourse({
  code: 'CS 401',
  title: 'Advanced Web Development',
  description: 'Learn modern web dev',
  category: 'Computer Science',
  level: 'Advanced',
  duration: '12 weeks'
});

// Enroll in course (student only)
await courseService.enrollCourse('course-id');
```

### Assignment Service

```typescript
import { assignmentService } from '@/services/assignmentService';

// Get all assignments
const assignments = await assignmentService.getAssignments({
  course_id: 'course-id',
  status: 'pending'
});

// Create assignment (instructor only)
const assignment = await assignmentService.createAssignment({
  course_id: 'course-id',
  title: 'React Component Design',
  description: 'Build a component library',
  due_date: '2025-12-31T23:59:59Z',
  total_points: 100
});

// Submit assignment (student only)
const submission = await assignmentService.submitAssignment('assignment-id', {
  submission_text: 'My submission...',
  file_urls: ['url1', 'url2']
});

// Grade assignment (instructor only)
await assignmentService.gradeAssignment('assignment-id', 'submission-id', {
  score: 95,
  feedback: 'Excellent work!'
});
```

### Grade Service

```typescript
import { gradeService } from '@/services/gradeService';

// Get student grades
const grades = await gradeService.getStudentGrades();

// Get course grades
const courseGrade = await gradeService.getCourseGrades('course-id');
console.log(courseGrade.overall_percentage); // e.g., 92.5
console.log(courseGrade.letter_grade);       // e.g., "A"
```

### Schedule Service

```typescript
import { scheduleService } from '@/services/scheduleService';

// Get schedule events
const events = await scheduleService.getSchedule({
  course_id: 'course-id',
  start_date: '2025-01-01',
  end_date: '2025-12-31'
});

// Get upcoming events
const upcoming = await scheduleService.getUpcomingEvents(5);

// Create schedule event (instructor only)
const event = await scheduleService.createScheduleEvent({
  course_id: 'course-id',
  title: 'React Hooks Lecture',
  event_type: 'lecture',
  start_time: '2025-11-01T10:00:00Z',
  end_time: '2025-11-01T12:00:00Z',
  is_online: true,
  meeting_url: 'https://meet.google.com/abc-defg'
});
```

## API Endpoints Reference

All endpoints are defined in `src/config/api.config.ts`:

### Authentication
- `POST /api/auth/login` - Login
- `POST /api/auth/register` - Register
- `POST /api/auth/logout` - Logout
- `POST /api/auth/refresh` - Refresh token
- `GET /api/auth/me` - Get current user

### Courses
- `GET /api/courses` - List courses
- `GET /api/courses/{id}` - Get course details
- `POST /api/courses` - Create course (instructor)
- `PUT /api/courses/{id}` - Update course (instructor)
- `DELETE /api/courses/{id}` - Delete course (instructor)
- `POST /api/courses/{id}/enroll` - Enroll in course (student)
- `GET /api/courses/{id}/students` - Get enrolled students (instructor)

### Assignments
- `GET /api/assignments` - List assignments
- `GET /api/assignments/{id}` - Get assignment
- `POST /api/assignments` - Create assignment (instructor)
- `POST /api/assignments/{id}/submit` - Submit assignment (student)
- `GET /api/assignments/{id}/submissions` - Get submissions (instructor)
- `POST /api/assignments/{id}/submissions/{submissionId}/grade` - Grade submission (instructor)

### Grades
- `GET /api/grades/me` - Get student grades
- `GET /api/grades/courses/{courseId}` - Get course grades
- `GET /api/grades` - Get all grades (admin/instructor)

### Schedule
- `GET /api/schedule` - List events
- `POST /api/schedule` - Create event (instructor)
- `PUT /api/schedule/{id}` - Update event (instructor)
- `DELETE /api/schedule/{id}` - Delete event (instructor)
- `GET /api/schedule/upcoming` - Get upcoming events

## Error Handling

All services include comprehensive error handling:

```typescript
import { handleApiError } from '@/services/api';

try {
  const courses = await courseService.getCourses();
} catch (error) {
  const errorMessage = handleApiError(error);
  console.error(errorMessage);
  // Display error to user via toast
}
```

## Role-Based Access Control

The frontend implements client-side role checking that mirrors the backend:

```typescript
// User roles stored after login
const userRole = localStorage.getItem('user_role'); // 'student' | 'instructor' | 'admin'

// Check role before showing features
if (userRole === 'instructor') {
  // Show instructor-only features
}

if (userRole === 'admin') {
  // Show admin-only features
}
```

**Important:** Client-side checks are for UX only. Real authorization happens on the backend.

## Mock Data vs Real API

### Current State
- ✅ All services have mock data implementations
- ✅ All services have real API call implementations
- ✅ Easy toggle between mock and real via environment variable
- ✅ Mock data structures match backend schemas exactly

### Benefits
- **Development:** Work on frontend without backend running
- **Testing:** Predictable data for testing UI
- **Demos:** Show features without backend dependency
- **Smooth Transition:** Switch to real backend instantly by changing one env variable

## Migration Checklist

When your FastAPI backend is ready:

1. ✅ Ensure FastAPI backend is running on `http://localhost:8000`
2. ✅ Update `.env`: Set `VITE_USE_MOCK_DATA=false`
3. ✅ Test authentication flow (login/logout)
4. ✅ Test each feature module (courses, assignments, etc.)
5. ✅ Update error messages if needed
6. ✅ Configure CORS on backend to allow frontend origin

## Backend Integration Notes

### CORS Configuration

Your FastAPI backend needs CORS configured:

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Vite dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Expected Response Formats

All API responses should match the TypeScript interfaces defined in the service files. See `backend_schemas.py` for Pydantic models.

### Authentication Headers

The frontend automatically sends:
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

### Error Response Format

Expected error format:
```json
{
  "detail": "Error message here"
}
```

## Testing

### Testing with Mock Data
```bash
# In .env
VITE_USE_MOCK_DATA=true

# Run frontend
npm run dev
```

### Testing with Real Backend
```bash
# In .env
VITE_USE_MOCK_DATA=false
VITE_API_BASE_URL=http://localhost:8000

# Start FastAPI backend
cd backend
uvicorn main:app --reload

# Start frontend in another terminal
npm run dev
```

## Security Considerations

✅ **Implemented:**
- JWT tokens stored in localStorage
- Automatic token refresh
- Authorization header on all requests
- Role-based access control
- Auto-logout on auth failure

⚠️ **Production Recommendations:**
- Use HTTPS for all API calls
- Implement CSRF protection
- Consider httpOnly cookies for tokens
- Add rate limiting
- Implement proper session management
- Never expose sensitive keys in frontend

## Troubleshooting

### "Network Error" or "CORS Error"
- Ensure backend is running
- Check CORS configuration on backend
- Verify `VITE_API_BASE_URL` is correct

### "401 Unauthorized"
- Token may be expired - try logging in again
- Check token is being sent in headers
- Verify backend JWT secret matches

### Mock data not showing
- Ensure `VITE_USE_MOCK_DATA=true` in `.env`
- Restart dev server after changing `.env`

### Real API not being called
- Set `VITE_USE_MOCK_DATA=false` in `.env`
- Verify backend is running and accessible
- Check network tab in browser DevTools

## Support

For issues or questions:
1. Check this documentation
2. Review `backend_schemas.py` for data structures
3. Review `BACKEND_README.md` for backend setup
4. Check browser console and network tab for errors
