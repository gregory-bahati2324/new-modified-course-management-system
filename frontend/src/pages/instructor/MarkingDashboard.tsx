import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen, FileText, CheckCircle, Clock, AlertCircle,
  Play, Download, Filter, TrendingUp, BarChart3, Brain
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { InstructorLayout } from '@/components/layout/InstructorLayout';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { assignmentService } from '@/services/assignmentService';
import { assessmentService } from '@/services/assessmentService';
import { markingGradingService } from '@/services/markingGradingService';

interface SubmissionItem {
  id: string;
  studentName: string;
  studentAvatar: string;
  submissionDate: string;
  status: 'pending' | 'ai-marked' | 'instructor-reviewed' | 'graded';
  score?: number;
  maxScore: number;
  courseId: string;
  courseName: string;
  type: string;
  submission_type: string; // For backward compatibility
  title: string;
}

export default function MarkingDashboard() {
  const navigate = useNavigate();
  const [selectedCourse, setSelectedCourse] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [isMarking, setIsMarking] = useState(false);
  const [submissions, setSubmissions] = useState<SubmissionItem[]>([]);
  const [loading, setLoading] = useState(true);

  const courses = [
    { id: 'all', name: 'All Courses' },
    ...Array.from(
      new Map(
        submissions.map(s => [s.courseId, { id: s.courseId, name: s.courseName }])
      ).values()
    )
  ];


  const assessmentTypes = [
    { id: 'all', name: 'All Types' },
    { id: 'assignment', name: 'Assignment' },
    { id: 'quiz', name: 'Quiz' },
    { id: 'test', name: 'Test' },
    { id: 'final', name: 'Exam' }
  ];

  useEffect(() => {
    const fetchSubmissions = async () => {
      setLoading(true);
      try {
        const data = await markingGradingService.getStudentSubmissions();
        console.log("submissions: ", data);
        setSubmissions(data.map(sub => ({
          id: sub.id,
          studentName: sub.student_name,
          studentAvatar: sub.student_name.charAt(0), // Simple avatar with initial
          submissionDate: sub.submitted_at,
          status: sub.grade ? 'graded' : 'pending',
          score: sub.grade,
          maxScore: sub.max_score || 100, // This would ideally come from the API
          courseId: sub.course_id,
          courseName: sub.course_name,
          type: sub.type,
          submission_type: sub.submission_type, // For backward compatibility
          title: sub.assignment_title
        })));
      } catch (error) {
        toast.error(`Failed to load submissions: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };
    fetchSubmissions();
  }, []);

  const filteredSubmissions = submissions.filter(sub => {
    const matchCourse =
      selectedCourse === 'all' || sub.courseId === selectedCourse;

    const matchType =
      selectedType === 'all' || sub.type === selectedType;

    return matchCourse && matchType;
  });



  const getStatusBadge = (status: string) => {
    const variants = {
      'pending': { variant: 'secondary' as const, icon: <Clock className="h-3 w-3" /> },
      'ai-marked': { variant: 'default' as const, icon: <Brain className="h-3 w-3" /> },
      'instructor-reviewed': { variant: 'default' as const, icon: <AlertCircle className="h-3 w-3" /> },
      'graded': { variant: 'default' as const, icon: <CheckCircle className="h-3 w-3" /> }
    };
    const config = variants[status as keyof typeof variants];
    return (
      <Badge variant={config.variant} className="gap-1">
        {config.icon}
        {status.replace('-', ' ')}
      </Badge>
    );
  };

  const handleBulkAIMarking = async () => {
    setIsMarking(true);
    toast.info('AI is marking submissions...', { duration: 2000 });

    // Simulate AI marking
    setTimeout(() => {
      setIsMarking(false);
      toast.success('AI marking completed! Review results below.');
    }, 3000);
  };

  const pendingCount = filteredSubmissions.filter(s => s.status === 'pending').length;
  const gradedCount = filteredSubmissions.filter(s => s.status === 'graded').length;

  if (loading) {
    return <div className="p-6">Loading submissions...</div>;
  }

  return (
    <InstructorLayout>
      <div className="container py-8 space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Brain className="h-8 w-8 text-primary" />
              AI Marking & Grading Service
            </h1>
            <p className="text-muted-foreground mt-1">
              Automated and manual marking workflows for all assessments
            </p>
          </div>
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export All Results
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending Review</p>
                  <p className="text-3xl font-bold">{pendingCount}</p>
                </div>
                <Clock className="h-10 w-10 text-orange-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Graded</p>
                  <p className="text-3xl font-bold">{gradedCount}</p>
                </div>
                <CheckCircle className="h-10 w-10 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Submissions</p>
                  <p className="text-3xl font-bold">{submissions.length}</p>
                </div>
                <FileText className="h-10 w-10 text-primary" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Course</label>
                <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {courses.map(c => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Assessment Type</label>
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {assessmentTypes.map(t => (
                      <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="submissions" className="space-y-6">
          <TabsList>
            <TabsTrigger value="submissions">Submissions</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="submissions" className="space-y-4">
            {/* Marking Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Marking Options</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <h3 className="font-semibold flex items-center gap-2">
                      <Brain className="h-5 w-5 text-primary" />
                      Self-Marking (Automatic AI)
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Use AI to automatically mark all pending submissions using answer keys
                    </p>
                  </div>
                  <Button
                    onClick={handleBulkAIMarking}
                    disabled={isMarking || pendingCount === 0}
                    className="gap-2"
                  >
                    {isMarking ? (
                      <>
                        <Skeleton className="h-4 w-4 rounded-full animate-spin" />
                        Marking...
                      </>
                    ) : (
                      <>
                        <Play className="h-4 w-4" />
                        Run AI Marking
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Submissions Table */}
            <Card>
              <CardHeader>
                <CardTitle>Student Submissions</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Submission Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Score</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSubmissions.map((submission) => (
                      <TableRow key={submission.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center font-semibold text-primary">
                              {submission.studentAvatar}
                            </div>
                            <span className="font-medium">{submission.studentName}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {new Date(submission.submissionDate).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(submission.status)}
                        </TableCell>
                        <TableCell>
                          {submission.score !== undefined ? (
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-lg">{submission.score}</span>
                              <span className="text-muted-foreground">/ {submission.maxScore}</span>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">Not graded</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              navigate(`/instructor/marking/submission/${submission.id}`, {
                                state: { submissionType: submission.submission_type }
                              })
                            }
                          >
                            Open Submission
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Average Scores
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm">Class Average</span>
                        <span className="font-bold">88.5%</span>
                      </div>
                      <Progress value={88.5} />
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm">Pass Rate</span>
                        <span className="font-bold">94%</span>
                      </div>
                      <Progress value={94} className="bg-green-200" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    AI vs Manual Consistency
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between p-2 rounded bg-muted/50">
                      <span>AI Accuracy</span>
                      <span className="font-bold">96%</span>
                    </div>
                    <div className="flex justify-between p-2 rounded bg-muted/50">
                      <span>Avg. Score Difference</span>
                      <span className="font-bold">±2.3%</span>
                    </div>
                    <div className="flex justify-between p-2 rounded bg-muted/50">
                      <span>Manual Overrides</span>
                      <span className="font-bold">8%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Common Mistakes (AI Summary)</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 text-orange-500 mt-0.5" />
                      <span className="text-sm">45% of students struggled with SQL JOIN operations</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 text-orange-500 mt-0.5" />
                      <span className="text-sm">32% had syntax errors in their code submissions</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 text-orange-500 mt-0.5" />
                      <span className="text-sm">28% missed the optimization requirements</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </InstructorLayout>
  );
}