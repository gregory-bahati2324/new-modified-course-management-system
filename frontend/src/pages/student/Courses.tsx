import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Clock, Users, Star, PlayCircle, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { courseService, Course, Enrollment } from '@/services/courseService';
import { ProgressService } from '@/services/progressService';

const progressService = new ProgressService();

// types/StudentCourse.ts
export interface StudentCourse {
  id: string;
  title: string;
  instructor: string;
  progress: number;
  completed: boolean;
  duration?: string;
  rating?: number;
  students?: number;
  last?: string | null;
  assignment_progress?: {
    submitted: number;
    required: number;
    total: number;
  };

  assessment_progress?: {
    submitted: number;
    required: number;
    total: number;
  };
}


export default function StudentCourses() {
  const navigate = useNavigate();
  const [enrolledCourses, setEnrolledCourses] = useState<StudentCourse[]>([]);
  const [completedCourses, setCompletedCourses] = useState<StudentCourse[]>([]);
  const [recommendedCourses, setRecommendedCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        // 1️⃣ Get enrolled courses (course service)
        const courses = await courseService.getEnrolledCourses();

        // 2️⃣ Get progress PER COURSE (progress service)
        const coursesWithProgress = await Promise.all(
          courses.map(async (course) => {
            try {
              const progress =
                await progressService.getCourseProgress(course.id);
              console.log("progress data", progress);

              return {
                id: course.id,
                title: course.title,
                instructor: course.instructor_name,
                duration: course.duration,
                rating: course.rating ?? 0,
                students: course.students_enrolled ?? 0,

                progress: progress.progress_percentage,
                completed: progress.is_completed,
                last: progress.last_accessed_at,
                assignment_progress: progress.assignment_summary
                  ? {
                    submitted: progress.assignment_summary.submitted,
                    required: progress.assignment_summary.total_assignments,
                    total: progress.assignment_summary.total_assignments,
                  }
                  : undefined,

                assessment_progress: progress.assessment_summary
                  ? {
                    submitted: progress.assessment_summary.submitted,
                    required: progress.assessment_summary.total_assessments,
                    total: progress.assessment_summary.total_assessments,
                  }
                  : undefined,
              };
            } catch {
              // If progress not found yet (new enrollment)
              return {
                id: course.id,
                title: course.title,
                instructor: course.instructor_name,
                duration: course.duration,
                rating: course.rating ?? 0,
                students: course.students_enrolled ?? 0,

                progress: 0,
                completed: false,
              };
            }
          })
        );

        // 3️⃣ Split tabs
        setEnrolledCourses(
          coursesWithProgress.filter((c) => !c.completed)
        );
        setCompletedCourses(
          coursesWithProgress.filter((c) => c.completed)
        );

        // 4️⃣ Recommended courses
        const recommended =
          await courseService.getStudentFilteredCourses({});
        setRecommendedCourses(recommended.courses);

      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);



  return (
    <div className="container py-8 space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Courses</h1>
          <p className="text-muted-foreground">
            Continue your learning journey
          </p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="enrolled" className="space-y-6">
        <TabsList>
          <TabsTrigger value="enrolled">
            Enrolled ({enrolledCourses.length})
          </TabsTrigger>
          <TabsTrigger value="completed">
            Completed ({completedCourses.length})
          </TabsTrigger>
        </TabsList>

        {/* ================= ENROLLED ================= */}
        <TabsContent value="enrolled" className="space-y-4">
          {enrolledCourses.map((course) => (
            <Card
              key={course.id}
              className="hover:shadow-academic transition-all"
            >
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row gap-6">
                  <div className="flex-1 space-y-4">
                    {/* Title */}
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-xl font-semibold mb-2">
                          {course.title}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          by {course.instructor}
                        </p>
                      </div>
                      <Badge variant="secondary">
                        {course.progress}% Complete
                      </Badge>
                    </div>

                    {/* Progress */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Progress</span>
                      </div>
                      <Progress value={course.progress} className="h-2" />
                    </div>

                    {course.assignment_progress && (
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Assignments</span>
                          <span>
                            {course.assignment_progress.submitted} / {course.assignment_progress.total}
                          </span>
                        </div>
                        <Progress
                          value={
                            course.assignment_progress.total > 0
                              ? (course.assignment_progress.submitted /
                                course.assignment_progress.total) *
                              100
                              : 0
                          }
                          className="h-1.5"
                        />
                      </div>
                    )}


                    {course.assessment_progress && (
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Assessments</span>
                          <span>
                            {course.assessment_progress.submitted} / {course.assessment_progress.total}
                          </span>
                        </div>
                        <Progress
                          value={
                            course.assessment_progress.total > 0
                              ? (course.assessment_progress.submitted /
                                course.assessment_progress.total) *
                              100
                              : 0
                          }
                          className="h-1.5"
                        />
                      </div>
                    )}

                    {/* Meta */}
                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        Last accessed:{' '}
                        {course.last
                          ? new Date(course.last).toLocaleString(undefined, {
                            dateStyle: 'medium',
                            timeStyle: 'short',
                          })
                          : '-'}
                      </div>

                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2 lg:w-48">
                    <Button
                      className="w-full"
                      onClick={() =>
                        navigate(`/student/course/${course.id}/learn`)
                      }
                    >
                      <PlayCircle className="mr-2 h-4 w-4" />
                      Continue Learning
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* ================= COMPLETED ================= */}
        <TabsContent value="completed" className="space-y-4">
          {completedCourses.map((course) => (
            <Card
              key={course.id}
              className="hover:shadow-academic transition-all"
            >
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row gap-6">
                  <div className="flex-1 space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-xl font-semibold mb-2 flex items-center gap-2">
                          {course.title}
                          <CheckCircle2 className="h-5 w-5 text-success" />
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          by {course.instructor}
                        </p>
                      </div>
                      <Badge className="bg-success text-white">
                        Completed
                      </Badge>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 lg:w-48">
                    <Button onClick={() => navigate('/certificates')}>
                      View Certificate
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
