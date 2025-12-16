import { departments } from '@/data/universityStructure';
import { apiCourseClient, handleApiError } from './apiCourse';
import { API_ENDPOINTS } from '@/config/api.config';

export interface CreateCourseRequest {
  code: string;
  title: string;
  description?: string;
  category?: string;
  department?: string;
  level?: string;
  course_type?: string;
  year_of_study?: number;
  semester?: '1' | '2';
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

  async getCourseNameById(courseId: string): Promise<string> {
    try {
      const token = localStorage.getItem('accessToken');

      const response = await apiCourseClient.get<Course>(
        API_ENDPOINTS.courses.getCourse(courseId),
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return response.data.title;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async getMyCourses(params?: {
    college?: string;
    department?: string;
    level?: string;
    type?: string;
    skip?: number;
    limit?: number;
  }): Promise<{ courses: Course[] }> {
    try {
      const token = localStorage.getItem('accessToken');

      const response = await apiCourseClient.get<Course[]>(
        API_ENDPOINTS.courses.getMycourse(params.college, params.department, params.level, params.type),
        {
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

  //get all courses
  async getAllCourses(): Promise<{ courses: Course[] }> {
    try {
      const token = localStorage.getItem('accessToken');

      const response = await apiCourseClient.get<Course[]>(
        API_ENDPOINTS.courses.list,
        {
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

  // Filter courses for students
  async getStudentFilteredCourses(params: {
    category?: string;
    department?: string;
    level?: string;
    type?: string;
    duration?: string;
  }): Promise<{ courses: Course[] }> {
    try {
      const token = localStorage.getItem('accessToken');

      const response = await apiCourseClient.get<Course[]>(
        API_ENDPOINTS.courses.studentCourseFilter, // 👈 no params in URL
        {
          params: {
            category: params.category || undefined,
            department: params.department || undefined,
            level: params.level || undefined,
            type: params.type || undefined,
            duration: params.duration || undefined,
          },
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

export interface Course extends CreateCourseRequest {
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
  max_students?: number;
  course_type: string;
  year_of_study?: number;
  semester?: '1' | '2';
  rating: number;
  image_url?: string;
  created_at: string;
  updated_at: string;
  is_published: boolean;
}



export const courseService = new CourseService();
