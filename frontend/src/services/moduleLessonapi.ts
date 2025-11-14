// src/services/api.ts
import { API_CONFIG_MODULE_LESSON } from "../config/api.config";
import axios, { AxiosInstance } from 'axios';
import { getToken, setToken, handleApiError } from './api';
import { authService } from './authService'; // your authService with refreshToken function


export const apiModuleClient: AxiosInstance = axios.create({
  baseURL: API_CONFIG_MODULE_LESSON.baseURL, // port 8002
  timeout: API_CONFIG_MODULE_LESSON.timeout,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token automatically to each request
apiModuleClient.interceptors.request.use(config => {
  const token = getToken();
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor to handle expired tokens
apiModuleClient.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;

    // If 401 Unauthorized and request not already retried
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Attempt to get a new access token using refresh token
        const newToken = await authService.refreshToken();
        if (newToken) {
          // Save new token
          setToken(newToken);

          // Update the failed request's Authorization header
          originalRequest.headers['Authorization'] = `Bearer ${newToken}`;

          // Retry the original request
          return apiModuleClient(originalRequest);
        }
      } catch (refreshError) {
        console.error('Refresh token failed', refreshError);
        // Optional: logout user or redirect to login page
      }
    }

    // Reject if not handled
    return Promise.reject(error);
  }
);




export {handleApiError};
