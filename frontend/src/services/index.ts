/**
 * Centralized exports for all services
 * Note: Import types directly from individual service files to avoid naming conflicts
 */

// Export service instances
export { authService } from './authService';
export { courseService } from './courseService';
export { assignmentService } from './assignmentService';
export { gradeService } from './gradeService';
export { scheduleService } from './scheduleService';
export { certificateService } from './certificateService';
export { forumService } from './forumService';
export { analyticsService } from './analyticsService';
export { messageService } from './messageService';
export { profileService } from './profileService';
export { moduleService } from './moduleService';
export { homeService } from './homeService';
export { learningService } from './learningService';
export { adminService } from './adminService';

// Export API utilities
export { default as apiClient, handleApiError, getToken, setToken, removeTokens } from './api';

// Re-export commonly used types (non-conflicting)
export type { LoginRequest, LoginResponse, RegisterRequest, UserRole } from './authService';
export type { Course, CourseDetail, CreateCourseRequest } from './courseService';
export type { Assignment, AssignmentSubmission } from './assignmentService';
export type { Grade, CourseGrade } from './gradeService';
export type { ScheduleEvent } from './scheduleService';
