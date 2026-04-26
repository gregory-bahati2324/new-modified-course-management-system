import { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import {
  ArrowLeft, Save, Send, Brain, User, FileText,
  CheckCircle, XCircle, RefreshCw, Download, Eye,
  Code, List, ArrowUpDown, Upload, ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { InstructorLayout } from '@/components/layout/InstructorLayout';
import { markingGradingService } from '@/services/markingGradingService';


interface QuestionGrade {
  questionNumber: number;
  questionType: 'multiple-choice' | 'true-false' | 'short-answer' | 'essay' | 'coding' | 'file-upload' | 'matching' | 'ordering';
  question: string;
  studentAnswer: any; // varies by type
  correctAnswer: any; // varies by type
  earnedPoints: number;
  maxPoints: number;
  aiSuggestion?: string;
  feedback?: string;
  isCorrect: boolean;
  isAutoGraded: boolean;
  // Type-specific fields
  options?: string[]; // MCQ options
  testCases?: { input: string; expectedOutput: string; studentOutput?: string; passed?: boolean }[];
  matchingPairs?: { left: string; right: string }[];
  studentMatching?: Record<string, string>;
  correctOrder?: string[];
  studentOrder?: string[];
  fileUrl?: string; // student uploaded file
  fileName?: string;
}

interface SubmissionDetailsResponse {
  submission: {
    id: string;
    studentName: string;
    studentId: string;
    registrationNumber: string;
    course_id: string;
    assessment_id: number;
    courseName: string;
    title: string;
    submittedAt: string;
    type: 'assignment' | 'assessment';
  };

  // for assessment
  questions?: QuestionGrade[];

  // for assignment
  assignment?: {
    files: { name: string; url: string; size?: string }[];
    text?: string;
    notes?: string;
    maxScore: number;
  };

  grading?: {
    score: number;
    maxScore: number;
    feedback: string;
  };
}

/* CHANGE: Submission metadata for both assessments and assignments */
interface SubmissionMeta {
  id: string;
  studentName: string;
  studentId: string;
  registrationNumber: string;
  submissionType: 'assessment' | 'assignment';
  title: string;
  courseName: string;
  submittedAt: string;
  // Assignment-specific
  assignmentFiles?: { name: string; url: string; size: string }[];
  submissionText?: string;
  studentNotes?: string;
}



/* CHANGE: Question type label and icon helper */
const getQuestionTypeInfo = (type: string) => {
  switch (type) {
    case 'multiple-choice': return { label: 'Multiple Choice', icon: <List className="h-4 w-4" /> };
    case 'true-false': return { label: 'True/False', icon: <CheckCircle className="h-4 w-4" /> };
    case 'short-answer': return { label: 'Short Answer', icon: <FileText className="h-4 w-4" /> };
    case 'essay': return { label: 'Essay', icon: <FileText className="h-4 w-4" /> };
    case 'coding': return { label: 'Coding', icon: <Code className="h-4 w-4" /> };
    case 'file-upload': return { label: 'File Upload', icon: <Upload className="h-4 w-4" /> };
    case 'matching': return { label: 'Matching', icon: <List className="h-4 w-4" /> };
    case 'ordering': return { label: 'Ordering', icon: <ArrowUpDown className="h-4 w-4" /> };
    default: return { label: type, icon: <FileText className="h-4 w-4" /> };
  }
};

export default function MarkingSubmission() {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const submission_type = location.state?.submissionType;
  const [submissionData, setSubmissionData] = useState<SubmissionDetailsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAIMarking, setIsAIMarking] = useState(false);
  const [markingMode, setMarkingMode] = useState<'ai' | 'manual'>('ai');
  const [overallFeedback, setOverallFeedback] = useState('');
  const [viewFileUrl, setViewFileUrl] = useState<string | null>(null);
  const [questions, setQuestions] = useState<QuestionGrade[]>([]);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const data = await markingGradingService.getSubmissionDetails(id!, submission_type);
        console.log("assessment details: ", data)
        setSubmissionData(data);

        // initialize states
        setOverallFeedback(data.grading?.feedback || '');

        setQuestions(data.questions || []);

        if (data.assignment) {
          setAssignmentGrade({
            score: data.grading?.score || 0,
            maxScore: data.assignment.maxScore
          });
        }

      } catch (err: any) {
        toast.error(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [id]);

  const formatAnswer = (answer: any): string => {
    if (!answer) return '';

    if (typeof answer === 'string') return answer;

    if (typeof answer === 'number') return String(answer);

    if (Array.isArray(answer)) return answer.join(', ');

    if (typeof answer === 'object') {
      // 🔥 handle your backend structure
      if ('answer' in answer) return String(answer.answer);

      return JSON.stringify(answer, null, 2);
    }

    return String(answer);
  };


  const submission = submissionData?.submission;
  const submissionType = submission?.type;

  /* CHANGE: Assignment-level grading for file-based assignments */
  const [assignmentGrade, setAssignmentGrade] = useState({ score: 0, maxScore: 100 });

  const totalEarned = submissionType === 'assessment'
    ? questions.reduce((sum, q) => sum + (q.earnedPoints ?? 0), 0)
    : assignmentGrade.score;

  const totalMax = submissionType === 'assessment'
    ? questions.reduce((sum, q) => sum + (q.maxPoints ?? 0), 0)
    : assignmentGrade.maxScore;
  const percentage = totalMax > 0 ? Math.round((totalEarned / totalMax) * 100) : 0;



  const handleRunAIMarking = () => {
    setIsAIMarking(true);
    toast.info('AI is analyzing submission...', { duration: 2000 });
    setTimeout(() => {
      setIsAIMarking(false);
      toast.success('AI marking completed! Review the suggestions below.');
      setOverallFeedback(
        submissionType === 'assessment'
          ? 'Overall good understanding of database concepts. The student demonstrates strong knowledge of SQL basics but needs improvement in normalization ordering and command categorization.'
          : 'The assignment submission is well-structured. The ER diagram follows proper notation. Implementation SQL could use better indexing strategies.'
      );
    }, 3000);
  };

  const handleAdjustScore = (questionNumber: number, newScore: number) => {
    setQuestions(prev => prev.map(q =>
      q.questionNumber === questionNumber
        ? { ...q, earnedPoints: Math.min(Math.max(0, newScore), q.maxPoints) }
        : q
    ));
  };

  const handlePublish = async () => {
    try {
      if (!submission) return;

      if (submission.type === 'assignment') {
        console.log("submission id: ", submission.id);
        console.log("student id: ", submission.studentId);
        await markingGradingService.gradeAssignment({
          submission_id: submission.id,
          assignment_id: submission.id,
          student_id: submission.studentId,
          course_id: submission.courseName,
          score: assignmentGrade.score,
          max_score: assignmentGrade.maxScore,
          feedback: overallFeedback,
          is_published: true
        });
      } else {
        await markingGradingService.gradeAssessment({
          attempt_id: submission.id,
          assessment_id: submission.assessment_id,
          student_id: submission.studentId,
          course_id: submission.course_id,
          score: totalEarned,
          max_score: totalMax,
          pending_score: 0,
          feedback: overallFeedback,
          is_published: true
        });
      }

      toast.success('Grades published!');
      navigate('/instructor/marking');
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  /* CHANGE: Render student answer based on question type */
  const renderStudentAnswer = (q: QuestionGrade) => {
    switch (q.questionType) {
      case 'multiple-choice':
        return (
          <div className="space-y-2">
            {q.options?.map((opt, idx) => (
              <div
                key={idx}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-lg border text-sm",
                  idx === q.studentAnswer && idx === q.correctAnswer && "bg-green-50 dark:bg-green-950/20 border-green-300",
                  idx === q.studentAnswer && idx !== q.correctAnswer && "bg-red-50 dark:bg-red-950/20 border-red-300",
                  idx !== q.studentAnswer && idx === q.correctAnswer && "bg-green-50/50 dark:bg-green-950/10 border-green-200 border-dashed",
                )}
              >
                <span className="font-mono text-xs w-6 h-6 rounded-full flex items-center justify-center border bg-background">
                  {String.fromCharCode(65 + idx)}
                </span>
                <span className="flex-1">{opt}</span>
                {idx === q.studentAnswer && idx === q.correctAnswer && <CheckCircle className="h-4 w-4 text-green-600" />}
                {idx === q.studentAnswer && idx !== q.correctAnswer && <XCircle className="h-4 w-4 text-red-500" />}
                {idx !== q.studentAnswer && idx === q.correctAnswer && <CheckCircle className="h-4 w-4 text-green-400" />}
              </div>
            ))}
          </div>
        );

      case 'true-false':
        return (
          <div className="grid grid-cols-2 gap-3">
            {['true', 'false'].map(val => (
              <div
                key={val}
                className={cn(
                  "p-4 rounded-lg border text-center font-medium capitalize",
                  q.studentAnswer === val && val === q.correctAnswer && "bg-green-50 dark:bg-green-950/20 border-green-300",
                  q.studentAnswer === val && val !== q.correctAnswer && "bg-red-50 dark:bg-red-950/20 border-red-300",
                  q.studentAnswer !== val && val === q.correctAnswer && "bg-green-50/50 dark:bg-green-950/10 border-green-200 border-dashed",
                )}
              >
                {val}
                {q.studentAnswer === val && val === q.correctAnswer && <CheckCircle className="h-4 w-4 inline ml-2 text-green-600" />}
                {q.studentAnswer === val && val !== q.correctAnswer && <XCircle className="h-4 w-4 inline ml-2 text-red-500" />}
              </div>
            ))}
          </div>
        );

      case 'short-answer':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Student Answer</Label>
              <div className="p-3 bg-muted/50 rounded-lg text-sm">{formatAnswer(q.studentAnswer) || <em className="text-muted-foreground">No answer</em>}</div>
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Model Answer</Label>
              <div className="p-3 bg-green-50 dark:bg-green-950/20 rounded-lg text-sm">{formatAnswer(q.correctAnswer)}</div>
            </div>
          </div>
        );

      case 'essay':
        return (
          <div className="space-y-4">
            <div className="space-y-1">
              <div className="p-4 bg-muted/50 rounded-lg text-sm whitespace-pre-wrap leading-relaxed">
                {formatAnswer(q.studentAnswer) || <em className="text-muted-foreground">No answer</em>}
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Model Answer</Label>
              <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg text-sm whitespace-pre-wrap leading-relaxed">
                {q.correctAnswer}
              </div>
            </div>
          </div>
        );

      case 'coding':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Student Code</Label>
                <pre className="p-4 bg-zinc-900 text-zinc-100 rounded-lg text-sm font-mono overflow-x-auto whitespace-pre-wrap">
                  {q.studentAnswer || '// No code submitted'}
                </pre>
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Expected Code</Label>
                <pre className="p-4 bg-zinc-900 text-green-300 rounded-lg text-sm font-mono overflow-x-auto whitespace-pre-wrap">
                  {q.correctAnswer}
                </pre>
              </div>
            </div>
            {q.testCases && q.testCases.length > 0 && (
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Test Cases</Label>
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-muted">
                      <tr>
                        <th className="p-2 text-left">#</th>
                        <th className="p-2 text-left">Input</th>
                        <th className="p-2 text-left">Expected</th>
                        <th className="p-2 text-left">Got</th>
                        <th className="p-2 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {q.testCases.map((tc, i) => (
                        <tr key={i} className="border-t">
                          <td className="p-2 font-mono">{i + 1}</td>
                          <td className="p-2 font-mono text-xs">{tc.input}</td>
                          <td className="p-2 font-mono text-xs">{tc.expectedOutput}</td>
                          <td className="p-2 font-mono text-xs">{tc.studentOutput || '—'}</td>
                          <td className="p-2 text-center">
                            {tc.passed ? (
                              <CheckCircle className="h-4 w-4 text-green-500 mx-auto" />
                            ) : (
                              <XCircle className="h-4 w-4 text-red-500 mx-auto" />
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        );

      case 'file-upload':
        return (
          <div className="space-y-3">
            {q.fileName ? (
              <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/30">
                <div className="flex items-center gap-3">
                  <FileText className="h-6 w-6 text-primary" />
                  <div>
                    <p className="font-medium">{q.fileName}</p>
                    <p className="text-xs text-muted-foreground">Uploaded by student</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => q.fileUrl && setViewFileUrl(q.fileUrl)}>
                    <Eye className="mr-2 h-4 w-4" /> View
                  </Button>
                  <Button size="sm" variant="outline">
                    <Download className="mr-2 h-4 w-4" /> Download
                  </Button>
                </div>
              </div>
            ) : (
              <div className="p-4 border rounded-lg bg-muted/30 text-center text-muted-foreground">
                No file uploaded by student
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              File-upload questions require manual review. AI can only verify file presence.
            </p>
          </div>
        );

      case 'matching':
        return (
          <div className="space-y-2">
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted">
                  <tr>
                    <th className="p-3 text-left">Item</th>
                    <th className="p-3 text-left">Student Match</th>
                    <th className="p-3 text-left">Correct Match</th>
                    <th className="p-3 text-center">Result</th>
                  </tr>
                </thead>
                <tbody>
                  {q.matchingPairs?.map((pair, i) => {
                    const studentMatch = q.studentMatching?.[pair.left] || '—';
                    const isMatch = studentMatch === pair.right;
                    return (
                      <tr key={i} className={cn("border-t", isMatch ? "bg-green-50/50 dark:bg-green-950/10" : "bg-red-50/50 dark:bg-red-950/10")}>
                        <td className="p-3 font-medium">{pair.left}</td>
                        <td className="p-3">{studentMatch}</td>
                        <td className="p-3 text-green-700 dark:text-green-400">{pair.right}</td>
                        <td className="p-3 text-center">
                          {isMatch ? <CheckCircle className="h-4 w-4 text-green-500 mx-auto" /> : <XCircle className="h-4 w-4 text-red-500 mx-auto" />}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        );

      case 'ordering':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Student Order</Label>
              <div className="space-y-2">
                {(q.studentOrder || []).map((item, idx) => {
                  const isCorrectPosition = q.correctOrder?.[idx] === item;
                  return (
                    <div key={idx} className={cn(
                      "flex items-center gap-3 p-3 rounded-lg border",
                      isCorrectPosition ? "bg-green-50 dark:bg-green-950/20 border-green-300" : "bg-red-50 dark:bg-red-950/20 border-red-300"
                    )}>
                      <span className="font-mono text-xs w-6 h-6 rounded-full flex items-center justify-center border bg-background">{idx + 1}</span>
                      <span>{item}</span>
                      {isCorrectPosition ? <CheckCircle className="h-4 w-4 text-green-500 ml-auto" /> : <XCircle className="h-4 w-4 text-red-500 ml-auto" />}
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Correct Order</Label>
              <div className="space-y-2">
                {(q.correctOrder || []).map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-3 rounded-lg border bg-green-50/50 dark:bg-green-950/10 border-green-200">
                    <span className="font-mono text-xs w-6 h-6 rounded-full flex items-center justify-center border bg-background">{idx + 1}</span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      default:
        return <p className="text-muted-foreground">Unknown question type</p>;
    }
  };

  /* CHANGE: Render a single question block (shared between AI & Manual tabs) */
  const renderQuestionBlock = (q: QuestionGrade, showModelAnswer: boolean) => {
    const typeInfo = getQuestionTypeInfo(q.questionType);
    return (
      <div key={q.questionNumber} className="space-y-4 p-5 border rounded-lg">
        {/* Question header */}
        <div className="flex items-start justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="outline">Q{q.questionNumber}</Badge>
            <Badge variant="secondary" className="gap-1">{typeInfo.icon}{typeInfo.label}</Badge>
            {q.isAutoGraded ? (
              q.isCorrect ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <XCircle className="h-5 w-5 text-red-500" />
              )
            ) : (
              <Brain className="h-5 w-5 text-yellow-500" />
            )}
          </div>
          <div className="flex items-center gap-2">
            <Label className="text-sm">Points:</Label>
            <Input
              type="number"
              min="0"
              max={q.maxPoints}
              step="0.5"
              value={q.earnedPoints ?? 0}
              disabled={q.isAutoGraded}
              onChange={(e) => handleAdjustScore(q.questionNumber, parseFloat(e.target.value) || 0)}
              className="w-20 text-center font-bold"
            />
            <span className="text-muted-foreground">/ {q.maxPoints}</span>
          </div>
        </div>

        {/* Question text */}
        <p className="font-medium text-base">{q.question}</p>

        <Separator />

        {/* Type-specific answer rendering */}
        {renderStudentAnswer(q)}

        {/* AI Suggestion */}
        {showModelAnswer && q.aiSuggestion && (
          <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
            <Brain className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-xs font-medium text-blue-900 dark:text-blue-300 mb-1">AI Suggestion</p>
              <p className="text-sm">{q.aiSuggestion}</p>
            </div>
          </div>
        )}

        {/* Feedback */}
        <div className="space-y-2">
          <Label>Instructor Feedback</Label>
          <Textarea
            placeholder="Add feedback for this question..."
            className="min-h-[80px]"
            value={q.feedback || ''}
            onChange={(e) => {
              setQuestions(prev => prev.map(question =>
                question.questionNumber === q.questionNumber
                  ? { ...question, feedback: e.target.value }
                  : question
              ));
            }}
          />
        </div>
      </div>
    );
  };

  /* CHANGE: Render assignment submission details */
  const renderAssignmentSubmission = () => {
    const assignment = submissionData?.assignment;
    if (!assignment) return null;

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Assignment Submission
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">

          {/* Files */}
          {assignment.files?.length > 0 && (
            <div className="space-y-3">
              <Label className="text-sm font-medium">Submitted Files</Label>

              {assignment.files.map((file, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium text-sm">{file.name}</p>
                      <p className="text-xs text-muted-foreground">{file.size}</p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => setViewFileUrl(file.url)}>
                      <Eye className="mr-1 h-3 w-3" /> View
                    </Button>
                    <Button size="sm" variant="outline">
                      <Download className="mr-1 h-3 w-3" /> Download
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Text */}
          {assignment.text && (
            <div className="space-y-1">
              <Label className="text-sm text-muted-foreground">Student Description</Label>
              <div className="p-4 bg-muted/50 rounded-lg text-sm">{assignment.text}</div>
            </div>
          )}

          {/* Notes */}
          {assignment.notes && (
            <div className="space-y-1">
              <Label className="text-sm text-muted-foreground">Student Notes</Label>
              <div className="p-4 bg-yellow-50 rounded-lg text-sm italic">{assignment.notes}</div>
            </div>
          )}

          <Separator />

          {/* Grade */}
          <div className="space-y-4">
            <Label className="text-base font-medium">Grade Assignment</Label>

            <div className="flex items-center gap-3">
              <Input
                type="number"
                min="0"
                max={assignmentGrade.maxScore}
                value={assignmentGrade.score}
                onChange={(e) =>
                  setAssignmentGrade(prev => ({
                    ...prev,
                    score: parseFloat(e.target.value) || 0
                  }))
                }
                className="w-24 text-center text-lg font-bold"
              />

              <span className="text-lg text-muted-foreground">
                / {assignmentGrade.maxScore}
              </span>

              <Badge className="ml-2 text-base px-3">
                {Math.round((assignmentGrade.score / assignmentGrade.maxScore) * 100)}%
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (loading || !submissionData || !submission) {
    return <div className="p-6">Loading submission...</div>;
  }

  return (
    <InstructorLayout>
      <div className="container py-8 space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate('/instructor/marking')} className="gap-2">
              <ArrowLeft className="h-4 w-4" /> Back
            </Button>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-2xl font-bold">Grade Submission</h1>
                {/* CHANGE: Submission type badge */}
                <Badge variant={submissionType === 'assessment' ? 'secondary' : 'outline'} className="text-sm">
                  {submissionType === 'assessment' ? 'Assessment' : 'Assignment'}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {submission.title} — {submission.studentName}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={handlePublish} className="gap-2">
              <Send className="h-4 w-4" /> Approve & Publish
            </Button>
          </div>
        </div>

        {/* Score Summary */}
        <Card className="border-primary/50 bg-gradient-to-r from-primary/5 to-transparent">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Current Score</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold">{totalEarned}</span>
                  <span className="text-2xl text-muted-foreground">/ {totalMax}</span>
                  <Badge className="ml-4 text-lg px-3 py-1">{percentage}%</Badge>
                </div>
              </div>
              <div className="text-right w-full sm:w-auto">
                <p className="text-sm text-muted-foreground mb-2">Grade Distribution</p>
                <Progress value={percentage} className="w-full sm:w-48 h-3" />
                {submissionType === 'assessment' && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {questions.filter(q => q.isCorrect).length} / {questions.length} questions correct
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CHANGE: Assignment file submission section (only for assignments) */}
        {submissionType === 'assignment' && renderAssignmentSubmission()}

        {/* CHANGE: Question-level marking (only for assessments) */}
        {submissionType === 'assessment' && (
          <Tabs value={markingMode} onValueChange={(v) => setMarkingMode(v as 'ai' | 'manual')}>
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="ai" className="gap-2">
                <Brain className="h-4 w-4" /> AI Marking
              </TabsTrigger>
              <TabsTrigger value="manual" className="gap-2">
                <User className="h-4 w-4" /> Manual Marking
              </TabsTrigger>
            </TabsList>

            <TabsContent value="ai" className="space-y-6">
              {/* AI Control Panel */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="h-5 w-5 text-primary" />
                    AI-Assisted Marking
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/30">
                    <div>
                      <p className="font-medium">Run AI Analysis</p>
                      <p className="text-sm text-muted-foreground">
                        Auto-grade objective questions and suggest scores for subjective ones
                      </p>
                    </div>
                    <Button onClick={handleRunAIMarking} disabled={isAIMarking} className="gap-2">
                      {isAIMarking ? (
                        <><Skeleton className="h-4 w-4 rounded-full animate-spin" /> Analyzing...</>
                      ) : (
                        <><Brain className="h-4 w-4" /> Run AI</>
                      )}
                    </Button>
                  </div>

                  {overallFeedback && (
                    <div className="p-4 border rounded-lg bg-blue-50 dark:bg-blue-950/20">
                      <div className="flex items-start gap-2">
                        <Brain className="h-5 w-5 text-blue-600 mt-0.5" />
                        <div className="flex-1">
                          <p className="font-medium text-sm mb-1">AI Generated Feedback</p>
                          <p className="text-sm text-muted-foreground">{overallFeedback}</p>
                        </div>
                        <Button variant="ghost" size="sm" onClick={handleRunAIMarking}>
                          <RefreshCw className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Questions with AI suggestions */}
              <Card>
                <CardHeader>
                  <CardTitle>Question-by-Question Analysis</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {questions.map(q => renderQuestionBlock(q, true))}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="manual" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" /> Manual Grading
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {questions.map(q => renderQuestionBlock(q, false))}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}

        {/* Overall Feedback */}
        <Card>
          <CardHeader>
            <CardTitle>Overall Feedback & Comments</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Enter overall feedback for the student..."
              value={overallFeedback}
              onChange={(e) => setOverallFeedback(e.target.value)}
              className="min-h-[120px]"
            />
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-wrap justify-end gap-2">
          <Button variant="outline" onClick={handleRunAIMarking} className="gap-2">
            <RefreshCw className="h-4 w-4" /> Re-run AI Marking
          </Button>
          <Button onClick={handlePublish} className="gap-2">
            <Send className="h-4 w-4" /> Approve & Publish
          </Button>
        </div>

        {/* CHANGE: File preview modal */}
        {viewFileUrl && (
          <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center">
            <div className="bg-background w-[90%] h-[90%] rounded-lg overflow-hidden flex flex-col">
              <div className="flex justify-between items-center p-3 border-b">
                <h2 className="font-semibold">File Preview</h2>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" asChild>
                    <a href={viewFileUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="mr-1 h-3 w-3" /> Open
                    </a>
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setViewFileUrl(null)}>Close</Button>
                </div>
              </div>
              <iframe
                src={viewFileUrl}
                className="flex-1 w-full"
              />
            </div>
          </div>
        )}
      </div>
    </InstructorLayout>
  );
}