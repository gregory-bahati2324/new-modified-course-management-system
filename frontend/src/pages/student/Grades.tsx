import { useState } from 'react';
import { Trophy, TrendingUp, Award, Download, Eye, MessageSquare, CheckCircle, XCircle } from 'lucide-react';
import StudentLayout from '@/components/layout/StudentLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';

export default function StudentGrades() {
  const [selectedAssessment, setSelectedAssessment] = useState<any>(null);
  
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
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className="text-sm font-semibold">{assignment.grade}%</p>
                          <Badge variant="outline" className="text-xs">
                            {assignment.weight}% of grade
                          </Badge>
                        </div>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setSelectedAssessment({ ...assignment, courseName: course.name })}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>Assessment Details: {assignment.name}</DialogTitle>
                              <DialogDescription>
                                {course.name} - {course.code}
                              </DialogDescription>
                            </DialogHeader>
                            
                            <div className="space-y-6">
                              {/* Score Summary */}
                              <Card>
                                <CardContent className="p-6">
                                  <div className="flex items-center justify-between">
                                    <div>
                                      <p className="text-sm text-muted-foreground">Your Score</p>
                                      <p className="text-4xl font-bold">{assignment.grade}%</p>
                                    </div>
                                    <Badge className="text-lg px-4 py-2">
                                      {assignment.grade >= 90 ? 'A' : assignment.grade >= 80 ? 'B' : assignment.grade >= 70 ? 'C' : 'D'}
                                    </Badge>
                                  </div>
                                </CardContent>
                              </Card>

                              {/* Question Results */}
                              <div className="space-y-4">
                                <h3 className="font-semibold text-lg">Question-by-Question Results</h3>
                                
                                {[
                                  {
                                    question: 'What is normalization in database design?',
                                    studentAnswer: 'Normalization is organizing data to reduce redundancy.',
                                    correct: true,
                                    points: 8,
                                    maxPoints: 10,
                                    feedback: 'Good answer! You covered the main concept well.'
                                  },
                                  {
                                    question: 'Explain the difference between DELETE and TRUNCATE.',
                                    studentAnswer: 'DELETE removes rows and TRUNCATE removes all.',
                                    correct: false,
                                    points: 5,
                                    maxPoints: 10,
                                    feedback: 'Your answer is partially correct but missing key details about DML vs DDL and rollback capabilities.'
                                  }
                                ].map((q, idx) => (
                                  <Card key={idx}>
                                    <CardContent className="p-4 space-y-3">
                                      <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-2">
                                          <Badge variant="outline">Q{idx + 1}</Badge>
                                          {q.correct ? (
                                            <CheckCircle className="h-5 w-5 text-green-500" />
                                          ) : (
                                            <XCircle className="h-5 w-5 text-red-500" />
                                          )}
                                        </div>
                                        <div className="text-right">
                                          <span className="font-bold">{q.points}</span>
                                          <span className="text-muted-foreground">/{q.maxPoints}</span>
                                        </div>
                                      </div>
                                      
                                      <p className="font-medium text-sm">{q.question}</p>
                                      
                                      <div className="p-3 bg-muted/50 rounded-lg">
                                        <p className="text-xs text-muted-foreground mb-1">Your Answer:</p>
                                        <p className="text-sm">{q.studentAnswer}</p>
                                      </div>
                                      
                                      {q.feedback && (
                                        <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                                          <p className="text-xs font-medium text-blue-900 dark:text-blue-300 mb-1">
                                            Instructor Feedback:
                                          </p>
                                          <p className="text-sm">{q.feedback}</p>
                                        </div>
                                      )}
                                    </CardContent>
                                  </Card>
                                ))}
                              </div>

                              {/* Overall Feedback */}
                              <Card>
                                <CardHeader>
                                  <CardTitle className="text-base">Overall Feedback</CardTitle>
                                </CardHeader>
                                <CardContent>
                                  <p className="text-sm">
                                    Good effort on this assignment. You demonstrated solid understanding of the core concepts.
                                    Focus on providing more detailed explanations in future assignments to earn full marks.
                                  </p>
                                </CardContent>
                              </Card>

                              {/* Actions */}
                              <div className="flex gap-2">
                                <Button variant="outline" className="flex-1 gap-2">
                                  <Download className="h-4 w-4" />
                                  Download Results (PDF)
                                </Button>
                                <Button variant="outline" className="flex-1 gap-2">
                                  <MessageSquare className="h-4 w-4" />
                                  Contact Instructor
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
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