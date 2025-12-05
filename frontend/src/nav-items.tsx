import { HomeIcon, BookOpen, Users, MessageSquare, Award, BarChart3, Settings, Calendar, FileText, Plus, Eye, Edit, FileQuestion, Shield, UserPlus, Upload, Download } from "lucide-react";
import Home from "./pages/Home.tsx";
import Dashboard from "./pages/Dashboard.tsx";
import Profile from "./pages/Profile.tsx";
import SettingsPage from "./pages/Settings.tsx";
import StudentCourses from "./pages/student/Courses.tsx";
import StudentAssignments from "./pages/student/Assignments.tsx";
import StudentSchedule from "./pages/student/Schedule.tsx";
import StudentGrades from "./pages/student/Grades.tsx";
import StudentProfile from "./pages/student/Profile.tsx";
import CourseLearn from "./pages/student/CourseLearn.tsx";
import InstructorDashboard from "./pages/instructor/Dashboard.tsx";
import InstructorCourses from "./pages/instructor/Courses.tsx";
import InstructorModules from "./pages/instructor/Modules.tsx";
import InstructorAssignments from "./pages/instructor/Assignments.tsx";
import CreateCourse from "./pages/instructor/CreateCourse.tsx";
import InstructorSchedule from "./pages/instructor/Schedule.tsx";
import CourseManage from "./pages/instructor/CourseManage.tsx";
import StudentReview from "./pages/instructor/StudentReview.tsx";
import MessageStudents from "./pages/instructor/MessageStudents.tsx";
import InstructorAnalytics from "./pages/instructor/Analytics.tsx";
import ScheduleSession from "./pages/instructor/ScheduleSession.tsx";
import EditCourseDescription from "./pages/instructor/EditCourseDescription.tsx";
import AddModule from "./pages/instructor/AddModule.tsx";
import AddLesson from "./pages/instructor/AddLesson.tsx";
import CreateAssignment from "./pages/instructor/CreateAssignment.tsx";
import ViewAssignment from "./pages/instructor/ViewAssignment.tsx";
import GradeAssignment from "./pages/instructor/GradeAssignment.tsx";
import ExamsTests from "./pages/instructor/ExamsTests.tsx";
import CreateAssessment from "./pages/instructor/CreateAssessment.tsx";
import StudentList from "./pages/instructor/StudentList.tsx";
import GradeSubmissions from "./pages/instructor/GradeSubmissions.tsx";
import MarkingDashboard from "./pages/instructor/MarkingDashboard.tsx";
import MarkingSubmission from "./pages/instructor/MarkingSubmission.tsx";
import ResultsOverview from "./pages/instructor/ResultsOverview.tsx";
import InstructorDiscussions from "./pages/instructor/Discussions.tsx";
import InstructorLiveSessions from "./pages/instructor/LiveSessions.tsx";
import StudentDiscussions from "./pages/student/Discussions.tsx";
import StudentLiveSessions from "./pages/student/LiveSessions.tsx";
import AdminDashboard from "./pages/admin/Dashboard.tsx";
import AdminLogin from "./pages/admin/Login.tsx";
import AdminUsers from "./pages/admin/Users.tsx";
import AdminSettings from "./pages/admin/Settings.tsx";
import AdminAnalytics from "./pages/admin/Analytics.tsx";
import AdminApprovals from "./pages/admin/Approvals.tsx";
import AdminAddUser from "./pages/admin/AddUser.tsx";
import AdminCreateCourse from "./pages/admin/CreateCourse.tsx";
import AdminBulkImport from "./pages/admin/BulkImport.tsx";
import AdminExportData from "./pages/admin/ExportData.tsx";
import Courses from "./pages/Courses.tsx";
import CourseDetail from "./pages/CourseDetail.tsx";
import Forums from "./pages/Forums.tsx";
import Certificates from "./pages/Certificates.tsx";
import Login from "./pages/auth/Login.tsx";
import Register from "./pages/auth/Register.tsx";
import NotFound from "./pages/NotFound.tsx";
import StudentLayout from "./components/layout/StudentLayout.tsx";
import { InstructorLayout } from "./components/layout/InstructorLayout.tsx";
import { AdminLayout } from "./components/layout/AdminLayout.tsx";

export const navItems = [
  {
    title: "Home",
    to: "/",
    icon: <HomeIcon className="h-4 w-4" />,
    page: <Home />,
  },
  {
    title: "Student Dashboard",
    to: "/dashboard",
    icon: <BarChart3 className="h-4 w-4" />,
    page: <Dashboard />,
  },
  {
    title: "Student Courses",
    to: "/student/courses",
    icon: <BookOpen className="h-4 w-4" />,
    page: <StudentLayout><StudentCourses /></StudentLayout>,
  },
  {
    title: "Student Assignments",
    to: "/student/assignments",
    icon: <FileText className="h-4 w-4" />,
    page: <StudentLayout><StudentAssignments /></StudentLayout>,
  },
  {
    title: "Student Schedule",
    to: "/student/schedule",
    icon: <Calendar className="h-4 w-4" />,
    page: <StudentLayout><StudentSchedule /></StudentLayout>,
  },
  {
    title: "Student Grades",
    to: "/student/grades",
    icon: <Award className="h-4 w-4" />,
    page: <StudentLayout><StudentGrades /></StudentLayout>,
  },
  {
    title: "Student Profile",
    to: "/student/profile",
    icon: <Users className="h-4 w-4" />,
    page: <StudentLayout><StudentProfile /></StudentLayout>,
  },
  {
    title: "Course Learn",
    to: "/student/course/:courseId/learn",
    icon: <BookOpen className="h-4 w-4" />,
    page: <StudentLayout><CourseLearn /></StudentLayout>,
  },
  {
    title: "Instructor Dashboard",
    to: "/instructor",
    icon: <BarChart3 className="h-4 w-4" />,
    page: <InstructorDashboard />,
  },
  {
    title: "Instructor Courses",
    to: "/instructor/courses",
    icon: <BookOpen className="h-4 w-4" />,
    page: <InstructorCourses />,
  },
  {
    title: "Instructor Modules",
    to: "/instructor/modules",
    icon: <FileText className="h-4 w-4" />,
    page: <InstructorModules />,
  },
  {
    title: "Instructor Assignments",
    to: "/instructor/assignments",
    icon: <FileQuestion className="h-4 w-4" />,
    page: <InstructorAssignments />,
  },
  {
    title: "Create Course",
    to: "/instructor/create-course",
    icon: <BookOpen className="h-4 w-4" />,
    page: <InstructorLayout><CreateCourse /></InstructorLayout>,
  },
  {
    title: "Instructor Schedule",
    to: "/instructor/schedule",
    icon: <BarChart3 className="h-4 w-4" />,
    page: <InstructorSchedule />,
  },
  {
    title: "Course Management",
    to: "/instructor/course/:id/manage",
    icon: <BookOpen className="h-4 w-4" />,
    page: <CourseManage />,
  },
  {
    title: "Student Review",
    to: "/instructor/review",
    icon: <Users className="h-4 w-4" />,
    page: <StudentReview />,
  },
  {
    title: "Message Students",
    to: "/instructor/messages",
    icon: <MessageSquare className="h-4 w-4" />,
    page: <MessageStudents />,
  },
  {
    title: "Instructor Analytics",
    to: "/instructor/analytics",
    icon: <BarChart3 className="h-4 w-4" />,
    page: <InstructorLayout><InstructorAnalytics /></InstructorLayout>,
  },
  {
    title: "Schedule Session",
    to: "/instructor/schedule-session",
    icon: <Calendar className="h-4 w-4" />,
    page: <ScheduleSession />,
  },
  {
    title: "Edit Course Description",
    to: "/instructor/course/:id/edit-description",
    icon: <FileText className="h-4 w-4" />,
    page: <EditCourseDescription />,
  },
  {
    title: "Add Module",
    to: "/instructor/course/:id/add-module",
    icon: <Plus className="h-4 w-4" />,
    page: <AddModule />,
  },
  {
    title: "Add Lesson",
    to: "/instructor/course/:courseId/module/:moduleId/add-lesson",
    icon: <Plus className="h-4 w-4" />,
    page: <AddLesson />,
  },
  {
    title: "Edit Lesson",
    to: "/instructor/course/:courseId/module/:moduleId/add-lesson/:lessonId",
    icon: <Edit className="h-4 w-4" />,
    page: <AddLesson />, // same page as Add Lesson
  },

  {
    title: "Create Assignment",
    to: "/instructor/create-assignment",
    icon: <FileText className="h-4 w-4" />,
    page: <InstructorLayout><CreateAssignment /></InstructorLayout>,
  },
  {
    title: "View Assignment",
    to: "/instructor/assignment/:assignmentId/view",
    icon: <Eye className="h-4 w-4" />,
    page: <InstructorLayout><ViewAssignment /></InstructorLayout>,
  },
  {
    title: "Grade Assignment",
    to: "/instructor/assignment/:assignmentId/grade",
    icon: <Edit className="h-4 w-4" />,
    page: <InstructorLayout><GradeAssignment /></InstructorLayout>,
  },
  {
    title: "Tests & Exams",
    to: "/instructor/exams",
    icon: <FileQuestion className="h-4 w-4" />,
    page: <ExamsTests />,
  },
  {
    title: "Create Assessment",
    to: "/instructor/create-assessment",
    icon: <Plus className="h-4 w-4" />,
    page: <InstructorLayout><CreateAssessment /></InstructorLayout>,
  },
  {
    title: "Grade Submissions",
    to: "/instructor/grade",
    icon: <Edit className="h-4 w-4" />,
    page: <GradeSubmissions />,
  },
  {
    title: "Student List",
    to: "/instructor/students",
    icon: <Users className="h-4 w-4" />,
    page: <StudentList />,
  },
  {
    title: "AI Marking Dashboard",
    to: "/instructor/marking",
    icon: <BarChart3 className="h-4 w-4" />,
    page: <MarkingDashboard />,
  },
  {
    title: "Marking Submission",
    to: "/instructor/marking/submission/:id",
    icon: <Edit className="h-4 w-4" />,
    page: <MarkingSubmission />,
  },
  {
    title: "Results Overview",
    to: "/instructor/results-overview",
    icon: <Award className="h-4 w-4" />,
    page: <ResultsOverview />,
  },
  {
    title: "Instructor Discussions",
    to: "/instructor/discussions",
    icon: <MessageSquare className="h-4 w-4" />,
    page: <InstructorDiscussions />,
  },
  {
    title: "Instructor Live Sessions",
    to: "/instructor/live-sessions",
    icon: <BookOpen className="h-4 w-4" />,
    page: <InstructorLiveSessions />,
  },
  {
    title: "Student Discussions",
    to: "/student/discussions",
    icon: <MessageSquare className="h-4 w-4" />,
    page: <StudentDiscussions />,
  },
  {
    title: "Student Live Sessions",
    to: "/student/live-sessions",
    icon: <BookOpen className="h-4 w-4" />,
    page: <StudentLiveSessions />,
  },
  {
    title: "Admin Login",
    to: "/admin/login",
    icon: <Shield className="h-4 w-4" />,
    page: <AdminLogin />,
  },
  {
    title: "Admin Dashboard",
    to: "/admin/dashboard",
    icon: <Settings className="h-4 w-4" />,
    page: <AdminDashboard />,
  },
  {
    title: "Admin Users",
    to: "/admin/users",
    icon: <Users className="h-4 w-4" />,
    page: <AdminUsers />,
  },
  {
    title: "Admin Settings",
    to: "/admin/settings",
    icon: <Settings className="h-4 w-4" />,
    page: <AdminSettings />,
  },
  {
    title: "Admin Analytics",
    to: "/admin/analytics",
    icon: <BarChart3 className="h-4 w-4" />,
    page: <AdminAnalytics />,
  },
  {
    title: "Admin Approvals",
    to: "/admin/approvals",
    icon: <Settings className="h-4 w-4" />,
    page: <AdminApprovals />,
  },
  {
    title: "Admin Add User",
    to: "/admin/add-user",
    icon: <UserPlus className="h-4 w-4" />,
    page: <AdminAddUser />,
  },
  {
    title: "Admin Create Course",
    to: "/admin/create-course",
    icon: <Plus className="h-4 w-4" />,
    page: <AdminCreateCourse />,
  },
  {
    title: "Admin Bulk Import",
    to: "/admin/bulk-import",
    icon: <Upload className="h-4 w-4" />,
    page: <AdminBulkImport />,
  },
  {
    title: "Admin Export Data",
    to: "/admin/export-data",
    icon: <Download className="h-4 w-4" />,
    page: <AdminExportData />,
  },
  {
    title: "Courses",
    to: "/courses",
    icon: <BookOpen className="h-4 w-4" />,
    page: <Courses />,
  },
  {
    title: "Course Detail",
    to: "/course/:id",
    icon: <BookOpen className="h-4 w-4" />,
    page: <CourseDetail />,
  },
  {
    title: "Forums",
    to: "/forums",
    icon: <MessageSquare className="h-4 w-4" />,
    page: <Forums />,
  },
  {
    title: "Certificates",
    to: "/certificates",
    icon: <Award className="h-4 w-4" />,
    page: <Certificates />,
  },
  {
    title: "Profile",
    to: "/profile",
    icon: <Users className="h-4 w-4" />,
    page: <Profile />,
  },
  {
    title: "Settings",
    to: "/settings",
    icon: <Settings className="h-4 w-4" />,
    page: <SettingsPage />,
  },
  {
    title: "Login",
    to: "/auth/login",
    icon: <Users className="h-4 w-4" />,
    page: <Login />,
  },
  {
    title: "Register",
    to: "/auth/register",
    icon: <Users className="h-4 w-4" />,
    page: <Register />,
  },
  {
    title: "Not Found",
    to: "*",
    icon: <HomeIcon className="h-4 w-4" />,
    page: <NotFound />,
  },
];