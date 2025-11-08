import { apiCourseClient, handleApiError } from './apiCourse';
import { API_ENDPOINTS } from '@/config/api.config';

export interface CreateCourseRequest {
  code: string;
  title: string;
  description?: string;
  category?: string;
  level?: string;
  duration?: string;
  max_students?: number;
  prerequisites?: string;
  learning_outcomes?: string;
  tags?: string[];
  is_published?: boolean;
  allow_self_enrollment?: boolean;
  certificate?: boolean;
}

export interface CourseOut extends CreateCourseRequest {
  id: string;
  instructor_id: string;
  created_at: string;
  updated_at: string;
}

class CourseService {
  async createCourse(data: CreateCourseRequest): Promise<CourseOut> {
    try {
      const response = await apiCourseClient.post<CourseOut>(API_ENDPOINTS.courses.create, data);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }
}

export const courseService = new CourseService();
