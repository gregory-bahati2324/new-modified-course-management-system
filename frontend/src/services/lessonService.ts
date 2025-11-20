import { apiModuleClient, handleApiError } from './moduleLessonapi';
import { API_ENDPOINTS } from '@/config/api.config';

export interface Lesson {
  id: string;
  module_id: string;
  title: string;
  objectives?: string;
  level?: string;
  prerequisites?: string;
  type?: 'video' | 'reading' | 'quiz' | 'assignment' | 'lab';
  tags?: string | string[];
  contentBlocks?: any[];
  quizQuestions?: any[];
  duration?: number;
  order?: number;
  is_completed?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CreateLessonPayload {
  title: string;
  objectives?: string;
  prerequisites?: string;
  estimatedDuration?: string;
  difficulty?: string;
  tags?: string[];
  contentBlocks?: { type: string; title?: string; content?: string }[];
  quizQuestions?: { id: number; question: string; options: string[]; correctAnswer: number }[];
  order?: number;
}

export class LessonService {

  async createLesson(moduleId: string, data: CreateLessonPayload): Promise<Lesson> {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await apiModuleClient.post<Lesson>(
        `/modules/${moduleId}/lessons`,
        data,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  // ------------------------
  // Upload a file for a lesson
  // ------------------------
  async uploadFile(lessonId: string, file: File): Promise<{ filename: string; filepath: string }> {
    try {
      const token = localStorage.getItem('accessToken');
      const formData = new FormData();
      formData.append('file', file);

      const response = await apiModuleClient.post<{ filename: string; filepath: string }>(
        `/uploads/lesson/${lessonId}/file`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      return response.data; // { filename: 'unique_file.pdf', filepath: 'uploads/...' }
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async getLessons(moduleId: string): Promise<{ data: Lesson[] }> {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await apiModuleClient.get<Lesson[]>(
        API_ENDPOINTS.lessonRoutes.list(moduleId),
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return { data: response.data };
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async updateLesson(moduleId: string, lessonId: string, data: Partial<Lesson>): Promise<Lesson> {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await apiModuleClient.put<Lesson>(
        API_ENDPOINTS.lessonRoutes.update(moduleId, lessonId),
        data,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async deleteLesson(moduleId: string, lessonId: string): Promise<void> {
    try {
      const token = localStorage.getItem('accessToken');
      await apiModuleClient.delete(
        API_ENDPOINTS.lessonRoutes.delete(moduleId, lessonId),
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }
}

export const lessonService = new LessonService();
