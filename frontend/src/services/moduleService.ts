/**
 * Module Service
 * Maps to FastAPI /api/modules/* and /api/lessons/* endpoints
 */

import apiClient, { handleApiError } from './api';
import { API_CONFIG, API_ENDPOINTS } from '@/config/api.config';

export interface Module {
  id: string;
  course_id: string;
  title: string;
  description: string;
  order: number;
  duration?: string;
  objectives?: string;
  status: 'draft' | 'active' | 'completed';
  created_at: string;
  updated_at: string;
  lessons?: Lesson[];
}

export interface Lesson {
  id: string;
  module_id: string;
  title: string;
  description?: string;
  type: 'video' | 'reading' | 'quiz' | 'assignment' | 'lab';
  content?: string;
  video_url?: string;
  duration?: number; // in minutes
  order: number;
  is_completed?: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateModuleRequest {
  course_id: string;
  title: string;
  description: string;
  order: number;
  duration?: string;
  objectives?: string;
  status?: 'draft' | 'active' | 'completed';
  lessons?: CreateLessonRequest[];
}

export interface UpdateModuleRequest {
  title?: string;
  description?: string;
  order?: number;
  duration?: string;
  objectives?: string;
  status?: 'draft' | 'active' | 'completed';
}

export interface CreateLessonRequest {
  module_id: string;
  title: string;
  description?: string;
  type: 'video' | 'reading' | 'quiz' | 'assignment' | 'lab';
  content?: string;
  video_url?: string;
  duration?: number;
  order: number;
}

export interface UpdateLessonRequest {
  title?: string;
  description?: string;
  type?: 'video' | 'reading' | 'quiz' | 'assignment' | 'lab';
  content?: string;
  video_url?: string;
  duration?: number;
  order?: number;
}

export interface ReorderRequest {
  items: { id: string; order: number }[];
}

// Mock data
const MOCK_MODULES: Module[] = [
  {
    id: '1',
    course_id: '1',
    title: 'Introduction to React',
    description: 'Learn the basics of React and component-based architecture',
    order: 1,
    duration: '2 weeks',
    objectives: 'Understand React fundamentals, Create basic components, Manage state',
    status: 'active',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    lessons: [],
  },
];

class ModuleService {
  /**
   * Get all modules for a course
   * Backend endpoint: GET /api/courses/{courseId}/modules
   */
  async getModulesByCourse(courseId: string): Promise<Module[]> {
    if (API_CONFIG.useMockData) {
      await new Promise(resolve => setTimeout(resolve, 500));
      return MOCK_MODULES.filter(m => m.course_id === courseId);
    }

    try {
      const response = await apiClient.get<Module[]>(
        API_ENDPOINTS.modules.list(courseId)
      );
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Get module by ID with lessons
   * Backend endpoint: GET /api/modules/{id}
   */
  async getModuleById(id: string): Promise<Module> {
    if (API_CONFIG.useMockData) {
      await new Promise(resolve => setTimeout(resolve, 500));
      const module = MOCK_MODULES.find(m => m.id === id);
      if (!module) throw new Error('Module not found');
      return module;
    }

    try {
      const response = await apiClient.get<Module>(
        API_ENDPOINTS.modules.detail(id)
      );
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Create a new module
   * Backend endpoint: POST /api/modules
   */
  async createModule(data: CreateModuleRequest): Promise<Module> {
    if (API_CONFIG.useMockData) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newModule: Module = {
        id: `module-${Date.now()}`,
        course_id: data.course_id,
        title: data.title,
        description: data.description,
        order: data.order,
        duration: data.duration,
        objectives: data.objectives,
        status: data.status || 'draft',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        lessons: [],
      };
      
      return newModule;
    }

    try {
      const response = await apiClient.post<Module>(
        API_ENDPOINTS.modules.create,
        data
      );
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Update a module
   * Backend endpoint: PUT /api/modules/{id}
   */
  async updateModule(id: string, data: UpdateModuleRequest): Promise<Module> {
    if (API_CONFIG.useMockData) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      const module = MOCK_MODULES.find(m => m.id === id);
      if (!module) throw new Error('Module not found');
      
      return {
        ...module,
        ...data,
        updated_at: new Date().toISOString(),
      };
    }

    try {
      const response = await apiClient.put<Module>(
        API_ENDPOINTS.modules.update(id),
        data
      );
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Delete a module
   * Backend endpoint: DELETE /api/modules/{id}
   */
  async deleteModule(id: string): Promise<void> {
    if (API_CONFIG.useMockData) {
      await new Promise(resolve => setTimeout(resolve, 500));
      return;
    }

    try {
      await apiClient.delete(API_ENDPOINTS.modules.delete(id));
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Reorder modules
   * Backend endpoint: POST /api/modules/reorder
   */
  async reorderModules(data: ReorderRequest): Promise<void> {
    if (API_CONFIG.useMockData) {
      await new Promise(resolve => setTimeout(resolve, 500));
      return;
    }

    try {
      await apiClient.post(API_ENDPOINTS.modules.reorder, data);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Get lessons for a module
   * Backend endpoint: GET /api/modules/{moduleId}/lessons
   */
  async getLessonsByModule(moduleId: string): Promise<Lesson[]> {
    if (API_CONFIG.useMockData) {
      await new Promise(resolve => setTimeout(resolve, 500));
      return [];
    }

    try {
      const response = await apiClient.get<Lesson[]>(
        API_ENDPOINTS.lessons.list(moduleId)
      );
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Get lesson by ID
   * Backend endpoint: GET /api/lessons/{id}
   */
  async getLessonById(id: string): Promise<Lesson> {
    if (API_CONFIG.useMockData) {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const mockLesson: Lesson = {
        id,
        module_id: '1',
        title: 'Introduction to Components',
        description: 'Learn about React components',
        type: 'video',
        video_url: 'https://example.com/video.mp4',
        duration: 30,
        order: 1,
        is_completed: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      
      return mockLesson;
    }

    try {
      const response = await apiClient.get<Lesson>(
        API_ENDPOINTS.lessons.detail(id)
      );
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Create a new lesson
   * Backend endpoint: POST /api/lessons
   */
  async createLesson(data: CreateLessonRequest): Promise<Lesson> {
    if (API_CONFIG.useMockData) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newLesson: Lesson = {
        id: `lesson-${Date.now()}`,
        module_id: data.module_id,
        title: data.title,
        description: data.description,
        type: data.type,
        content: data.content,
        video_url: data.video_url,
        duration: data.duration,
        order: data.order,
        is_completed: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      
      return newLesson;
    }

    try {
      const response = await apiClient.post<Lesson>(
        API_ENDPOINTS.lessons.create,
        data
      );
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Update a lesson
   * Backend endpoint: PUT /api/lessons/{id}
   */
  async updateLesson(id: string, data: UpdateLessonRequest): Promise<Lesson> {
    if (API_CONFIG.useMockData) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockLesson: Lesson = {
        id,
        module_id: '1',
        title: data.title || 'Lesson Title',
        description: data.description,
        type: data.type || 'video',
        content: data.content,
        video_url: data.video_url,
        duration: data.duration,
        order: data.order || 1,
        is_completed: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      
      return mockLesson;
    }

    try {
      const response = await apiClient.put<Lesson>(
        API_ENDPOINTS.lessons.update(id),
        data
      );
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Delete a lesson
   * Backend endpoint: DELETE /api/lessons/{id}
   */
  async deleteLesson(id: string): Promise<void> {
    if (API_CONFIG.useMockData) {
      await new Promise(resolve => setTimeout(resolve, 500));
      return;
    }

    try {
      await apiClient.delete(API_ENDPOINTS.lessons.delete(id));
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Mark lesson as complete
   * Backend endpoint: POST /api/lessons/{id}/complete
   */
  async completeLesson(id: string): Promise<void> {
    if (API_CONFIG.useMockData) {
      await new Promise(resolve => setTimeout(resolve, 500));
      return;
    }

    try {
      await apiClient.post(API_ENDPOINTS.lessons.complete(id));
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }
}

export const moduleService = new ModuleService();
