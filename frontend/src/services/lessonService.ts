import apiClient from './api';
import { API_CONFIG } from '@/config/api.config';

// Interfaces
export interface Lesson {
  id: string;
  module_id: string;
  title: string;
  description?: string;
  content: LessonContent;
  order: number;
  duration_minutes?: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface LessonContent {
  objectives?: string[];
  prerequisites?: string[];
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  tags?: string[];
  content_blocks: ContentBlock[];
  quiz?: QuizQuestion[];
  resources?: Resource[];
}

export interface ContentBlock {
  id: string;
  type: 'text' | 'video' | 'image' | 'pdf' | 'ppt' | 'audio' | 'code';
  title?: string;
  content: string;
  metadata?: {
    language?: string;
    transcript?: string;
    fileSize?: string;
  };
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
}

export interface Resource {
  id: string;
  title: string;
  type: 'pdf' | 'ppt' | 'doc' | 'link';
  url: string;
}

export interface CreateLessonRequest {
  module_id: string;
  title: string;
  description?: string;
  content: LessonContent;
  order?: number;
  duration_minutes?: number;
  is_published?: boolean;
}

export interface UpdateLessonRequest extends Partial<CreateLessonRequest> {}

export interface LessonProgress {
  lesson_id: string;
  completed: boolean;
  time_spent_minutes: number;
  quiz_score?: number;
  last_accessed: string;
}

// Mock Data
const MOCK_LESSONS: Lesson[] = [
  {
    id: '1',
    module_id: '1',
    title: 'Introduction to Database Fundamentals',
    description: 'Learn the basics of database systems and relational models',
    content: {
      objectives: [
        'Understand what databases are and why they are used',
        'Learn about different database models',
        'Explore real-world database applications'
      ],
      prerequisites: ['Basic computer knowledge'],
      difficulty: 'beginner',
      tags: ['databases', 'fundamentals', 'introduction'],
      content_blocks: [
        {
          id: '1',
          type: 'text',
          title: 'What is a Database?',
          content: 'A database is an organized collection of structured information, or data, typically stored electronically in a computer system...'
        },
        {
          id: '2',
          type: 'video',
          title: 'Database Concepts Overview',
          content: 'https://example.com/video1.mp4',
          metadata: {
            transcript: 'In this video, we will explore...'
          }
        }
      ],
      quiz: [
        {
          id: '1',
          question: 'What is a database?',
          options: [
            'A collection of unrelated files',
            'An organized collection of structured data',
            'A type of programming language',
            'A hardware component'
          ],
          correctAnswer: 1,
          explanation: 'A database is an organized collection of structured information or data.'
        }
      ],
      resources: [
        {
          id: '1',
          title: 'Database Design Principles',
          type: 'pdf',
          url: '/resources/db-design.pdf'
        }
      ]
    },
    order: 1,
    duration_minutes: 45,
    is_published: true,
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z'
  }
];

// Service Class
class LessonService {
  /**
   * Get all lessons for a specific module
   */
  async getLessonsByModule(moduleId: string): Promise<Lesson[]> {
    if (API_CONFIG.useMockData) {
      return Promise.resolve(MOCK_LESSONS.filter(l => l.module_id === moduleId));
    }

    const response = await apiClient.get<Lesson[]>(`/modules/${moduleId}/lessons`);
    return response.data;
  }

  /**
   * Get a single lesson by ID
   */
  async getLessonById(lessonId: string): Promise<Lesson> {
    if (API_CONFIG.useMockData) {
      const lesson = MOCK_LESSONS.find(l => l.id === lessonId);
      if (!lesson) throw new Error('Lesson not found');
      return Promise.resolve(lesson);
    }

    const response = await apiClient.get<Lesson>(`/lessons/${lessonId}`);
    return response.data;
  }

  /**
   * Create a new lesson
   */
  async createLesson(data: CreateLessonRequest): Promise<Lesson> {
    if (API_CONFIG.useMockData) {
      const newLesson: Lesson = {
        id: String(MOCK_LESSONS.length + 1),
        ...data,
        order: data.order || MOCK_LESSONS.length + 1,
        is_published: data.is_published || false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      MOCK_LESSONS.push(newLesson);
      return Promise.resolve(newLesson);
    }

    const response = await apiClient.post<Lesson>('/lessons', data);
    return response.data;
  }

  /**
   * Update an existing lesson
   */
  async updateLesson(lessonId: string, data: UpdateLessonRequest): Promise<Lesson> {
    if (API_CONFIG.useMockData) {
      const index = MOCK_LESSONS.findIndex(l => l.id === lessonId);
      if (index === -1) throw new Error('Lesson not found');
      
      MOCK_LESSONS[index] = {
        ...MOCK_LESSONS[index],
        ...data,
        updated_at: new Date().toISOString()
      };
      return Promise.resolve(MOCK_LESSONS[index]);
    }

    const response = await apiClient.put<Lesson>(`/lessons/${lessonId}`, data);
    return response.data;
  }

  /**
   * Delete a lesson
   */
  async deleteLesson(lessonId: string): Promise<void> {
    if (API_CONFIG.useMockData) {
      const index = MOCK_LESSONS.findIndex(l => l.id === lessonId);
      if (index !== -1) {
        MOCK_LESSONS.splice(index, 1);
      }
      return Promise.resolve();
    }

    await apiClient.delete(`/lessons/${lessonId}`);
  }

  /**
   * Reorder lessons within a module
   */
  async reorderLessons(moduleId: string, lessonIds: string[]): Promise<void> {
    if (API_CONFIG.useMockData) {
      lessonIds.forEach((id, index) => {
        const lesson = MOCK_LESSONS.find(l => l.id === id);
        if (lesson) {
          lesson.order = index + 1;
        }
      });
      return Promise.resolve();
    }

    await apiClient.post(`/modules/${moduleId}/lessons/reorder`, { lesson_ids: lessonIds });
  }

  /**
   * Publish/unpublish a lesson
   */
  async togglePublish(lessonId: string, isPublished: boolean): Promise<Lesson> {
    if (API_CONFIG.useMockData) {
      const lesson = MOCK_LESSONS.find(l => l.id === lessonId);
      if (!lesson) throw new Error('Lesson not found');
      
      lesson.is_published = isPublished;
      lesson.updated_at = new Date().toISOString();
      return Promise.resolve(lesson);
    }

    const response = await apiClient.patch<Lesson>(`/lessons/${lessonId}/publish`, { 
      is_published: isPublished 
    });
    return response.data;
  }

  /**
   * Get lesson progress for a user
   */
  async getLessonProgress(lessonId: string): Promise<LessonProgress> {
    if (API_CONFIG.useMockData) {
      return Promise.resolve({
        lesson_id: lessonId,
        completed: false,
        time_spent_minutes: 15,
        quiz_score: undefined,
        last_accessed: new Date().toISOString()
      });
    }

    const response = await apiClient.get<LessonProgress>(`/lessons/${lessonId}/progress`);
    return response.data;
  }

  /**
   * Update lesson progress
   */
  async updateProgress(
    lessonId: string, 
    data: { 
      completed?: boolean; 
      time_spent_minutes?: number; 
      quiz_score?: number 
    }
  ): Promise<LessonProgress> {
    if (API_CONFIG.useMockData) {
      return Promise.resolve({
        lesson_id: lessonId,
        completed: data.completed || false,
        time_spent_minutes: data.time_spent_minutes || 0,
        quiz_score: data.quiz_score,
        last_accessed: new Date().toISOString()
      });
    }

    const response = await apiClient.post<LessonProgress>(
      `/lessons/${lessonId}/progress`, 
      data
    );
    return response.data;
  }
}

// Export singleton instance
export const lessonService = new LessonService();