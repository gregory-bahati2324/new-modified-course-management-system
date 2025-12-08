// src/services/assessmentService.ts
import { apiAssessmentClient, handleApiError } from './assessmentsapi';
import { API_ENDPOINTS } from '@/config/api.config';

export interface QuestionCreate {
  type: 'multiple-choice' | 'true-false' | 'short-answer' | 'essay' | 'coding' | 'file-upload' | 'matching' | 'ordering';
  question_text: string;
  points: number;
  options?: string[];
  correct_answer?: number | string | string[];
  model_answer?: string;
  test_cases?: { input: string; expectedOutput: string }[];
  reference_file?: string;
  matching_pairs?: { left: string; right: string }[];
  correct_order?: string[];
}

export interface AssessmentCreate {
  title: string;
  type: 'quiz' | 'exam' | 'test' | 'midterm' | 'final';
  description?: string;
  course_id: string;
  module_id?: string | null;
  due_date?: string;    // ISO
  time_limit?: number | null;
  attempts?: string;
  passing_score?: number;
  shuffle_questions?: boolean;
  show_answers?: boolean;
  status?: 'draft' | 'published' | 'closed';
  questions: QuestionCreate[];
}

export interface Assessment {
  id: string;
  title: string;
  description: string;
  type: string;
  course_id: string;
  module_id?: string;
  status: string;
  created_at: string;
  updated_at: string;
}

class AssessmentService {
  async createAssessment(data: AssessmentCreate): Promise<Assessment> {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await apiAssessmentClient.post<Assessment>(
        API_ENDPOINTS.assessments.create,
        data,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async getAssessments(): Promise<Assessment[]> {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await apiAssessmentClient.get<Assessment[]>(
        API_ENDPOINTS.assessments.list,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }
}

export const assessmentService = new AssessmentService();
