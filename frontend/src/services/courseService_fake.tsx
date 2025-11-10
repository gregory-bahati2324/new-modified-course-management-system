/**
 * Course Service
 * Maps to FastAPI /api/courses/* endpoints
 */

import apiClient, { handleApiError } from './api';
import { API_CONFIG, API_ENDPOINTS } from '@/config/api.config';

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

export interface CourseDetail extends Course {
  syllabus?: string;
  prerequisites?: string[];
  learning_outcomes?: string[];
  modules?: Module[];
}

export interface Module {
  id: string;
  course_id: string;
  title: string;
  description: string;
  order: number;
  lessons: Lesson[];
}

export interface Lesson {
  id: string;
  module_id: string;
  title: string;
  type: 'video' | 'reading' | 'quiz' | 'assignment' | 'lab';
  content?: string;
  video_url?: string;
  duration?: number;
  order: number;
  is_completed?: boolean;
}

export interface CreateCourseRequest {
  code: string;
  title: string;
  description: string;
  category: string;
  level: string;
  duration: string;
  syllabus?: string;
  prerequisites?: string[];
  learning_outcomes?: string[];
}

// Mock data
const MOCK_COURSES: Course[] = [
  {
    id: '1',
    code: 'CS 401',
    title: 'Advanced Web Development',
    description: 'Master modern web development with React, TypeScript, and Node.js',
    instructor_id: 'instructor-1',
    instructor_name: 'Dr. Jane Smith',
    category: 'Computer Science',
    level: 'Advanced',
    duration: '12 weeks',
    students_enrolled: 45,
    rating: 4.8,
    image_url: '/placeholder.svg',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    is_published: true,
  },
  {
    id: '2',
    code: 'DATA 301',
    title: 'Data Science Fundamentals',
    description: 'Learn Python, statistics, and machine learning basics',
    instructor_id: 'instructor-1',
    instructor_name: 'Prof. John Doe',
    category: 'Data Science',
    level: 'Intermediate',
    duration: '10 weeks',
    students_enrolled: 67,
    rating: 4.9,
    image_url: '/placeholder.svg',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    is_published: true,
  },
];

class CourseService {
  /**
   * Get all courses
   * Backend endpoint: GET /api/courses
   */
  async getCourses(params?: {
    category?: string;
    level?: string;
    search?: string;
    page?: number;
    page_size?: number;
  }): Promise<{ courses: Course[]; total: number }> {
    if (API_CONFIG.useMockData) {
      await new Promise(resolve => setTimeout(resolve, 500));
      return { courses: MOCK_COURSES, total: MOCK_COURSES.length };
    }

    try {
      const response = await apiClient.get<{ courses: Course[]; total: number }>(
        API_ENDPOINTS.courses.list,
        { params }
      );
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Get course by ID
   * Backend endpoint: GET /api/courses/{id}
   */
  async getCourseById(id: string): Promise<CourseDetail> {
    if (API_CONFIG.useMockData) {
      await new Promise(resolve => setTimeout(resolve, 500));
      const course = MOCK_COURSES.find(c => c.id === id);
      if (!course) throw new Error('Course not found');
      
      return {
        ...course,
        prerequisites: ['Basic programming knowledge', 'HTML/CSS basics'],
        learning_outcomes: [
          'Build modern web applications',
          'Master React and TypeScript',
          'Deploy production-ready apps',
        ],
        modules: [],
      };
    }

    try {
      const response = await apiClient.get<CourseDetail>(
        API_ENDPOINTS.courses.detail(id)
      );
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Create new course (instructor only)
   * Backend endpoint: POST /api/courses
   */
  async createCourse(data: CreateCourseRequest): Promise<Course> {
    if (API_CONFIG.useMockData) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newCourse: Course = {
        id: `course-${Date.now()}`,
        ...data,
        instructor_id: 'instructor-1',
        instructor_name: 'Current User',
        students_enrolled: 0,
        rating: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        is_published: false,
      };
      
      return newCourse;
    }

    try {
      const response = await apiClient.post<Course>(
        API_ENDPOINTS.courses.create,
        data
      );
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Update course
   * Backend endpoint: PUT /api/courses/{id}
   */
  async updateCourse(id: string, data: Partial<CreateCourseRequest>): Promise<Course> {
    if (API_CONFIG.useMockData) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      const course = MOCK_COURSES.find(c => c.id === id);
      if (!course) throw new Error('Course not found');
      
      return { ...course, ...data, updated_at: new Date().toISOString() };
    }

    try {
      const response = await apiClient.put<Course>(
        API_ENDPOINTS.courses.update(id),
        data
      );
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Delete course
   * Backend endpoint: DELETE /api/courses/{id}
   */
  async deleteCourse(id: string): Promise<void> {
    if (API_CONFIG.useMockData) {
      await new Promise(resolve => setTimeout(resolve, 500));
      return;
    }

    try {
      await apiClient.delete(API_ENDPOINTS.courses.delete(id));
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Enroll in course (student only)
   * Backend endpoint: POST /api/courses/{id}/enroll
   */
  async enrollCourse(id: string): Promise<void> {
    if (API_CONFIG.useMockData) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      return;
    }

    try {
      await apiClient.post(API_ENDPOINTS.courses.enroll(id));
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Unenroll from course
   * Backend endpoint: POST /api/courses/{id}/unenroll
   */
  async unenrollCourse(id: string): Promise<void> {
    if (API_CONFIG.useMockData) {
      await new Promise(resolve => setTimeout(resolve, 500));
      return;
    }

    try {
      await apiClient.post(API_ENDPOINTS.courses.unenroll(id));
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Get enrolled students for a course (instructor only)
   * Backend endpoint: GET /api/courses/{id}/students
   */
  async getCourseStudents(id: string): Promise<any[]> {
    if (API_CONFIG.useMockData) {
      await new Promise(resolve => setTimeout(resolve, 500));
      return [
        {
          id: 'student-1',
          name: 'John Doe',
          email: 'john@example.com',
          enrolled_at: new Date().toISOString(),
          progress: 75,
        },
      ];
    }

    try {
      const response = await apiClient.get(API_ENDPOINTS.courses.students(id));
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }
}

export const courseService = new CourseService();