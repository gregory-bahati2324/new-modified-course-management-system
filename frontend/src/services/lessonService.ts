// src/services/lessonService.ts
import {apiCourseClient, handleApiError} from "./moduleLessonapi"

export const lessonService = {
  getLessons(moduleId: string) {
    return api.get(`/modules/${moduleId}/lessons`);
  },

  getLessonById(lessonId: string) {
    return api.get(`/lessons/${lessonId}`);
  },

  createLesson(moduleId: string, data: any) {
    return api.post(`/modules/${moduleId}/lessons`, data);
  },

  updateLesson(lessonId: string, data: any) {
    return api.put(`/lessons/${lessonId}`, data);
  },

  deleteLesson(lessonId: string) {
    return api.delete(`/lessons/${lessonId}`);
  },

  reorderLessons(moduleId: string, orderData: any) {
    return api.put(`/modules/${moduleId}/lessons/reorder`, orderData);
  },
};
