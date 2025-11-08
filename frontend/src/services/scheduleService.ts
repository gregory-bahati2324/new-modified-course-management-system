/**
 * Schedule Service
 * Maps to FastAPI /api/schedule/* endpoints
 */

import apiClient, { handleApiError } from './api';
import { API_CONFIG, API_ENDPOINTS } from '@/config/api.config';

export interface ScheduleEvent {
  id: string;
  course_id: string;
  course_name: string;
  title: string;
  description?: string;
  event_type: 'lecture' | 'lab' | 'exam' | 'office_hours' | 'meeting';
  start_time: string;
  end_time: string;
  location?: string;
  is_online: boolean;
  meeting_url?: string;
  created_by: string;
}

export interface CreateScheduleRequest {
  course_id: string;
  title: string;
  description?: string;
  event_type: 'lecture' | 'lab' | 'exam' | 'office_hours' | 'meeting';
  start_time: string;
  end_time: string;
  location?: string;
  is_online: boolean;
  meeting_url?: string;
}

// Mock data
const MOCK_SCHEDULE: ScheduleEvent[] = [
  {
    id: '1',
    course_id: '1',
    course_name: 'Advanced Web Development',
    title: 'React Hooks Lecture',
    description: 'Deep dive into React hooks',
    event_type: 'lecture',
    start_time: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    end_time: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString(),
    location: 'Room 301',
    is_online: false,
    created_by: 'instructor-1',
  },
  {
    id: '2',
    course_id: '2',
    course_name: 'Data Science Fundamentals',
    title: 'Python Lab Session',
    description: 'Hands-on Python practice',
    event_type: 'lab',
    start_time: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    end_time: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000 + 1.5 * 60 * 60 * 1000).toISOString(),
    is_online: true,
    meeting_url: 'https://meet.google.com/abc-defg-hij',
    created_by: 'instructor-1',
  },
];

class ScheduleService {
  /**
   * Get all schedule events
   * Backend endpoint: GET /api/schedule
   */
  async getSchedule(params?: {
    course_id?: string;
    start_date?: string;
    end_date?: string;
  }): Promise<ScheduleEvent[]> {
    if (API_CONFIG.useMockData) {
      await new Promise(resolve => setTimeout(resolve, 500));
      return MOCK_SCHEDULE;
    }

    try {
      const response = await apiClient.get<ScheduleEvent[]>(
        API_ENDPOINTS.schedule.list,
        { params }
      );
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Get upcoming schedule events
   * Backend endpoint: GET /api/schedule/upcoming
   */
  async getUpcomingEvents(limit: number = 5): Promise<ScheduleEvent[]> {
    if (API_CONFIG.useMockData) {
      await new Promise(resolve => setTimeout(resolve, 500));
      return MOCK_SCHEDULE.slice(0, limit);
    }

    try {
      const response = await apiClient.get<ScheduleEvent[]>(
        API_ENDPOINTS.schedule.upcoming,
        { params: { limit } }
      );
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Create new schedule event (instructor only)
   * Backend endpoint: POST /api/schedule
   */
  async createScheduleEvent(data: CreateScheduleRequest): Promise<ScheduleEvent> {
    if (API_CONFIG.useMockData) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newEvent: ScheduleEvent = {
        id: `event-${Date.now()}`,
        ...data,
        course_name: 'Course Name',
        created_by: 'current-user',
      };
      
      return newEvent;
    }

    try {
      const response = await apiClient.post<ScheduleEvent>(
        API_ENDPOINTS.schedule.create,
        data
      );
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Update schedule event (instructor only)
   * Backend endpoint: PUT /api/schedule/{id}
   */
  async updateScheduleEvent(
    id: string,
    data: Partial<CreateScheduleRequest>
  ): Promise<ScheduleEvent> {
    if (API_CONFIG.useMockData) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      const event = MOCK_SCHEDULE.find(e => e.id === id);
      if (!event) throw new Error('Event not found');
      
      return { ...event, ...data };
    }

    try {
      const response = await apiClient.put<ScheduleEvent>(
        API_ENDPOINTS.schedule.update(id),
        data
      );
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Delete schedule event (instructor only)
   * Backend endpoint: DELETE /api/schedule/{id}
   */
  async deleteScheduleEvent(id: string): Promise<void> {
    if (API_CONFIG.useMockData) {
      await new Promise(resolve => setTimeout(resolve, 500));
      return;
    }

    try {
      await apiClient.delete(API_ENDPOINTS.schedule.delete(id));
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }
}

export const scheduleService = new ScheduleService();
