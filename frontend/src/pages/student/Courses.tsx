import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Clock, Users, Star, PlayCircle, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { courseService, Course, Enrollment } from '@/services/courseService';


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

        const [courses, enrollments] = await Promise.all([
          courseService.getEnrolledCourses(),
          courseService.getStudentEnrollments(),
        ]);

        // 🔗 Merge course + enrollment
        const merged = courses.map(course => {
          const enrollment = enrollments.find(e => e.course_id === course.id);

          return {
            id: course.id,
            title: course.title,
            instructor: course.instructor_name,
            duration: course.duration,
            rating: course.rating ?? 0,
            students: course.students_enrolled ?? 0,
            progress: enrollment?.progress ?? 0,
            completed: enrollment?.completed ?? false,
          };
        });

        setEnrolledCourses(merged.filter(c => !c.completed));
        setCompletedCourses(merged.filter(c => c.completed));

        // Recommended = published courses
        const recommended = await courseService.getStudentFilteredCourses({});
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
        <Button onClick={() => navigate('/courses')}>
          <BookOpen className="mr-2 h-4 w-4" />
          Browse All Courses
        </Button>
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
          <TabsTrigger value="recommended">
            Recommended
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
                        <span className="font-medium text-muted-foreground">
                          Modules coming soon
                        </span>
                      </div>
                      <Progress value={course.progress} className="h-2" />
                    </div>

                    {/* Meta */}
                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {course.students} students
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        {course.rating}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        Last accessed: —
                      </div>
                    </div>

                    {/* Next lesson placeholder */}
                    <div className="pt-2">
                      <p className="text-sm font-medium mb-2">Next lesson:</p>
                      <p className="text-sm text-muted-foreground">
                        Coming soon
                      </p>
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
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => navigate(`/course/${course.id}`)}
                    >
                      View Details
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
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {course.students} students
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        {course.rating}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 lg:w-48">
                    <Button onClick={() => navigate('/certificates')}>
                      View Certificate
                    </Button>
                    <Button variant="outline">
                      Review Course
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* ================= RECOMMENDED ================= */}
        <TabsContent
          value="recommended"
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          {recommendedCourses.map((course) => (
            <Card
              key={course.id}
              className="hover:shadow-academic transition-all"
            >
              <CardHeader>
                <CardTitle>{course.title}</CardTitle>
                <CardDescription>
                  by {course.instructor_name}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {course.duration}
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    {course.students_enrolled} students
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    {course.rating}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <Badge>{course.level}</Badge>
                  <span className="text-lg font-semibold text-primary">
                    Free
                  </span>
                </div>

                <Button
                  className="w-full"
                  onClick={async () => {
                    await courseService.createEnrollment(course.id);
                    navigate('/student/courses');
                  }}
                >
                  Get Started
                </Button>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
