import { 
  BookOpen, 
  Calendar, 
  Trophy, 
  Clock, 
  TrendingUp, 
  Bell,
  PlayCircle,
  CheckCircle2,
  FileText,
  Users
} from 'lucide-react';
import StudentLayout from '@/components/layout/StudentLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function Dashboard() {
  const user = {
    name: "John Doe",
    studentId: "MUST/CS/2024/001",
    program: "Computer Science",
    level: "Level 3",
    avatar: undefined
  };

  const stats = [
    {
      title: "Enrolled Courses",
      value: "6",
      description: "Active this semester",
      icon: BookOpen,
      trend: "+2 from last semester"
    },
    {
      title: "Completed Assignments",
      value: "24",
      description: "Submitted on time",
      icon: CheckCircle2,
      trend: "95% completion rate"
    },
    {
      title: "Study Hours",
      value: "142",
      description: "This month",
      icon: Clock,
      trend: "+18 hours from last month"
    },
    {
      title: "Achievement Points",
      value: "1,340",
      description: "Total earned",
      icon: Trophy,
      trend: "Top 15% of class"
    }
  ];

  const enrolledCourses = [
    {
      id: 1,
      title: "Advanced Database Systems",
      instructor: "Dr. Sarah Johnson",
      progress: 75,
      nextDeadline: "Assignment 3 - Dec 15, 2024",
      status: "active",
      lastAccessed: "2 hours ago"
    },
    {
      id: 2,
      title: "Machine Learning Fundamentals",
      instructor: "Prof. Michael Chen",
      progress: 60,
      nextDeadline: "Final Project - Dec 20, 2024",
      status: "active",
      lastAccessed: "1 day ago"
    },
    {
      id: 3,
      title: "Software Engineering Principles",
      instructor: "Dr. Emily Davis",
      progress: 90,
      nextDeadline: "Code Review - Dec 12, 2024",
      status: "active",
      lastAccessed: "5 hours ago"
    },
    {
      id: 4,
      title: "Digital Signal Processing",
      instructor: "Prof. James Wilson",
      progress: 45,
      nextDeadline: "Lab Report 4 - Dec 18, 2024",
      status: "active",
      lastAccessed: "3 days ago"
    }
  ];

  const recentActivity = [
    {
      type: "assignment",
      title: "Database Design Assignment submitted",
      course: "Advanced Database Systems",
      time: "2 hours ago",
      status: "completed"
    },
    {
      type: "quiz",
      title: "ML Quiz 3 completed with 95% score",
      course: "Machine Learning Fundamentals",
      time: "1 day ago",
      status: "completed"
    },
    {
      type: "discussion",
      title: "Replied to Software Architecture discussion",
      course: "Software Engineering Principles",
      time: "2 days ago",
      status: "completed"
    },
    {
      type: "announcement",
      title: "New lecture materials uploaded",
      course: "Digital Signal Processing",
      time: "3 days ago",
      status: "new"
    }
  ];

  const upcomingDeadlines = [
    {
      title: "Code Review Submission",
      course: "Software Engineering Principles",
      date: "Dec 12, 2024",
      time: "11:59 PM",
      daysLeft: 3,
      priority: "high"
    },
    {
      title: "Database Assignment 3",
      course: "Advanced Database Systems",
      date: "Dec 15, 2024",
      time: "11:59 PM",
      daysLeft: 6,
      priority: "medium"
    },
    {
      title: "Lab Report 4",
      course: "Digital Signal Processing",
      date: "Dec 18, 2024",
      time: "11:59 PM",
      daysLeft: 9,
      priority: "medium"
    }
  ];

  return (
    <StudentLayout>
      <div className="container py-8 space-y-8 animate-fade-in">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Welcome back, {user.name}! 👋</h1>
          <div className="flex items-center gap-4 text-muted-foreground">
            <span>{user.studentId}</span>
            <span>•</span>
            <span>{user.program}</span>
            <span>•</span>
            <span>{user.level}</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => window.location.href = '/student/schedule'}>
            <Calendar className="mr-2 h-4 w-4" />
            View Schedule
          </Button>
          <Button size="sm" onClick={() => window.location.href = '/student/course/1/learn'}>
            <BookOpen className="mr-2 h-4 w-4" />
            Continue Learning
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="hover:shadow-academic transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold mb-1">{stat.value}</div>
              <p className="text-xs text-muted-foreground mb-2">
                {stat.description}
              </p>
              <div className="flex items-center text-xs text-success">
                <TrendingUp className="mr-1 h-3 w-3" />
                {stat.trend}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Enrolled Courses */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                My Courses
              </CardTitle>
              <CardDescription>
                Continue your learning journey with your enrolled courses
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {enrolledCourses.map((course) => (
                <div key={course.id} className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold">{course.title}</h3>
                      <Badge variant="secondary" className="text-xs">
                        {course.progress}% Complete
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      by {course.instructor}
                    </p>
                    <Progress value={course.progress} className="h-2" />
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Next: {course.nextDeadline}</span>
                      <span>Last accessed: {course.lastAccessed}</span>
                    </div>
                  </div>
                  <Button size="sm" className="ml-4" onClick={() => window.location.href = `/student/course/${course.id}/learn`}>
                    <PlayCircle className="mr-2 h-4 w-4" />
                    Continue
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-start gap-3 pb-3 border-b last:border-0">
                    <div className={`p-2 rounded-full ${
                      activity.type === 'assignment' ? 'bg-primary-subtle' :
                      activity.type === 'quiz' ? 'bg-success-subtle' :
                      activity.type === 'discussion' ? 'bg-warning-subtle' :
                      'bg-accent'
                    }`}>
                      {activity.type === 'assignment' && <FileText className="h-4 w-4" />}
                      {activity.type === 'quiz' && <CheckCircle2 className="h-4 w-4" />}
                      {activity.type === 'discussion' && <Users className="h-4 w-4" />}
                      {activity.type === 'announcement' && <Bell className="h-4 w-4" />}
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium">{activity.title}</p>
                      <p className="text-xs text-muted-foreground">{activity.course}</p>
                      <p className="text-xs text-muted-foreground">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Upcoming Deadlines */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Upcoming Deadlines
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {upcomingDeadlines.map((deadline, index) => (
                <div key={index} className="space-y-2 p-3 rounded-lg bg-card-subtle">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium">{deadline.title}</h4>
                    <Badge 
                      variant={deadline.priority === 'high' ? 'destructive' : 'secondary'}
                      className="text-xs"
                    >
                      {deadline.daysLeft} days
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{deadline.course}</p>
                  <div className="text-xs text-muted-foreground">
                    {deadline.date} at {deadline.time}
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
              <Button variant="outline" size="sm" className="w-full justify-start" onClick={() => window.location.href = '/courses'}>
                <BookOpen className="mr-2 h-4 w-4" />
                Browse Courses
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start" onClick={() => window.location.href = '/student/assignments'}>
                <FileText className="mr-2 h-4 w-4" />
                Submit Assignment
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start" onClick={() => window.location.href = '/forums'}>
                <Users className="mr-2 h-4 w-4" />
                Join Discussion
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start" onClick={() => window.location.href = '/certificates'}>
                <Trophy className="mr-2 h-4 w-4" />
                View Certificates
              </Button>
            </CardContent>
          </Card>

          {/* Achievement Badge */}
          <Card className="bg-success-gradient text-white">
            <CardContent className="pt-6 text-center">
              <Trophy className="h-8 w-8 mx-auto mb-2" />
              <h3 className="font-semibold mb-1">Top Performer!</h3>
              <p className="text-sm opacity-90">
                You're in the top 15% of your class. Keep up the excellent work!
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
      </div>
    </StudentLayout>
  );
}