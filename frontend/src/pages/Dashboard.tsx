import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  Calendar,
  Clock,
  Trophy,
  CheckCircle2,
  FileText,
  PlayCircle,
} from 'lucide-react';
import { authService, UserProfile } from '@/services/authService';
import { courseService, type Course } from '@/services/courseService';
import { apiAssessmentClient } from '@/services/assessmentsapi';
import { apiProgressClient } from '@/services/apiProgress';
import { apiSchedulingClient } from '@/services/schedulingapi';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface StudentAssignment {
  id: string;
  title: string;
  course_id: string;
  course_title?: string;
  due_date?: string;
  status: 'pending' | 'submitted' | 'overdue' | string;
  submitted?: boolean;
  graded?: boolean;
  score?: number;
}

interface CourseProgress {
  course_id: string;
  completed_modules: number;
  total_modules: number;
  completed_lessons: number;
  total_lessons: number;
  progress_percentage: number;
  is_completed: boolean;
  last_accessed_at?: string;
}


interface LearningSession {
  id: string;
  title: string;
  course_id: string;
  date: string;
  start_time: string;
  end_time: string;
  location: string;
  type: string;
}

export default function Dashboard() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [progress, setProgress] = useState<CourseProgress[]>([]);
  const [assignments, setAssignments] = useState<StudentAssignment[]>([]);
  const [sessions, setSessions] = useState<LearningSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const loadDashboard = async () => {
      try {
        const currentUser = await authService.getCurrentUser();
        const [enrolledCourses, studentAssignments] = await Promise.all([
          courseService.getEnrolledCourses(),
          apiAssessmentClient
            .get<StudentAssignment[]>('/assignments/student/assignments')
            .then((response) => response.data),
        ]);

        if (cancelled) return;

        setUser(currentUser);
        setCourses(enrolledCourses);
        setAssignments(studentAssignments);

        const [courseProgress, mySessions] = await Promise.all([
          Promise.all(
            enrolledCourses.map(async (course) => {
              try {
                const response = await apiProgressClient.get<CourseProgress>(
                  `/progress/courses/${course.id}`,
                );
                return response.data;
              } catch {
                return null;
              }
            }),
          ),
          Promise.all(
            enrolledCourses.map(async (course) => {
              try {
                const response = await apiSchedulingClient.get<LearningSession[]>(
                  `/sessions/course/${course.id}`,
                );
                return response.data;
              } catch {
                return [];
              }
            }),
          ),
        ]);

        if (cancelled) return;

        setProgress(courseProgress.filter(Boolean) as CourseProgress[]);
        setSessions(
          mySessions
            .flat()
            .sort((a, b) => `${a.date} ${a.start_time}`.localeCompare(`${b.date} ${b.start_time}`)),
        );
      } catch (error) {
        console.error('Unable to load student dashboard:', error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadDashboard();

    return () => {
      cancelled = true;
    };
  }, []);

  const progressByCourse = useMemo(
    () => new Map(progress.map((item) => [item.course_id, item])),
    [progress],
  );

  const courseById = useMemo(
    () => new Map(courses.map((course) => [course.id, course])),
    [courses],
  );

  const learningTimeSeconds = progress.reduce((total, item) => total + (item.completed_lessons || 0), 0);

  const completedAssignments = assignments.filter(
    (assignment) => assignment.submitted || assignment.status === 'submitted' || assignment.graded,
  ).length;

  const completedCourses = progress.filter((item) => item.is_completed).length;

  const upcomingAssignments = assignments
    .filter((assignment) => assignment.status === 'pending' || assignment.status === 'overdue')
    .filter((assignment) => assignment.due_date)
    .sort((a, b) => new Date(a.due_date!).getTime() - new Date(b.due_date!).getTime())
    .slice(0, 4);

  if (loading) {
    return <div className="py-20 text-center text-muted-foreground">Loading your Moodle dashboard...</div>;
  }

  if (!user) {
    return <div className="py-20 text-center text-muted-foreground">Unable to load your account.</div>;
  }

  const initials = `${user.first_name?.[0] || ''}${user.last_name?.[0] || ''}`.toUpperCase();

  return (
    <div className="container space-y-8 py-6 lg:py-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Moodle Dashboard</p>
          <h1 className="text-2xl font-bold lg:text-3xl">
            Welcome, {user.first_name} {user.last_name}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">{user.registrationNumber}</p>
        </div>
        <Avatar className="h-12 w-12">
          <AvatarFallback>{initials || 'S'}</AvatarFallback>
        </Avatar>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Enrolled courses</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{courses.length}</div><p className="text-xs text-muted-foreground">Current courses</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Submitted assignments</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{completedAssignments}</div><p className="text-xs text-muted-foreground">From your assignments</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Completed courses</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{completedCourses}</div><p className="text-xs text-muted-foreground">Based on course progress</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Learning activity</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{learningTimeSeconds}</div><p className="text-xs text-muted-foreground">Completed lessons</p></CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><BookOpen className="h-5 w-5" /> My courses</CardTitle>
              <CardDescription>Your enrolled courses and current progress.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {courses.length === 0 && (
                <p className="py-6 text-center text-muted-foreground">You are not enrolled in any courses yet.</p>
              )}
              {courses.map((course) => {
                const item = progressByCourse.get(course.id);
                const percentage = item?.progress_percentage ?? 0;

                return (
                  <div key={course.id} className="rounded-lg border p-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <h3 className="font-semibold">{course.title}</h3>
                        <p className="text-sm text-muted-foreground">{course.code} · {course.instructor_name || 'Instructor'}</p>
                      </div>
                      <Badge variant={item?.is_completed ? 'default' : 'secondary'}>
                        {item?.is_completed ? 'Completed' : `${percentage}%`}
                      </Badge>
                    </div>
                    <Progress value={percentage} className="mt-4 h-2" />
                    <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                      <span>{item?.completed_lessons ?? 0} / {item?.total_lessons ?? 0} lessons</span>
                      <Button size="sm" variant="outline" asChild>
                        <Link to={`/student/course/${course.id}/learn`}>
                          <PlayCircle className="mr-2 h-4 w-4" /> Continue
                        </Link>
                      </Button>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5" /> Recent assignments</CardTitle>
              <CardDescription>Assignment status from Moodle.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {assignments.slice(0, 5).map((assignment) => (
                <div key={assignment.id} className="flex items-center justify-between gap-4 rounded-lg border p-3">
                  <div className="min-w-0">
                    <p className="font-medium">{assignment.title}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {assignment.course_title || courseById.get(assignment.course_id)?.title || 'Course'}
                    </p>
                  </div>
                  <Badge variant={assignment.status === 'submitted' ? 'default' : assignment.status === 'overdue' ? 'destructive' : 'secondary'}>
                    {assignment.status}
                  </Badge>
                </div>
              ))}
              {assignments.length === 0 && <p className="py-4 text-center text-muted-foreground">No assignments found.</p>}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Calendar className="h-5 w-5" /> Upcoming deadlines</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {upcomingAssignments.map((assignment) => (
                <div key={assignment.id} className="rounded-lg bg-muted/50 p-3">
                  <p className="text-sm font-medium">{assignment.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {assignment.course_title || courseById.get(assignment.course_id)?.title}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {new Date(assignment.due_date!).toLocaleString()}
                  </p>
                </div>
              ))}
              {upcomingAssignments.length === 0 && <p className="py-4 text-center text-muted-foreground">No upcoming deadlines.</p>}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Clock className="h-5 w-5" /> Scheduled sessions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {sessions.slice(0, 4).map((session) => (
                <div key={session.id} className="rounded-lg border p-3">
                  <p className="text-sm font-medium">{session.title}</p>
                  <p className="text-xs text-muted-foreground">{courseById.get(session.course_id)?.title || 'Course'}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{session.date} · {session.start_time}–{session.end_time}</p>
                  <p className="text-xs text-muted-foreground">{session.location}</p>
                </div>
              ))}
              {sessions.length === 0 && <p className="py-4 text-center text-muted-foreground">No scheduled sessions.</p>}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
