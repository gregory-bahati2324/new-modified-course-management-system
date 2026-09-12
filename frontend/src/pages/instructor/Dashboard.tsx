import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen, Calendar, FileText, Plus, Edit, Eye
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { authService, UserProfile } from '@/services/authService';
import { courseService, type Course } from '@/services/courseService';
import { apiAssessmentClient } from '@/services/assessmentsapi';
import { apiSchedulingClient } from '@/services/schedulingapi';
import { CourseSearchModule } from '@/components/CourseSearchModule';
import { InstructorLayout } from '@/components/layout/InstructorLayout';
import { useInstructorAuth } from '@/hooks/useInstructorAuth';

interface Submission {
  id: string;
  student_id: string;
  student_name?: string;
  course_id: string;
  course_name?: string;
  assignment_title?: string;
  submitted_at: string;
  status?: string;
  type?: string;
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

export default function InstructorDashboard() {
  useInstructorAuth();

  const [instructor, setInstructor] = useState<UserProfile | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [sessions, setSessions] = useState<LearningSession[]>([]);
  const [studentCounts, setStudentCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const loadDashboard = async () => {
      try {
        const currentUser = await authService.getCurrentUser();
        const { courses: myCourses } = await courseService.getCourses();

        if (cancelled) return;

        setInstructor(currentUser);
        setCourses(myCourses);

        const [courseSubmissions, courseEnrollments, mySessions] = await Promise.all([
          Promise.all(
            myCourses.map(async (course) => {
              try {
                const response = await apiAssessmentClient.get<Submission[]>(
                  `/assignments/course/${course.id}/submissions`,
                );
                return response.data;
              } catch {
                return [];
              }
            }),
          ),
          Promise.all(
            myCourses.map(async (course) => {
              try {
                const response = await fetchCourseEnrollments(course.id);
                return [course.id, response] as const;
              } catch {
                return [course.id, 0] as const;
              }
            }),
          ),
          apiSchedulingClient
            .get<LearningSession[]>('/sessions/my')
            .then((response) => response.data)
            .catch(() => []),
        ]);

        if (cancelled) return;

        setSubmissions(courseSubmissions.flat());
        setStudentCounts(Object.fromEntries(courseEnrollments));
        setSessions(
          mySessions.sort((a, b) =>
            `${a.date} ${a.start_time}`.localeCompare(`${b.date} ${b.start_time}`),
          ),
        );
      } catch (error) {
        console.error('Unable to load instructor dashboard:', error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadDashboard();

    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return <div className="py-20 text-center text-muted-foreground">Loading your Moodle dashboard...</div>;
  }

  if (!instructor) {
    return <div className="py-20 text-center text-muted-foreground">Unable to load your account.</div>;
  }

  const pendingSubmissions = submissions.filter(
    (submission) => submission.status !== 'graded',
  );

  const totalStudents = Object.values(studentCounts).reduce((sum, count) => sum + count, 0);
  const publishedCourses = courses.filter((course) => course.is_published).length;

  const courseData = courses.map((course) => ({
    course,
    students: studentCounts[course.id] ?? 0,
    submissions: submissions.filter((submission) => submission.course_id === course.id),
  }));

  return (
    <InstructorLayout>
      <div className="container space-y-6 py-6 lg:space-y-8 lg:py-8">
        <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <div>
            <p className="text-sm text-muted-foreground">Greg-LMS Instructor Dashboard</p>
            <h1 className="text-2xl font-bold lg:text-3xl">
              Welcome, {instructor.first_name} {instructor.last_name}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">{instructor.registrationNumber}</p>
          </div>
          <div className="flex gap-2">
            <Button asChild variant="outline" size="sm">
              <Link to="/instructor/schedule"><Calendar className="mr-2 h-4 w-4" />Schedule</Link>
            </Button>
            <Button asChild size="sm">
              <Link to="/instructor/create-course"><Plus className="mr-2 h-4 w-4" />Create Course</Link>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">My courses</CardTitle></CardHeader>
            <CardContent><div className="text-2xl font-bold">{courses.length}</div><p className="text-xs text-muted-foreground">Courses assigned to you</p></CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Enrolled students</CardTitle></CardHeader>
            <CardContent><div className="text-2xl font-bold">{totalStudents}</div><p className="text-xs text-muted-foreground">Across your courses</p></CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Pending reviews</CardTitle></CardHeader>
            <CardContent><div className="text-2xl font-bold">{pendingSubmissions.length}</div><p className="text-xs text-muted-foreground">Submitted work</p></CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Published courses</CardTitle></CardHeader>
            <CardContent><div className="text-2xl font-bold">{publishedCourses}</div><p className="text-xs text-muted-foreground">Visible to learners</p></CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <CourseSearchModule />

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><BookOpen className="h-5 w-5" /> My courses</CardTitle>
                <CardDescription>Real course and enrollment information from the backend.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {courseData.length === 0 && (
                  <p className="py-6 text-center text-muted-foreground">You have not created any courses yet.</p>
                )}
                {courseData.map(({ course, students, submissions: courseSubmissions }) => (
                  <div key={course.id} className="rounded-lg border p-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <h3 className="font-semibold">{course.title}</h3>
                        <p className="text-sm text-muted-foreground">{course.code}</p>
                      </div>
                      <div className="flex gap-2">
                        <Badge variant={course.is_published ? 'default' : 'secondary'}>
                          {course.is_published ? 'Published' : 'Draft'}
                        </Badge>
                        <Badge variant="outline">{students} students</Badge>
                      </div>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
                      <span>{courseSubmissions.length} submissions</span>
                      <span>·</span>
                      <span>{course.category || 'No category'}</span>
                    </div>
                    
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5" /> Recent submissions</CardTitle>
                <CardDescription>Submission records retrieved from the assessment service.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {submissions.slice(0, 6).map((submission) => (
                  <div key={submission.id} className="flex flex-col gap-3 rounded-lg border p-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-medium">{submission.student_name || submission.student_id}</p>
                      <p className="text-sm text-muted-foreground">
                        {submission.assignment_title || submission.type || 'Submission'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {submission.course_name || courseData.find((item) => item.course.id === submission.course_id)?.course.title || 'Course'}
                        {' · '}
                        {new Date(submission.submitted_at).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={submission.status === 'graded' ? 'default' : 'secondary'}>
                        {submission.status || 'pending'}
                      </Badge>
                      <Button asChild size="sm" variant="outline">
                        <Link to="/instructor/grade">Review</Link>
                      </Button>
                    </div>
                  </div>
                ))}
                {submissions.length === 0 && <p className="py-4 text-center text-muted-foreground">No submissions found.</p>}
              </CardContent>
            </Card>
          </div>

          <Card className="h-fit">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Calendar className="h-5 w-5" /> Upcoming sessions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {sessions.slice(0, 6).map((session) => (
                <div key={session.id} className="rounded-lg border p-3">
                  <p className="text-sm font-medium">{session.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {courses.find((course) => course.id === session.course_id)?.title || 'Course'}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {session.date} · {session.start_time}–{session.end_time}
                  </p>
                  <p className="text-xs text-muted-foreground">{session.location}</p>
                </div>
              ))}
              {sessions.length === 0 && <p className="py-4 text-center text-muted-foreground">No scheduled sessions.</p>}
            </CardContent>
          </Card>
        </div>
      </div>
    </InstructorLayout>
  );
}

async function fetchCourseEnrollments(courseId: string): Promise<number> {
  const token = localStorage.getItem('auth_token') || localStorage.getItem('accessToken');
  const response = await fetch(
    `${import.meta.env.VITE_API_COURSE_BASE_URL_COURSE || 'http://localhost:8001'}/api/courses/enrollments/course/${courseId}`,
    {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    },
  );

  if (!response.ok) {
    throw new Error(`Enrollment request failed: ${response.status}`);
  }

  const data = await response.json();
  return Array.isArray(data) ? data.length : 0;
}
