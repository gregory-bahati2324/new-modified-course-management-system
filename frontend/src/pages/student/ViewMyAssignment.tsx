import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  FileText,
  Calendar,
  Clock,
  Award,
  Download,
  Upload,
  BookOpen,
  AlertCircle,
  File,
  ExternalLink,
  CheckCircle2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { assignmentService, StudentAssignment } from '@/services/assignmentService';
import { toast } from 'sonner';

export default function StudentViewAssignment() {
  const navigate = useNavigate();
  const { assignmentId } = useParams<{ assignmentId: string }>();
  const [assignment, setAssignment] = useState<StudentAssignment | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAssignment = async () => {
      try {
        if (!assignmentId) return;
        const data = await assignmentService.getStudentAssignment(assignmentId);
        console.log("Fetched data: ", data);
        setAssignment(data);
      } catch (error: any) {
        toast.error(error.message || 'Failed to load assignment');
      } finally {
        setLoading(false);
      }
    };
    fetchAssignment();
  }, [assignmentId]);


  if (!assignment) return null;
  const displayAssignment = assignment;

  const getDaysLeft = (dueDate: string) => {
    const now = new Date();
    const due = new Date(dueDate);
    return Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  };

  const daysLeft = getDaysLeft(displayAssignment.due_date);
  const isOverdue = daysLeft < 0;
  const isUrgent = daysLeft >= 0 && daysLeft <= 3;

  if (loading && !assignment) {
    return (
      <div className="container py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-1/3" />
          <div className="h-64 bg-muted rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8 space-y-6 animate-fade-in">
      {/* CHANGE: Back navigation and header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/student/assignments')}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Assignments
        </Button>
      </div>

      {/* Assignment Header Card */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <BookOpen className="h-4 w-4" />
                <span>{displayAssignment.course_title}</span>
              </div>
              <CardTitle className="text-2xl md:text-3xl">{displayAssignment.title}</CardTitle>
              <div className="flex flex-wrap items-center gap-3">
                {/* CHANGE: Status badges */}
                {displayAssignment.submitted ? (
                  <Badge className="bg-green-500/10 text-green-600 border-green-500/20">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Submitted
                  </Badge>
                ) : isOverdue ? (
                  <Badge variant="destructive">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    Overdue
                  </Badge>
                ) : isUrgent ? (
                  <Badge variant="destructive">
                    <Clock className="h-3 w-3 mr-1" />
                    Due Soon
                  </Badge>
                ) : (
                  <Badge variant="outline">
                    <Clock className="h-3 w-3 mr-1" />
                    Pending
                  </Badge>
                )}
              </div>
            </div>
            {/* CHANGE: Submit button in header */}
            {!displayAssignment.submitted && (
              <Button
                size="lg"
                onClick={() => navigate(`/student/assignment/${assignmentId}/submit`)}
                className="gap-2"
              >
                <Upload className="h-4 w-4" />
                Submit Assignment
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {/* CHANGE: Key info grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Due Date</p>
                <p className="text-sm font-medium">
                  {new Date(displayAssignment.due_date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <Clock className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Time Left</p>
                <p className={`text-sm font-medium ${isOverdue ? 'text-destructive' : isUrgent ? 'text-destructive' : ''}`}>
                  {isOverdue ? `${Math.abs(daysLeft)} days overdue` : `${daysLeft} days`}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <Award className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Total Points</p>
                <p className="text-sm font-medium">{displayAssignment.total_points} pts</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <FileText className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Attempts</p>
                <p className="text-sm font-medium">
                  {(displayAssignment as any).attempts_used || 0} / {(displayAssignment as any).attempts_allowed || 1}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* CHANGE: Description section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Description
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                {displayAssignment.description}
              </p>
            </CardContent>
          </Card>

          {/* CHANGE: Instructions section */}
          {displayAssignment.instructions && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Instructions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none text-muted-foreground">
                  {(displayAssignment as any).instructions.split('\n').map((line: string, idx: number) => {
                    if (line.startsWith('## ')) {
                      return <h3 key={idx} className="text-foreground font-semibold mt-4 mb-2">{line.replace('## ', '')}</h3>;
                    }
                    if (line.startsWith('**') && line.endsWith('**')) {
                      return <p key={idx} className="font-medium text-foreground">{line.replace(/\*\*/g, '')}</p>;
                    }
                    if (line.startsWith('   - ')) {
                      return <li key={idx} className="ml-8 list-disc">{line.replace('   - ', '')}</li>;
                    }
                    if (line.match(/^\d+\./)) {
                      return <p key={idx} className="ml-4">{line}</p>;
                    }
                    return line.trim() ? <p key={idx}>{line}</p> : <br key={idx} />;
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/*Instructor PDF Attachment */}
          {displayAssignment.file_url && (
            <Card className="border-primary/20 bg-primary/5">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <File className="h-5 w-5 text-primary" />
                  Instructor Attachment
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between p-4 border rounded-lg bg-background">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-red-500/10">
                      <FileText className="h-6 w-6 text-red-500" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">
                        {(displayAssignment as any).attachment_name || 'Assignment File'}
                      </p>
                      <p className="text-xs text-muted-foreground">PDF Document</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2"
                      onClick={() => window.open(displayAssignment.file_url, '_blank')}
                    >
                      <ExternalLink className="h-4 w-4" />
                      View
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2"
                      asChild
                    >
                      <a href={(displayAssignment as any).attachment_url} download>
                        <Download className="h-4 w-4" />
                        Download
                      </a>
                    </Button>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-3">
                  This file contains additional instructions from your instructor. Please review it carefully before submitting.
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* CHANGE: Sidebar */}
        <div className="space-y-6">
          {/* Submission Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Submission Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {(displayAssignment as any).allowed_file_types && (
                <div>
                  <p className="text-sm font-medium mb-2">Accepted File Types</p>
                  <div className="flex flex-wrap gap-1">
                    {(displayAssignment as any).allowed_file_types.map((type: string) => (
                      <Badge key={type} variant="secondary" className="text-xs">
                        {type}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              {(displayAssignment as any).max_file_size && (
                <div>
                  <p className="text-sm font-medium">Max File Size</p>
                  <p className="text-sm text-muted-foreground">{(displayAssignment as any).max_file_size}</p>
                </div>
              )}
              <Separator />
              {/* CHANGE: Urgent warning */}
              {isUrgent && !isOverdue && !displayAssignment.submitted && (
                <div className="flex items-center gap-2 p-3 bg-destructive/10 text-destructive rounded-lg">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  <span className="text-sm font-medium">This assignment is due soon!</span>
                </div>
              )}
              {isOverdue && !displayAssignment.submitted && (
                <div className="flex items-center gap-2 p-3 bg-destructive/10 text-destructive rounded-lg">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  <span className="text-sm font-medium">This assignment is overdue!</span>
                </div>
              )}
              {!displayAssignment.submitted && (
                <Button
                  className="w-full gap-2"
                  size="lg"
                  onClick={() => navigate(`/student/assignment/${assignmentId}/submit`)}
                >
                  <Upload className="h-4 w-4" />
                  Submit Assignment
                </Button>
              )}
              {displayAssignment.submitted && (
                <div className="text-center p-4 rounded-lg bg-green-500/10">
                  <CheckCircle2 className="h-8 w-8 text-green-500 mx-auto mb-2" />
                  <p className="font-medium text-green-600">Assignment Submitted</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Submitted on {(displayAssignment as any).submission_date ? new Date((displayAssignment as any).submission_date).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Tips Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                Tips
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  Read all instructions carefully before starting
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  Download the instructor's file if provided
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  Submit before the deadline to avoid penalties
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  Check file format and size requirements
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}