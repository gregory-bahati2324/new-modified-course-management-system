/**
 * Student Exam Service
 * Handles all exam-related API calls for students
 * Created: 2025-02-04
 */

import apiClient, { handleApiError } from './api';

// Types for student exam system
export interface ExamListItem {
  id: string;
  title: string;
  type: 'quiz' | 'exam' | 'test' | 'midterm' | 'final';
  course_id: string;
  course_title: string;
  module_id?: string;
  module_title?: string;
  due_date: string;
  time_limit: number | null;
  attempts_allowed: string;
  attempts_used: number;
  passing_score: number;
  total_points: number;
  question_count: number;
  status: 'upcoming' | 'available' | 'in_progress' | 'completed' | 'missed';
  best_score?: number;
  last_attempt_date?: string;
}

export interface ExamQuestion {
  id: number;
  type: 'multiple-choice' | 'true-false' | 'short-answer' | 'essay' | 'coding' | 'file-upload' | 'matching' | 'ordering';
  question_text: string;
  points: number;
  options?: string[];
  matching_pairs?: { left: string; right: string }[];
  correct_order?: string[]; // For ordering questions, shuffled for display
  test_cases?: { input: string; expectedOutput: string }[];
}

export interface ExamDetails {
  id: string;
  title: string;
  description: string;
  type: string;
  course_title: string;
  module_title?: string;
  due_date: string;
  time_limit: number | null;
  attempts_allowed: string;
  attempts_used: number;
  passing_score: number;
  shuffle_questions: boolean;
  show_answers: boolean;
  total_points: number;
  questions: ExamQuestion[];
  started_at?: string;
  time_remaining?: number;
}

export interface ExamAnswer {
  question_id: number;
  answer: string | number | string[] | { [key: string]: string };
  file?: File;
}

export interface ExamSubmission {
  exam_id: string;
  answers: ExamAnswer[];
  time_taken: number;
}

export interface ExamResult {
  id: string;
  exam_id: string;
  exam_title: string;
  course_title: string;
  submitted_at: string;
  time_taken: number;
  total_points: number;
  points_earned: number;
  percentage: number;
  passed: boolean;
  passing_score: number;
  show_answers: boolean;
  question_results?: {
    question_id: number;
    question_text: string;
    type: string;
    points: number;
    points_earned: number;
    student_answer: any;
    correct_answer?: any;
    is_correct?: boolean;
    feedback?: string;
  }[];
}

export interface AttemptHistory {
  id: string;
  attempt_number: number;
  submitted_at: string;
  time_taken: number;
  points_earned: number;
  total_points: number;
  percentage: number;
  passed: boolean;
}

// Mock data for development (will be replaced with actual API calls)
const mockExams: ExamListItem[] = [
  {
    id: '1',
    title: 'Introduction to Programming Quiz',
    type: 'quiz',
    course_id: 'cs101',
    course_title: 'Computer Science 101',
    due_date: '2025-02-10T23:59:00',
    time_limit: 30,
    attempts_allowed: '3',
    attempts_used: 1,
    passing_score: 70,
    total_points: 50,
    question_count: 10,
    status: 'available',
    best_score: 85
  },
  {
    id: '2',
    title: 'Data Structures Midterm',
    type: 'midterm',
    course_id: 'cs201',
    course_title: 'Data Structures',
    due_date: '2025-02-15T14:00:00',
    time_limit: 90,
    attempts_allowed: '1',
    attempts_used: 0,
    passing_score: 60,
    total_points: 100,
    question_count: 25,
    status: 'upcoming'
  },
  {
    id: '3',
    title: 'Database Fundamentals Test',
    type: 'test',
    course_id: 'cs301',
    course_title: 'Database Systems',
    due_date: '2025-02-05T18:00:00',
    time_limit: 45,
    attempts_allowed: '2',
    attempts_used: 2,
    passing_score: 70,
    total_points: 60,
    question_count: 15,
    status: 'completed',
    best_score: 92
  }
];

const mockQuestions: ExamQuestion[] = [
  {
    id: 1,
    type: 'multiple-choice',
    question_text: 'What is the time complexity of binary search?',
    points: 5,
    options: ['O(1)', 'O(n)', 'O(log n)', 'O(n²)']
  },
  {
    id: 2,
    type: 'true-false',
    question_text: 'A stack follows the LIFO (Last In First Out) principle.',
    points: 3
  },
  {
    id: 3,
    type: 'short-answer',
    question_text: 'Define polymorphism in object-oriented programming.',
    points: 5
  },
  {
    id: 4,
    type: 'essay',
    question_text: 'Explain the differences between SQL and NoSQL databases. Provide examples of when you would use each.',
    points: 15
  },
  {
    id: 5,
    type: 'coding',
    question_text: 'Write a function that reverses a string without using built-in reverse methods.',
    points: 10,
    test_cases: [
      { input: 'hello', expectedOutput: 'olleh' },
      { input: 'world', expectedOutput: 'dlrow' }
    ]
  },
  {
    id: 6,
    type: 'matching',
    question_text: 'Match the data structure with its primary use case.',
    points: 8,
    matching_pairs: [
      { left: 'Array', right: 'Indexed access' },
      { left: 'Stack', right: 'Undo operations' },
      { left: 'Queue', right: 'Task scheduling' },
      { left: 'Hash Table', right: 'Fast lookup' }
    ]
  },
  {
    id: 7,
    type: 'ordering',
    question_text: 'Arrange the following sorting algorithms by their average time complexity (fastest first).',
    points: 4,
    correct_order: ['Quick Sort', 'Merge Sort', 'Bubble Sort', 'Selection Sort']
  }
];

export const studentExamService = {
  // Get list of exams for student
  async getExams(filters?: {
    status?: string;
    course_id?: string;
    type?: string;
  }): Promise<ExamListItem[]> {
    try {
      // TODO: Replace with actual API call
      // const response = await apiClient.get('/api/student/exams', { params: filters });
      // return response.data;
      
      // Mock implementation
      let filtered = [...mockExams];
      if (filters?.status && filters.status !== 'all') {
        filtered = filtered.filter(e => e.status === filters.status);
      }
      if (filters?.course_id) {
        filtered = filtered.filter(e => e.course_id === filters.course_id);
      }
      if (filters?.type && filters.type !== 'all') {
        filtered = filtered.filter(e => e.type === filters.type);
      }
      return filtered;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Get exam details for taking
  async getExamDetails(examId: string): Promise<ExamDetails> {
    try {
      // TODO: Replace with actual API call
      // const response = await apiClient.get(`/api/student/exams/${examId}`);
      // return response.data;
      
      // Mock implementation
      const exam = mockExams.find(e => e.id === examId);
      if (!exam) throw new Error('Exam not found');
      
      return {
        id: exam.id,
        title: exam.title,
        description: 'This assessment covers the fundamental concepts discussed in the course.',
        type: exam.type,
        course_title: exam.course_title,
        due_date: exam.due_date,
        time_limit: exam.time_limit,
        attempts_allowed: exam.attempts_allowed,
        attempts_used: exam.attempts_used,
        passing_score: exam.passing_score,
        shuffle_questions: false,
        show_answers: true,
        total_points: exam.total_points,
        questions: mockQuestions
      };
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Start an exam attempt
  async startExam(examId: string): Promise<{ attempt_id: string; started_at: string }> {
    try {
      // TODO: Replace with actual API call
      // const response = await apiClient.post(`/api/student/exams/${examId}/start`);
      // return response.data;
      
      return {
        attempt_id: `attempt_${Date.now()}`,
        started_at: new Date().toISOString()
      };
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Save progress (auto-save)
  async saveProgress(examId: string, answers: ExamAnswer[]): Promise<void> {
    try {
      // TODO: Replace with actual API call
      // await apiClient.post(`/api/student/exams/${examId}/save`, { answers });
      console.log('Progress saved:', answers);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Submit exam
  async submitExam(submission: ExamSubmission): Promise<ExamResult> {
    try {
      // TODO: Replace with actual API call
      // const response = await apiClient.post(`/api/student/exams/${submission.exam_id}/submit`, submission);
      // return response.data;
      
      // Mock implementation
      const exam = mockExams.find(e => e.id === submission.exam_id);
      const pointsEarned = Math.floor(Math.random() * 30) + 70; // Mock score 70-100%
      const percentage = pointsEarned;
      
      return {
        id: `result_${Date.now()}`,
        exam_id: submission.exam_id,
        exam_title: exam?.title || 'Unknown Exam',
        course_title: exam?.course_title || 'Unknown Course',
        submitted_at: new Date().toISOString(),
        time_taken: submission.time_taken,
        total_points: exam?.total_points || 100,
        points_earned: Math.floor((percentage / 100) * (exam?.total_points || 100)),
        percentage,
        passed: percentage >= (exam?.passing_score || 70),
        passing_score: exam?.passing_score || 70,
        show_answers: true
      };
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Get exam result
  async getExamResult(examId: string, attemptId?: string): Promise<ExamResult> {
    try {
      // TODO: Replace with actual API call
      // const response = await apiClient.get(`/api/student/exams/${examId}/result`, { params: { attemptId } });
      // return response.data;
      
      const exam = mockExams.find(e => e.id === examId);
      return {
        id: `result_${examId}`,
        exam_id: examId,
        exam_title: exam?.title || 'Unknown Exam',
        course_title: exam?.course_title || 'Unknown Course',
        submitted_at: new Date().toISOString(),
        time_taken: 1800,
        total_points: exam?.total_points || 100,
        points_earned: Math.floor((exam?.best_score || 85) / 100 * (exam?.total_points || 100)),
        percentage: exam?.best_score || 85,
        passed: true,
        passing_score: exam?.passing_score || 70,
        show_answers: true,
        question_results: mockQuestions.map((q, idx) => ({
          question_id: q.id,
          question_text: q.question_text,
          type: q.type,
          points: q.points,
          points_earned: Math.floor(q.points * 0.85),
          student_answer: 'Sample answer',
          is_correct: true,
          feedback: 'Good job!'
        }))
      };
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Get attempt history
  async getAttemptHistory(examId: string): Promise<AttemptHistory[]> {
    try {
      // TODO: Replace with actual API call
      // const response = await apiClient.get(`/api/student/exams/${examId}/attempts`);
      // return response.data;
      
      return [
        {
          id: 'attempt_1',
          attempt_number: 1,
          submitted_at: '2025-02-01T14:30:00',
          time_taken: 1800,
          points_earned: 42,
          total_points: 50,
          percentage: 84,
          passed: true
        }
      ];
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Upload file for file-upload questions
  async uploadAnswerFile(examId: string, questionId: number, file: File): Promise<string> {
    try {
      // TODO: Replace with actual API call
      // const formData = new FormData();
      // formData.append('file', file);
      // const response = await apiClient.post(`/api/student/exams/${examId}/questions/${questionId}/upload`, formData);
      // return response.data.file_url;
      
      return URL.createObjectURL(file);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }
};

export default studentExamService;