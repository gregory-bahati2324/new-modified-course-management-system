// src/services/questionService.ts
import { apiAssessmentClient, handleApiError } from './assessmentsapi';
import { API_ENDPOINTS } from '@/config/api.config';

export interface QuestionCreate {
  type: 'multiple-choice' | 'true-false' | 'short-answer' | 'essay' | 'coding' | 'file-upload' | 'matching' | 'ordering';
  question_text: string;
  points?: number;
  options?: string[];
  correct_answer?: number | string | string[];
  model_answer?: string;
  test_cases?: { input: string; expectedOutput: string }[];
  reference_file?: string;
  reference_file_url?: string;
  matching_pairs?: { left: string; right: string }[];
  correct_order?: string[];
}

export interface QuestionUpdate extends QuestionCreate {
  id: string; // id is required for update
}

export interface QuestionResponse extends QuestionCreate {
  id: string;
  assessment_id: string;
  created_at: string;
  updated_at: string;
}

class QuestionService {
  // Create a question for an assessment
  async createQuestion(assessmentId: string, data: QuestionCreate): Promise<QuestionResponse> {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await apiAssessmentClient.post<QuestionResponse>(
        API_ENDPOINTS.questions.create(assessmentId),
        data,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  // List all questions for an assessment
  async listQuestions(assessmentId: string): Promise<QuestionResponse[]> {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await apiAssessmentClient.get<QuestionResponse[]>(
        API_ENDPOINTS.questions.list(assessmentId),
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  // Update a question
  async updateQuestion(questionId: string, data: QuestionCreate): Promise<QuestionResponse> {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await apiAssessmentClient.put<QuestionResponse>(
        API_ENDPOINTS.questions.update(questionId),
        data,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  // Delete a question
  async deleteQuestion(questionId: string): Promise<{ ok: boolean }> {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await apiAssessmentClient.delete<{ ok: boolean }>(
        API_ENDPOINTS.questions.delete(questionId),
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  // Sync questions for an assessment (update multiple at once)
  async syncQuestions(assessmentId: string, questions: QuestionUpdate[]): Promise<QuestionResponse[]> {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await apiAssessmentClient.post<QuestionResponse[]>(
        API_ENDPOINTS.questions.sync(assessmentId),
        questions,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  // Upload a file for a question
  async uploadQuestionFile(questionId: string, file: File): Promise<QuestionResponse> {
    try {
      const token = localStorage.getItem('accessToken');
      const formData = new FormData();
      formData.append('file', file);

      const response = await apiAssessmentClient.post<QuestionResponse>(
        API_ENDPOINTS.questions.uploadFile(questionId),
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
  // Delete a file associated with a question
  async deleteQuestionFile(questionId: string): Promise<{ ok: boolean }> {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await apiAssessmentClient.delete<{ ok: boolean }>(
        API_ENDPOINTS.questions.deleteFile(questionId),
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  } 
}

export const questionService = new QuestionService();
