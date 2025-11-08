import apiClient, { setToken, setRefreshToken, removeTokens, handleApiError } from './api';
import { API_ENDPOINTS } from '@/config/api.config';

export type UserRole = 'student' | 'instructor' | 'admin';

export interface UserProfile {
  id: string;
  registrationNumber: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  avatar_url?: string;
  bio?: string;
  created_at: string;
  is_active: boolean;
}

export interface LoginRequest {
  registrationNumber: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  user: UserProfile;
}

class AuthService {
  private currentUser: UserProfile | null = null;

  async login(data: LoginRequest): Promise<UserProfile> {
    try {
      const response = await apiClient.post<LoginResponse>(API_ENDPOINTS.auth.login, data);

      // Store tokens
      setToken(response.data.access_token);
      setRefreshToken(response.data.refresh_token);

      // Cache user locally
      this.currentUser = response.data.user;
      localStorage.setItem('user_profile', JSON.stringify(this.currentUser));

      return response.data.user;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async getCurrentUser(): Promise<UserProfile> {
    if (this.currentUser) return this.currentUser;

    const cached = localStorage.getItem('user_profile');
    if (cached) {
      this.currentUser = JSON.parse(cached);
      return this.currentUser;
    }

    try {
      const response = await apiClient.get<UserProfile>(API_ENDPOINTS.auth.me);
      this.currentUser = response.data;
      localStorage.setItem('user_profile', JSON.stringify(this.currentUser));
      return response.data;
    } catch (error) {
      removeTokens();
      throw new Error(handleApiError(error));
    }
  }

  logout(): void {
    removeTokens();
    localStorage.removeItem('user_profile');
    this.currentUser = null;
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('auth_token');
  }

  async refreshToken(): Promise<string> {
  const refreshToken = localStorage.getItem('refresh_token');
  if (!refreshToken) throw new Error('No refresh token found');

  try {
    const response = await apiClient.post<{ access_token: string; user: UserProfile }>(
      API_ENDPOINTS.auth.refresh,
      { refresh_token: refreshToken }
    );

    // Update tokens
    setToken(response.data.access_token);

    // Optionally update cached user if backend returns user data
    if (response.data.user) {
      this.currentUser = response.data.user;
      localStorage.setItem('user_profile', JSON.stringify(this.currentUser));
    }

    return response.data.access_token;
  } catch (error) {
    removeTokens();
    localStorage.removeItem('user_profile');
    this.currentUser = null;
    throw new Error(handleApiError(error));
  }
}

}



export const authService = new AuthService();
