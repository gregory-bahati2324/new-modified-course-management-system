import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Edit, FileText, Users, BarChart3, Download, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function ViewAssignment() {
  const navigate = useNavigate();
  const { id, assignmentId } = useParams();
  const [activeTab, setActiveTab] = useState('overview');

  const assignment = {
    id: 1,
    title: "Database Design Project",
    type: "project",
    description: "Design and implement a complete database system for a small business",
    dueDate: "2024-12-20",
    dueTime: "23:59",
    points: 100,
    attempts: 1,
    timeLimit: null,
    status: "active",
    submissions: 38,
    pending: 7,
    graded: 31,
    totalStudents: 45
  };

  const submissions = [
    {
      id: 1,
      student: "John Smith",
      studentId: "STU001",
      submittedAt: "2024-12-15 14:30",
      score: 85,
      status: "graded",
      attempts: 1
    },
    {
      id: 2,
      student: "Jane Doe", 
      studentId: "STU002",
      submittedAt: "2024-12-16 09:15",
      score: null,
      status: "pending",
      attempts: 1
    },
    {
      id: 3,
      student: "Mike Johnson",
      studentId: "STU003",
      submittedAt: "2024-12-14 18:45",
      score: 92,
      status: "graded", 
      attempts: 1
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'graded': return 'bg-success text-success-foreground';
      case 'pending': return 'bg-warning text-warning-foreground';
      case 'late': return 'bg-destructive text-destructive-foreground';
      case 'not_submitted': return 'bg-muted text-muted-foreground';
      default: return 'bg-secondary text-secondary-foreground';
    }
  };

  return (
    <div className="container py-8 space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => navigate(`/instructor/course/${id}/manage`)}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Course Management
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">{assignment.title}</h1>
          <p className="text-muted-foreground">View assignment details and submissions</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={assignment.status === 'active' ? 'default' : 'secondary'}>
            {assignment.status}
          </Badge>
          <Button variant="outline" size="sm">
            <Edit className="mr-2 h-4 w-4" />
            Edit Assignment
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <FileText className="h-8 w-8 text-primary" />
              <div>
                <div className="text-2xl font-bold">{assignment.submissions}</div>
                <p className="text-sm text-muted-foreground">Submissions</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 text-warning" />
              <div>
                <div className="text-2xl font-bold">{assignment.pending}</div>
                <p className="text-sm text-muted-foreground">Pending Review</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <BarChart3 className="h-8 w-8 text-success" />
              <div>
                <div className="text-2xl font-bold">{assignment.graded}</div>
                <p className="text-sm text-muted-foreground">Graded</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <FileText className="h-8 w-8 text-accent" />
              <div>
                <div className="text-2xl font-bold">{Math.round((assignment.submissions / assignment.totalStudents) * 100)}%</div>
                <p className="text-sm text-muted-foreground">Completion</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="submissions">Submissions</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Assignment Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Description</h4>
                    <p className="text-muted-foreground">{assignment.description}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Type:</span>
                      <span className="ml-2 capitalize">{assignment.type}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Points:</span>
                      <span className="ml-2">{assignment.points}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Due Date:</span>
                      <span className="ml-2">{new Date(assignment.dueDate).toLocaleDateString()} at {assignment.dueTime}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Attempts:</span>
                      <span className="ml-2">{assignment.attempts}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <Download className="mr-2 h-4 w-4" />
                    Download All Submissions
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <FileText className="mr-2 h-4 w-4" />
                    Export Grades
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <Edit className="mr-2 h-4 w-4" />
                    Grade All Pending
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="submissions" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Student Submissions</h3>
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Export List
            </Button>
          </div>
          
          <div className="space-y-4">
            {submissions.map((submission) => (
              <Card key={submission.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-semibold">{submission.student}</h4>
                        <span className="text-sm text-muted-foreground">{submission.studentId}</span>
                        <Badge className={getStatusColor(submission.status)}>
                          {submission.status}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Submitted At</p>
                          <p className="font-medium">{submission.submittedAt}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Score</p>
                          <p className="font-medium">
                            {submission.score !== null ? `${submission.score}/${assignment.points}` : 'Not graded'}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Attempts</p>
                          <p className="font-medium">{submission.attempts}/{assignment.attempts}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 ml-4">
                      <Button size="sm" variant="outline">
                        <Eye className="mr-2 h-4 w-4" />
                        View
                      </Button>
                      {submission.status === 'pending' && (
                        <Button size="sm">
                          <Edit className="mr-2 h-4 w-4" />
                          Grade
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Submission Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Submitted</span>
                      <span>{assignment.submissions}/{assignment.totalStudents}</span>
                    </div>
                    <Progress value={(assignment.submissions / assignment.totalStudents) * 100} />
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Graded</span>
                      <span>{assignment.graded}/{assignment.submissions}</span>
                    </div>
                    <Progress value={(assignment.graded / assignment.submissions) * 100} />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Grade Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <BarChart3 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Grade analytics will be available once more submissions are graded</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}