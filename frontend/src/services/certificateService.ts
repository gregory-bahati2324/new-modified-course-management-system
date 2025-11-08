/**
 * Certificate Service
 * Maps to FastAPI /api/certificates/* endpoints
 */

import apiClient, { handleApiError } from './api';
import { API_CONFIG, API_ENDPOINTS } from '@/config/api.config';

export interface Certificate {
  id: string;
  course_id: string;
  course_code: string;
  title: string;
  instructor: string;
  completion_date: string;
  grade: string;
  credential_id: string;
  skills: string[];
  verification_url: string;
  status: 'issued' | 'revoked';
  student_id: string;
  student_name: string;
  pdf_url?: string;
}

export interface InProgressCourse {
  id: string;
  title: string;
  course_code: string;
  instructor: string;
  progress: number;
  estimated_completion: string;
  current_grade: string;
  requirements_completed: number;
  total_requirements: number;
  status: 'in_progress';
}

export interface AvailableCourse {
  id: string;
  title: string;
  course_code: string;
  instructor: string;
  duration: string;
  prerequisites: string[];
  skills: string[];
  enrollment_deadline: string;
  status: 'available';
}

// Mock data
const MOCK_EARNED_CERTIFICATES: Certificate[] = [
  {
    id: '1',
    course_id: '1',
    course_code: 'CS 301',
    title: 'Database Systems Fundamentals',
    instructor: 'Dr. Emily Davis',
    completion_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    grade: 'A',
    credential_id: 'MUST-CS301-2024-001234',
    skills: ['SQL', 'Database Design', 'Normalization', 'Query Optimization'],
    verification_url: 'https://verify.must.ac.tz/cert/001234',
    status: 'issued',
    student_id: 'student-1',
    student_name: 'John Doe',
  },
];

const MOCK_IN_PROGRESS: InProgressCourse[] = [
  {
    id: '4',
    title: 'Advanced Database Systems',
    course_code: 'CS 401',
    instructor: 'Dr. Sarah Johnson',
    progress: 75,
    estimated_completion: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    current_grade: 'A-',
    requirements_completed: 8,
    total_requirements: 10,
    status: 'in_progress',
  },
];

const MOCK_AVAILABLE: AvailableCourse[] = [
  {
    id: '7',
    title: 'Artificial Intelligence',
    course_code: 'CS 461',
    instructor: 'Dr. Michael Thompson',
    duration: '16 weeks',
    prerequisites: ['Data Structures', 'Algorithms', 'Statistics'],
    skills: ['AI Algorithms', 'Neural Networks', 'Expert Systems'],
    enrollment_deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'available',
  },
];

class CertificateService {
  /**
   * Get all earned certificates for current student
   * Backend endpoint: GET /api/certificates
   */
  async getEarnedCertificates(): Promise<Certificate[]> {
    if (API_CONFIG.useMockData) {
      await new Promise(resolve => setTimeout(resolve, 500));
      return MOCK_EARNED_CERTIFICATES;
    }

    try {
      const response = await apiClient.get<Certificate[]>(API_ENDPOINTS.certificates.list);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Get certificate by ID
   * Backend endpoint: GET /api/certificates/{id}
   */
  async getCertificateById(id: string): Promise<Certificate> {
    if (API_CONFIG.useMockData) {
      await new Promise(resolve => setTimeout(resolve, 500));
      const cert = MOCK_EARNED_CERTIFICATES.find(c => c.id === id);
      if (!cert) throw new Error('Certificate not found');
      return cert;
    }

    try {
      const response = await apiClient.get<Certificate>(
        API_ENDPOINTS.certificates.detail(id)
      );
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Generate certificate for completed course
   * Backend endpoint: POST /api/certificates/generate/{courseId}
   */
  async generateCertificate(courseId: string): Promise<Certificate> {
    if (API_CONFIG.useMockData) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newCert: Certificate = {
        id: `cert-${Date.now()}`,
        course_id: courseId,
        course_code: 'CS XXX',
        title: 'Course Title',
        instructor: 'Instructor Name',
        completion_date: new Date().toISOString(),
        grade: 'A',
        credential_id: `MUST-${Date.now()}`,
        skills: [],
        verification_url: `https://verify.must.ac.tz/cert/${Date.now()}`,
        status: 'issued',
        student_id: 'student-1',
        student_name: 'John Doe',
      };
      
      return newCert;
    }

    try {
      const response = await apiClient.post<Certificate>(
        API_ENDPOINTS.certificates.generate(courseId)
      );
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Verify certificate authenticity
   * Backend endpoint: GET /api/certificates/verify/{id}
   */
  async verifyCertificate(id: string): Promise<{
    valid: boolean;
    certificate?: Certificate;
    message: string;
  }> {
    if (API_CONFIG.useMockData) {
      await new Promise(resolve => setTimeout(resolve, 500));
      const cert = MOCK_EARNED_CERTIFICATES.find(c => c.id === id);
      
      return {
        valid: !!cert && cert.status === 'issued',
        certificate: cert,
        message: cert ? 'Certificate is valid' : 'Certificate not found',
      };
    }

    try {
      const response = await apiClient.get(
        API_ENDPOINTS.certificates.verify(id)
      );
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Get in-progress courses (for certificate tracking)
   * Backend endpoint: GET /api/courses (filtered by enrollment status)
   */
  async getInProgressCourses(): Promise<InProgressCourse[]> {
    if (API_CONFIG.useMockData) {
      await new Promise(resolve => setTimeout(resolve, 500));
      return MOCK_IN_PROGRESS;
    }

    try {
      const response = await apiClient.get<InProgressCourse[]>(
        API_ENDPOINTS.courses.list,
        { params: { status: 'in_progress' } }
      );
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Get available courses for enrollment
   * Backend endpoint: GET /api/courses (filtered by available status)
   */
  async getAvailableCourses(): Promise<AvailableCourse[]> {
    if (API_CONFIG.useMockData) {
      await new Promise(resolve => setTimeout(resolve, 500));
      return MOCK_AVAILABLE;
    }

    try {
      const response = await apiClient.get<AvailableCourse[]>(
        API_ENDPOINTS.courses.list,
        { params: { status: 'available' } }
      );
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Download certificate PDF
   * Backend endpoint: GET /api/certificates/{id}/download
   */
  async downloadCertificate(id: string): Promise<Blob> {
    if (API_CONFIG.useMockData) {
      await new Promise(resolve => setTimeout(resolve, 500));
      // Return a mock blob for testing
      return new Blob(['Mock PDF content'], { type: 'application/pdf' });
    }

    try {
      const response = await apiClient.get(
        `${API_ENDPOINTS.certificates.detail(id)}/download`,
        { responseType: 'blob' }
      );
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }
}

export const certificateService = new CertificateService();
