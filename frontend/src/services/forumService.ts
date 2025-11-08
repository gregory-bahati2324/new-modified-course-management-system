/**
 * Forum Service
 * Maps to FastAPI /api/forums/* endpoints
 */

import apiClient, { handleApiError } from './api';
import { API_CONFIG, API_ENDPOINTS } from '@/config/api.config';

export interface ForumCategory {
  id: string;
  name: string;
  description: string;
  topics: number;
  posts: number;
  last_post?: {
    title: string;
    author: string;
    time: string;
  };
}

export interface ForumTopic {
  id: string;
  title: string;
  category: string;
  category_id: string;
  author: string;
  author_id: string;
  author_role: 'student' | 'instructor' | 'admin';
  replies: number;
  views: number;
  likes: number;
  last_reply: string;
  is_pinned: boolean;
  is_locked: boolean;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface ForumPost {
  id: string;
  topic_id: string;
  author: string;
  author_id: string;
  author_role: 'student' | 'instructor' | 'admin';
  content: string;
  likes: number;
  created_at: string;
  updated_at: string;
  replies?: ForumReply[];
}

export interface ForumReply {
  id: string;
  post_id: string;
  author: string;
  author_id: string;
  author_role: 'student' | 'instructor' | 'admin';
  content: string;
  likes: number;
  created_at: string;
  updated_at: string;
}

export interface CreateTopicRequest {
  title: string;
  category_id: string;
  content: string;
  tags?: string[];
}

export interface CreatePostRequest {
  topic_id: string;
  content: string;
}

export interface CreateReplyRequest {
  post_id: string;
  content: string;
}

// Mock data
const MOCK_CATEGORIES: ForumCategory[] = [
  {
    id: '1',
    name: 'General Discussion',
    description: 'General topics and announcements',
    topics: 45,
    posts: 234,
    last_post: {
      title: 'Welcome to MUST LMS Forums',
      author: 'Admin',
      time: '2 hours ago',
    },
  },
  {
    id: '2',
    name: 'Course Discussions',
    description: 'Course-specific discussions and help',
    topics: 128,
    posts: 892,
    last_post: {
      title: 'Database Assignment Help',
      author: 'John Mwalimu',
      time: '30 minutes ago',
    },
  },
];

const MOCK_TOPICS: ForumTopic[] = [
  {
    id: '1',
    title: 'How to optimize database queries for large datasets?',
    category: 'Advanced Database Systems',
    category_id: '2',
    author: 'Sarah Johnson',
    author_id: 'instructor-1',
    author_role: 'instructor',
    replies: 12,
    views: 89,
    likes: 8,
    last_reply: '15 minutes ago',
    is_pinned: false,
    is_locked: false,
    tags: ['database', 'optimization', 'performance'],
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
  },
];

class ForumService {
  /**
   * Get all forum categories
   * Backend endpoint: GET /api/forums
   */
  async getCategories(): Promise<ForumCategory[]> {
    if (API_CONFIG.useMockData) {
      await new Promise(resolve => setTimeout(resolve, 500));
      return MOCK_CATEGORIES;
    }

    try {
      const response = await apiClient.get<ForumCategory[]>(API_ENDPOINTS.forums.list);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Get category by ID
   * Backend endpoint: GET /api/forums/{id}
   */
  async getCategoryById(id: string): Promise<ForumCategory> {
    if (API_CONFIG.useMockData) {
      await new Promise(resolve => setTimeout(resolve, 500));
      const category = MOCK_CATEGORIES.find(c => c.id === id);
      if (!category) throw new Error('Category not found');
      return category;
    }

    try {
      const response = await apiClient.get<ForumCategory>(
        API_ENDPOINTS.forums.detail(id)
      );
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Get topics in a forum category
   * Backend endpoint: GET /api/forums/{forumId}/posts
   */
  async getTopics(params?: {
    category_id?: string;
    search?: string;
    tags?: string[];
    page?: number;
    page_size?: number;
  }): Promise<{ topics: ForumTopic[]; total: number }> {
    if (API_CONFIG.useMockData) {
      await new Promise(resolve => setTimeout(resolve, 500));
      return { topics: MOCK_TOPICS, total: MOCK_TOPICS.length };
    }

    try {
      const response = await apiClient.get<{ topics: ForumTopic[]; total: number }>(
        API_ENDPOINTS.forums.list,
        { params }
      );
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Get topic by ID with posts
   * Backend endpoint: GET /api/forums/posts/{postId}
   */
  async getTopicById(id: string): Promise<ForumTopic & { posts: ForumPost[] }> {
    if (API_CONFIG.useMockData) {
      await new Promise(resolve => setTimeout(resolve, 500));
      const topic = MOCK_TOPICS.find(t => t.id === id);
      if (!topic) throw new Error('Topic not found');
      
      return {
        ...topic,
        posts: [],
      };
    }

    try {
      const response = await apiClient.get(
        `${API_ENDPOINTS.forums.createPost}/${id}`
      );
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Create a new topic
   * Backend endpoint: POST /api/forums/posts
   */
  async createTopic(data: CreateTopicRequest): Promise<ForumTopic> {
    if (API_CONFIG.useMockData) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newTopic: ForumTopic = {
        id: `topic-${Date.now()}`,
        title: data.title,
        category: 'General Discussion',
        category_id: data.category_id,
        author: 'Current User',
        author_id: 'user-1',
        author_role: 'student',
        replies: 0,
        views: 0,
        likes: 0,
        last_reply: 'just now',
        is_pinned: false,
        is_locked: false,
        tags: data.tags || [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      
      return newTopic;
    }

    try {
      const response = await apiClient.post<ForumTopic>(
        API_ENDPOINTS.forums.createPost,
        data
      );
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Create a post in a topic
   * Backend endpoint: POST /api/forums/posts/{postId}/replies
   */
  async createPost(data: CreatePostRequest): Promise<ForumPost> {
    if (API_CONFIG.useMockData) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newPost: ForumPost = {
        id: `post-${Date.now()}`,
        topic_id: data.topic_id,
        author: 'Current User',
        author_id: 'user-1',
        author_role: 'student',
        content: data.content,
        likes: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      
      return newPost;
    }

    try {
      const response = await apiClient.post<ForumPost>(
        API_ENDPOINTS.forums.reply(data.topic_id),
        { content: data.content }
      );
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Like a topic or post
   * Backend endpoint: POST /api/forums/posts/{postId}/like
   */
  async likeTopic(topicId: string): Promise<void> {
    if (API_CONFIG.useMockData) {
      await new Promise(resolve => setTimeout(resolve, 500));
      return;
    }

    try {
      await apiClient.post(`${API_ENDPOINTS.forums.createPost}/${topicId}/like`);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Pin a topic (instructor/admin only)
   * Backend endpoint: POST /api/forums/posts/{postId}/pin
   */
  async pinTopic(topicId: string): Promise<void> {
    if (API_CONFIG.useMockData) {
      await new Promise(resolve => setTimeout(resolve, 500));
      return;
    }

    try {
      await apiClient.post(`${API_ENDPOINTS.forums.createPost}/${topicId}/pin`);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Lock a topic (instructor/admin only)
   * Backend endpoint: POST /api/forums/posts/{postId}/lock
   */
  async lockTopic(topicId: string): Promise<void> {
    if (API_CONFIG.useMockData) {
      await new Promise(resolve => setTimeout(resolve, 500));
      return;
    }

    try {
      await apiClient.post(`${API_ENDPOINTS.forums.createPost}/${topicId}/lock`);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }
}

export const forumService = new ForumService();
