/**
 * Profile Service
 * Maps to FastAPI /api/profile/* endpoints
 */

import apiClient, { handleApiError } from './api';
import { API_CONFIG, API_ENDPOINTS } from '@/config/api.config';

export interface UserProfile {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: 'student' | 'instructor' | 'admin';
  student_id?: string;
  phone?: string;
  address?: string;
  program?: string;
  level?: string;
  year?: string;
  enrollment_date?: string;
  avatar_url?: string;
  bio?: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

export interface UpdateProfileRequest {
  first_name?: string;
  last_name?: string;
  phone?: string;
  address?: string;
  bio?: string;
}

export interface ChangePasswordRequest {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

// Mock data
const MOCK_PROFILE: UserProfile = {
  id: 'student-1',
  email: 'john.doe@must.ac.tz',
  first_name: 'John',
  last_name: 'Doe',
  role: 'student',
  student_id: 'MUST/CS/2024/001',
  phone: '+255 123 456 789',
  address: 'Dar es Salaam, Tanzania',
  program: 'Computer Science',
  level: 'Level 3',
  year: '2024/2025',
  enrollment_date: 'September 2022',
  avatar_url: undefined,
  bio: 'Computer Science student passionate about software development.',
  created_at: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
  updated_at: new Date().toISOString(),
  is_active: true,
};

class ProfileService {
  /**
   * Get current user's profile
   * Backend endpoint: GET /api/profile
   */
  async getProfile(): Promise<UserProfile> {
    if (API_CONFIG.useMockData) {
      await new Promise(resolve => setTimeout(resolve, 500));
      return MOCK_PROFILE;
    }

    try {
      const response = await apiClient.get<UserProfile>(API_ENDPOINTS.profile.get);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Update user profile
   * Backend endpoint: PUT /api/profile
   */
  async updateProfile(data: UpdateProfileRequest): Promise<UserProfile> {
    if (API_CONFIG.useMockData) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return {
        ...MOCK_PROFILE,
        ...data,
        updated_at: new Date().toISOString(),
      };
    }

    try {
      const response = await apiClient.put<UserProfile>(
        API_ENDPOINTS.profile.update,
        data
      );
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Upload profile avatar
   * Backend endpoint: POST /api/profile/avatar
   */
  async uploadAvatar(file: File): Promise<{ avatar_url: string }> {
    if (API_CONFIG.useMockData) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return {
        avatar_url: URL.createObjectURL(file),
      };
    }

    try {
      const formData = new FormData();
      formData.append('avatar', file);

      const response = await apiClient.post<{ avatar_url: string }>(
        API_ENDPOINTS.profile.uploadAvatar,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Change user password
   * Backend endpoint: POST /api/profile/change-password
   */
  async changePassword(data: ChangePasswordRequest): Promise<{ message: string }> {
    if (API_CONFIG.useMockData) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (data.new_password !== data.confirm_password) {
        throw new Error('Passwords do not match');
      }
      
      return {
        message: 'Password changed successfully',
      };
    }

    try {
      const response = await apiClient.post<{ message: string }>(
        `${API_ENDPOINTS.profile.update}/change-password`,
        {
          current_password: data.current_password,
          new_password: data.new_password,
        }
      );
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Delete profile avatar
   * Backend endpoint: DELETE /api/profile/avatar
   */
  async deleteAvatar(): Promise<void> {
    if (API_CONFIG.useMockData) {
      await new Promise(resolve => setTimeout(resolve, 500));
      return;
    }

    try {
      await apiClient.delete(API_ENDPOINTS.profile.uploadAvatar);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Get public profile by user ID
   * Backend endpoint: GET /api/profile/{userId}
   */
  async getPublicProfile(userId: string): Promise<Partial<UserProfile>> {
    if (API_CONFIG.useMockData) {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return {
        id: userId,
        first_name: 'John',
        last_name: 'Doe',
        role: 'student',
        avatar_url: undefined,
        bio: 'Computer Science student',
      };
    }

    try {
      const response = await apiClient.get<Partial<UserProfile>>(
        `${API_ENDPOINTS.profile.get}/${userId}`
      );
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }
}

export const profileService = new ProfileService();
