import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  BookOpen, Users, Calendar, TrendingUp, FileText, Plus, Edit, Eye, Star, MessageSquare 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { authService, UserProfile } from '@/services/authService';
import apiClient from '@/services/api';
import { API_ENDPOINTS } from '@/config/api.config';
import { CourseSearchModule } from '@/components/CourseSearchModule';
import { InstructorLayout } from '@/components/layout/InstructorLayout';
import { useNavigate } from 'react-router-dom';
import { useInstructorAuth } from '@/hooks/useInstructorAuth';


// ----------------------
// Instructor Dashboard Component
// ----------------------
export default function InstructorDashboard() {
  useInstructorAuth(); // protect page

  const [instructor, setInstructor] = useState<UserProfile | null>(null);
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Mock data for things we don’t yet have APIs for
  const recentSubmissions = [
    { studentName: "John Mwalimu", course: "Advanced Database Systems", assignment: "Database Design Project", submittedAt: "2 hours ago", status: "pending" },
    { studentName: "Grace Kikoti", course: "Machine Learning Fundamentals", assignment: "ML Algorithm Implementation", submittedAt: "4 hours ago", status: "pending" },
  ];

  const upcomingSessions = [
    { title: "Advanced Database Systems - Lecture 8", course: "CS 401", date: "Dec 12, 2024", time: "10:00 AM - 12:00 PM", location: "Room 201, CS Building", type: "lecture" },
    { title: "Data Structures Lab Session", course: "CS 201", date: "Dec 13, 2024", time: "2:00 PM - 4:00 PM", location: "Computer Lab 1", type: "lab" },
  ];

  // Fetch instructor and courses from backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        const user = await authService.getCurrentUser();
        setInstructor(user);

        // Fetch courses
        const response = await apiClient.get(API_ENDPOINTS.learning.myCourses);
        setCourses(response.data);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading || !instructor) {
    return <div className="text-center py-20">Loading instructor info...</div>;
  }

  // Stats - you can integrate analytics later
  const stats = [
    { title: "Active Courses", value: courses.length.toString(), description: "This semester", icon: BookOpen, trend: "+0 from last semester" },
    { title: "Total Students", value: courses.reduce((sum, c) => sum + (c.students || 0), 0).toString(), description: "Across all courses", icon: Users, trend: "+0 from last semester" },
    { title: "Pending Reviews", value: recentSubmissions.length.toString(), description: "Assignments to grade", icon: FileText, trend: "Due this week" },
    { title: "Course Rating", value: "4.8", description: "Average rating", icon: Star, trend: "Excellent feedback" }
  ];

  return (
    <InstructorLayout>
      <div className="container py-6 lg:py-8 space-y-6 lg:space-y-8 animate-fade-in">
        {/* Welcome Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-2xl lg:text-3xl font-bold">
              Welcome back, {instructor.first_name} {instructor.last_name}! 👋
            </h1>
            <div className="flex flex-wrap items-center gap-2 lg:gap-4 text-sm text-muted-foreground">
              <span>{instructor.registrationNumber}</span>
              <span className="hidden sm:inline">•</span>
              <span className="hidden sm:inline">Department: TBD</span>
              <span className="hidden md:inline">•</span>
              <span className="hidden md:inline">Title: TBD</span>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 lg:gap-3 w-full md:w-auto">
            <Button asChild variant="outline" size="sm" className="flex-1 md:flex-none">
              <Link to="/instructor/schedule">
                <Calendar className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">View </span>Schedule
              </Link>
            </Button>
            <Button asChild size="sm" className="flex-1 md:flex-none">
              <Link to="/instructor/create-course">
                <Plus className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Create </span>Course
              </Link>
            </Button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {stats.map((stat, index) => (
            <Card key={index} className="hover:shadow-academic transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold mb-1">{stat.value}</div>
                <p className="text-xs text-muted-foreground mb-2">{stat.description}</p>
                <div className="flex items-center text-xs text-success">
                  <TrendingUp className="mr-1 h-3 w-3" />
                  {stat.trend}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* My Courses */}
          <div className="lg:col-span-2 space-y-6">
            <CourseSearchModule />

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />My Courses
                </CardTitle>
                <CardDescription>Manage and monitor your courses</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {courses.map((course) => (
                  <div key={course.id} className="flex flex-col lg:flex-row lg:items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <h3 className="font-semibold">{course.title}</h3>
                          <p className="text-sm text-muted-foreground">{course.code}</p>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant={course.status === 'published' ? 'default' : 'secondary'}>
                            {course.status}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {course.students || 0} students
                          </Badge>
                        </div>
                      </div>
                      <Progress value={course.progress || 0} className="h-2" />
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-muted-foreground">
                        <span>Next: {course.nextSession || "Not scheduled"}</span>
                        <span>{course.pendingSubmissions || 0} pending submissions</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button asChild size="sm" variant="outline" className="flex-1 sm:flex-none">
                        <Link to={`/course/${course.id}`}>
                          <Eye className="mr-2 h-4 w-4" />
                          View
                        </Link>
                      </Button>
                      <Button asChild size="sm" className="flex-1 sm:flex-none">
                        <Link to={`/instructor/course/${course.id}/manage`}>
                          <Edit className="mr-2 h-4 w-4" />
                          Manage
                        </Link>
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Recent Submissions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />Recent Submissions
                </CardTitle>
                <CardDescription>Student assignments waiting for review</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentSubmissions.map((submission, index) => (
                    <div key={index} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg bg-card-subtle gap-3">
                      <div className="space-y-1 flex-1">
                        <p className="font-medium">{submission.studentName}</p>
                        <p className="text-sm text-muted-foreground">{submission.assignment}</p>
                        <p className="text-xs text-muted-foreground">{submission.course}</p>
                        <p className="text-xs text-muted-foreground">Submitted {submission.submittedAt}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={submission.status === 'pending' ? 'bg-warning text-warning-foreground' : 'bg-success text-success-foreground'}>
                          {submission.status}
                        </Badge>
                        <Button asChild size="sm" variant="outline">
                          <Link to="/instructor/review">Review</Link>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Upcoming Sessions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />Upcoming Sessions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {upcomingSessions.map((session, index) => (
                  <div key={index} className="space-y-2 p-3 rounded-lg bg-card-subtle">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-sm font-medium line-clamp-2">{session.title}</h4>
                      <Badge variant="secondary" className="text-xs shrink-0">{session.type}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{session.course}</p>
                    <div className="text-xs text-muted-foreground">
                      <p>{session.date} • {session.time}</p>
                      <p>{session.location}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button asChild variant="outline" size="sm" className="w-full justify-start">
                  <Link to="/instructor/create-course">
                    <Plus className="mr-2 h-4 w-4" />Create New Course
                  </Link>
                </Button>
                <Button asChild variant="outline" size="sm" className="w-full justify-start">
                  <Link to="/instructor/schedule">
                    <Calendar className="mr-2 h-4 w-4" />Schedule Session
                  </Link>
                </Button>
                <Button asChild variant="outline" size="sm" className="w-full justify-start">
                  <Link to="/instructor/messages">
                    <MessageSquare className="mr-2 h-4 w-4" />Message Students
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Performance Summary */}
            <Card className="bg-primary-gradient text-white">
              <CardContent className="pt-6 text-center">
                <TrendingUp className="h-8 w-8 mx-auto mb-2" />
                <h3 className="font-semibold mb-1">Excellent Teaching!</h3>
                <p className="text-sm opacity-90">Your courses have a 4.8/5 average rating from students.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </InstructorLayout>
  );
}
