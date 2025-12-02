// src/services/assignmentService.ts
import { apiAssessmentClient, handleApiError } from './assessmentsapi';
import { API_ENDPOINTS } from '@/config/api.config';

export interface AssignmentCreate {
  title: string;
  type: 'assignment' | 'quiz' | 'exam' | 'project' | 'discussion';
  description?: string;
  instructions?: string;
  course_id: string;
  module_id?: string | null;   // match backend field name
  due_date: string;            // ISO string, required
  attempts?: number;
  time_limit?: number | null;
  total_points?: number;
  status?: 'draft' | 'published' | 'closed';
}

export interface Assignment {
  id: string;
  title: string;
  description: string;
  instructions?: string;
  course_id: string;
  module?: string;
  due_date?: string;
  total_points?: number;
  submitted: boolean;
  graded: boolean;
  status: 'draft' | 'published' | 'closed';
  created_at: string;
  updated_at: string;
}

class AssignmentService {
  async createAssignment(data: AssignmentCreate): Promise<Assignment> {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await apiAssessmentClient.post<Assignment>(
        API_ENDPOINTS.assignments.create,
        data,
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

  async getAssignments(): Promise<Assignment[]> {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await apiAssessmentClient.get<Assignment[]>(
        API_ENDPOINTS.assignments.list,
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

  async getAssignment(id: string): Promise<Assignment> {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await apiAssessmentClient.get<Assignment>(
        API_ENDPOINTS.assignments.detail(id),
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

export const assignmentService = new AssignmentService();
