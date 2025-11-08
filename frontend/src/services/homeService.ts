/**
 * Home Service
 * Handles home page data including stats, featured courses, and testimonials
 */

import apiClient, { handleApiError } from './api';
import { API_CONFIG, API_ENDPOINTS } from '@/config/api.config';

export interface HomeStats {
  total_students: number;
  total_courses: number;
  success_rate: number;
  total_instructors: number;
  active_enrollments: number;
  certificates_issued: number;
}

export interface FeaturedCourse {
  id: string;
  title: string;
  instructor: string;
  category: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  duration: string;
  students: number;
  rating: number;
  description: string;
}

export interface Testimonial {
  id: string;
  student_name: string;
  course_title: string;
  rating: number;
  comment: string;
  date: string;
  avatar?: string;
}

// Mock data
const MOCK_STATS: HomeStats = {
  total_students: 15000,
  total_courses: 500,
  success_rate: 98,
  total_instructors: 250,
  active_enrollments: 12500,
  certificates_issued: 8500,
};

const MOCK_FEATURED_COURSES: FeaturedCourse[] = [
  {
    id: '1',
    title: 'Advanced Computer Science',
    instructor: 'Dr. Sarah Johnson',
    category: 'Technology',
    level: 'Advanced',
    duration: '12 weeks',
    students: 1240,
    rating: 4.9,
    description: 'Master advanced programming concepts, algorithms, and software architecture',
  },
  {
    id: '2',
    title: 'Sustainable Engineering',
    instructor: 'Prof. Michael Chen',
    category: 'Engineering',
    level: 'Intermediate',
    duration: '10 weeks',
    students: 856,
    rating: 4.8,
    description: 'Learn sustainable engineering practices and environmental design',
  },
  {
    id: '3',
    title: 'Digital Marketing Strategy',
    instructor: 'Dr. Emily Davis',
    category: 'Business',
    level: 'Beginner',
    duration: '8 weeks',
    students: 2100,
    rating: 4.7,
    description: 'Comprehensive digital marketing strategies for the modern business',
  },
];

const MOCK_TESTIMONIALS: Testimonial[] = [
  {
    id: '1',
    student_name: 'John Mwalimu',
    course_title: 'Advanced Database Systems',
    rating: 5,
    comment: 'Excellent course! The instructor explains complex concepts very clearly.',
    date: '2024-11-15',
  },
  {
    id: '2',
    student_name: 'Grace Kikoti',
    course_title: 'Machine Learning Fundamentals',
    rating: 5,
    comment: 'Best ML course I have taken. Real-world examples make learning engaging.',
    date: '2024-11-10',
  },
];

class HomeService {
  /**
   * Get platform statistics for home page
   * Backend endpoint: GET /api/public/stats
   */
  async getHomeStats(): Promise<HomeStats> {
    if (API_CONFIG.useMockData) {
      await new Promise(resolve => setTimeout(resolve, 300));
      return MOCK_STATS;
    }

    try {
      const response = await apiClient.get<HomeStats>('/api/public/stats');
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Get featured courses for home page
   * Backend endpoint: GET /api/public/featured-courses
   */
  async getFeaturedCourses(limit: number = 3): Promise<FeaturedCourse[]> {
    if (API_CONFIG.useMockData) {
      await new Promise(resolve => setTimeout(resolve, 300));
      return MOCK_FEATURED_COURSES.slice(0, limit);
    }

    try {
      const response = await apiClient.get<FeaturedCourse[]>(
        '/api/public/featured-courses',
        { params: { limit } }
      );
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Get testimonials for home page
   * Backend endpoint: GET /api/public/testimonials
   */
  async getTestimonials(limit: number = 6): Promise<Testimonial[]> {
    if (API_CONFIG.useMockData) {
      await new Promise(resolve => setTimeout(resolve, 300));
      return MOCK_TESTIMONIALS.slice(0, limit);
    }

    try {
      const response = await apiClient.get<Testimonial[]>(
        '/api/public/testimonials',
        { params: { limit } }
      );
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Search courses from home page
   * Backend endpoint: GET /api/public/search
   */
  async searchCourses(query: string): Promise<FeaturedCourse[]> {
    if (API_CONFIG.useMockData) {
      await new Promise(resolve => setTimeout(resolve, 300));
      return MOCK_FEATURED_COURSES.filter(
        course =>
          course.title.toLowerCase().includes(query.toLowerCase()) ||
          course.description.toLowerCase().includes(query.toLowerCase())
      );
    }

    try {
      const response = await apiClient.get<FeaturedCourse[]>(
        '/api/public/search',
        { params: { q: query } }
      );
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }
}

export const homeService = new HomeService();
