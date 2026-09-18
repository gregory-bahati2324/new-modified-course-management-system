/**
 * Notification Service
 * Maps to the notification microservice's /notifications/* endpoints
 * (backend/notification_service). Every notification API call in the
 * app should go through this file — not scattered across components —
 * matching the pattern already used by progressService.ts,
 * courseService.ts, etc.
 */

import { apiNotificationClient, handleApiError } from './apiNotification';
import { API_ENDPOINTS } from '@/config/api.config';

export type NotificationCategory =
  | 'COURSE' | 'MODULE' | 'ASSIGNMENT' | 'ASSESSMENT'
  | 'GRADE' | 'PROGRESS' | 'SCHEDULE' | 'SYSTEM';

export type NotificationPriority = 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';

export interface AppNotification {
  id: string;
  recipient_id: string;
  actor_id: string | null;
  type: string;
  category: NotificationCategory;
  priority: NotificationPriority;
  title: string;
  message: string;
  action_url: string | null;
  status: 'UNREAD' | 'READ';
  is_read: boolean;
  read_at: string | null;
  source_service: string | null;
  source_entity_type: string | null;
  source_entity_id: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string | null;
}

export interface NotificationListResult {
  items: AppNotification[];
  total: number;
  page: number;
  limit: number;
  unread_count: number;
}

export interface ListNotificationsParams {
  page?: number;
  limit?: number;
  unreadOnly?: boolean;
  category?: NotificationCategory;
  type?: string;
}

class NotificationService {
  async getNotifications(params: ListNotificationsParams = {}): Promise<NotificationListResult> {
    try {
      const response = await apiNotificationClient.get(API_ENDPOINTS.notifications.list, {
        params: {
          page: params.page ?? 1,
          limit: params.limit ?? 20,
          unread_only: params.unreadOnly ?? false,
          category: params.category,
          type: params.type,
        },
      });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async getUnreadNotifications(params: { page?: number; limit?: number } = {}): Promise<NotificationListResult> {
    try {
      const response = await apiNotificationClient.get(API_ENDPOINTS.notifications.unread, {
        params: { page: params.page ?? 1, limit: params.limit ?? 20 },
      });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async getUnreadCount(): Promise<number> {
    try {
      const response = await apiNotificationClient.get(API_ENDPOINTS.notifications.count);
      return response.data.unread_count;
    } catch (error) {
      // Polling shouldn't throw a toast every 30s if the service hiccups —
      // callers (see NotificationBell) treat a rejected promise as "skip
      // this poll", so surfacing 0 here would be misleading. Re-throw and
      // let the caller decide; it already does.
      throw new Error(handleApiError(error));
    }
  }

  async getNotification(id: string): Promise<AppNotification> {
    try {
      const response = await apiNotificationClient.get(API_ENDPOINTS.notifications.detail(id));
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async markAsRead(id: string): Promise<AppNotification> {
    try {
      const response = await apiNotificationClient.patch(API_ENDPOINTS.notifications.markRead(id));
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async markAllAsRead(): Promise<{ message: string }> {
    try {
      const response = await apiNotificationClient.patch(API_ENDPOINTS.notifications.markAllRead);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async deleteNotification(id: string): Promise<{ message: string }> {
    try {
      const response = await apiNotificationClient.delete(API_ENDPOINTS.notifications.delete(id));
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }
}

export const notificationService = new NotificationService();
