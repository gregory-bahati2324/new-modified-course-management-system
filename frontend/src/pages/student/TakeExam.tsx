
import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Clock,
  Save,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  Flag,
  Send,
  FileQuestion,
  Upload,
  Code,
  List,
  ArrowUpDown,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { assessmentService, ExamDetails, ExamAnswer, ExamQuestion } from '@/services/assessmentService';
import { cn } from '@/lib/utils';

export default function TakeExam() {
  const navigate = useNavigate();
  const { examId } = useParams<{ examId: string }>();

  const [exam, setExam] = useState<ExamDetails | null>(null);
  const [attemptId, setAttemptId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, any>>({});
  const [flaggedQuestions, setFlaggedQuestions] = useState<Set<number>>(new Set());
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [showTimeWarning, setShowTimeWarning] = useState(false);
  const [startTime] = useState(Date.now());

  const autoSaveRef = useRef<NodeJS.Timeout | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  /* CHANGE: Fetch exam details on mount */
  useEffect(() => {
    const fetchExam = async () => {
      if (!examId) return;

      try {
        setLoading(true);
        const data = await assessmentService.getExamDetails(examId);
        setExam(data);

        // Set timer if time limit exists
        if (data.time_limit) {
          setTimeRemaining(data.time_limit * 60); // Convert to seconds
        }

        // Start the exam
        const res = await assessmentService.startExam(examId);
        setAttemptId(res.attempt_id);
      } catch (error: any) {
        toast.error(error.message || 'Failed to load exam');
        navigate('/student/exams');
      } finally {
        setLoading(false);
      }
    };

    fetchExam();

    return () => {
      if (autoSaveRef.current) clearInterval(autoSaveRef.current);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [examId, navigate]);

  /* CHANGE: Timer countdown */
  useEffect(() => {
    if (timeRemaining === null) return;

    timerRef.current = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev === null) return null;
        if (prev <= 1) {
          // Time's up - auto submit
          handleSubmit(true);
          return 0;
        }
        // Show warning at 5 minutes
        if (prev === 300) {
          setShowTimeWarning(true);
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [timeRemaining !== null]);

  /* CHANGE: Auto-save every 30 seconds */
  useEffect(() => {
    if (!examId || !exam || !attemptId) return;

    autoSaveRef.current = setInterval(async () => {
      const answersArray: ExamAnswer[] = Object.entries(answers).map(([qId, answer]) => ({
        question_id: parseInt(qId),
        answer
      }));

      try {
        await assessmentService.saveExamProgress(attemptId, answersArray);
      } catch (error) {
        console.error('Auto-save failed:', error);
      }
    }, 30000);

    return () => {
      if (autoSaveRef.current) clearInterval(autoSaveRef.current);
    };
  }, [examId, exam, attemptId, answers]);

  /* CHANGE: Format time display */
  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  /* CHANGE: Handle answer changes */
  const handleAnswer = useCallback((questionId: number, answer: any) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
  }, []);

  /* CHANGE: Toggle flagged question */
  const toggleFlag = (questionId: number) => {
    setFlaggedQuestions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(questionId)) {
        newSet.delete(questionId);
      } else {
        newSet.add(questionId);
      }
      return newSet;
    });
  };

  /* CHANGE: Submit exam */
  const handleSubmit = async (isAutoSubmit = false) => {
    if (!exam || !examId || !attemptId) return;
    if (submitting) return;

    setSubmitting(true);

    const timeTaken = Math.floor((Date.now() - startTime) / 1000);

    const answersArray: ExamAnswer[] = Object.entries(answers).map(([qId, answer]) => ({
      question_id: parseInt(qId),
      answer
    }));

    try {
      const result = await assessmentService.submitExam(attemptId, answersArray, timeTaken);

      toast.success(
        isAutoSubmit
          ? 'Time up! Exam submitted automatically.'
          : 'Exam submitted successfully!'
      );

      navigate(`/student/exams/${examId}/result`, { state: { result } });

    } catch (error: any) {
      const message =
        error?.response?.data?.detail ||
        error?.message ||
        'Failed to submit exam';

      toast.error(message);
      setSubmitting(false);
    }
  };

  /* CHANGE: Calculate progress */
  const answeredCount = Object.keys(answers).length;
  const totalQuestions = exam?.questions.length || 0;
  const progressPercent = (answeredCount / totalQuestions) * 100;

  /* CHANGE: Render question based on type */
  const renderQuestion = (question: ExamQuestion) => {
    const answer = answers[question.id];
    const normalizedtype = question.type?.toLowerCase().trim();
    console.log("QUESTION TYPE:", question.type);
    console.log("NORMALIZED TYPE:", normalizedtype);


    switch (normalizedtype) {
      case 'multiple-choice':
        return (
          <RadioGroup
            value={answer?.toString()}
            onValueChange={(value) => handleAnswer(question.id, parseInt(value))}
          >
            {question.options?.map((option, idx) => (
              <div
                key={idx}
                className="flex items-center space-x-3 p-4 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer"
                onClick={() => handleAnswer(question.id, idx)}
              >
                <RadioGroupItem value={idx.toString()} id={`q${question.id}-opt${idx}`} />
                <Label htmlFor={`q${question.id}-opt${idx}`} className="flex-1 cursor-pointer text-base">
                  {option}
                </Label>
              </div>
            ))}
          </RadioGroup>
        );

      case 'true-false':
        return (
          <RadioGroup
            value={answer}
            onValueChange={(value) => handleAnswer(question.id, value)}
          >
            <div
              className="flex items-center space-x-3 p-4 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer"
              onClick={() => handleAnswer(question.id, 'true')}
            >
              <RadioGroupItem value="true" id={`q${question.id}-true`} />
              <Label htmlFor={`q${question.id}-true`} className="flex-1 cursor-pointer text-base">True</Label>
            </div>
            <div
              className="flex items-center space-x-3 p-4 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer"
              onClick={() => handleAnswer(question.id, 'false')}
            >
              <RadioGroupItem value="false" id={`q${question.id}-false`} />
              <Label htmlFor={`q${question.id}-false`} className="flex-1 cursor-pointer text-base">False</Label>
            </div>
          </RadioGroup>
        );

      case 'short-answer':
        return (
          <Input
            placeholder="Type your answer here..."
            value={answer || ''}
            onChange={(e) => handleAnswer(question.id, e.target.value)}
            className="text-base"
          />
        );

      case 'essay':
        return (
          <div className="space-y-2">
            <Textarea
              placeholder="Write your essay response here..."
              value={answer || ''}
              onChange={(e) => handleAnswer(question.id, e.target.value)}
              rows={10}
              className="text-base"
            />
            <p className="text-sm text-muted-foreground">
              Word count: {(answer || '').split(/\s+/).filter(Boolean).length}
            </p>
          </div>
        );

      case 'coding':
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Code className="h-4 w-4" />
              Write your code below
            </div>
            <Textarea
              placeholder="// Write your code here..."
              value={answer || ''}
              onChange={(e) => handleAnswer(question.id, e.target.value)}
              rows={12}
              className="font-mono text-sm"
            />
            {question.test_cases && question.test_cases.length > 0 && (
              <Card className="bg-muted/30">
                <CardHeader className="py-3">
                  <CardTitle className="text-sm">Test Cases</CardTitle>
                </CardHeader>
                <CardContent className="py-3">
                  {question.test_cases.map((tc, i) => (
                    <div key={i} className="text-xs font-mono mb-1">
                      <span className="text-muted-foreground">Input:</span> {tc.input} →
                      <span className="text-muted-foreground ml-2">Expected:</span> {tc.expectedOutput}
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        );

      case 'file-upload':
        return (
          <div className="space-y-4">
            <div className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
              <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
              <p className="text-sm text-muted-foreground mb-2">
                Drag and drop your file here, or click to browse
              </p>
              <Input
                type="file"
                className="max-w-xs mx-auto cursor-pointer"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleAnswer(question.id, file.name);
                }}
              />
            </div>
            {answer && (
              <p className="text-sm text-green-600">File selected: {answer}</p>
            )}
          </div>
        );

      case 'matching':
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
              <List className="h-4 w-4" />
              Match items from left column to right column
            </div>
            {question.matching_pairs?.map((pair, idx) => (
              <div key={idx} className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                <div className="p-3 bg-muted/50 rounded-lg font-medium">
                  {pair.left}
                </div>
                <select
                  className="p-3 border rounded-lg bg-background"
                  value={(answer as Record<string, string>)?.[pair.left] || ''}
                  onChange={(e) => {
                    const newAnswer = { ...(answer || {}) as Record<string, string>, [pair.left]: e.target.value };
                    handleAnswer(question.id, newAnswer);
                  }}
                >
                  <option value="">Select match...</option>
                  {question.matching_pairs?.map((p, i) => (
                    <option key={i} value={p.right}>{p.right}</option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        );

      case 'ordering':
        const items = answer ? [...answer] : [...(question.correct_order || [])].sort(() => Math.random() - 0.5);
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <ArrowUpDown className="h-4 w-4" />
              Drag items to arrange them in correct order (or use arrows)
            </div>
            <div className="space-y-2">
              {items.map((item, idx) => (
                <div
                  key={idx}
                  className="p-4 bg-muted/50 rounded-lg flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-muted-foreground font-mono">{idx + 1}.</span>
                    <span>{item}</span>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={idx === 0}
                      onClick={() => {
                        const newItems = [...items];
                        [newItems[idx - 1], newItems[idx]] = [newItems[idx], newItems[idx - 1]];
                        handleAnswer(question.id, newItems);
                      }}
                    >
                      ↑
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={idx === items.length - 1}
                      onClick={() => {
                        const newItems = [...items];
                        [newItems[idx], newItems[idx + 1]] = [newItems[idx + 1], newItems[idx]];
                        handleAnswer(question.id, newItems);
                      }}
                    >
                      ↓
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      default:
        return <p className="text-muted-foreground">Unknown question type</p>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!exam) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <AlertTriangle className="h-12 w-12 text-destructive" />
        <p>Failed to load exam</p>
        <Button onClick={() => navigate('/student/exams')}>Back to Exams</Button>
      </div>
    );
  }

  const currentQ = exam.questions[currentQuestion];

  return (
    <div className="min-h-screen bg-background">
      {/* CHANGE: Fixed header with timer and progress */}
      <div className="sticky top-0 z-40 bg-background border-b shadow-sm">
        <div className="container max-w-6xl mx-auto px-4 py-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h1 className="font-semibold text-lg truncate">{exam.title}</h1>
              <p className="text-sm text-muted-foreground">{exam.course_title}</p>
            </div>

            <div className="flex items-center gap-4">
              {/* Timer */}
              {timeRemaining !== null && (
                <div className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg font-mono font-bold",
                  timeRemaining <= 300 ? "bg-destructive/10 text-destructive" : "bg-muted"
                )}>
                  <Clock className="h-4 w-4" />
                  {formatTime(timeRemaining)}
                </div>
              )}

              {/* Save indicator */}
              <Button variant="ghost" size="sm" className="gap-2">
                <Save className="h-4 w-4" />
                <span className="hidden sm:inline">Auto-saved</span>
              </Button>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-3">
            <div className="flex justify-between text-xs text-muted-foreground mb-1">
              <span>Progress: {answeredCount}/{totalQuestions} answered</span>
              <span>{Math.round(progressPercent)}%</span>
            </div>
            <Progress value={progressPercent} className="h-2" />
          </div>
        </div>
      </div>

      <div className="container max-w-6xl mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-4 gap-6">
          {/* CHANGE: Question navigation sidebar */}
          <div className="lg:col-span-1 order-2 lg:order-1">
            <Card className="sticky top-32">
              <CardHeader className="py-3">
                <CardTitle className="text-sm">Questions</CardTitle>
              </CardHeader>
              <CardContent className="py-3">
                <div className="grid grid-cols-5 gap-2">
                  {exam.questions.map((q, idx) => (
                    <Button
                      key={q.id}
                      variant={currentQuestion === idx ? "default" : "outline"}
                      size="sm"
                      className={cn(
                        "h-10 w-10 p-0 relative",
                        answers[q.id] !== undefined && currentQuestion !== idx && "bg-green-100 border-green-500 dark:bg-green-900",
                        flaggedQuestions.has(q.id) && "ring-2 ring-yellow-500"
                      )}
                      onClick={() => setCurrentQuestion(idx)}
                    >
                      {idx + 1}
                      {flaggedQuestions.has(q.id) && (
                        <Flag className="h-3 w-3 absolute -top-1 -right-1 text-yellow-500" />
                      )}
                    </Button>
                  ))}
                </div>

                <Separator className="my-4" />

                <div className="space-y-2 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-green-100 dark:bg-green-900 border border-green-500" />
                    <span>Answered</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-background border" />
                    <span>Unanswered</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded border ring-2 ring-yellow-500" />
                    <span>Flagged</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* CHANGE: Main question area */}
          <div className="lg:col-span-3 order-1 lg:order-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary">Q{currentQuestion + 1}</Badge>
                    <Badge variant="outline">{currentQ.type.replace('-', ' ')}</Badge>
                    <Badge>{currentQ.points} pt{currentQ.points > 1 ? 's' : ''}</Badge>
                  </div>
                  <Button
                    variant={flaggedQuestions.has(currentQ.id) ? "secondary" : "ghost"}
                    size="sm"
                    onClick={() => toggleFlag(currentQ.id)}
                    className="gap-2"
                  >
                    <Flag className={cn("h-4 w-4", flaggedQuestions.has(currentQ.id) && "text-yellow-500")} />
                    {flaggedQuestions.has(currentQ.id) ? 'Flagged' : 'Flag'}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <p className="text-lg font-medium leading-relaxed">
                  {currentQ.question_text}
                </p>

                <Separator />

                {renderQuestion(currentQ)}
              </CardContent>
            </Card>

            {/* Navigation buttons */}
            <div className="flex justify-between mt-6">
              <Button
                variant="outline"
                onClick={() => setCurrentQuestion(prev => Math.max(0, prev - 1))}
                disabled={currentQuestion === 0}
                className="gap-2"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>

              <div className="flex gap-2">
                {currentQuestion === exam.questions.length - 1 ? (
                  <Button
                    onClick={() => setShowSubmitDialog(true)}
                    className="gap-2"
                    disabled={submitting}
                  >
                    {submitting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                    Submit Exam
                  </Button>
                ) : (
                  <Button
                    onClick={() => setCurrentQuestion(prev => Math.min(exam.questions.length - 1, prev + 1))}
                    className="gap-2"
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CHANGE: Submit confirmation dialog */}
      <AlertDialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Submit Exam?</AlertDialogTitle>
            <AlertDialogDescription className="space-y-3">
              <p>Are you sure you want to submit your exam?</p>
              <div className="bg-muted p-4 rounded-lg space-y-2">
                <p className="flex justify-between">
                  <span>Questions answered:</span>
                  <span className="font-medium">{answeredCount} / {totalQuestions}</span>
                </p>
                <p className="flex justify-between">
                  <span>Flagged for review:</span>
                  <span className="font-medium">{flaggedQuestions.size}</span>
                </p>
                {timeRemaining !== null && (
                  <p className="flex justify-between">
                    <span>Time remaining:</span>
                    <span className="font-medium">{formatTime(timeRemaining)}</span>
                  </p>
                )}
              </div>
              {answeredCount < totalQuestions && (
                <p className="text-destructive text-sm">
                  ⚠️ You have {totalQuestions - answeredCount} unanswered question(s)
                </p>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Review Answers</AlertDialogCancel>
            <AlertDialogAction onClick={() => handleSubmit(false)} disabled={submitting}>
              {submitting ? 'Submitting...' : 'Submit Exam'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Time warning dialog */}
      <AlertDialog open={showTimeWarning} onOpenChange={setShowTimeWarning}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              5 Minutes Remaining!
            </AlertDialogTitle>
            <AlertDialogDescription>
              You have 5 minutes left to complete your exam. Please review your answers and submit soon.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction>Continue</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}