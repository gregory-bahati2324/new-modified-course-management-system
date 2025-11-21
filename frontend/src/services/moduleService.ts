import { apiModuleClient, handleApiError } from './moduleLessonapi';
import { API_ENDPOINTS } from '@/config/api.config';

export interface Module {
  id: string;
  course_id: string;
  title: string;
  description?: string;
  order: number;
  lessons?: Lesson[];
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

export interface CreateModuleRequest {
  course_id: string;
  title: string;
  description?: string;
  order?: number;
}

export class ModuleService {
  async getModules(courseId: string): Promise<{ data: Module[] }> {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await apiModuleClient.get<Module[]>(
        API_ENDPOINTS.modules.get_course_module(courseId),
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      return { data: response.data };
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async getModuleById(moduleId: string): Promise<Module> {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await apiModuleClient.get<Module>(
        API_ENDPOINTS.modules.detail(moduleId),
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async createModule(data: CreateModuleRequest): Promise<Module> {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await apiModuleClient.post<Module>(
        API_ENDPOINTS.modules.create,   // '/modules'
        data,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }


  async updateModule(moduleId: string, data: Partial<CreateModuleRequest>): Promise<Module> {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await apiModuleClient.put<Module>(
        API_ENDPOINTS.modules.update(moduleId),  // `/modules/${id}`
        data,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async deleteModule(moduleId: string): Promise<void> {
    try {
      const token = localStorage.getItem('accessToken');
      await apiModuleClient.delete(
        API_ENDPOINTS.modules.delete(moduleId),
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async reorderModules(orderData: { module_id: string; order: number }[]): Promise<void> {
    try {
      const token = localStorage.getItem('accessToken');
      await apiModuleClient.put(
        API_ENDPOINTS.modules.reorder,   // '/modules/reorder'
        orderData,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }
}

export const moduleService = new ModuleService();
