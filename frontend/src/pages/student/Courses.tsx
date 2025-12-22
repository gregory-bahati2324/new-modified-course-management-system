import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Clock, Users, Star, PlayCircle, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { courseService, Enrollment, Course } from '@/services/courseService';
import { toast } from 'sonner';

interface EnrollmentWithCourse extends Enrollment {
  course: Course;
  nextLesson?: string;
  completedModules?: number;
  totalModules?: number;
  lastAccessed?: string;
}

export default function StudentCourses() {
  const [enrolledCourses, setEnrolledCourses] = useState<EnrollmentWithCourse[]>([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    async function fetchEnrollments() {
      try {
        const data = await courseService.getStudentEnrollments();

        // Optional: fetch module/progress info for each enrollment if backend supports it
        const enrichedData: EnrollmentWithCourse[] = await Promise.all(
          data.map(async (enrollment) => {
            let nextLesson = 'Start';
            let completedModules = 0;
            let totalModules = enrollment.course?.totalModules || 10; // fallback if not provided
            let lastAccessed = enrollment.enrolled_at;

            // Example: if backend provides a function to get module progress
            // const progressData = await courseService.getEnrollmentProgress(enrollment.id);
            // nextLesson = progressData.nextLesson;
            // completedModules = progressData.completedModules;
            // totalModules = progressData.totalModules;
            // lastAccessed = progressData.lastAccessed;

            return { ...enrollment, course: enrollment.course, nextLesson, completedModules, totalModules, lastAccessed };
          })
        );

        setEnrolledCourses(enrichedData);
      } catch (error: any) {
        toast.error(error.message || 'Failed to load courses');
      } finally {
        setLoading(false);
      }
    }

    fetchEnrollments();
  }, []);

  if (loading) return <div className="p-8">Loading courses…</div>;

  const inProgressCourses = enrolledCourses.filter(c => !c.completed);
  const completedCourses = enrolledCourses.filter(c => c.completed);

  const recommendedCourses = [
    {
      id: '4',
      title: "Cloud Computing Essentials",
      instructor: "Dr. James Wilson",
      duration: "8 weeks",
      level: "Intermediate",
      rating: 4.6,
      students: 456,
      price: "Free"
    },
    {
      id: '5',
      title: "Web Development Bootcamp",
      instructor: "Sarah Martinez",
      duration: "12 weeks",
      level: "Beginner",
      rating: 4.8,
      students: 678,
      price: "Free"
    }
  ];

  return (
    <div className="container py-8 space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Courses</h1>
          <p className="text-muted-foreground">Continue your learning journey</p>
        </div>
        <Button onClick={() => navigate('/courses')}>
          <BookOpen className="mr-2 h-4 w-4" />
          Browse All Courses
        </Button>
      </div>

      <Tabs defaultValue="enrolled" className="space-y-6">
        <TabsList>
          <TabsTrigger value="enrolled">Enrolled ({inProgressCourses.length})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({completedCourses.length})</TabsTrigger>
          <TabsTrigger value="recommended">Recommended</TabsTrigger>
        </TabsList>

        {/* In-Progress Courses */}
        <TabsContent value="enrolled" className="space-y-4">
          {inProgressCourses.map((enrollment) => {
            const course = enrollment.course;
            return (
              <Card key={enrollment.id} className="hover:shadow-academic transition-all">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row gap-6">
                    <div className="flex-1 space-y-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-xl font-semibold mb-2">{course.title}</h3>
                          <p className="text-sm text-muted-foreground">by {course.instructor_name}</p>
                        </div>
                        <Badge variant="secondary">
                          {enrollment.progress}% Complete
                        </Badge>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Progress</span>
                          <span className="font-medium">{enrollment.completedModules} / {enrollment.totalModules} modules</span>
                        </div>
                        <Progress value={enrollment.progress} className="h-2" />
                      </div>

                      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {course.students_enrolled} students
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          {course.rating}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          Last accessed: {enrollment.lastAccessed}
                        </div>
                      </div>

                      <div className="pt-2">
                        <p className="text-sm font-medium mb-2">Next lesson:</p>
                        <p className="text-sm text-muted-foreground">{enrollment.nextLesson}</p>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 lg:w-48">
                      <Button className="w-full" onClick={() => navigate(`/student/course/${course.id}/learn`)}>
                        <PlayCircle className="mr-2 h-4 w-4" />
                        Continue Learning
                      </Button>
                      <Button variant="outline" className="w-full" onClick={() => navigate(`/course/${course.id}`)}>
                        View Details
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>

        {/* Completed Courses */}
        <TabsContent value="completed" className="space-y-4">
          {completedCourses.map((enrollment) => {
            const course = enrollment.course;
            return (
              <Card key={enrollment.id} className="hover:shadow-academic transition-all">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row gap-6">
                    <div className="flex-1 space-y-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-xl font-semibold mb-2 flex items-center gap-2">
                            {course.title}
                            <CheckCircle2 className="h-5 w-5 text-success" />
                          </h3>
                          <p className="text-sm text-muted-foreground">by {course.instructor_name}</p>
                        </div>
                        <Badge className="bg-success text-white">Completed</Badge>
                      </div>

                      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {course.students_enrolled} students
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
            );
          })}
        </TabsContent>

        {/* Recommended Courses */}
        <TabsContent value="recommended" className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {recommendedCourses.map((course) => (
            <Card key={course.id} className="hover:shadow-academic transition-all">
              <CardHeader>
                <CardTitle>{course.title}</CardTitle>
                <CardDescription>by {course.instructor}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {course.duration}
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    {course.students} students
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    {course.rating}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <Badge>{course.level}</Badge>
                  <span className="text-lg font-semibold text-primary">{course.price}</span>
                </div>
                <Button className="w-full" onClick={() => navigate(`/student/course/${course.id}/learn`)}>
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
