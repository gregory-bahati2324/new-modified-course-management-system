import { apiCourseClient, handleApiError } from './apiCourse';
import { API_ENDPOINTS } from '@/config/api.config';

export interface CreateCourseRequest {
  code: string;
  title: string;
  description?: string;
  category?: string;
  department?:string;
  level?: string;
  course_type?: string;
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

  // ✅ Get all courses for the current instructor
  async getCourses(params?: { skip?: number; limit?: number }): Promise<{ courses: Course[] }> {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await apiCourseClient.get<Course[]>(
        API_ENDPOINTS.courses.me,
        {
          params,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return { courses: response.data };
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }


  
}

export interface Course {
  id: string;
  code: string;
  title: string;
  description: string;
  instructor_id: string;
  instructor_name: string;
  category: string;
  level: string;
  duration: string;
  students_enrolled: number;
  rating: number;
  image_url?: string;
  created_at: string;
  updated_at: string;
  is_published: boolean;
}



export const courseService = new CourseService();
