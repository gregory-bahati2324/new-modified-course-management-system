import apiClient from './api';

export interface Participant {
  id: string;
  name: string;
  avatar: string;
  role: 'student' | 'instructor';
  online: boolean;
}

export interface Message {
  id: string;
  discussionId: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  senderRole: 'student' | 'instructor';
  content: string;
  timestamp: string;
  isPinned: boolean;
  isQuestion: boolean;
  isAcceptedAnswer: boolean;
  reactions: { emoji: string; count: number; users: string[] }[];
  attachments?: { type: string; url: string; name: string }[];
  replyTo?: string;
  replies?: Message[];
}

export interface Discussion {
  id: string;
  title: string;
  description: string;
  courseId: string;
  courseName: string;
  moduleId?: string;
  moduleName?: string;
  visibility: 'private' | 'course' | 'public';
  createdBy: string;
  createdAt: string;
  participants: Participant[];
  messages: Message[];
  unreadCount: number;
}

// Mock data
const MOCK_DISCUSSIONS: Discussion[] = [
  {
    id: '1',
    title: 'Introduction to React Hooks',
    description: 'Discussion about useEffect and useState best practices',
    courseId: '1',
    courseName: 'Web Development Fundamentals',
    moduleId: '1',
    moduleName: 'React Basics',
    visibility: 'course',
    createdBy: 'instructor-1',
    createdAt: new Date().toISOString(),
    participants: [
      { id: '1', name: 'Dr. Smith', avatar: '', role: 'instructor', online: true },
      { id: '2', name: 'John Doe', avatar: '', role: 'student', online: true },
      { id: '3', name: 'Jane Smith', avatar: '', role: 'student', online: false },
    ],
    messages: [],
    unreadCount: 3,
  },
];

class DiscussionService {
  async getDiscussions(filters?: {
    courseId?: string;
    moduleId?: string;
    visibility?: string;
  }): Promise<Discussion[]> {
    try {
      const response = await apiClient.get('/discussions', { params: filters });
      return response.data;
    } catch (error) {
      console.log('Using mock discussions data');
      return MOCK_DISCUSSIONS;
    }
  }

  async getDiscussionById(id: string): Promise<Discussion> {
    try {
      const response = await apiClient.get(`/discussions/${id}`);
      return response.data;
    } catch (error) {
      console.log('Using mock discussion data');
      return MOCK_DISCUSSIONS[0];
    }
  }

  async createDiscussion(data: {
    title: string;
    description: string;
    courseId: string;
    moduleId?: string;
    visibility: string;
    participantIds: string[];
  }): Promise<Discussion> {
    try {
      const response = await apiClient.post('/discussions', data);
      return response.data;
    } catch (error) {
      console.log('Mock: Discussion created');
      return MOCK_DISCUSSIONS[0];
    }
  }

  async sendMessage(discussionId: string, data: {
    content: string;
    attachments?: any[];
    replyTo?: string;
  }): Promise<Message> {
    try {
      const response = await apiClient.post(`/discussions/${discussionId}/messages`, data);
      return response.data;
    } catch (error) {
      console.log('Mock: Message sent');
      return {
        id: Date.now().toString(),
        discussionId,
        senderId: 'current-user',
        senderName: 'Current User',
        senderAvatar: '',
        senderRole: 'student',
        content: data.content,
        timestamp: new Date().toISOString(),
        isPinned: false,
        isQuestion: false,
        isAcceptedAnswer: false,
        reactions: [],
        attachments: data.attachments,
        replyTo: data.replyTo,
      };
    }
  }

  async togglePin(messageId: string): Promise<void> {
    try {
      await apiClient.patch(`/messages/${messageId}/pin`);
    } catch (error) {
      console.log('Mock: Message pin toggled');
    }
  }

  async markAsQuestion(messageId: string): Promise<void> {
    try {
      await apiClient.patch(`/messages/${messageId}/question`);
    } catch (error) {
      console.log('Mock: Message marked as question');
    }
  }

  async addReaction(messageId: string, emoji: string): Promise<void> {
    try {
      await apiClient.post(`/messages/${messageId}/reactions`, { emoji });
    } catch (error) {
      console.log('Mock: Reaction added');
    }
  }

  async searchMessages(discussionId: string, query: string): Promise<Message[]> {
    try {
      const response = await apiClient.get(`/discussions/${discussionId}/search`, {
        params: { q: query },
      });
      return response.data;
    } catch (error) {
      console.log('Mock: Search results');
      return [];
    }
  }

  async inviteParticipants(discussionId: string, participantIds: string[]): Promise<void> {
    try {
      await apiClient.post(`/discussions/${discussionId}/invite`, { participantIds });
    } catch (error) {
      console.log('Mock: Participants invited');
    }
  }
}

export const discussionService = new DiscussionService();