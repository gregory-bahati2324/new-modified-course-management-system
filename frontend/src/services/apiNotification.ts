// src/services/apiNotification.ts
import { API_CONFIG_NOTIFICATION } from "../config/api.config";
import axios, { AxiosInstance } from 'axios';
import { getToken, setToken, handleApiError } from './api';
import { authService } from './authService';

export const apiNotificationClient: AxiosInstance = axios.create({
  baseURL: API_CONFIG_NOTIFICATION.baseURL, // port 8007
  timeout: API_CONFIG_NOTIFICATION.timeout,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token automatically to each request
apiNotificationClient.interceptors.request.use(config => {
  const token = getToken();
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor to handle expired tokens
apiNotificationClient.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const newToken = await authService.refreshToken();
        if (newToken) {
          setToken(newToken);
          originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
          return apiNotificationClient(originalRequest);
        }
      } catch (refreshError) {
        console.error('Refresh token failed', refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export { handleApiError };
