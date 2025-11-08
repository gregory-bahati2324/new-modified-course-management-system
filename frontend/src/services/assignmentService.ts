/**
 * Assignment Service
 * Maps to FastAPI /api/assignments/* endpoints
 */

import apiClient, { handleApiError } from './api';
import { API_CONFIG, API_ENDPOINTS } from '@/config/api.config';

export interface Assignment {
  id: string;
  course_id: string;
  course_name: string;
  title: string;
  description: string;
  due_date: string;
  total_points: number;
  submitted: boolean;
  graded: boolean;
  score?: number;
  status: 'pending' | 'submitted' | 'graded' | 'late';
  submission_date?: string;
  feedback?: string;
}

export interface AssignmentSubmission {
  id: string;
  assignment_id: string;
  student_id: string;
  student_name: string;
  submission_text?: string;
  file_urls?: string[];
  submitted_at: string;
  score?: number;
  feedback?: string;
  graded: boolean;
}

export interface CreateAssignmentRequest {
  course_id: string;
  title: string;
  description: string;
  due_date: string;
  total_points: number;
  instructions?: string;
  allowed_file_types?: string[];
}

export interface SubmitAssignmentRequest {
  submission_text?: string;
  file_urls?: string[];
}

export interface GradeAssignmentRequest {
  score: number;
  feedback?: string;
}

// Mock data
const MOCK_ASSIGNMENTS: Assignment[] = [
  {
    id: '1',
    course_id: '1',
    course_name: 'Advanced Web Development',
    title: 'React Component Design',
    description: 'Build a reusable component library',
    due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    total_points: 100,
    submitted: false,
    graded: false,
    status: 'pending',
  },
  {
    id: '2',
    course_id: '2',
    course_name: 'Data Science Fundamentals',
    title: 'Data Analysis Project',
    description: 'Analyze a real-world dataset',
    due_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    total_points: 150,
    submitted: true,
    graded: true,
    score: 142,
    status: 'graded',
    submission_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    feedback: 'Excellent work!',
  },
];

class AssignmentService {
  /**
   * Get all assignments for current user
   * Backend endpoint: GET /api/assignments
   */
  async getAssignments(params?: {
    course_id?: string;
    status?: string;
  }): Promise<Assignment[]> {
    if (API_CONFIG.useMockData) {
      await new Promise(resolve => setTimeout(resolve, 500));
      return MOCK_ASSIGNMENTS;
    }

    try {
      const response = await apiClient.get<Assignment[]>(
        API_ENDPOINTS.assignments.list,
        { params }
      );
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Get assignment by ID
   * Backend endpoint: GET /api/assignments/{id}
   */
  async getAssignmentById(id: string): Promise<Assignment> {
    if (API_CONFIG.useMockData) {
      await new Promise(resolve => setTimeout(resolve, 500));
      const assignment = MOCK_ASSIGNMENTS.find(a => a.id === id);
      if (!assignment) throw new Error('Assignment not found');
      return assignment;
    }

    try {
      const response = await apiClient.get<Assignment>(
        API_ENDPOINTS.assignments.detail(id)
      );
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Create new assignment (instructor only)
   * Backend endpoint: POST /api/assignments
   */
  async createAssignment(data: CreateAssignmentRequest): Promise<Assignment> {
    if (API_CONFIG.useMockData) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newAssignment: Assignment = {
        id: `assignment-${Date.now()}`,
        course_id: data.course_id,
        course_name: 'Course Name',
        title: data.title,
        description: data.description,
        due_date: data.due_date,
        total_points: data.total_points,
        submitted: false,
        graded: false,
        status: 'pending',
      };
      
      return newAssignment;
    }

    try {
      const response = await apiClient.post<Assignment>(
        API_ENDPOINTS.assignments.create,
        data
      );
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Submit assignment (student only)
   * Backend endpoint: POST /api/assignments/{id}/submit
   */
  async submitAssignment(
    id: string,
    data: SubmitAssignmentRequest
  ): Promise<AssignmentSubmission> {
    if (API_CONFIG.useMockData) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return {
        id: `submission-${Date.now()}`,
        assignment_id: id,
        student_id: 'student-1',
        student_name: 'Current Student',
        ...data,
        submitted_at: new Date().toISOString(),
        graded: false,
      };
    }

    try {
      const response = await apiClient.post<AssignmentSubmission>(
        API_ENDPOINTS.assignments.submit(id),
        data
      );
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Get all submissions for an assignment (instructor only)
   * Backend endpoint: GET /api/assignments/{id}/submissions
   */
  async getAssignmentSubmissions(id: string): Promise<AssignmentSubmission[]> {
    if (API_CONFIG.useMockData) {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return [
        {
          id: 'submission-1',
          assignment_id: id,
          student_id: 'student-1',
          student_name: 'John Doe',
          submission_text: 'My submission...',
          submitted_at: new Date().toISOString(),
          graded: false,
        },
      ];
    }

    try {
      const response = await apiClient.get<AssignmentSubmission[]>(
        API_ENDPOINTS.assignments.submissions(id)
      );
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Grade assignment submission (instructor only)
   * Backend endpoint: POST /api/assignments/{id}/submissions/{submissionId}/grade
   */
  async gradeAssignment(
    assignmentId: string,
    submissionId: string,
    data: GradeAssignmentRequest
  ): Promise<AssignmentSubmission> {
    if (API_CONFIG.useMockData) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return {
        id: submissionId,
        assignment_id: assignmentId,
        student_id: 'student-1',
        student_name: 'John Doe',
        submitted_at: new Date().toISOString(),
        score: data.score,
        feedback: data.feedback,
        graded: true,
      };
    }

    try {
      const response = await apiClient.post<AssignmentSubmission>(
        API_ENDPOINTS.assignments.grade(assignmentId, submissionId),
        data
      );
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Update assignment (instructor only)
   * Backend endpoint: PUT /api/assignments/{id}
   */
  async updateAssignment(
    id: string,
    data: Partial<CreateAssignmentRequest>
  ): Promise<Assignment> {
    if (API_CONFIG.useMockData) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      const assignment = MOCK_ASSIGNMENTS.find(a => a.id === id);
      if (!assignment) throw new Error('Assignment not found');
      
      return { ...assignment, ...data };
    }

    try {
      const response = await apiClient.put<Assignment>(
        API_ENDPOINTS.assignments.update(id),
        data
      );
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Delete assignment (instructor only)
   * Backend endpoint: DELETE /api/assignments/{id}
   */
  async deleteAssignment(id: string): Promise<void> {
    if (API_CONFIG.useMockData) {
      await new Promise(resolve => setTimeout(resolve, 500));
      return;
    }

    try {
      await apiClient.delete(API_ENDPOINTS.assignments.delete(id));
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }
}

export const assignmentService = new AssignmentService();
