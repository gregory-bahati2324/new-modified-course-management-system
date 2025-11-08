/**
 * api.ts
 * Base API Service with Axios
 * Handles JWT authentication, interceptors, and error handling
 */

import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { API_CONFIG } from '@/config/api.config';
import { authService } from './authService';

// =========================
// TOKEN MANAGEMENT
// =========================
const TOKEN_KEY = 'auth_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

export const getToken = (): string | null => localStorage.getItem(TOKEN_KEY);
export const setToken = (token: string) => localStorage.setItem(TOKEN_KEY, token);
export const getRefreshToken = (): string | null => localStorage.getItem(REFRESH_TOKEN_KEY);
export const setRefreshToken = (token: string) => localStorage.setItem(REFRESH_TOKEN_KEY, token);
export const removeTokens = (): void => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
};

// =========================
// AXIOS INSTANCE
// =========================
const apiClient: AxiosInstance = axios.create({
  baseURL: API_CONFIG.baseURL,
  timeout: API_CONFIG.timeout,
  headers: { 'Content-Type': 'application/json' },
});

// =========================
// REQUEST INTERCEPTOR
// =========================
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

// =========================
// RESPONSE INTERCEPTOR
// =========================
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const newToken = await authService.refreshToken();
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
        }
        return apiClient(originalRequest);
      } catch (refreshError) {
        removeTokens();
        window.location.href = '/auth/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// =========================
// ERROR HANDLER HELPER
// =========================
export const handleApiError = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<{ detail?: string; message?: string }>;
    return axiosError.response?.data?.detail ||
           axiosError.response?.data?.message ||
           axiosError.message ||
           'An unexpected error occurred';
  }
  return 'An unexpected error occurred';
};

export default apiClient;
