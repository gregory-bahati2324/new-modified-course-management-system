/**
 * Admin Service
 * Handles administrative operations including user management, system settings, and platform analytics
 */

import apiClient, { handleApiError } from './api';
import { API_CONFIG, API_ENDPOINTS } from '@/config/api.config';

export interface AdminStats {
  total_users: number;
  total_students: number;
  total_instructors: number;
  total_staff: number;
  active_courses: number;
  total_courses: number;
  draft_courses: number;
  archived_courses: number;
  total_enrollments: number;
  active_enrollments: number;
  certificates_issued: number;
  system_health: 'good' | 'warning' | 'critical';
  uptime_percentage: number;
  storage_used_gb: number;
  storage_total_gb: number;
}

export interface UserManagement {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: 'student' | 'instructor' | 'admin' | 'staff';
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
  last_login?: string;
  department?: string;
  courses_enrolled?: number;
  courses_teaching?: number;
}

export interface PendingApproval {
  id: string;
  type: 'course' | 'user' | 'certificate' | 'enrollment';
  title: string;
  description: string;
  requester: string;
  requester_email: string;
  requested_at: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'approved' | 'rejected';
}

export interface SystemAlert {
  id: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
  title: string;
  message: string;
  timestamp: string;
  resolved: boolean;
  category: 'system' | 'security' | 'performance' | 'user';
}

export interface SystemSettings {
  site_name: string;
  site_url: string;
  maintenance_mode: boolean;
  allow_registrations: boolean;
  require_email_verification: boolean;
  max_file_upload_mb: number;
  session_timeout_minutes: number;
  enable_certificates: boolean;
  enable_forums: boolean;
  default_course_duration_weeks: number;
}

export interface PlatformAnalytics {
  period: {
    start_date: string;
    end_date: string;
  };
  user_growth: {
    students: number[];
    instructors: number[];
    labels: string[];
  };
  course_stats: {
    total_published: number;
    total_draft: number;
    total_archived: number;
    new_this_month: number;
  };
  engagement_metrics: {
    avg_session_duration: number;
    total_assignments_submitted: number;
    total_forum_posts: number;
    completion_rate: number;
  };
  revenue_data?: {
    total: number;
    this_month: number;
    growth_percentage: number;
  };
}

// Mock data
const MOCK_ADMIN_STATS: AdminStats = {
  total_users: 2847,
  total_students: 2450,
  total_instructors: 350,
  total_staff: 47,
  active_courses: 156,
  total_courses: 210,
  draft_courses: 34,
  archived_courses: 20,
  total_enrollments: 12500,
  active_enrollments: 11200,
  certificates_issued: 1234,
  system_health: 'good',
  uptime_percentage: 98.9,
  storage_used_gb: 450,
  storage_total_gb: 1000,
};

const MOCK_USERS: UserManagement[] = [
  {
    id: '1',
    email: 'john.mwalimu@student.must.ac.tz',
    first_name: 'John',
    last_name: 'Mwalimu',
    role: 'student',
    is_active: true,
    is_verified: true,
    created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    last_login: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    department: 'Computer Science',
    courses_enrolled: 5,
  },
  {
    id: '2',
    email: 'm.thompson@must.ac.tz',
    first_name: 'Michael',
    last_name: 'Thompson',
    role: 'instructor',
    is_active: true,
    is_verified: false,
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    department: 'Mathematics',
    courses_teaching: 0,
  },
];

const MOCK_PENDING_APPROVALS: PendingApproval[] = [
  {
    id: '1',
    type: 'course',
    title: 'Advanced Quantum Computing',
    description: 'New course creation request',
    requester: 'Dr. Sarah Johnson',
    requester_email: 's.johnson@must.ac.tz',
    requested_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    priority: 'medium',
    status: 'pending',
  },
  {
    id: '2',
    type: 'user',
    title: 'Instructor Registration',
    description: 'Prof. Michael Chen - Computer Science Department',
    requester: 'Michael Chen',
    requester_email: 'm.chen@must.ac.tz',
    requested_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    priority: 'high',
    status: 'pending',
  },
];

const MOCK_SYSTEM_ALERTS: SystemAlert[] = [
  {
    id: '1',
    severity: 'warning',
    title: 'High Database Load',
    message: 'Database response time increased by 25% in the last hour',
    timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    resolved: false,
    category: 'performance',
  },
  {
    id: '2',
    severity: 'info',
    title: 'Scheduled Maintenance',
    message: 'System maintenance scheduled for Dec 15, 2024 at 2:00 AM',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    resolved: false,
    category: 'system',
  },
];

class AdminService {
  /**
   * Get admin dashboard statistics
   * Backend endpoint: GET /api/admin/stats
   */
  async getAdminStats(): Promise<AdminStats> {
    if (API_CONFIG.useMockData) {
      await new Promise(resolve => setTimeout(resolve, 500));
      return MOCK_ADMIN_STATS;
    }

    try {
      const response = await apiClient.get<AdminStats>(API_ENDPOINTS.admin.stats);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Get all users with filtering and pagination
   * Backend endpoint: GET /api/admin/users
   */
  async getUsers(params?: {
    role?: string;
    search?: string;
    page?: number;
    page_size?: number;
  }): Promise<{ users: UserManagement[]; total: number }> {
    if (API_CONFIG.useMockData) {
      await new Promise(resolve => setTimeout(resolve, 500));
      return { users: MOCK_USERS, total: MOCK_USERS.length };
    }

    try {
      const response = await apiClient.get<{ users: UserManagement[]; total: number }>(
        API_ENDPOINTS.admin.users,
        { params }
      );
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Get pending approvals
   * Backend endpoint: GET /api/admin/approvals/pending
   */
  async getPendingApprovals(type?: string): Promise<PendingApproval[]> {
    if (API_CONFIG.useMockData) {
      await new Promise(resolve => setTimeout(resolve, 500));
      return type
        ? MOCK_PENDING_APPROVALS.filter(a => a.type === type)
        : MOCK_PENDING_APPROVALS;
    }

    try {
      const response = await apiClient.get<PendingApproval[]>(
        '/api/admin/approvals/pending',
        { params: { type } }
      );
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Approve or reject a pending item
   * Backend endpoint: POST /api/admin/approvals/{id}/decision
   */
  async handleApproval(
    id: string,
    action: 'approve' | 'reject',
    reason?: string
  ): Promise<void> {
    if (API_CONFIG.useMockData) {
      await new Promise(resolve => setTimeout(resolve, 500));
      return;
    }

    try {
      await apiClient.post(`/api/admin/approvals/${id}/decision`, {
        action,
        reason,
      });
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Get system alerts
   * Backend endpoint: GET /api/admin/alerts
   */
  async getSystemAlerts(resolved?: boolean): Promise<SystemAlert[]> {
    if (API_CONFIG.useMockData) {
      await new Promise(resolve => setTimeout(resolve, 300));
      return resolved !== undefined
        ? MOCK_SYSTEM_ALERTS.filter(a => a.resolved === resolved)
        : MOCK_SYSTEM_ALERTS;
    }

    try {
      const response = await apiClient.get<SystemAlert[]>(
        '/api/admin/alerts',
        { params: { resolved } }
      );
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Resolve a system alert
   * Backend endpoint: POST /api/admin/alerts/{id}/resolve
   */
  async resolveAlert(id: string): Promise<void> {
    if (API_CONFIG.useMockData) {
      await new Promise(resolve => setTimeout(resolve, 300));
      return;
    }

    try {
      await apiClient.post(`/api/admin/alerts/${id}/resolve`);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Get system settings
   * Backend endpoint: GET /api/admin/settings
   */
  async getSystemSettings(): Promise<SystemSettings> {
    if (API_CONFIG.useMockData) {
      await new Promise(resolve => setTimeout(resolve, 300));
      return {
        site_name: 'MUST Learning Hub',
        site_url: 'https://lms.must.ac.tz',
        maintenance_mode: false,
        allow_registrations: true,
        require_email_verification: true,
        max_file_upload_mb: 100,
        session_timeout_minutes: 60,
        enable_certificates: true,
        enable_forums: true,
        default_course_duration_weeks: 12,
      };
    }

    try {
      const response = await apiClient.get<SystemSettings>(API_ENDPOINTS.admin.settings);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Update system settings
   * Backend endpoint: PUT /api/admin/settings
   */
  async updateSystemSettings(settings: Partial<SystemSettings>): Promise<void> {
    if (API_CONFIG.useMockData) {
      await new Promise(resolve => setTimeout(resolve, 500));
      return;
    }

    try {
      await apiClient.put(API_ENDPOINTS.admin.settings, settings);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Get platform analytics
   * Backend endpoint: GET /api/admin/analytics
   */
  async getPlatformAnalytics(params?: {
    start_date?: string;
    end_date?: string;
  }): Promise<PlatformAnalytics> {
    if (API_CONFIG.useMockData) {
      await new Promise(resolve => setTimeout(resolve, 500));
      return {
        period: {
          start_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          end_date: new Date().toISOString(),
        },
        user_growth: {
          students: [2200, 2250, 2300, 2350, 2400, 2450],
          instructors: [320, 325, 330, 340, 345, 350],
          labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6'],
        },
        course_stats: {
          total_published: 156,
          total_draft: 34,
          total_archived: 20,
          new_this_month: 12,
        },
        engagement_metrics: {
          avg_session_duration: 45,
          total_assignments_submitted: 5420,
          total_forum_posts: 1230,
          completion_rate: 78.5,
        },
      };
    }

    try {
      const response = await apiClient.get<PlatformAnalytics>(
        '/api/admin/analytics',
        { params }
      );
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Delete a user
   * Backend endpoint: DELETE /api/admin/users/{id}
   */
  async deleteUser(id: string): Promise<void> {
    if (API_CONFIG.useMockData) {
      await new Promise(resolve => setTimeout(resolve, 500));
      return;
    }

    try {
      await apiClient.delete(`/api/admin/users/${id}`);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Update user role or status
   * Backend endpoint: PUT /api/admin/users/{id}
   */
  async updateUser(
    id: string,
    data: Partial<UserManagement>
  ): Promise<UserManagement> {
    if (API_CONFIG.useMockData) {
      await new Promise(resolve => setTimeout(resolve, 500));
      return MOCK_USERS[0];
    }

    try {
      const response = await apiClient.put<UserManagement>(
        `/api/admin/users/${id}`,
        data
      );
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Export platform data
   * Backend endpoint: GET /api/admin/export
   */
  async exportData(
    type: 'users' | 'courses' | 'enrollments' | 'analytics',
    format: 'csv' | 'xlsx' | 'pdf' = 'csv'
  ): Promise<Blob> {
    if (API_CONFIG.useMockData) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      return new Blob([`Mock ${type} export data`], { type: 'text/csv' });
    }

    try {
      const response = await apiClient.get(`/api/admin/export`, {
        params: { type, format },
        responseType: 'blob',
      });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }
}

export const adminService = new AdminService();
