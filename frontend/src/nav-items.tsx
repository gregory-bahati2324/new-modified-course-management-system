import { HomeIcon, BookOpen, Users, MessageSquare, Award, BarChart3, Settings, Calendar, FileText, Plus, Eye, Edit, FileQuestion, Shield } from "lucide-react";
import Home from "./pages/Home.tsx";
import Dashboard from "./pages/Dashboard.tsx";
import StudentCourses from "./pages/student/Courses.tsx";
import StudentAssignments from "./pages/student/Assignments.tsx";
import StudentSchedule from "./pages/student/Schedule.tsx";
import StudentGrades from "./pages/student/Grades.tsx";
import StudentProfile from "./pages/student/Profile.tsx";
import CourseLearn from "./pages/student/CourseLearn.tsx";
import InstructorDashboard from "./pages/instructor/Dashboard.tsx";
import CreateCourse from "./pages/instructor/CreateCourse.tsx";
import InstructorSchedule from "./pages/instructor/Schedule.tsx";
import CourseManage from "./pages/instructor/CourseManage.tsx";
import StudentReview from "./pages/instructor/StudentReview.tsx";
import MessageStudents from "./pages/instructor/MessageStudents.tsx";
import InstructorAnalytics from "./pages/instructor/Analytics.tsx";
import ScheduleSession from "./pages/instructor/ScheduleSession.tsx";
import EditCourseDescription from "./pages/instructor/EditCourseDescription.tsx";
import AddModule from "./pages/instructor/AddModule.tsx";
import CreateAssignment from "./pages/instructor/CreateAssignment.tsx";
import ViewAssignment from "./pages/instructor/ViewAssignment.tsx";
import GradeAssignment from "./pages/instructor/GradeAssignment.tsx";
import ExamsTests from "./pages/instructor/ExamsTests.tsx";
import AdminDashboard from "./pages/admin/Dashboard.tsx";
import AdminLogin from "./pages/admin/Login.tsx";
import AdminUsers from "./pages/admin/Users.tsx";
import AdminSettings from "./pages/admin/Settings.tsx";
import AdminAnalytics from "./pages/admin/Analytics.tsx";
import AdminApprovals from "./pages/admin/Approvals.tsx";
import Courses from "./pages/Courses.tsx";
import CourseDetail from "./pages/CourseDetail.tsx";
import Forums from "./pages/Forums.tsx";
import Certificates from "./pages/Certificates.tsx";
import Login from "./pages/auth/Login.tsx";
import Register from "./pages/auth/Register.tsx";
import NotFound from "./pages/NotFound.tsx";

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
    page: <StudentCourses />,
  },
  {
    title: "Student Assignments",
    to: "/student/assignments",
    icon: <FileText className="h-4 w-4" />,
    page: <StudentAssignments />,
  },
  {
    title: "Student Schedule",
    to: "/student/schedule",
    icon: <Calendar className="h-4 w-4" />,
    page: <StudentSchedule />,
  },
  {
    title: "Student Grades",
    to: "/student/grades",
    icon: <Award className="h-4 w-4" />,
    page: <StudentGrades />,
  },
  {
    title: "Student Profile",
    to: "/student/profile",
    icon: <Users className="h-4 w-4" />,
    page: <StudentProfile />,
  },
  {
    title: "Course Learn",
    to: "/student/course/:courseId/learn",
    icon: <BookOpen className="h-4 w-4" />,
    page: <CourseLearn />,
  },
  {
    title: "Instructor Dashboard", 
    to: "/instructor",
    icon: <BarChart3 className="h-4 w-4" />,
    page: <InstructorDashboard />,
  },
  {
    title: "Create Course",
    to: "/instructor/create-course",
    icon: <BookOpen className="h-4 w-4" />,
    page: <CreateCourse />,
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
    page: <InstructorAnalytics />,
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
    title: "Create Assignment",
    to: "/instructor/course/:id/create-assignment",
    icon: <FileText className="h-4 w-4" />,
    page: <CreateAssignment />,
  },
  {
    title: "View Assignment",
    to: "/instructor/course/:id/assignment/:assignmentId/view",
    icon: <Eye className="h-4 w-4" />,
    page: <ViewAssignment />,
  },
  {
    title: "Grade Assignment",
    to: "/instructor/course/:id/assignment/:assignmentId/submission/:submissionId/grade",
    icon: <Edit className="h-4 w-4" />,
    page: <GradeAssignment />,
  },
  {
    title: "Tests & Exams",
    to: "/instructor/exams",
    icon: <FileQuestion className="h-4 w-4" />,
    page: <ExamsTests />,
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