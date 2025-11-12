/**
 * Marking Service
 * Handles AI-assisted and manual marking workflows
 */

import apiClient, { handleApiError } from './api';
import { API_CONFIG, API_ENDPOINTS } from '@/config/api.config';

export interface MarkingSubmission {
  id: string;
  student_id: string;
  student_name: string;
  assessment_id: string;
  assessment_title: string;
  course_id: string;
  module_id?: string;
  submitted_at: string;
  status: 'pending' | 'ai-marked' | 'instructor-reviewed' | 'graded';
  score?: number;
  max_score: number;
  marking_mode?: 'AI' | 'Manual' | 'Hybrid';
}

export interface QuestionGrade {
  question_number: number;
  question_text: string;
  student_answer: string;
  correct_answer?: string;
  earned_points: number;
  max_points: number;
  ai_suggestion?: string;
  feedback?: string;
  is_correct: boolean;
}

export interface MarkingResult {
  submission_id: string;
  total_score: number;
  max_score: number;
  percentage: number;
  letter_grade: string;
  questions: QuestionGrade[];
  overall_feedback?: string;
  marked_by: 'AI' | 'Instructor' | 'Hybrid';
  marked_at: string;
}

export interface AIMarkingRequest {
  submission_id: string;
  use_answer_keys: boolean;
  generate_feedback: boolean;
}

export interface ManualGradeUpdate {
  question_number: number;
  earned_points: number;
  feedback?: string;
}

// Mock data for development
const MOCK_SUBMISSIONS: MarkingSubmission[] = [
  {
    id: '1',
    student_id: 'st1',
    student_name: 'John Doe',
    assessment_id: 'a1',
    assessment_title: 'Midterm Exam',
    course_id: 'c1',
    module_id: 'm1',
    submitted_at: new Date().toISOString(),
    status: 'pending',
    max_score: 100
  },
  {
    id: '2',
    student_id: 'st2',
    student_name: 'Jane Smith',
    assessment_id: 'a1',
    assessment_title: 'Midterm Exam',
    course_id: 'c1',
    module_id: 'm1',
    submitted_at: new Date().toISOString(),
    status: 'ai-marked',
    score: 85,
    max_score: 100,
    marking_mode: 'AI'
  }
];

class MarkingService {
  /**
   * Get all submissions for marking
   */
  async getSubmissionsForMarking(params?: {
    course_id?: string;
    module_id?: string;
    assessment_id?: string;
    status?: string;
  }): Promise<MarkingSubmission[]> {
    if (API_CONFIG.useMockData) {
      await new Promise(resolve => setTimeout(resolve, 500));
      return MOCK_SUBMISSIONS;
    }

    try {
      const response = await apiClient.get<MarkingSubmission[]>(
        '/api/marking/submissions',
        { params }
      );
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Run AI marking on a submission
   */
  async runAIMarking(request: AIMarkingRequest): Promise<MarkingResult> {
    if (API_CONFIG.useMockData) {
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate AI processing
      
      return {
        submission_id: request.submission_id,
        total_score: 85,
        max_score: 100,
        percentage: 85,
        letter_grade: 'B',
        questions: [
          {
            question_number: 1,
            question_text: 'What is normalization?',
            student_answer: 'Process of organizing data...',
            correct_answer: 'Normalization is the process...',
            earned_points: 8,
            max_points: 10,
            ai_suggestion: 'Good understanding but missing details.',
            is_correct: true
          }
        ],
        overall_feedback: 'Good performance overall.',
        marked_by: 'AI',
        marked_at: new Date().toISOString()
      };
    }

    try {
      const response = await apiClient.post<MarkingResult>(
        '/api/marking/ai-mark',
        request
      );
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Update manual grades for a submission
   */
  async updateManualGrades(
    submissionId: string,
    grades: ManualGradeUpdate[],
    overallFeedback?: string
  ): Promise<MarkingResult> {
    if (API_CONFIG.useMockData) {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return {
        submission_id: submissionId,
        total_score: grades.reduce((sum, g) => sum + g.earned_points, 0),
        max_score: 100,
        percentage: 0,
        letter_grade: 'B',
        questions: [],
        overall_feedback: overallFeedback,
        marked_by: 'Instructor',
        marked_at: new Date().toISOString()
      };
    }

    try {
      const response = await apiClient.put<MarkingResult>(
        `/api/marking/submissions/${submissionId}/manual`,
        { grades, overall_feedback: overallFeedback }
      );
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Publish grades to students
   */
  async publishGrades(submissionId: string): Promise<void> {
    if (API_CONFIG.useMockData) {
      await new Promise(resolve => setTimeout(resolve, 300));
      return;
    }

    try {
      await apiClient.post(`/api/marking/submissions/${submissionId}/publish`);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Get marking analytics
   */
  async getMarkingAnalytics(params?: {
    course_id?: string;
    assessment_id?: string;
  }): Promise<{
    average_score: number;
    pass_rate: number;
    ai_accuracy: number;
    common_mistakes: string[];
  }> {
    if (API_CONFIG.useMockData) {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return {
        average_score: 88.5,
        pass_rate: 94,
        ai_accuracy: 96,
        common_mistakes: [
          'SQL JOIN operations',
          'Syntax errors in code',
          'Missing optimization requirements'
        ]
      };
    }

    try {
      const response = await apiClient.get('/api/marking/analytics', { params });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Bulk AI marking for multiple submissions
   */
  async bulkAIMarking(submissionIds: string[]): Promise<{
    success_count: number;
    failed_count: number;
    results: MarkingResult[];
  }> {
    if (API_CONFIG.useMockData) {
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      return {
        success_count: submissionIds.length,
        failed_count: 0,
        results: []
      };
    }

    try {
      const response = await apiClient.post('/api/marking/bulk-ai-mark', {
        submission_ids: submissionIds
      });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Get detailed marking result for a submission
   */
  async getMarkingResult(submissionId: string): Promise<MarkingResult> {
    if (API_CONFIG.useMockData) {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return {
        submission_id: submissionId,
        total_score: 85,
        max_score: 100,
        percentage: 85,
        letter_grade: 'B',
        questions: [
          {
            question_number: 1,
            question_text: 'What is normalization in database design?',
            student_answer: 'Normalization is the process of organizing data in a database to reduce redundancy and improve data integrity.',
            correct_answer: 'Normalization is the process of organizing data to minimize redundancy and dependency...',
            earned_points: 8,
            max_points: 10,
            ai_suggestion: 'Good understanding but missing some details.',
            feedback: 'Well explained!',
            is_correct: true
          }
        ],
        overall_feedback: 'Good performance overall.',
        marked_by: 'AI',
        marked_at: new Date().toISOString()
      };
    }

    try {
      const response = await apiClient.get<MarkingResult>(
        `/api/marking/submissions/${submissionId}/result`
      );
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }
}

export const markingService = new MarkingService();