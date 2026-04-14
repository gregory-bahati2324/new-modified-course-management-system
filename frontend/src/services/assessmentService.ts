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

export interface ExamQuestion {
  id: number;
  type: 'multiple-choice' | 'true-false' | 'short-answer' | 'essay' | 'coding' | 'file-upload' | 'matching' | 'ordering';
  question_text: string;
  points: number;
  options?: string[];
  matching_pairs?: { left: string; right: string }[];
  correct_order?: string[]; // For ordering questions, shuffled for display
  test_cases?: { input: string; expectedOutput: string }[];
}

export interface ExamDetails {
  id: string;
  title: string;
  description: string;
  type: string;
  course_title: string;
  module_title?: string;
  due_date: string;
  time_limit: number | null;
  attempts_allowed: string;
  attempts_used: number;
  passing_score: number;
  shuffle_questions: boolean;
  show_answers: boolean;
  total_points: number;
  questions: ExamQuestion[];
  started_at?: string;
  time_remaining?: number;
}

export interface ExamQuestion {
  id: number;
  type: 'multiple-choice' | 'true-false' | 'short-answer' | 'essay' | 'coding' | 'file-upload' | 'matching' | 'ordering';
  question_text: string;
  points: number;
  question_file_url?: string;
  options?: string[];
  matching_pairs?: { left: string; right: string }[];
  correct_order?: string[]; // For ordering questions, shuffled for display
  test_cases?: { input: string; expectedOutput: string }[];
}

export interface ExamAnswer {
  question_id: number;
  answer: string | number | string[] | { [key: string]: string };
  file?: File;
}

export interface ExamSubmission {
  exam_id: string;
  answers: ExamAnswer[];
  time_taken: number;
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

  course_title?: string;
  course_code?: string;
  instructor_name?: string;

  attempt_id?: number | null;
  attempt_status?: string | null;

  score?: number | null;
  is_graded?: boolean;

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
  async getStudentAssessments(): Promise<Assessment[]> {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await apiAssessmentClient.get<Assessment[]>(
        API_ENDPOINTS.assessments.get_student_assessments,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async deleteAssessment(id: string): Promise<void> {
    try {
      const token = localStorage.getItem('accessToken');

      await apiAssessmentClient.delete(
        API_ENDPOINTS.assessments.delete(id),
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }


  async getExamDetails(id: string): Promise<ExamDetails> {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await apiAssessmentClient.get<ExamDetails>(
        API_ENDPOINTS.assessments.get_exam(id),
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async startExam(id: string): Promise<{ attempt_id: number }> {
    const token = localStorage.getItem('accessToken');
    const response = await apiAssessmentClient.post(
      API_ENDPOINTS.assessments.startExam(id),
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  }

  async saveExamProgress(id: number, answers: ExamAnswer[]): Promise<void> {
    try {
      const token = localStorage.getItem('accessToken');
      await apiAssessmentClient.post(
        API_ENDPOINTS.assessments.saveAttempt,
        { attempt_id: id, answers },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async submitExam(attempt_id: number, answers: ExamAnswer[], time_taken: number) {
    try {
      const token = localStorage.getItem('accessToken');

      const formData = new FormData();

      formData.append("attempt_id", String(attempt_id));
      formData.append("time_taken", String(time_taken));

      // Separate answers
      const cleanAnswers = answers.map(a => ({
        question_id: a.question_id,
        answer: a.file ? null : a.answer // file questions handled separately
      }));

      formData.append("answers", JSON.stringify(cleanAnswers));

      for (let pair of formData.entries()) {
        console.log("FORM DATA:", pair[0], pair[1]);
      }

      // Attach files
      answers.forEach((a) => {
        if (a.file) {
          formData.append(`file_${a.question_id}`, a.file);
        }
      });

      const response = await apiAssessmentClient.post(
        API_ENDPOINTS.assessments.submitExam,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data"
          }
        }
      );

      return response.data;

    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }
}

export const assessmentService = new AssessmentService();
