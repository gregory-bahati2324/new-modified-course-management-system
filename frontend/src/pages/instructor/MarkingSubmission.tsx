import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft, Save, Send, Brain, User, FileText,
  CheckCircle, XCircle, AlertCircle, Download, RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { InstructorLayout } from '@/components/layout/InstructorLayout';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';

interface QuestionGrade {
  questionNumber: number;
  question: string;
  studentAnswer: string;
  correctAnswer: string;
  earnedPoints: number;
  maxPoints: number;
  aiSuggestion?: string;
  feedback?: string;
  isCorrect: boolean;
}

export default function MarkingSubmission() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [isAIMarking, setIsAIMarking] = useState(false);
  const [markingMode, setMarkingMode] = useState<'ai' | 'manual'>('ai');
  const [overallFeedback, setOverallFeedback] = useState('');

  const [questions, setQuestions] = useState<QuestionGrade[]>([
    {
      questionNumber: 1,
      question: 'What is normalization in database design?',
      studentAnswer: 'Normalization is the process of organizing data in a database to reduce redundancy and improve data integrity.',
      correctAnswer: 'Normalization is the process of organizing data to minimize redundancy and dependency by dividing large tables into smaller ones and defining relationships between them.',
      earnedPoints: 8,
      maxPoints: 10,
      aiSuggestion: 'Good understanding but missing the part about dividing tables and relationships.',
      isCorrect: true
    },
    {
      questionNumber: 2,
      question: 'Explain the difference between DELETE and TRUNCATE commands.',
      studentAnswer: 'DELETE removes rows one by one and TRUNCATE removes all rows at once.',
      correctAnswer: 'DELETE is a DML command that removes rows one by one, can be rolled back, and fires triggers. TRUNCATE is a DDL command that removes all rows quickly, cannot be rolled back, and does not fire triggers.',
      earnedPoints: 5,
      maxPoints: 10,
      aiSuggestion: 'Missing important details about DML vs DDL, rollback capability, and triggers.',
      isCorrect: false
    },
    {
      questionNumber: 3,
      question: 'What is a foreign key constraint?',
      studentAnswer: 'A foreign key is a field that links two tables together by referencing the primary key of another table.',
      correctAnswer: 'A foreign key constraint establishes a link between data in two tables by referencing the primary key in another table, ensuring referential integrity.',
      earnedPoints: 9,
      maxPoints: 10,
      aiSuggestion: 'Excellent answer, just missing "ensures referential integrity".',
      isCorrect: true
    }
  ]);

  const totalEarned = questions.reduce((sum, q) => sum + q.earnedPoints, 0);
  const totalMax = questions.reduce((sum, q) => sum + q.maxPoints, 0);
  const percentage = Math.round((totalEarned / totalMax) * 100);

  const handleRunAIMarking = () => {
    setIsAIMarking(true);
    toast.info('AI is analyzing submission...', { duration: 2000 });

    setTimeout(() => {
      setIsAIMarking(false);
      toast.success('AI marking completed! Review the suggestions below.');
      setOverallFeedback('Overall good understanding of database concepts. Focus on providing more detailed explanations, especially regarding technical distinctions between commands and the importance of constraints.');
    }, 3000);
  };

  const handleAdjustScore = (questionNumber: number, newScore: number) => {
    setQuestions(questions.map(q =>
      q.questionNumber === questionNumber
        ? { ...q, earnedPoints: Math.min(Math.max(0, newScore), q.maxPoints) }
        : q
    ));
  };

  const handleSaveAsDraft = () => {
    toast.success('Grades saved as draft');
  };

  const handlePublish = () => {
    toast.success('Grades published! Student notified.');
    navigate('/instructor/marking');
  };

  return (
    <InstructorLayout>
      <div className="container py-8 space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/instructor/marking')}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Grade Submission</h1>
              <p className="text-sm text-muted-foreground">
                Database Systems - Midterm Exam - John Doe
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleSaveAsDraft} className="gap-2">
              <Save className="h-4 w-4" />
              Save Draft
            </Button>
            <Button onClick={handlePublish} className="gap-2">
              <Send className="h-4 w-4" />
              Approve & Publish
            </Button>
          </div>
        </div>

        {/* Score Summary */}
        <Card className="border-primary/50 bg-gradient-to-r from-primary/5 to-transparent">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Current Score</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold">{totalEarned}</span>
                  <span className="text-2xl text-muted-foreground">/ {totalMax}</span>
                  <Badge className="ml-4 text-lg px-3 py-1">
                    {percentage}%
                  </Badge>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground mb-2">Grade Distribution</p>
                <Progress value={percentage} className="w-48 h-3" />
                <p className="text-xs text-muted-foreground mt-1">
                  {questions.filter(q => q.isCorrect).length} / {questions.length} questions correct
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs value={markingMode} onValueChange={(v) => setMarkingMode(v as 'ai' | 'manual')}>
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="ai" className="gap-2">
              <Brain className="h-4 w-4" />
              AI Marking
            </TabsTrigger>
            <TabsTrigger value="manual" className="gap-2">
              <User className="h-4 w-4" />
              Manual Marking
            </TabsTrigger>
          </TabsList>

          <TabsContent value="ai" className="space-y-6">
            {/* AI Marking Panel */}
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
                      Compare student answers with model answers and get AI suggestions
                    </p>
                  </div>
                  <Button
                    onClick={handleRunAIMarking}
                    disabled={isAIMarking}
                    className="gap-2"
                  >
                    {isAIMarking ? (
                      <>
                        <Skeleton className="h-4 w-4 rounded-full animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Brain className="h-4 w-4" />
                        Run AI
                      </>
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
                      <Button variant="ghost" size="sm">
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Question-by-Question Results */}
            <Card>
              <CardHeader>
                <CardTitle>Question-by-Question Analysis</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {questions.map((q) => (
                  <div key={q.questionNumber} className="space-y-4 p-4 border rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">Q{q.questionNumber}</Badge>
                        {q.isCorrect ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-500" />
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Label className="text-sm">Points:</Label>
                        <Input
                          type="number"
                          min="0"
                          max={q.maxPoints}
                          value={q.earnedPoints}
                          onChange={(e) => handleAdjustScore(q.questionNumber, parseFloat(e.target.value))}
                          className="w-20 text-center font-bold"
                        />
                        <span className="text-muted-foreground">/ {q.maxPoints}</span>
                      </div>
                    </div>

                    <div>
                      <p className="font-medium mb-2">{q.question}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-xs text-muted-foreground">Student Answer</Label>
                        <div className="p-3 bg-muted/50 rounded-lg text-sm">
                          {q.studentAnswer}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs text-muted-foreground">Model Answer</Label>
                        <div className="p-3 bg-green-50 dark:bg-green-950/20 rounded-lg text-sm">
                          {q.correctAnswer}
                        </div>
                      </div>
                    </div>

                    {q.aiSuggestion && (
                      <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                        <Brain className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                          <p className="text-xs font-medium text-blue-900 dark:text-blue-300 mb-1">
                            AI Suggestion
                          </p>
                          <p className="text-sm">{q.aiSuggestion}</p>
                        </div>
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label>Your Feedback</Label>
                      <Textarea
                        placeholder="Add feedback for this question..."
                        className="min-h-[80px]"
                        value={q.feedback || ''}
                        onChange={(e) => {
                          setQuestions(questions.map(question =>
                            question.questionNumber === q.questionNumber
                              ? { ...question, feedback: e.target.value }
                              : question
                          ));
                        }}
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="manual" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Manual Grading
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {questions.map((q) => (
                  <div key={q.questionNumber} className="space-y-4 p-4 border rounded-lg">
                    <div className="flex items-start justify-between">
                      <Badge variant="outline">Q{q.questionNumber}</Badge>
                      <div className="flex items-center gap-2">
                        <Label className="text-sm">Points:</Label>
                        <Input
                          type="number"
                          min="0"
                          max={q.maxPoints}
                          value={q.earnedPoints}
                          onChange={(e) => handleAdjustScore(q.questionNumber, parseFloat(e.target.value))}
                          className="w-20 text-center font-bold"
                        />
                        <span className="text-muted-foreground">/ {q.maxPoints}</span>
                      </div>
                    </div>

                    <p className="font-medium">{q.question}</p>

                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">Student Answer</Label>
                      <div className="p-3 bg-muted/50 rounded-lg text-sm">
                        {q.studentAnswer}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Feedback</Label>
                      <Textarea
                        placeholder="Add feedback..."
                        className="min-h-[100px]"
                        value={q.feedback || ''}
                        onChange={(e) => {
                          setQuestions(questions.map(question =>
                            question.questionNumber === q.questionNumber
                              ? { ...question, feedback: e.target.value }
                              : question
                          ));
                        }}
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

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
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={handleSaveAsDraft} className="gap-2">
            <Save className="h-4 w-4" />
            Save as Draft
          </Button>
          <Button variant="outline" onClick={handleRunAIMarking} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Re-run AI Marking
          </Button>
          <Button onClick={handlePublish} className="gap-2">
            <Send className="h-4 w-4" />
            Approve & Publish
          </Button>
        </div>
      </div>
    </InstructorLayout>
  );
}