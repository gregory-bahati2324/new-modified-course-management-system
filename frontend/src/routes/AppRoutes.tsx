import { Routes, Route } from "react-router-dom";

import Home from "@/pages/Home";
import Dashboard from "@/pages/Dashboard";
import Profile from "@/pages/Profile";
import SettingsPage from "@/pages/Settings";

import Courses from "@/pages/Courses";
import CourseDetail from "@/pages/CourseDetail";
import Forums from "@/pages/Forums";
import Certificates from "@/pages/Certificates";

import Login from "@/pages/auth/Login";
import Register from "@/pages/auth/Register";
import NotFound from "@/pages/NotFound";

// Layouts
import StudentLayout from "@/components/layout/StudentLayout";
import { InstructorLayout } from "@/components/layout/InstructorLayout";
import { AdminLayout } from "@/components/layout/AdminLayout";

// Student pages
import StudentCourses from "@/pages/student/Courses";
import Enrollment from "@/pages/student/Enrollment";
import StudentAssignments from "@/pages/student/Assignments";
import Exams from "@/pages/student/Exam";
import ExamHistory from "@/pages/student/ExamHistory";
import TakeExam from "@/pages/student/TakeExam";
import StudentSchedule from "@/pages/student/Schedule";
import StudentGrades from "@/pages/student/Grades";
import StudentProfile from "@/pages/student/Profile";
import CourseLearn from "@/pages/student/CourseLearn";
import StudentDiscussions from "@/pages/student/Discussions";
import StudentLiveSessions from "@/pages/student/LiveSessions";

// Instructor pages
import InstructorDashboard from "@/pages/instructor/Dashboard";
import InstructorCourses from "@/pages/instructor/Courses";
import InstructorModules from "@/pages/instructor/Modules";
import InstructorAssignments from "@/pages/instructor/Assignments";
import CreateCourse from "@/pages/instructor/CreateCourse";
import InstructorSchedule from "@/pages/instructor/Schedule";
import CourseManage from "@/pages/instructor/CourseManage";
import StudentReview from "@/pages/instructor/StudentReview";
import MessageStudents from "@/pages/instructor/MessageStudents";
import InstructorAnalytics from "@/pages/instructor/Analytics";
import ScheduleSession from "@/pages/instructor/ScheduleSession";
import EditCourseDescription from "@/pages/instructor/EditCourseDescription";
import AddModule from "@/pages/instructor/AddModule";
import AddLesson from "@/pages/instructor/AddLesson";
import CreateAssignment from "@/pages/instructor/CreateAssignment";
import ViewAssignment from "@/pages/instructor/ViewAssignment";
import GradeAssignment from "@/pages/instructor/GradeAssignment";
import ExamsTests from "@/pages/instructor/ExamsTests";
import CreateAssessment from "@/pages/instructor/CreateAssessment";
import StudentList from "@/pages/instructor/StudentList";
import GradeSubmissions from "@/pages/instructor/GradeSubmissions";
import MarkingDashboard from "@/pages/instructor/MarkingDashboard";
import MarkingSubmission from "@/pages/instructor/MarkingSubmission";
import ResultsOverview from "@/pages/instructor/ResultsOverview";
import InstructorDiscussions from "@/pages/instructor/Discussions";
import InstructorLiveSessions from "@/pages/instructor/LiveSessions";

// Admin pages
import AdminDashboard from "@/pages/admin/Dashboard";
import AdminLogin from "@/pages/admin/Login";
import AdminUsers from "@/pages/admin/Users";
import AdminSettings from "@/pages/admin/Settings";
import AdminAnalytics from "@/pages/admin/Analytics";
import AdminApprovals from "@/pages/admin/Approvals";
import AdminAddUser from "@/pages/admin/AddUser";
import AdminCreateCourse from "@/pages/admin/CreateCourse";
import AdminBulkImport from "@/pages/admin/BulkImport";
import AdminExportData from "@/pages/admin/ExportData";

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<Home />} />
      <Route path="/courses" element={<Courses />} />
      <Route path="/course/:id" element={<CourseDetail />} />
      <Route path="/forums" element={<Forums />} />
      <Route path="/certificates" element={<Certificates />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/settings" element={<SettingsPage />} />

      {/* Auth */}
      <Route path="/auth/login" element={<Login />} />
      <Route path="/auth/register" element={<Register />} />

      {/* ================= STUDENT ================= */}
      <Route path="/student" element={<StudentLayout />}>
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="courses" element={<StudentCourses />} />
        <Route path="enrollment" element={<Enrollment />} />
        <Route path="assignments" element={<StudentAssignments />} />
        <Route path="exams" element={<Exams />} />
        <Route path="exam-history" element={<ExamHistory />} />
        <Route path="exam/:examId/take" element={<TakeExam />} />
        <Route path="schedule" element={<StudentSchedule />} />
        <Route path="grades" element={<StudentGrades />} />
        <Route path="profile" element={<StudentProfile />} />
        <Route path="course/:courseId/learn" element={<CourseLearn />} />
        <Route path="discussions" element={<StudentDiscussions />} />
        <Route path="live-sessions" element={<StudentLiveSessions />} />
      </Route>

      {/* ================= INSTRUCTOR ================= */}
      <Route path="/instructor" element={<InstructorLayout />}>
        <Route index element={<InstructorDashboard />} />
        <Route path="courses" element={<InstructorCourses />} />
        <Route path="modules" element={<InstructorModules />} />
        <Route path="assignments" element={<InstructorAssignments />} />
        <Route path="create-course" element={<CreateCourse />} />
        <Route path="schedule" element={<InstructorSchedule />} />
        <Route path="course/:id/manage" element={<CourseManage />} />
        <Route path="review" element={<StudentReview />} />
        <Route path="messages" element={<MessageStudents />} />
        <Route path="analytics" element={<InstructorAnalytics />} />
        <Route path="schedule-session" element={<ScheduleSession />} />
        <Route path="course/:id/edit-description" element={<EditCourseDescription />} />
        <Route path="course/:id/add-module" element={<AddModule />} />
        <Route path="course/:courseId/module/:moduleId/add-lesson" element={<AddLesson />} />
        <Route path="course/:courseId/module/:moduleId/add-lesson/:lessonId" element={<AddLesson />} />

        <Route path="create-assignment" element={<CreateAssignment />} />
        <Route path="assignment/:assignmentId/view" element={<ViewAssignment />} />
        <Route path="assignment/:assignmentId/grade" element={<GradeAssignment />} />

        <Route path="exams" element={<ExamsTests />} />
        <Route path="create-assessment" element={<CreateAssessment />} />
        <Route path="exam/:examId/edit" element={<CreateAssessment />} />

        <Route path="grade" element={<GradeSubmissions />} />
        <Route path="students" element={<StudentList />} />
        <Route path="marking" element={<MarkingDashboard />} />
        <Route path="marking/submission/:id" element={<MarkingSubmission />} />
        <Route path="results-overview" element={<ResultsOverview />} />

        <Route path="discussions" element={<InstructorDiscussions />} />
        <Route path="live-sessions" element={<InstructorLiveSessions />} />
      </Route>

      {/* ================= ADMIN ================= */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route path="login" element={<AdminLogin />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="settings" element={<AdminSettings />} />
        <Route path="analytics" element={<AdminAnalytics />} />
        <Route path="approvals" element={<AdminApprovals />} />
        <Route path="add-user" element={<AdminAddUser />} />
        <Route path="create-course" element={<AdminCreateCourse />} />
        <Route path="bulk-import" element={<AdminBulkImport />} />
        <Route path="export-data" element={<AdminExportData />} />
      </Route>

      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}