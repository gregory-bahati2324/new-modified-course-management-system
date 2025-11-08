/**
 * Message Service
 * Maps to FastAPI /api/messages/* endpoints
 */

import apiClient, { handleApiError } from './api';
import { API_CONFIG, API_ENDPOINTS } from '@/config/api.config';

export interface Message {
  id: string;
  sender_id: string;
  sender_name: string;
  sender_role: 'student' | 'instructor' | 'admin';
  recipient_id?: string;
  recipient_ids?: string[]; // For bulk messages
  subject: string;
  content: string;
  is_read: boolean;
  created_at: string;
  updated_at: string;
  attachments?: MessageAttachment[];
}

export interface MessageAttachment {
  id: string;
  file_name: string;
  file_size: number;
  file_type: string;
  file_url: string;
}

export interface MessageThread {
  participant_id: string;
  participant_name: string;
  participant_role: 'student' | 'instructor' | 'admin';
  last_message: string;
  last_message_time: string;
  unread_count: number;
  messages: Message[];
}

export interface SendMessageRequest {
  recipient_ids: string[];
  subject: string;
  content: string;
  attachments?: File[];
}

export interface Student {
  id: string;
  name: string;
  email: string;
  course?: string;
  status: 'active' | 'inactive';
  last_active: string;
  avatar?: string;
}

// Mock data
const MOCK_MESSAGES: Message[] = [
  {
    id: '1',
    sender_id: 'instructor-1',
    sender_name: 'Dr. Sarah Johnson',
    sender_role: 'instructor',
    recipient_ids: ['student-1', 'student-2'],
    subject: 'Assignment Reminder',
    content: 'This is a reminder that Assignment 2 is due next week.',
    is_read: false,
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
];

const MOCK_STUDENTS: Student[] = [
  {
    id: '1',
    name: 'John Mwalimu',
    email: 'john.mwalimu@must.ac.tz',
    course: 'CS 401',
    status: 'active',
    last_active: '2 hours ago',
  },
  {
    id: '2',
    name: 'Grace Kikoti',
    email: 'grace.kikoti@must.ac.tz',
    course: 'CS 451',
    status: 'active',
    last_active: '1 day ago',
  },
];

class MessageService {
  /**
   * Get all messages for current user
   * Backend endpoint: GET /api/messages
   */
  async getMessages(params?: {
    unread_only?: boolean;
    page?: number;
    page_size?: number;
  }): Promise<{ messages: Message[]; total: number }> {
    if (API_CONFIG.useMockData) {
      await new Promise(resolve => setTimeout(resolve, 500));
      return { messages: MOCK_MESSAGES, total: MOCK_MESSAGES.length };
    }

    try {
      const response = await apiClient.get<{ messages: Message[]; total: number }>(
        API_ENDPOINTS.messages.list,
        { params }
      );
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Get message thread with a specific user
   * Backend endpoint: GET /api/messages/thread/{userId}
   */
  async getMessageThread(userId: string): Promise<MessageThread> {
    if (API_CONFIG.useMockData) {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const mockThread: MessageThread = {
        participant_id: userId,
        participant_name: 'John Doe',
        participant_role: 'student',
        last_message: 'Thank you for your help!',
        last_message_time: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
        unread_count: 2,
        messages: MOCK_MESSAGES,
      };
      
      return mockThread;
    }

    try {
      const response = await apiClient.get<MessageThread>(
        API_ENDPOINTS.messages.thread(userId)
      );
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Send a message to one or multiple recipients
   * Backend endpoint: POST /api/messages
   */
  async sendMessage(data: SendMessageRequest): Promise<Message> {
    if (API_CONFIG.useMockData) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newMessage: Message = {
        id: `msg-${Date.now()}`,
        sender_id: 'instructor-1',
        sender_name: 'Current User',
        sender_role: 'instructor',
        recipient_ids: data.recipient_ids,
        subject: data.subject,
        content: data.content,
        is_read: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      
      return newMessage;
    }

    try {
      // Handle file uploads if attachments exist
      const formData = new FormData();
      formData.append('recipient_ids', JSON.stringify(data.recipient_ids));
      formData.append('subject', data.subject);
      formData.append('content', data.content);
      
      if (data.attachments) {
        data.attachments.forEach((file) => {
          formData.append('attachments', file);
        });
      }

      const response = await apiClient.post<Message>(
        API_ENDPOINTS.messages.send,
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
   * Mark message as read
   * Backend endpoint: PUT /api/messages/{id}/read
   */
  async markAsRead(messageId: string): Promise<void> {
    if (API_CONFIG.useMockData) {
      await new Promise(resolve => setTimeout(resolve, 500));
      return;
    }

    try {
      await apiClient.put(API_ENDPOINTS.messages.markRead(messageId));
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Get students for messaging (instructor only)
   * Backend endpoint: GET /api/courses/{courseId}/students
   */
  async getStudents(courseId?: string): Promise<Student[]> {
    if (API_CONFIG.useMockData) {
      await new Promise(resolve => setTimeout(resolve, 500));
      return MOCK_STUDENTS;
    }

    try {
      // If courseId is provided, get students from that course
      // Otherwise, get all students instructor teaches
      const endpoint = courseId
        ? `/api/courses/${courseId}/students`
        : '/api/students';
        
      const response = await apiClient.get<Student[]>(endpoint);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Delete a message
   * Backend endpoint: DELETE /api/messages/{id}
   */
  async deleteMessage(messageId: string): Promise<void> {
    if (API_CONFIG.useMockData) {
      await new Promise(resolve => setTimeout(resolve, 500));
      return;
    }

    try {
      await apiClient.delete(`${API_ENDPOINTS.messages.list}/${messageId}`);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Get unread message count
   * Backend endpoint: GET /api/messages/unread/count
   */
  async getUnreadCount(): Promise<number> {
    if (API_CONFIG.useMockData) {
      await new Promise(resolve => setTimeout(resolve, 500));
      return 3;
    }

    try {
      const response = await apiClient.get<{ count: number }>(
        `${API_ENDPOINTS.messages.list}/unread/count`
      );
      return response.data.count;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }
}

export const messageService = new MessageService();
