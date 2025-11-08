import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, Star, User, Clock, Download, MessageSquare, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function StudentReview() {
  const navigate = useNavigate();
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [feedback, setFeedback] = useState('');
  const [grade, setGrade] = useState('');

  const submissions = [
    {
      id: 1,
      studentName: "John Mwalimu",
      studentId: "MUST/2021/CS/001",
      course: "Advanced Database Systems",
      assignment: "Database Design Project",
      submittedAt: "2024-12-08 14:30",
      status: "pending",
      files: ["database_design.pdf", "ER_diagram.png", "schema.sql"],
      description: "Complete database design for an e-commerce system including ER diagrams, normalized schema, and sample queries.",
      avatar: undefined
    },
    {
      id: 2, 
      studentName: "Grace Kikoti",
      studentId: "MUST/2021/CS/045",
      course: "Machine Learning Fundamentals",
      assignment: "ML Algorithm Implementation",
      submittedAt: "2024-12-08 10:15",
      status: "pending",
      files: ["ml_project.py", "dataset.csv", "results.pdf"],
      description: "Implementation of linear regression algorithm with performance analysis on housing price dataset.",
      avatar: undefined
    },
    {
      id: 3,
      studentName: "Peter Msigwa", 
      studentId: "MUST/2021/CS/023",
      course: "Data Structures & Algorithms",
      assignment: "Binary Tree Implementation",
      submittedAt: "2024-12-07 16:45",
      status: "reviewed",
      grade: "85",
      feedback: "Excellent implementation with proper error handling. Good use of recursion.",
      files: ["binary_tree.cpp", "test_cases.txt", "documentation.md"],
      description: "Complete binary tree implementation with insertion, deletion, and traversal methods.",
      avatar: undefined
    },
    {
      id: 4,
      studentName: "Fatuma Hassan",
      studentId: "MUST/2021/CS/067",
      course: "Advanced Database Systems", 
      assignment: "Query Optimization Report",
      submittedAt: "2024-12-06 11:20",
      status: "pending",
      files: ["optimization_report.pdf", "query_examples.sql"],
      description: "Analysis of query optimization techniques with practical examples and performance comparisons.",
      avatar: undefined
    }
  ];

  const pendingSubmissions = submissions.filter(s => s.status === 'pending');
  const reviewedSubmissions = submissions.filter(s => s.status === 'reviewed');

  const handleGradeSubmission = (submissionId: number) => {
    console.log('Grading submission:', submissionId, { grade, feedback });
    // Handle grading logic
  };

  return (
    <div className="container py-8 space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => navigate('/instructor')}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">Student Submissions</h1>
          <p className="text-muted-foreground">Review and grade student assignments</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-warning">
            {pendingSubmissions.length} Pending
          </Badge>
          <Badge variant="outline" className="text-success">
            {reviewedSubmissions.length} Reviewed
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-warning">{pendingSubmissions.length}</div>
            <p className="text-sm text-muted-foreground">Pending Review</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-success">{reviewedSubmissions.length}</div>
            <p className="text-sm text-muted-foreground">Reviewed</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-accent">12</div>
            <p className="text-sm text-muted-foreground">This Week</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-primary">4.2</div>
            <p className="text-sm text-muted-foreground">Avg Grade</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="pending" className="space-y-6">
        <TabsList>
          <TabsTrigger value="pending">Pending Review ({pendingSubmissions.length})</TabsTrigger>
          <TabsTrigger value="reviewed">Reviewed ({reviewedSubmissions.length})</TabsTrigger>
          <TabsTrigger value="all">All Submissions</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          {pendingSubmissions.map((submission) => (
            <Card key={submission.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <Avatar>
                      <AvatarImage src={submission.avatar} />
                      <AvatarFallback>
                        {submission.studentName.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg">{submission.studentName}</CardTitle>
                      <CardDescription>{submission.studentId}</CardDescription>
                      <div className="flex items-center gap-4 mt-2 text-sm">
                        <span className="flex items-center gap-1">
                          <FileText className="h-4 w-4" />
                          {submission.assignment}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {new Date(submission.submittedAt).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-warning">
                    Pending Review
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">{submission.description}</p>
                
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Submitted Files:</h4>
                  <div className="flex flex-wrap gap-2">
                    {submission.files.map((file, index) => (
                      <Badge key={index} variant="outline" className="gap-1">
                        <FileText className="h-3 w-3" />
                        {file}
                        <Download className="h-3 w-3 cursor-pointer hover:text-primary" />
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Grade</label>
                    <Select value={grade} onValueChange={setGrade}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select grade" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="A">A (90-100)</SelectItem>
                        <SelectItem value="B+">B+ (85-89)</SelectItem>
                        <SelectItem value="B">B (80-84)</SelectItem>
                        <SelectItem value="C+">C+ (75-79)</SelectItem>
                        <SelectItem value="C">C (70-74)</SelectItem>
                        <SelectItem value="D+">D+ (65-69)</SelectItem>
                        <SelectItem value="D">D (60-64)</SelectItem>
                        <SelectItem value="F">F (0-59)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Feedback</label>
                    <Textarea
                      placeholder="Provide feedback to the student..."
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      className="min-h-20"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      <FileText className="mr-2 h-4 w-4" />
                      View Details
                    </Button>
                    <Button variant="outline" size="sm">
                      <MessageSquare className="mr-2 h-4 w-4" />
                      Message Student
                    </Button>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-destructive hover:text-destructive"
                    >
                      <XCircle className="mr-2 h-4 w-4" />
                      Reject
                    </Button>
                    <Button 
                      size="sm" 
                      onClick={() => handleGradeSubmission(submission.id)}
                      disabled={!grade}
                    >
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Submit Grade
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="reviewed" className="space-y-4">
          {reviewedSubmissions.map((submission) => (
            <Card key={submission.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <Avatar>
                      <AvatarImage src={submission.avatar} />
                      <AvatarFallback>
                        {submission.studentName.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg">{submission.studentName}</CardTitle>
                      <CardDescription>{submission.studentId}</CardDescription>
                      <div className="flex items-center gap-4 mt-2 text-sm">
                        <span className="flex items-center gap-1">
                          <FileText className="h-4 w-4" />
                          {submission.assignment}
                        </span>
                        <span className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-success" />
                          Grade: {submission.grade}/100
                        </span>
                      </div>
                    </div>
                  </div>
                  <Badge className="bg-success text-success-foreground">
                    Reviewed
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Feedback Given:</h4>
                  <p className="text-sm text-muted-foreground bg-muted p-3 rounded">
                    {submission.feedback}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="all">
          <Card>
            <CardContent className="p-8 text-center">
              <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-semibold mb-2">All Submissions View</h3>
              <p className="text-muted-foreground">
                Complete submission history and advanced filtering coming soon
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}