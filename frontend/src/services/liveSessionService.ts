import apiClient from './api';

export interface LiveSession {
  id: string;
  title: string;
  description: string;
  agenda?: string;
  courseId: string;
  courseName: string;
  moduleId?: string;
  moduleName?: string;
  instructorId: string;
  instructorName: string;
  startTime: string;
  duration: number; // minutes
  status: 'upcoming' | 'live' | 'completed';
  platform: 'zoom' | 'meet' | 'teams' | 'custom';
  meetingLink: string;
  recordingUrl?: string;
  materials?: { name: string; url: string; type: string }[];
  participants: number;
  maxParticipants?: number;
  notes?: string;
}

// Mock data
const MOCK_SESSIONS: LiveSession[] = [
  {
    id: '1',
    title: 'Introduction to React Components',
    description: 'Live training on React functional components and hooks',
    agenda: '1. Component basics\n2. Props and state\n3. Hooks introduction',
    courseId: '1',
    courseName: 'Web Development Fundamentals',
    moduleId: '1',
    moduleName: 'React Basics',
    instructorId: 'instructor-1',
    instructorName: 'Dr. Smith',
    startTime: new Date(Date.now() + 86400000).toISOString(), // tomorrow
    duration: 60,
    status: 'upcoming',
    platform: 'zoom',
    meetingLink: 'https://zoom.us/j/123456789',
    participants: 25,
    maxParticipants: 50,
  },
  {
    id: '2',
    title: 'Advanced State Management',
    description: 'Deep dive into Redux and Context API',
    courseId: '1',
    courseName: 'Web Development Fundamentals',
    instructorId: 'instructor-1',
    instructorName: 'Dr. Smith',
    startTime: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
    duration: 90,
    status: 'live',
    platform: 'meet',
    meetingLink: 'https://meet.google.com/abc-defg-hij',
    participants: 32,
  },
];

class LiveSessionService {
  async getSessions(filters?: {
    courseId?: string;
    status?: string;
    upcoming?: boolean;
  }): Promise<LiveSession[]> {
    try {
      const response = await apiClient.get('/live-sessions', { params: filters });
      return response.data;
    } catch (error) {
      console.log('Using mock sessions data');
      return MOCK_SESSIONS;
    }
  }

  async getSessionById(id: string): Promise<LiveSession> {
    try {
      const response = await apiClient.get(`/live-sessions/${id}`);
      return response.data;
    } catch (error) {
      console.log('Using mock session data');
      return MOCK_SESSIONS[0];
    }
  }

  async createSession(data: {
    title: string;
    description: string;
    agenda?: string;
    courseId: string;
    moduleId?: string;
    startTime: string;
    duration: number;
    platform: string;
    meetingLink: string;
    maxParticipants?: number;
  }): Promise<LiveSession> {
    try {
      const response = await apiClient.post('/live-sessions', data);
      return response.data;
    } catch (error) {
      console.log('Mock: Session created');
      return {
        id: Date.now().toString(),
        ...data,
        instructorId: 'current-user',
        instructorName: 'Current Instructor',
        courseName: 'Course Name',
        status: 'upcoming' as const,
        participants: 0,
        platform: data.platform as 'zoom' | 'meet' | 'teams' | 'custom',
      };
    }
  }

  async updateSession(id: string, data: Partial<LiveSession>): Promise<LiveSession> {
    try {
      const response = await apiClient.put(`/live-sessions/${id}`, data);
      return response.data;
    } catch (error) {
      console.log('Mock: Session updated');
      return MOCK_SESSIONS[0];
    }
  }

  async deleteSession(id: string): Promise<void> {
    try {
      await apiClient.delete(`/live-sessions/${id}`);
    } catch (error) {
      console.log('Mock: Session deleted');
    }
  }

  async startSession(id: string): Promise<void> {
    try {
      await apiClient.post(`/live-sessions/${id}/start`);
    } catch (error) {
      console.log('Mock: Session started');
    }
  }

  async endSession(id: string): Promise<void> {
    try {
      await apiClient.post(`/live-sessions/${id}/end`);
    } catch (error) {
      console.log('Mock: Session ended');
    }
  }

  async uploadRecording(id: string, file: File): Promise<void> {
    try {
      const formData = new FormData();
      formData.append('recording', file);
      await apiClient.post(`/live-sessions/${id}/recording`, formData);
    } catch (error) {
      console.log('Mock: Recording uploaded');
    }
  }

  async uploadMaterial(id: string, file: File): Promise<void> {
    try {
      const formData = new FormData();
      formData.append('material', file);
      await apiClient.post(`/live-sessions/${id}/materials`, formData);
    } catch (error) {
      console.log('Mock: Material uploaded');
    }
  }

  async joinSession(id: string): Promise<string> {
    try {
      const response = await apiClient.post(`/live-sessions/${id}/join`);
      return response.data.meetingLink;
    } catch (error) {
      console.log('Mock: Joining session');
      return MOCK_SESSIONS[0].meetingLink;
    }
  }

  async getUpcomingSessions(): Promise<LiveSession[]> {
    try {
      const response = await apiClient.get('/live-sessions/upcoming');
      return response.data;
    } catch (error) {
      console.log('Using mock upcoming sessions');
      return MOCK_SESSIONS.filter(s => s.status === 'upcoming');
    }
  }
}

export const liveSessionService = new LiveSessionService();