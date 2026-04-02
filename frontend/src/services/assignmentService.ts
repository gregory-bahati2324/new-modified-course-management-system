// src/services/assignmentService.ts
import { apiAssessmentClient, handleApiError } from './assessmentsapi';
import { API_ENDPOINTS } from '@/config/api.config';

export interface AssignmentCreate {
  title: string;
  description?: string;
  instructions?: string;
  course_id: string;
  due_date: string;
  total_points?: number;
  status?: 'draft' | 'published' | 'closed';
}

export interface Assignment {
  id: string;
  title: string;
  description: string;
  instructions?: string;
  course_id: string;
  due_date?: string;
  total_points?: number;

  file_url?: string; // ✅ NEW (important for frontend later)

  submitted: boolean;
  graded: boolean;
  status: 'draft' | 'published' | 'closed';
  created_at: string;
  updated_at: string;
}

class AssignmentService {
  async createAssignment(data: FormData): Promise<Assignment> {
    try {
      const token = localStorage.getItem('accessToken');

      const response = await apiAssessmentClient.post<Assignment>(
        API_ENDPOINTS.assignments.create,
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data', // ✅ IMPORTANT
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
  async updateAssignment(id: string, data: FormData): Promise<Assignment> {
    try {
      const token = localStorage.getItem('accessToken');

      const response = await apiAssessmentClient.put(
        API_ENDPOINTS.assignments.update(id),
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data"
          },
        }
      );

      return response.data;

    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }
  async deleteAssignment(id: string): Promise<void> {
    try {
      const token = localStorage.getItem('accessToken');

      await apiAssessmentClient.delete(
        API_ENDPOINTS.assignments.delete(id),
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }
}

export const assignmentService = new AssignmentService();
