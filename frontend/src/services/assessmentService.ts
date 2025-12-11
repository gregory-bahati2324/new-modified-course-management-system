// src/services/assessmentService.ts
import { apiAssessmentClient, handleApiError } from './assessmentsapi';
import { API_ENDPOINTS } from '@/config/api.config';

// Only define question structure for typing purposes; not sent directly in assessment CRUD
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

// New type: assessment metadata only (omit questions)
export interface AssessmentMetadata {
  title: string;
  type: 'quiz' | 'exam' | 'test' | 'midterm' | 'final';
  description?: string;
  course_id: string;
  module_id?: string | null;
  due_date?: string;    // ISO string
  time_limit?: number | null;
  attempts?: string;
  passing_score?: number;
  shuffle_questions?: boolean;
  show_answers?: boolean;
  status?: 'draft' | 'published' | 'closed';
}

export interface Assessment {
  id: string;
  title: string;
  description: string | null;
  type: string;
  course_id: string;
  module_id?: string | null;
  instructor_id: string;

  due_date?: string | null;
  due_time?: string | null;

  time_limit?: number | null;
  attempts?: string;
  passing_score?: number;
  shuffle_questions?: boolean;
  show_answers?: boolean;
  status: string;

  questions: QuestionCreate[];  // fetched separately

  created_at: string;
  updated_at: string;
}

class AssessmentService {
  // Create assessment (metadata only)
  async createAssessment(data: AssessmentMetadata): Promise<Assessment> {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await apiAssessmentClient.post<Assessment>(
        API_ENDPOINTS.assessments.create,
        data,  // no questions here
        { headers: { Authorization: `Bearer ${token}` } }
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
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async getAssessmentDetail(id: string): Promise<Assessment> {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await apiAssessmentClient.get<Assessment>(
        API_ENDPOINTS.assessments.detail(id),
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  // Update assessment (metadata only)
  async assessmentUpdate(id: string, data: AssessmentMetadata): Promise<Assessment> {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await apiAssessmentClient.put<Assessment>(
        API_ENDPOINTS.assessments.update(id),
        data,  // no questions here
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }
}

export const assessmentService = new AssessmentService();
