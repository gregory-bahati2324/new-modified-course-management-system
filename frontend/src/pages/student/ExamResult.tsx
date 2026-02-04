/**
 * Exam Result Page - Shows exam results and detailed feedback
 * Created: 2025-02-04
 */

import { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import {
  ArrowLeft,
  Trophy,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  FileQuestion,
  Download,
  Share2,
  RotateCcw,
  Loader2,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { toast } from 'sonner';
import { studentExamService, ExamResult, AttemptHistory } from '@/services/studentExamService';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

export default function ExamResultPage() {
  const navigate = useNavigate();
  const { examId } = useParams<{ examId: string }>();
  const location = useLocation();
  
  const [result, setResult] = useState<ExamResult | null>(location.state?.result || null);
  const [attemptHistory, setAttemptHistory] = useState<AttemptHistory[]>([]);
  const [loading, setLoading] = useState(!location.state?.result);
  const [expandedQuestions, setExpandedQuestions] = useState<Set<number>>(new Set());

  useEffect(() => {
    const fetchResult = async () => {
      if (!examId) return;
      if (result) {
        // Already have result from navigation state
        fetchAttemptHistory();
        return;
      }
      
      try {
        setLoading(true);
        const data = await studentExamService.getExamResult(examId);
        setResult(data);
        await fetchAttemptHistory();
      } catch (error: any) {
        toast.error(error.message || 'Failed to load result');
        navigate('/student/exams');
      } finally {
        setLoading(false);
      }
    };
    
    const fetchAttemptHistory = async () => {
      if (!examId) return;
      try {
        const history = await studentExamService.getAttemptHistory(examId);
        setAttemptHistory(history);
      } catch (error) {
        console.error('Failed to load attempt history:', error);
      }
    };
    
    fetchResult();
  }, [examId, navigate]);

  const toggleQuestion = (questionId: number) => {
    setExpandedQuestions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(questionId)) {
        newSet.delete(questionId);
      } else {
        newSet.add(questionId);
      }
      return newSet;
    });
  };

  const formatDuration = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hrs > 0) {
      return `${hrs}h ${mins}m`;
    }
    if (mins > 0) {
      return `${mins}m ${secs}s`;
    }
    return `${secs}s`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!result) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <AlertCircle className="h-12 w-12 text-destructive" />
        <p>Failed to load result</p>
        <Button onClick={() => navigate('/student/exams')}>Back to Exams</Button>
      </div>
    );
  }

  const passedClass = result.passed ? 'text-green-600 dark:text-green-400' : 'text-destructive';
  const passedBg = result.passed ? 'bg-green-100 dark:bg-green-900' : 'bg-red-100 dark:bg-red-900';

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-4xl mx-auto">
      {/* Back button */}
      <Button
        variant="ghost"
        onClick={() => navigate('/student/exams')}
        className="gap-2"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Exams
      </Button>

      {/* Result Header */}
      <Card className={cn("overflow-hidden", passedBg)}>
        <CardContent className="p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            {/* Score Circle */}
            <div className="relative">
              <div className={cn(
                "w-32 h-32 rounded-full flex items-center justify-center",
                "bg-background shadow-lg"
              )}>
                <div className="text-center">
                  <div className={cn("text-4xl font-bold", passedClass)}>
                    {result.percentage}%
                  </div>
                  <div className="text-sm text-muted-foreground">Score</div>
                </div>
              </div>
              {result.passed && (
                <Trophy className="absolute -top-2 -right-2 h-8 w-8 text-yellow-500" />
              )}
            </div>

            {/* Result Info */}
            <div className="flex-1 text-center sm:text-left">
              <Badge className={cn("mb-2", result.passed ? "bg-green-600" : "bg-destructive")}>
                {result.passed ? 'PASSED' : 'NOT PASSED'}
              </Badge>
              <h1 className="text-2xl font-bold mb-2">{result.exam_title}</h1>
              <p className="text-muted-foreground mb-4">{result.course_title}</p>
              
              <div className="flex flex-wrap justify-center sm:justify-start gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-muted-foreground" />
                  <span>{result.points_earned}/{result.total_points} points</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>{formatDuration(result.time_taken)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-muted-foreground" />
                  <span>Passing: {result.passing_score}%</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3">
        <Button variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          Download Report
        </Button>
        <Button variant="outline" className="gap-2">
          <Share2 className="h-4 w-4" />
          Share Result
        </Button>
        <Button 
          variant="secondary" 
          className="gap-2"
          onClick={() => navigate(`/student/exams/${examId}/take`)}
        >
          <RotateCcw className="h-4 w-4" />
          Retake Exam
        </Button>
      </div>

      {/* Attempt History */}
      {attemptHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Attempt History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {attemptHistory.map((attempt) => (
                <div 
                  key={attempt.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                >
                  <div className="flex items-center gap-4">
                    <Badge variant="outline">Attempt {attempt.attempt_number}</Badge>
                    <span className="text-sm text-muted-foreground">
                      {format(new Date(attempt.submitted_at), 'MMM d, yyyy h:mm a')}
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={cn("font-semibold", attempt.passed ? "text-green-600" : "text-destructive")}>
                      {attempt.percentage}%
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {formatDuration(attempt.time_taken)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Question-by-Question Review */}
      {result.show_answers && result.question_results && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <FileQuestion className="h-5 w-5" />
              Detailed Review
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {result.question_results.map((qResult, idx) => (
              <Collapsible
                key={qResult.question_id}
                open={expandedQuestions.has(qResult.question_id)}
                onOpenChange={() => toggleQuestion(qResult.question_id)}
              >
                <CollapsibleTrigger asChild>
                  <div className={cn(
                    "flex items-center justify-between p-4 rounded-lg cursor-pointer transition-colors",
                    "hover:bg-muted/50",
                    qResult.is_correct 
                      ? "bg-green-50 dark:bg-green-950 border-l-4 border-green-500" 
                      : "bg-red-50 dark:bg-red-950 border-l-4 border-red-500"
                  )}>
                    <div className="flex items-center gap-3">
                      {qResult.is_correct ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : (
                        <XCircle className="h-5 w-5 text-destructive" />
                      )}
                      <div>
                        <span className="font-medium">Question {idx + 1}</span>
                        <Badge variant="outline" className="ml-2">{qResult.type}</Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={cn(
                        "font-semibold",
                        qResult.is_correct ? "text-green-600" : "text-destructive"
                      )}>
                        {qResult.points_earned}/{qResult.points} pts
                      </span>
                      {expandedQuestions.has(qResult.question_id) ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </div>
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="p-4 border-l-4 border-transparent ml-4 space-y-3">
                    <p className="font-medium">{qResult.question_text}</p>
                    
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="p-3 rounded-lg bg-muted/50">
                        <p className="text-xs text-muted-foreground mb-1">Your Answer</p>
                        <p className={qResult.is_correct ? "text-green-600" : "text-destructive"}>
                          {typeof qResult.student_answer === 'object' 
                            ? JSON.stringify(qResult.student_answer) 
                            : qResult.student_answer || 'No answer provided'}
                        </p>
                      </div>
                      {qResult.correct_answer && (
                        <div className="p-3 rounded-lg bg-green-50 dark:bg-green-950">
                          <p className="text-xs text-muted-foreground mb-1">Correct Answer</p>
                          <p className="text-green-600">
                            {typeof qResult.correct_answer === 'object' 
                              ? JSON.stringify(qResult.correct_answer) 
                              : qResult.correct_answer}
                          </p>
                        </div>
                      )}
                    </div>
                    
                    {qResult.feedback && (
                      <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950">
                        <p className="text-xs text-muted-foreground mb-1">Feedback</p>
                        <p className="text-sm">{qResult.feedback}</p>
                      </div>
                    )}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Performance Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Performance Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Overall Score</span>
                <span className="font-medium">{result.percentage}%</span>
              </div>
              <Progress value={result.percentage} className="h-3" />
            </div>
            
            <Separator />
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {result.question_results?.filter(q => q.is_correct).length || 0}
                </div>
                <div className="text-xs text-muted-foreground">Correct</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-destructive">
                  {result.question_results?.filter(q => !q.is_correct).length || 0}
                </div>
                <div className="text-xs text-muted-foreground">Incorrect</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-primary">
                  {result.points_earned}
                </div>
                <div className="text-xs text-muted-foreground">Points Earned</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-muted-foreground">
                  {formatDuration(result.time_taken)}
                </div>
                <div className="text-xs text-muted-foreground">Time Taken</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Back to exams */}
      <div className="text-center">
        <Button onClick={() => navigate('/student/exams')} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to All Exams
        </Button>
      </div>
    </div>
  );
}