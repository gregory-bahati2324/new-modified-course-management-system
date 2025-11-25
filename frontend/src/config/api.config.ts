/**
 * API Configuration
 * Toggle between mock data and real backend
 */

export const API_CONFIG = {
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000',
  useMockData: import.meta.env.VITE_USE_MOCK_DATA === 'true',
  timeout: 30000,
};

export const API_CONFIG_COURSE = {
  baseURL: import.meta.env.VITE_API_COURSE_BASE_URL_COURSE || 'http://localhost:8001',
  useMockData: import.meta.env.VITE_USE_MOCK_DATA === 'true',
  timeout: 30000,
};

export const API_CONFIG_MODULE_LESSON = {
  baseURL: import.meta.env.VITE_API_MODULE_LESSON_BASE_URL || 'http://localhost:8002',
  useMockData: import.meta.env.VITE_USE_MOCK_DATA === 'true',
  timeout: 30000,
};

export const API_ENDPOINTS = {
  // Authentication endpoints - maps to FastAPI /api/auth/*
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    logout: '/api/auth/logout',
    refresh: '/api/auth/refresh',
    me: '/api/auth/me',

  },

  // Course endpoints - maps to FastAPI /api/courses/*
  courses: {
    list: '/api/courses',
    me: '/api/courses/me',
    getMycourse: (category: string, department: string, level: string, type: string) => `/api/courses/${category}/${department}/${level}/${type}`,
    detail: (id: string) => `/api/courses/${id}`,
    create: '/api/courses',
    update: (id: string) => `/api/courses/${id}`,
    delete: (id: string) => `/api/courses/${id}`,
    enroll: (id: string) => `/api/courses/${id}/enroll`,
    unenroll: (id: string) => `/api/courses/${id}/unenroll`,
    students: (id: string) => `/api/courses/${id}/students`,
    analytics: (id: string) => `/api/courses/${id}/analytics`,
  },

  // Module endpoints - maps to FastAPI /api/modules/*
  modules: {
    create: "/modules",    // FIXED
    detail: (id: string) => `/modules/${id}`,
    get_course_module: (id: string) => `/modules/course/${id}`,
    update: (id: string) => `/modules/update/${id}`,
    delete: (id: string) => `/modules/${id}`,
    reorder: "/api/modules/reorder",
  },


  // Lesson endpoints - maps to FastAPI /api/lessons/*
  // Lesson endpoints inside module service (correct)
  lessonRoutes: {
    create: (moduleId: string) => `/modules/${moduleId}/lessons`,          // POST
    list: (moduleId: string) => `/modules/lessons/${moduleId}/lessons`,            // GET all lessons by module
    detail: (lessonId: string) => `/modules/lessons/${lessonId}`,          // GET single lesson
    update: (lessonId: string) => `/modules/lessons/update/${lessonId}`,   // PUT
    delete: (lessonId: string) => `/modules/lessons/delete/${lessonId}`,   // DELETE
    uploadFile: (lessonId: string) => `/modules/lessons/uploads/${lessonId}/file`, // POST file
  },

  // Assignment endpoints - maps to FastAPI /api/assignments/*
  assignments: {
    list: '/api/assignments',
    detail: (id: string) => `/api/assignments/${id}`,
    create: '/api/assignments',
    update: (id: string) => `/api/assignments/${id}`,
    delete: (id: string) => `/api/assignments/${id}`,
    submit: (id: string) => `/api/assignments/${id}/submit`,
    submissions: (id: string) => `/api/assignments/${id}/submissions`,
    grade: (id: string, submissionId: string) => `/api/assignments/${id}/submissions/${submissionId}/grade`,
  },

  // Grade endpoints - maps to FastAPI /api/grades/*
  grades: {
    student: '/api/grades/me',
    course: (courseId: string) => `/api/grades/courses/${courseId}`,
    all: '/api/grades',
  },

  // Schedule endpoints - maps to FastAPI /api/schedule/*
  schedule: {
    list: '/api/schedule',
    create: '/api/schedule',
    update: (id: string) => `/api/schedule/${id}`,
    delete: (id: string) => `/api/schedule/${id}`,
    upcoming: '/api/schedule/upcoming',
  },

  // Forum endpoints - maps to FastAPI /api/forums/*
  forums: {
    list: '/api/forums',
    detail: (id: string) => `/api/forums/${id}`,
    create: '/api/forums',
    posts: (forumId: string) => `/api/forums/${forumId}/posts`,
    createPost: '/api/forums/posts',
    reply: (postId: string) => `/api/forums/posts/${postId}/replies`,
  },

  // Certificate endpoints - maps to FastAPI /api/certificates/*
  certificates: {
    list: '/api/certificates',
    detail: (id: string) => `/api/certificates/${id}`,
    generate: (courseId: string) => `/api/certificates/generate/${courseId}`,
    verify: (id: string) => `/api/certificates/verify/${id}`,
  },

  // Analytics endpoints - maps to FastAPI /api/analytics/*
  analytics: {
    instructor: '/api/analytics/instructor',
    course: (courseId: string) => `/api/analytics/courses/${courseId}`,
    student: '/api/analytics/student',
  },

  // Learning endpoints - maps to FastAPI /api/learning/*
  learning: {
    myCourses: '/api/learning/my-courses',
    courseProgress: (courseId: string) => `/api/learning/courses/${courseId}/progress`,
    markLessonComplete: (courseId: string, lessonId: string) =>
      `/api/learning/courses/${courseId}/lessons/${lessonId}/complete`,
    nextLesson: (courseId: string) => `/api/learning/courses/${courseId}/next-lesson`,
  },

  // Admin endpoints - maps to FastAPI /api/admin/*
  admin: {
    stats: '/api/admin/stats',
    users: '/api/admin/users',
    settings: '/api/admin/settings',
    approvals: '/api/admin/approvals',
    alerts: '/api/admin/alerts',
    analytics: '/api/admin/analytics',
  },

  // Message endpoints - maps to FastAPI /api/messages/*
  messages: {
    list: '/api/messages',
    send: '/api/messages',
    thread: (userId: string) => `/api/messages/thread/${userId}`,
    markRead: (id: string) => `/api/messages/${id}/read`,
  },

  // Profile endpoints - maps to FastAPI /api/profile/*
  profile: {
    get: '/api/profile',
    update: '/api/profile',
    uploadAvatar: '/api/profile/avatar',
  },
};
