/**
 * Grade Service
 * Maps to FastAPI /api/grades/* endpoints
 */

import apiClient, { handleApiError } from './api';
import { API_CONFIG, API_ENDPOINTS } from '@/config/api.config';

export interface Grade {
  id: string;
  course_id: string;
  course_name: string;
  assignment_id: string;
  assignment_name: string;
  score: number;
  total_points: number;
  percentage: number;
  letter_grade: string;
  submitted_date: string;
  graded_date: string;
  feedback?: string;
}

export interface CourseGrade {
  course_id: string;
  course_name: string;
  overall_percentage: number;
  letter_grade: string;
  gpa: number;
  assignments: Grade[];
}

// Mock data
const MOCK_GRADES: Grade[] = [
  {
    id: '1',
    course_id: '1',
    course_name: 'Advanced Web Development',
    assignment_id: '1',
    assignment_name: 'React Component Design',
    score: 95,
    total_points: 100,
    percentage: 95,
    letter_grade: 'A',
    submitted_date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    graded_date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    feedback: 'Excellent work!',
  },
  {
    id: '2',
    course_id: '2',
    course_name: 'Data Science Fundamentals',
    assignment_id: '2',
    assignment_name: 'Data Analysis Project',
    score: 142,
    total_points: 150,
    percentage: 94.7,
    letter_grade: 'A',
    submitted_date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    graded_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    feedback: 'Great analysis!',
  },
];

class GradeService {
  /**
   * Get all grades for current student
   * Backend endpoint: GET /api/grades/me
   */
  async getStudentGrades(): Promise<Grade[]> {
    if (API_CONFIG.useMockData) {
      await new Promise(resolve => setTimeout(resolve, 500));
      return MOCK_GRADES;
    }

    try {
      const response = await apiClient.get<Grade[]>(API_ENDPOINTS.grades.student);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Get grades for a specific course
   * Backend endpoint: GET /api/grades/courses/{courseId}
   */
  async getCourseGrades(courseId: string): Promise<CourseGrade> {
    if (API_CONFIG.useMockData) {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const courseGrades = MOCK_GRADES.filter(g => g.course_id === courseId);
      const avgPercentage = courseGrades.reduce((sum, g) => sum + g.percentage, 0) / courseGrades.length;
      
      return {
        course_id: courseId,
        course_name: courseGrades[0]?.course_name || 'Course',
        overall_percentage: avgPercentage,
        letter_grade: 'A',
        gpa: 4.0,
        assignments: courseGrades,
      };
    }

    try {
      const response = await apiClient.get<CourseGrade>(
        API_ENDPOINTS.grades.course(courseId)
      );
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Get all grades (admin/instructor only)
   * Backend endpoint: GET /api/grades
   */
  async getAllGrades(params?: {
    course_id?: string;
    student_id?: string;
  }): Promise<Grade[]> {
    if (API_CONFIG.useMockData) {
      await new Promise(resolve => setTimeout(resolve, 500));
      return MOCK_GRADES;
    }

    try {
      const response = await apiClient.get<Grade[]>(
        API_ENDPOINTS.grades.all,
        { params }
      );
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }
}

export const gradeService = new GradeService();
