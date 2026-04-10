import { apiMarkingGradingClient, handleApiError } from "./markingGradingApi";
import { API_ENDPOINTS } from "../config/api.config";

export interface StudentSubmission {
  id: string;
  student_id: string;
  student_name: string;
  course_id: string;
  course_name: string;
  assignment_id: string;
  assignment_title: string;
  submitted_at: string;
  file_url?: string; // URL to the submitted file
  grade?: number; // Grade assigned by the instructor
  feedback?: string; // Feedback from the instructor
  max_score?: number; // Maximum score for the assignment
  type: string; // "assignment" or "assessment"
  submission_type: string; // "assignment" or "assessment" (for backward compatibility)
}

class MarkingGradingService {
  async getStudentSubmissions(): Promise<StudentSubmission[]> {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await apiMarkingGradingClient.get<StudentSubmission[]>(
        API_ENDPOINTS.Marking_grading.student_submissions,
        { headers: { Authorization: `Bearer ${token}` }, }
      );
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async getSubmissionDetails(submissionId: string, submissionType: string) {
    try {
      const token = localStorage.getItem('accessToken');

      const response = await apiMarkingGradingClient.get(
        API_ENDPOINTS.Marking_grading.submission_details(submissionId),
        {
          headers: { Authorization: `Bearer ${token}` },
          params: { submission_type: submissionType } // Pass submission type as query param
        }
      );

      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }
}

export const markingGradingService = new MarkingGradingService();