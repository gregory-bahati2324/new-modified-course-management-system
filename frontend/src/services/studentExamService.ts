/**
 * Student Exam Service
 * Uses the assessment backend for student exam history.
 */

import apiClient, { handleApiError } from './api';
import { API_ENDPOINTS } from '@/config/api.config';

export interface ExamListItem {
  id: string;
  title: string;
  type: string;
  course_id?: string | null;
  course_title?: string | null;
  passing_score?: number | null;
  status: 'completed' | 'available' | 'upcoming' | 'in_progress' | 'missed';
  score?: number | null;
  attempt_id?: number | null;
  last_attempt_date?: string | null;
  is_graded?: boolean;
  attempt_status?: string | null;
}

interface StudentAssessmentResponse {
  id: number;
  title: string;
  type: string;
  course_id?: string | null;
  course_title?: string | null;
  due_date?: string | null;
  passing_score?: number | null;
  status: string;
  attempt_id?: number | null;
  attempt_status?: string | null;
  score?: number | null;
  is_graded: boolean;
}

export const studentExamService = {
  /**
   * Get assessments for the logged-in student.
   *
   * The backend already limits this endpoint to the student's enrolled
   * courses. History is derived only from submitted/graded attempts.
   */
  async getExams(filters?: {
    status?: string;
    course_id?: string;
    type?: string;
  }): Promise<ExamListItem[]> {
    try {
      const token = localStorage.getItem('accessToken');

      const response = await apiClient.get<StudentAssessmentResponse[]>(
        API_ENDPOINTS.assessments.get_student_assessments,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      let exams = response.data
        .filter((assessment) =>
          assessment.attempt_status === 'submitted' ||
          assessment.attempt_status === 'graded'
        )
        .map((assessment): ExamListItem => ({
          id: String(assessment.id),
          title: assessment.title,
          type: assessment.type,
          course_id: assessment.course_id,
          course_title: assessment.course_title,
          passing_score: assessment.passing_score,
          status: 'completed',
          score: assessment.is_graded ? assessment.score ?? null : null,
          attempt_id: assessment.attempt_id,
          is_graded: assessment.is_graded,
          attempt_status: assessment.attempt_status,
        }));

      if (filters?.course_id) {
        exams = exams.filter((exam) => exam.course_id === filters.course_id);
      }

      if (filters?.type && filters.type !== 'all') {
        exams = exams.filter((exam) => exam.type === filters.type);
      }

      if (filters?.status && filters.status !== 'all') {
        exams = exams.filter((exam) => exam.status === filters.status);
      }

      return exams;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },
};

export default studentExamService;
