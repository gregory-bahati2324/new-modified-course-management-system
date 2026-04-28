import { apiSchedulingClient } from './schedulingapi';
import { API_ENDPOINTS } from '@/config/api.config';
import { handleApiError } from './assessmentsapi';

export interface ScheduleCreate {
  title: string;
  course_id: string;
  date: string;
  start_time: string;
  end_time: string;
  location: string;
  type: string;
  description?: string;
  capacity?: number;
  is_online: boolean;
  meeting_link?: string | null;
}

export interface Schedule {
  id: string;
  title: string;
  course_id: string;
  date: string;
  start_time: string;
  end_time: string;
  location: string;
  type: string;
  description?: string;
  capacity?: number;
  is_online: boolean;
  status: string;
  meeting_link?: string | null;
}

class ScheduleService {

  // CREATE SESSION
  async createSchedule(data: ScheduleCreate): Promise<Schedule> {
    try {
      const token = localStorage.getItem('accessToken');

      const response = await apiSchedulingClient.post(
        API_ENDPOINTS.schedule.create,
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  // GET ALL SESSIONS (INSTRUCTOR)
  async getMySchedules(): Promise<Schedule[]> {
    try {
      const token = localStorage.getItem('accessToken');

      const response = await apiSchedulingClient.get(
        API_ENDPOINTS.schedule.my,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  // UPDATE SESSION
  async updateSchedule(id: string, data: Partial<ScheduleCreate>): Promise<Schedule> {
    try {
      const token = localStorage.getItem('accessToken');

      const response = await apiSchedulingClient.put(
        API_ENDPOINTS.schedule.update(id),
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  // DELETE SESSION
  async deleteSchedule(id: string): Promise<void> {
    try {
      const token = localStorage.getItem('accessToken');

      await apiSchedulingClient.delete(
        API_ENDPOINTS.schedule.delete(id),
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  // UPCOMING SESSIONS (STUDENTS)
  async getUpcomingSchedules(): Promise<Schedule[]> {
    try {
      const token = localStorage.getItem('accessToken');

      const response = await apiSchedulingClient.get(
        API_ENDPOINTS.schedule.upcoming,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }
  async getCourseSchedules(courseId: string): Promise<Schedule[]> {
  try {
    const token = localStorage.getItem('accessToken');

    const response = await apiSchedulingClient.get(
      API_ENDPOINTS.schedule.course(courseId),
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
}
}

export const scheduleService = new ScheduleService();