import { Trophy, TrendingUp, Award } from 'lucide-react';
import StudentLayout from '@/components/layout/StudentLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

export default function StudentGrades() {
  const courses = [
    {
      id: 1,
      name: "Advanced Database Systems",
      code: "CS401",
      instructor: "Dr. Sarah Johnson",
      grade: "A",
      percentage: 92,
      credits: 4,
      assignments: [
        { name: "Assignment 1", grade: 95, weight: 20 },
        { name: "Assignment 2", grade: 90, weight: 20 },
        { name: "Midterm", grade: 88, weight: 30 },
        { name: "Final Project", grade: 95, weight: 30 }
      ]
    },
    {
      id: 2,
      name: "Machine Learning Fundamentals",
      code: "CS402",
      instructor: "Prof. Michael Chen",
      grade: "A-",
      percentage: 88,
      credits: 4,
      assignments: [
        { name: "Quiz 1", grade: 90, weight: 15 },
        { name: "Quiz 2", grade: 85, weight: 15 },
        { name: "Project 1", grade: 92, weight: 35 },
        { name: "Project 2", grade: 85, weight: 35 }
      ]
    },
    {
      id: 3,
      name: "Software Engineering Principles",
      code: "CS403",
      instructor: "Dr. Emily Davis",
      grade: "B+",
      percentage: 85,
      credits: 3,
      assignments: [
        { name: "Assignment 1", grade: 88, weight: 25 },
        { name: "Assignment 2", grade: 82, weight: 25 },
        { name: "Final Exam", grade: 85, weight: 50 }
      ]
    }
  ];

  const totalCredits = courses.reduce((sum, course) => sum + course.credits, 0);
  const gpa = courses.reduce((sum, course) => {
    const gradePoints = course.grade === 'A' ? 4.0 : course.grade === 'A-' ? 3.7 : course.grade === 'B+' ? 3.3 : 0;
    return sum + (gradePoints * course.credits);
  }, 0) / totalCredits;

  return (
    <StudentLayout>
      <div className="container py-8 space-y-8 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold">My Grades</h1>
          <p className="text-muted-foreground">Track your academic performance and progress</p>
        </div>

        {/* GPA Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Current GPA</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-3xl font-bold">{gpa.toFixed(2)}</div>
                <Trophy className="h-8 w-8 text-primary" />
              </div>
              <p className="text-xs text-muted-foreground mt-2">Out of 4.0</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Credits</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-3xl font-bold">{totalCredits}</div>
                <Award className="h-8 w-8 text-primary" />
              </div>
              <p className="text-xs text-muted-foreground mt-2">This semester</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Average Grade</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-3xl font-bold">
                  {Math.round(courses.reduce((sum, c) => sum + c.percentage, 0) / courses.length)}%
                </div>
                <TrendingUp className="h-8 w-8 text-success" />
              </div>
              <p className="text-xs text-success mt-2">↑ 3% from last semester</p>
            </CardContent>
          </Card>
        </div>

        {/* Course Grades */}
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold">Course Grades</h2>
          {courses.map((course) => (
            <Card key={course.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>{course.name}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {course.code} • {course.instructor} • {course.credits} Credits
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge className={`text-lg px-4 py-1 ${
                      course.grade.startsWith('A') ? 'bg-success' :
                      course.grade.startsWith('B') ? 'bg-primary' :
                      'bg-warning'
                    }`}>
                      {course.grade}
                    </Badge>
                    <p className="text-sm text-muted-foreground mt-1">{course.percentage}%</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Overall Progress</span>
                    <span className="font-medium">{course.percentage}%</span>
                  </div>
                  <Progress value={course.percentage} className="h-2" />
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold text-sm">Grade Breakdown</h4>
                  {course.assignments.map((assignment, index) => (
                    <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <div className="flex-1">
                        <p className="text-sm font-medium">{assignment.name}</p>
                        <p className="text-xs text-muted-foreground">Weight: {assignment.weight}%</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold">{assignment.grade}%</p>
                        <Badge variant="outline" className="text-xs">
                          {assignment.weight}% of grade
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Academic Standing */}
        <Card className="bg-success-gradient text-white">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <Trophy className="h-12 w-12" />
              <div>
                <h3 className="text-xl font-semibold mb-1">Excellent Academic Standing</h3>
                <p className="text-sm opacity-90">
                  You're performing exceptionally well! Keep up the great work to maintain your high GPA.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </StudentLayout>
  );
}
