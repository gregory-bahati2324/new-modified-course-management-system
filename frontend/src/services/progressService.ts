import { apiProgressClient, handleApiError } from './apiProgress';
import { API_ENDPOINTS } from '@/config/api.config';

export interface Progress {
    lessonId: string;
    moduleId: string;
    courseId: string;
    completed: boolean;
    completedAt: string | null;
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

  async completeLesson(lessonId: string): Promise<void> {
    try {
      await apiProgressClient.post(
        API_ENDPOINTS.progress.lessonComplete(lessonId)
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

  async getModuleProgress(moduleId: string): Promise<Progress[]> {
    try {
      const response = await apiProgressClient.get<Progress[]>(
        API_ENDPOINTS.progress.getModuleProgress(moduleId)
      );
      return response.data;
    } catch (error) {
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
}

