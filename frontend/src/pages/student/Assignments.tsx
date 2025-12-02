import { useState } from 'react';
import { FileText, Calendar, Clock, CheckCircle2, AlertCircle, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function StudentAssignments() {
  const assignments = [
    {
      id: 1,
      title: "Database Design Project",
      course: "Advanced Database Systems",
      dueDate: "Dec 15, 2024",
      daysLeft: 6,
      points: 100,
      status: "pending",
      submitted: false,
      description: "Design and implement a normalized database schema for an e-commerce application"
    },
    {
      id: 2,
      title: "Neural Networks Implementation",
      course: "Machine Learning Fundamentals",
      dueDate: "Dec 20, 2024",
      daysLeft: 11,
      points: 150,
      status: "in-progress",
      submitted: false,
      description: "Implement a basic neural network from scratch using Python"
    },
    {
      id: 3,
      title: "Software Architecture Document",
      course: "Software Engineering Principles",
      dueDate: "Dec 12, 2024",
      daysLeft: 3,
      points: 80,
      status: "urgent",
      submitted: false,
      description: "Create a comprehensive architecture document for your final project"
    },
    {
      id: 4,
      title: "Data Structures Quiz",
      course: "Advanced Database Systems",
      submittedDate: "Nov 28, 2024",
      points: 50,
      grade: 45,
      status: "graded",
      submitted: true,
      feedback: "Excellent work! Your implementation was clean and efficient."
    },
    {
      id: 5,
      title: "Code Review Assignment",
      course: "Software Engineering Principles",
      submittedDate: "Nov 25, 2024",
      points: 100,
      grade: 95,
      status: "graded",
      submitted: true,
      feedback: "Great attention to detail. Minor improvements suggested in comments."
    }
  ];

  const pending = assignments.filter(a => !a.submitted);
  const submitted = assignments.filter(a => a.submitted && a.status !== 'graded');
  const graded = assignments.filter(a => a.status === 'graded');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'urgent': return 'destructive';
      case 'in-progress': return 'default';
      case 'graded': return 'secondary';
      default: return 'outline';
    }
  };

  return (
      <div className="container py-8 space-y-8 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">My Assignments</h1>
            <p className="text-muted-foreground">Track and submit your course assignments</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Assignments</p>
                  <h3 className="text-2xl font-bold">{assignments.length}</h3>
                </div>
                <FileText className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending</p>
                  <h3 className="text-2xl font-bold text-warning">{pending.length}</h3>
                </div>
                <Clock className="h-8 w-8 text-warning" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Submitted</p>
                  <h3 className="text-2xl font-bold text-primary">{submitted.length}</h3>
                </div>
                <Upload className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Graded</p>
                  <h3 className="text-2xl font-bold text-success">{graded.length}</h3>
                </div>
                <CheckCircle2 className="h-8 w-8 text-success" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="pending" className="space-y-6">
          <TabsList>
            <TabsTrigger value="pending">Pending ({pending.length})</TabsTrigger>
            <TabsTrigger value="submitted">Submitted ({submitted.length})</TabsTrigger>
            <TabsTrigger value="graded">Graded ({graded.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-4">
            {pending.map((assignment) => (
              <Card key={assignment.id} className="hover:shadow-academic transition-all">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle>{assignment.title}</CardTitle>
                      <p className="text-sm text-muted-foreground">{assignment.course}</p>
                    </div>
                    <Badge variant={getStatusColor(assignment.status)}>
                      {assignment.status === 'urgent' ? 'Due Soon' : 'Pending'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">{assignment.description}</p>
                  
                  <div className="flex flex-wrap gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>Due: {assignment.dueDate}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className={assignment.daysLeft <= 3 ? 'text-destructive font-medium' : ''}>
                        {assignment.daysLeft} days left
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span>{assignment.points} points</span>
                    </div>
                  </div>

                  {assignment.daysLeft <= 3 && (
                    <div className="flex items-center gap-2 p-3 bg-destructive/10 text-destructive rounded-lg">
                      <AlertCircle className="h-4 w-4" />
                      <span className="text-sm font-medium">This assignment is due soon!</span>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button className="flex-1">
                      <Upload className="mr-2 h-4 w-4" />
                      Submit Assignment
                    </Button>
                    <Button variant="outline">View Details</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="submitted" className="space-y-4">
            {submitted.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">No Submitted Assignments</h3>
                  <p className="text-sm text-muted-foreground">
                    Assignments you submit will appear here while awaiting grading
                  </p>
                </CardContent>
              </Card>
            ) : (
              submitted.map((assignment) => (
                <Card key={assignment.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle>{assignment.title}</CardTitle>
                        <p className="text-sm text-muted-foreground">{assignment.course}</p>
                      </div>
                      <Badge>Awaiting Grade</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>Submitted: {assignment.submittedDate}</span>
                      <span>•</span>
                      <span>{assignment.points} points</span>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="graded" className="space-y-4">
            {graded.map((assignment) => (
              <Card key={assignment.id} className="hover:shadow-academic transition-all">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="flex items-center gap-2">
                        {assignment.title}
                        <CheckCircle2 className="h-5 w-5 text-success" />
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">{assignment.course}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-success">
                        {assignment.grade}/{assignment.points}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {Math.round((assignment.grade! / assignment.points) * 100)}%
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>Submitted: {assignment.submittedDate}</span>
                  </div>
                  
                  <div className="p-4 bg-muted rounded-lg">
                    <h4 className="text-sm font-medium mb-2">Instructor Feedback:</h4>
                    <p className="text-sm text-muted-foreground">{assignment.feedback}</p>
                  </div>

                  <Button variant="outline">View Submission</Button>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </div>
  );
}