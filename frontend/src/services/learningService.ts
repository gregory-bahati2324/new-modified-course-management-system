/**
 * Learning Service
 * Handles course learning progress, lessons, and module tracking
 */

import apiClient, { handleApiError } from './api';
import { API_CONFIG, API_ENDPOINTS } from '@/config/api.config';

export interface LessonProgress {
  lesson_id: string;
  completed: boolean;
  completed_at?: string;
  time_spent: number; // minutes
  quiz_score?: number;
}

export interface ModuleProgress {
  module_id: string;
  module_title: string;
  total_lessons: number;
  completed_lessons: number;
  is_completed: boolean;
  lessons: LessonProgress[];
}

export interface CourseProgress {
  course_id: string;
  course_title: string;
  instructor: string;
  overall_progress: number; // percentage
  total_modules: number;
  completed_modules: number;
  modules: ModuleProgress[];
  last_accessed?: string;
}

export interface MarkCompleteRequest {
  lesson_id: string;
  time_spent?: number;
  quiz_score?: number;
}

// Mock data
const MOCK_COURSE_PROGRESS: CourseProgress = {
  course_id: '1',
  course_title: 'Advanced Database Systems',
  instructor: 'Dr. Sarah Johnson',
  overall_progress: 75,
  total_modules: 4,
  completed_modules: 2,
  last_accessed: new Date().toISOString(),
  modules: [
    {
      module_id: '1',
      module_title: 'Introduction to Advanced Databases',
      total_lessons: 4,
      completed_lessons: 4,
      is_completed: true,
      lessons: [
        {
          lesson_id: '1',
          completed: true,
          completed_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          time_spent: 15,
        },
        {
          lesson_id: '2',
          completed: true,
          completed_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
          time_spent: 30,
        },
        {
          lesson_id: '3',
          completed: true,
          completed_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          time_spent: 45,
        },
        {
          lesson_id: '4',
          completed: true,
          completed_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
          time_spent: 10,
          quiz_score: 95,
        },
      ],
    },
    {
      module_id: '2',
      module_title: 'Normalization & Optimization',
      total_lessons: 4,
      completed_lessons: 1,
      is_completed: false,
      lessons: [
        {
          lesson_id: '1',
          completed: true,
          completed_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          time_spent: 40,
        },
        {
          lesson_id: '2',
          completed: false,
          time_spent: 0,
        },
        {
          lesson_id: '3',
          completed: false,
          time_spent: 0,
        },
        {
          lesson_id: '4',
          completed: false,
          time_spent: 0,
        },
      ],
    },
  ],
};

class LearningService {
  /**
   * Get course progress for a student
   * Backend endpoint: GET /api/learning/courses/{courseId}/progress
   */
  async getCourseProgress(courseId: string): Promise<CourseProgress> {
    if (API_CONFIG.useMockData) {
      await new Promise(resolve => setTimeout(resolve, 500));
      return { ...MOCK_COURSE_PROGRESS, course_id: courseId };
    }

    try {
      const response = await apiClient.get<CourseProgress>(
        API_ENDPOINTS.learning.courseProgress(courseId)
      );
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Mark a lesson as complete
   * Backend endpoint: POST /api/learning/courses/{courseId}/lessons/{lessonId}/complete
   */
  async markLessonComplete(
    courseId: string,
    lessonId: string,
    data: MarkCompleteRequest
  ): Promise<void> {
    if (API_CONFIG.useMockData) {
      await new Promise(resolve => setTimeout(resolve, 500));
      return;
    }

    try {
      await apiClient.post(
        API_ENDPOINTS.learning.markLessonComplete(courseId, lessonId),
        data
      );
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Get next recommended lesson
   * Backend endpoint: GET /api/learning/courses/{courseId}/next-lesson
   */
  async getNextLesson(courseId: string): Promise<{ module_id: string; lesson_id: string }> {
    if (API_CONFIG.useMockData) {
      await new Promise(resolve => setTimeout(resolve, 300));
      return { module_id: '2', lesson_id: '2' };
    }

    try {
      const response = await apiClient.get<{ module_id: string; lesson_id: string }>(
        `/api/learning/courses/${courseId}/next-lesson`
      );
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Get all enrolled courses with progress
   * Backend endpoint: GET /api/learning/my-courses
   */
  async getMyCourses(): Promise<CourseProgress[]> {
    if (API_CONFIG.useMockData) {
      await new Promise(resolve => setTimeout(resolve, 500));
      return [MOCK_COURSE_PROGRESS];
    }

    try {
      const response = await apiClient.get<CourseProgress[]>('/api/learning/my-courses');
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Update lesson time spent
   * Backend endpoint: PUT /api/learning/courses/{courseId}/lessons/{lessonId}/time
   */
  async updateTimeSpent(
    courseId: string,
    lessonId: string,
    timeSpent: number
  ): Promise<void> {
    if (API_CONFIG.useMockData) {
      await new Promise(resolve => setTimeout(resolve, 200));
      return;
    }

    try {
      await apiClient.put(
        `/api/learning/courses/${courseId}/lessons/${lessonId}/time`,
        { time_spent: timeSpent }
      );
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }
}

export const learningService = new LearningService();
