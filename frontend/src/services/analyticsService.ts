/**
 * Analytics Service
 * Maps to FastAPI /api/analytics/* endpoints
 */

import apiClient, { handleApiError } from './api';
import { API_CONFIG, API_ENDPOINTS } from '@/config/api.config';

export interface CourseAnalytics {
  course_id: string;
  course_name: string;
  total_students: number;
  active_students: number;
  completion_rate: number;
  average_grade: number;
  total_assignments: number;
  submitted_assignments: number;
  engagement_score: number;
  time_period: {
    start_date: string;
    end_date: string;
  };
}

export interface StudentEngagement {
  student_id: string;
  student_name: string;
  last_active: string;
  total_time_spent: number; // in minutes
  lessons_completed: number;
  assignments_submitted: number;
  forum_posts: number;
  current_grade: number;
  engagement_level: 'high' | 'medium' | 'low';
}

export interface InstructorAnalytics {
  instructor_id: string;
  total_courses: number;
  total_students: number;
  average_rating: number;
  total_assignments_graded: number;
  pending_assignments: number;
  forum_responses: number;
  courses: CourseAnalytics[];
}

export interface StudentAnalytics {
  student_id: string;
  enrolled_courses: number;
  completed_courses: number;
  in_progress_courses: number;
  overall_gpa: number;
  total_credits: number;
  total_time_spent: number; // in minutes
  assignments_completed: number;
  certificates_earned: number;
  forum_participation: number;
  learning_streak: number; // consecutive days
}

export interface PerformanceMetrics {
  course_id: string;
  metrics: {
    assignment_scores: number[];
    quiz_scores: number[];
    participation_score: number;
    attendance_rate: number;
    average_time_per_lesson: number;
  };
  trends: {
    improvement_rate: number;
    consistency_score: number;
    at_risk: boolean;
  };
}

// Mock data
const MOCK_COURSE_ANALYTICS: CourseAnalytics = {
  course_id: '1',
  course_name: 'Advanced Database Systems',
  total_students: 45,
  active_students: 38,
  completion_rate: 72.5,
  average_grade: 85.3,
  total_assignments: 10,
  submitted_assignments: 382,
  engagement_score: 78.5,
  time_period: {
    start_date: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
    end_date: new Date().toISOString(),
  },
};

const MOCK_INSTRUCTOR_ANALYTICS: InstructorAnalytics = {
  instructor_id: 'instructor-1',
  total_courses: 3,
  total_students: 150,
  average_rating: 4.7,
  total_assignments_graded: 450,
  pending_assignments: 12,
  forum_responses: 89,
  courses: [MOCK_COURSE_ANALYTICS],
};

const MOCK_STUDENT_ANALYTICS: StudentAnalytics = {
  student_id: 'student-1',
  enrolled_courses: 5,
  completed_courses: 3,
  in_progress_courses: 2,
  overall_gpa: 3.8,
  total_credits: 45,
  total_time_spent: 2400, // 40 hours
  assignments_completed: 28,
  certificates_earned: 3,
  forum_participation: 15,
  learning_streak: 7,
};

class AnalyticsService {
  /**
   * Get instructor dashboard analytics
   * Backend endpoint: GET /api/analytics/instructor
   */
  async getInstructorAnalytics(): Promise<InstructorAnalytics> {
    if (API_CONFIG.useMockData) {
      await new Promise(resolve => setTimeout(resolve, 500));
      return MOCK_INSTRUCTOR_ANALYTICS;
    }

    try {
      const response = await apiClient.get<InstructorAnalytics>(
        API_ENDPOINTS.analytics.instructor
      );
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Get analytics for a specific course
   * Backend endpoint: GET /api/analytics/courses/{courseId}
   */
  async getCourseAnalytics(
    courseId: string,
    params?: {
      start_date?: string;
      end_date?: string;
    }
  ): Promise<CourseAnalytics> {
    if (API_CONFIG.useMockData) {
      await new Promise(resolve => setTimeout(resolve, 500));
      return MOCK_COURSE_ANALYTICS;
    }

    try {
      const response = await apiClient.get<CourseAnalytics>(
        API_ENDPOINTS.analytics.course(courseId),
        { params }
      );
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Get student engagement data for a course
   * Backend endpoint: GET /api/analytics/courses/{courseId}/engagement
   */
  async getStudentEngagement(courseId: string): Promise<StudentEngagement[]> {
    if (API_CONFIG.useMockData) {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const mockEngagement: StudentEngagement[] = [
        {
          student_id: 'student-1',
          student_name: 'John Doe',
          last_active: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          total_time_spent: 120,
          lessons_completed: 15,
          assignments_submitted: 8,
          forum_posts: 5,
          current_grade: 88.5,
          engagement_level: 'high',
        },
      ];
      
      return mockEngagement;
    }

    try {
      const response = await apiClient.get<StudentEngagement[]>(
        `${API_ENDPOINTS.analytics.course(courseId)}/engagement`
      );
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Get student's own analytics
   * Backend endpoint: GET /api/analytics/student
   */
  async getStudentAnalytics(): Promise<StudentAnalytics> {
    if (API_CONFIG.useMockData) {
      await new Promise(resolve => setTimeout(resolve, 500));
      return MOCK_STUDENT_ANALYTICS;
    }

    try {
      const response = await apiClient.get<StudentAnalytics>(
        API_ENDPOINTS.analytics.student
      );
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Get performance metrics for a student in a course
   * Backend endpoint: GET /api/analytics/courses/{courseId}/students/{studentId}/performance
   */
  async getPerformanceMetrics(
    courseId: string,
    studentId?: string
  ): Promise<PerformanceMetrics> {
    if (API_CONFIG.useMockData) {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const mockMetrics: PerformanceMetrics = {
        course_id: courseId,
        metrics: {
          assignment_scores: [85, 90, 88, 92, 87],
          quiz_scores: [78, 82, 85, 88, 90],
          participation_score: 85,
          attendance_rate: 95,
          average_time_per_lesson: 45,
        },
        trends: {
          improvement_rate: 5.2,
          consistency_score: 88,
          at_risk: false,
        },
      };
      
      return mockMetrics;
    }

    try {
      const endpoint = studentId
        ? `${API_ENDPOINTS.analytics.course(courseId)}/students/${studentId}/performance`
        : `${API_ENDPOINTS.analytics.course(courseId)}/performance`;
        
      const response = await apiClient.get<PerformanceMetrics>(endpoint);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Export analytics report
   * Backend endpoint: GET /api/analytics/courses/{courseId}/export
   */
  async exportAnalyticsReport(
    courseId: string,
    format: 'pdf' | 'csv' | 'xlsx' = 'pdf'
  ): Promise<Blob> {
    if (API_CONFIG.useMockData) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      return new Blob(['Mock analytics report'], { type: 'application/pdf' });
    }

    try {
      const response = await apiClient.get(
        `${API_ENDPOINTS.analytics.course(courseId)}/export`,
        {
          params: { format },
          responseType: 'blob',
        }
      );
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }
}

export const analyticsService = new AnalyticsService();
