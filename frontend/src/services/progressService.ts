import { apiProgressClient, handleApiError } from './apiProgress';
import { API_ENDPOINTS } from '@/config/api.config';

export interface Progress {
  lesson_id: string;
  moduleId: string;
  courseId: string;
  completed: boolean;
  completedAt: string | null;
  progress_percentage: number;
}

export interface CourseProgress {
  course_id: string;
  completed_modules: number;
  total_modules: number;
  completed_lessons: number;
  total_lessons: number;
  progress_percentage: number;
  is_completed: boolean;
  last_accessed_at: string | null;
}

export interface ModuleProgress {
  module_id: string;
  completed_lessons: number;
  total_lessons: number;
  progress_percentage: number;
  is_completed: boolean;
}


export class ProgressService {
  async startLesson(lessonId: string): Promise<void> {
    try {
      await apiProgressClient.post(
        API_ENDPOINTS.progress.lessonStart(lessonId)
      );
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async completeLesson(
    lessonId: string,
    payload: {
      course_id: string;
      module_id: string;
      quiz_score?: number;
      time_spent_seconds?: number;
    }
  ): Promise<void> {
    try {
      await apiProgressClient.post(
        API_ENDPOINTS.progress.lessonComplete(lessonId),
        payload
      );
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }


  async resetLessonProgress(lessonId: string): Promise<void> {
    try {
      await apiProgressClient.post(
        API_ENDPOINTS.progress.resetLessonProgress(lessonId)
      );
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async getModuleProgress(moduleId: string): Promise<ModuleProgress | null> {
    try {
      const response = await apiProgressClient.get<ModuleProgress>(
        API_ENDPOINTS.progress.getModuleProgress(moduleId)
      );
      return response.data;
    } catch (error: any) {
      
      if (error.response?.status === 404) {
        return null;
      }

      
      throw new Error(handleApiError(error));
    }
  }


  async getCourseLessonsProgress(courseId: string): Promise<Progress[]> {
    try {
      const response = await apiProgressClient.get<Progress[]>(
        API_ENDPOINTS.progress.getCourseLessonsProgress(courseId)
      );
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async getCourseProgress(courseId: string): Promise<CourseProgress> {
    try {
      const response = await apiProgressClient.get<CourseProgress>(
        API_ENDPOINTS.progress.getCourseProgress(courseId)
      );
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

}

