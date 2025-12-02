import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Clock, Users, Star, PlayCircle, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function StudentCourses() {
  const navigate = useNavigate();

  const enrolledCourses = [
    {
      id: 1,
      title: "Advanced Database Systems",
      instructor: "Dr. Sarah Johnson",
      progress: 75,
      totalModules: 12,
      completedModules: 9,
      nextLesson: "Normalization & Optimization",
      lastAccessed: "2 hours ago",
      status: "in-progress",
      rating: 4.8,
      students: 245
    },
    {
      id: 2,
      title: "Machine Learning Fundamentals",
      instructor: "Prof. Michael Chen",
      progress: 60,
      totalModules: 15,
      completedModules: 9,
      nextLesson: "Neural Networks Basics",
      lastAccessed: "1 day ago",
      status: "in-progress",
      rating: 4.9,
      students: 312
    },
    {
      id: 3,
      title: "Software Engineering Principles",
      instructor: "Dr. Emily Davis",
      progress: 100,
      totalModules: 10,
      completedModules: 10,
      nextLesson: "Course Completed",
      lastAccessed: "5 hours ago",
      status: "completed",
      rating: 4.7,
      students: 189
    }
  ];

  const recommendedCourses = [
    {
      id: 4,
      title: "Cloud Computing Essentials",
      instructor: "Dr. James Wilson",
      duration: "8 weeks",
      level: "Intermediate",
      rating: 4.6,
      students: 456,
      price: "Free"
    },
    {
      id: 5,
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
            <TabsTrigger value="enrolled">Enrolled ({enrolledCourses.length})</TabsTrigger>
            <TabsTrigger value="completed">Completed (1)</TabsTrigger>
            <TabsTrigger value="recommended">Recommended</TabsTrigger>
          </TabsList>

          <TabsContent value="enrolled" className="space-y-4">
            {enrolledCourses.filter(c => c.status === 'in-progress').map((course) => (
              <Card key={course.id} className="hover:shadow-academic transition-all">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row gap-6">
                    <div className="flex-1 space-y-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-xl font-semibold mb-2">{course.title}</h3>
                          <p className="text-sm text-muted-foreground">by {course.instructor}</p>
                        </div>
                        <Badge variant="secondary">
                          {course.progress}% Complete
                        </Badge>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Progress</span>
                          <span className="font-medium">{course.completedModules} / {course.totalModules} modules</span>
                        </div>
                        <Progress value={course.progress} className="h-2" />
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
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          Last accessed: {course.lastAccessed}
                        </div>
                      </div>

                      <div className="pt-2">
                        <p className="text-sm font-medium mb-2">Next lesson:</p>
                        <p className="text-sm text-muted-foreground">{course.nextLesson}</p>
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
            ))}
          </TabsContent>

          <TabsContent value="completed" className="space-y-4">
            {enrolledCourses.filter(c => c.status === 'completed').map((course) => (
              <Card key={course.id} className="hover:shadow-academic transition-all">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row gap-6">
                    <div className="flex-1 space-y-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-xl font-semibold mb-2 flex items-center gap-2">
                            {course.title}
                            <CheckCircle2 className="h-5 w-5 text-success" />
                          </h3>
                          <p className="text-sm text-muted-foreground">by {course.instructor}</p>
                        </div>
                        <Badge className="bg-success text-white">Completed</Badge>
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