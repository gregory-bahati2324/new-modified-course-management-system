/**
 * CHANGES MADE TODAY (2025-12-05):
 * - Created AssessmentPreview component to preview assessments as students would see them
 * - Supports all question types: multiple-choice, true-false, short-answer, essay, coding, file-upload, matching, ordering
 * - Interactive preview with answer selection simulation
 */

import { useState } from 'react';
import { X, Clock, FileQuestion, CheckCircle, Upload, Code, List, ArrowUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';

interface Question {
  id: number;
  type: 'multiple-choice' | 'true-false' | 'short-answer' | 'essay' | 'coding' | 'file-upload' | 'matching' | 'ordering';
  question_text: string;
  points: number;
  options?: string[];
  correct_answer?: number | string | string[];
  model_answer?: string;
  test_cases?: { input: string; expectedOutput: string }[];
  reference_cile?: File | null;
  matching_pairs?: { left: string; right: string }[];
  correct_order?: string[];
}

interface AssessmentData {
  title: string;
  type: string;
  description: string;
  course: string;
  module: string;
  dueDate: string;
  dueTime: string;
  timeLimit: string;
  attempts: string;
  passingScore: string;
  shuffleQuestions: boolean;
  showAnswers: boolean;
}

interface AssessmentPreviewProps {
  isOpen: boolean;
  onClose: () => void;
  assessmentData: AssessmentData;
  questions: Question[];
}

export default function AssessmentPreview({ isOpen, onClose, assessmentData, questions }: AssessmentPreviewProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, any>>({});
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const totalPoints = questions.reduce((sum, q) => sum + q.points, 0);
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  const handleAnswer = (questionId: number, answer: any) => {
    setAnswers({ ...answers, [questionId]: answer });
  };

  const handleSubmit = () => {
    setSubmitted(true);
  };

  const renderQuestion = (question: Question, index: number) => {
    const isActive = index === currentQuestion;
    if (!isActive && !submitted) return null;

    return (
      <Card key={question.id} className={`${!isActive && !submitted ? 'hidden' : ''} ${submitted ? 'mb-4' : ''}`}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <Badge variant="outline">Question {index + 1}</Badge>
            <Badge variant="secondary">{question.points} point{question.points > 1 ? 's' : ''}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="font-medium text-lg">{question.question_text || 'No question text provided'}</p>

          {question.type === 'multiple-choice' && (
            <RadioGroup
              value={answers[question.id]?.toString()}
              onValueChange={(value) => handleAnswer(question.id, parseInt(value))}
              disabled={submitted}
            >
              {question.options?.map((option, optIndex) => (
                <div key={optIndex} className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                  <RadioGroupItem value={optIndex.toString()} id={`q${question.id}-opt${optIndex}`} />
                  <Label htmlFor={`q${question.id}-opt${optIndex}`} className="flex-1 cursor-pointer">
                    {option || `Option ${optIndex + 1}`}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          )}

          {question.type === 'true-false' && (
            <RadioGroup
              value={answers[question.id]}
              onValueChange={(value) => handleAnswer(question.id, value)}
              disabled={submitted}
            >
              <div className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                <RadioGroupItem value="true" id={`q${question.id}-true`} />
                <Label htmlFor={`q${question.id}-true`} className="flex-1 cursor-pointer">True</Label>
              </div>
              <div className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                <RadioGroupItem value="false" id={`q${question.id}-false`} />
                <Label htmlFor={`q${question.id}-false`} className="flex-1 cursor-pointer">False</Label>
              </div>
            </RadioGroup>
          )}

          {question.type === 'short-answer' && (
            <Input
              placeholder="Type your answer here..."
              value={answers[question.id] || ''}
              onChange={(e) => handleAnswer(question.id, e.target.value)}
              disabled={submitted}
            />
          )}

          {question.type === 'essay' && (
            <Textarea
              placeholder="Write your essay response here..."
              value={answers[question.id] || ''}
              onChange={(e) => handleAnswer(question.id, e.target.value)}
              rows={8}
              disabled={submitted}
            />
          )}

          {question.type === 'coding' && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Code className="h-4 w-4" />
                Write your code below
              </div>
              <Textarea
                placeholder="// Write your code here..."
                value={answers[question.id] || ''}
                onChange={(e) => handleAnswer(question.id, e.target.value)}
                rows={10}
                className="font-mono text-sm"
                disabled={submitted}
              />
              {question.test_cases && question.test_cases.length > 0 && (
                <div className="p-3 bg-muted/30 rounded-lg">
                  <p className="text-sm font-medium mb-2">Test Cases:</p>
                  {question.test_cases.map((tc, i) => (
                    <div key={i} className="text-xs font-mono">
                      Input: {tc.input} → Expected: {tc.expectedOutput}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {question.type === 'file-upload' && (
            <div className="border-2 border-dashed rounded-lg p-8 text-center">
              <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
              <p className="text-sm text-muted-foreground mb-2">Drag and drop your file here, or click to browse</p>
              <Input type="file" className="max-w-xs mx-auto" disabled={submitted} />
            </div>
          )}

          {question.type === 'matching' && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <List className="h-4 w-4" />
                Match items from left column to right column
              </div>
              {question.matching_pairs && question.matching_pairs.length > 0 ? (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    {question.matching_pairs.map((pair, i) => (
                      <div key={i} className="p-3 bg-muted/50 rounded-lg">
                        {pair.left || `Item ${i + 1}`}
                      </div>
                    ))}
                  </div>
                  <div className="space-y-2">
                    {question.matching_pairs.map((pair, i) => (
                      <div key={i} className="p-3 border rounded-lg">
                        {pair.right || `Match ${i + 1}`}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">No matching pairs added yet</p>
              )}
            </div>
          )}

          {question.type === 'ordering' && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <ArrowUpDown className="h-4 w-4" />
                Drag items to arrange them in correct order
              </div>
              {question.correct_order && question.correct_order.length > 0 ? (
                <div className="space-y-2">
                  {question.correct_order.map((item, i) => (
                    <div key={i} className="p-3 bg-muted/50 rounded-lg flex items-center gap-3 cursor-move">
                      <span className="text-muted-foreground">{i + 1}.</span>
                      {item || `Item ${i + 1}`}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">No items added yet</p>
              )}
            </div>
          )}

          {submitted && assessmentData.showAnswers && question.model_answer && (
            <div className="mt-4 p-3 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
              <p className="text-sm font-medium text-green-700 dark:text-green-300">Model Answer:</p>
              <p className="text-sm text-green-600 dark:text-green-400">{question.model_answer}</p>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm overflow-y-auto">
      <div className="container max-w-4xl py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">{assessmentData.title || 'Untitled Assessment'}</h1>
            <p className="text-muted-foreground">{assessmentData.description || 'No description'}</p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Assessment Info */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-2">
                <FileQuestion className="h-4 w-4 text-muted-foreground" />
                <span>{questions.length} Questions</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
                <span>{totalPoints} Points</span>
              </div>
              {assessmentData.timeLimit && (
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>{assessmentData.timeLimit} minutes</span>
                </div>
              )}
              <Badge variant="secondary" className="capitalize">{assessmentData.type}</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Progress */}
        {!submitted && (
          <div className="mb-6">
            <div className="flex justify-between text-sm mb-2">
              <span>Question {currentQuestion + 1} of {questions.length}</span>
              <span>{Math.round(progress)}% Complete</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}

        {/* Questions */}
        {submitted ? (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Review Your Answers</h2>
            {questions.map((q, i) => renderQuestion(q, i))}
          </div>
        ) : (
          questions.map((q, i) => renderQuestion(q, i))
        )}

        {/* Navigation */}
        {!submitted && (
          <div className="flex justify-between mt-6">
            <Button
              variant="outline"
              onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
              disabled={currentQuestion === 0}
            >
              Previous
            </Button>
            {currentQuestion === questions.length - 1 ? (
              <Button onClick={handleSubmit}>
                Submit Assessment
              </Button>
            ) : (
              <Button
                onClick={() => setCurrentQuestion(Math.min(questions.length - 1, currentQuestion + 1))}
              >
                Next
              </Button>
            )}
          </div>
        )}

        {submitted && (
          <div className="mt-6 text-center">
            <Button onClick={onClose}>Close Preview</Button>
          </div>
        )}
      </div>
    </div>
  );
}