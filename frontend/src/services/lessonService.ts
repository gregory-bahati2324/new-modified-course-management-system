import { apiModuleClient, handleApiError } from './moduleLessonapi';
import { API_ENDPOINTS } from '@/config/api.config';

// ---------------------
// INTERFACES
// ---------------------
export interface ContentBlock {
  type: string;
  title?: string;
  content?: string;
}

export interface QuizQuestion {
  id?: number;
  question: string;
  options: string[];
  correctAnswer: number;
}

export interface DiscussionSettings {
  enabled: boolean;
  prompt?: string | null;
}

export interface ProgressSettings {
  completion: boolean;
  timeSpent: boolean;
  quizScore: boolean;
}

export type FontSize = 'small' | 'medium' | 'large';

export interface AccessibilitySettings {
  darkMode: boolean;
  fontSize: FontSize;
  transcriptEnabled: boolean;
  transcriptText?: string | null;
}

export interface FeedbackSettings {
  ratings: boolean;
  reviews: boolean;
  customQuestions: string[];
}

export interface Lesson {
  id: string;
  module_id: string;
  title: string;
  objectives?: string | null;
  prerequisites?: string | null;
  estimatedDuration?: string | null;
  difficulty?: string | null;
  tags?: string[];
  contentBlocks?: ContentBlock[];
  quizQuestions?: QuizQuestion[];
  discussion?: DiscussionSettings;
  progressSettings?: ProgressSettings;
  accessibility?: AccessibilitySettings;
  feedbackSettings?: FeedbackSettings;
  order?: number;
  is_completed?: boolean;
  created_at?: string;
  updated_at?: string;
}

// ---------------------
// CREATE LESSON PAYLOAD
// ---------------------
export interface CreateLessonPayload {
  title: string;
  objectives?: string | null;
  prerequisites?: string | null;
  estimatedDuration?: string | null;
  difficulty?: string | null;
  tags?: string[];
  contentBlocks?: ContentBlock[];
  quizQuestions?: QuizQuestion[];
  discussion?: DiscussionSettings;
  progressSettings?: ProgressSettings;
  accessibility?: AccessibilitySettings;
  feedbackSettings?: FeedbackSettings;
  order?: number;
}

// ---------------------
// LESSON SERVICE
// ---------------------
export class LessonService {
  async createLesson(moduleId: string, data: CreateLessonPayload): Promise<Lesson> {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await apiModuleClient.post<Lesson>(
        API_ENDPOINTS.lessonRoutes.create(moduleId),
        data,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
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

  async getLesson(lessonId: string): Promise<Lesson> {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await apiModuleClient.get<Lesson>(
        API_ENDPOINTS.lessonRoutes.detail(lessonId),
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async updateLesson(lessonId: string, data: Partial<CreateLessonPayload>): Promise<Lesson> {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await apiModuleClient.put<Lesson>(
        API_ENDPOINTS.lessonRoutes.update(lessonId),
        data,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async deleteLesson(lessonId: string): Promise<void> {
    try {
      const token = localStorage.getItem('accessToken');
      await apiModuleClient.delete(
        API_ENDPOINTS.lessonRoutes.delete(lessonId),
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async uploadFile(
    lessonId: string,
    file: File
  ): Promise<{ filename: string; filepath: string }> {
    try {
      const token = localStorage.getItem('accessToken');
      const formData = new FormData();
      formData.append('file', file);

      const response = await apiModuleClient.post<{ filename: string; filepath: string }>(
        API_ENDPOINTS.lessonRoutes.uploadFile(lessonId),
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }
}

export const lessonService = new LessonService();
