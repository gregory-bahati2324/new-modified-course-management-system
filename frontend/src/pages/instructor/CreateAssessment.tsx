import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Save, FileQuestion, Plus, Trash2, Clock, 
  CheckCircle, Calendar, Settings 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { InstructorLayout } from '@/components/layout/InstructorLayout';

interface Question {
  id: number;
  type: 'multiple-choice' | 'true-false' | 'short-answer' | 'essay';
  question: string;
  points: number;
  options?: string[];
  correctAnswer?: number | string;
}

export default function CreateAssessment() {
  const navigate = useNavigate();
  
  const [assessmentData, setAssessmentData] = useState({
    title: '',
    type: 'quiz',
    description: '',
    course: '',
    module: '',
    dueDate: '',
    dueTime: '',
    timeLimit: '',
    attempts: '1',
    passingScore: '70',
    shuffleQuestions: false,
    showAnswers: true,
    status: 'draft'
  });

  const [questions, setQuestions] = useState<Question[]>([
    {
      id: 1,
      type: 'multiple-choice',
      question: '',
      points: 1,
      options: ['', '', '', ''],
      correctAnswer: 0
    }
  ]);

  const assessmentTypes = [
    { id: 'quiz', name: 'Quiz' },
    { id: 'exam', name: 'Exam' },
    { id: 'test', name: 'Test' },
    { id: 'midterm', name: 'Midterm' },
    { id: 'final', name: 'Final Exam' }
  ];

  const courses = [
    { id: '1', name: 'Database Systems' },
    { id: '2', name: 'Web Development' },
    { id: '3', name: 'Data Structures' }
  ];

  const modules = [
    { id: '1', name: 'Introduction to Databases' },
    { id: '2', name: 'Relational Database Design' },
    { id: '3', name: 'Query Optimization' }
  ];

  const addQuestion = () => {
    const newQuestion: Question = {
      id: questions.length + 1,
      type: 'multiple-choice',
      question: '',
      points: 1,
      options: ['', '', '', ''],
      correctAnswer: 0
    };
    setQuestions([...questions, newQuestion]);
  };

  const removeQuestion = (id: number) => {
    if (questions.length > 1) {
      setQuestions(questions.filter(q => q.id !== id));
    }
  };

  const updateQuestion = (id: number, updates: Partial<Question>) => {
    setQuestions(questions.map(q => q.id === id ? { ...q, ...updates } : q));
  };

  const updateOption = (questionId: number, optionIndex: number, value: string) => {
    setQuestions(questions.map(q => {
      if (q.id === questionId && q.options) {
        const newOptions = [...q.options];
        newOptions[optionIndex] = value;
        return { ...q, options: newOptions };
      }
      return q;
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Assessment data:', { ...assessmentData, questions });
    toast.success('Assessment created successfully!');
    navigate('/instructor/exams');
  };

  const totalPoints = questions.reduce((sum, q) => sum + q.points, 0);

  return (
    <InstructorLayout>
      <div className="container py-8 space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate('/instructor/exams')}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Create Assessment</h1>
              <p className="text-muted-foreground">Create a new test, quiz, or exam</p>
            </div>
          </div>
          <Badge variant="outline" className="text-lg px-4 py-2">
            Total: {totalPoints} points
          </Badge>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileQuestion className="h-5 w-5" />
                    Assessment Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Assessment Title *</Label>
                      <Input
                        id="title"
                        placeholder="e.g., Database Fundamentals Quiz"
                        value={assessmentData.title}
                        onChange={(e) => setAssessmentData({...assessmentData, title: e.target.value})}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="type">Assessment Type</Label>
                      <Select 
                        value={assessmentData.type} 
                        onValueChange={(value) => setAssessmentData({...assessmentData, type: value})}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {assessmentTypes.map(type => (
                            <SelectItem key={type.id} value={type.id}>
                              {type.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="course">Course</Label>
                      <Select 
                        value={assessmentData.course} 
                        onValueChange={(value) => setAssessmentData({...assessmentData, course: value})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select course" />
                        </SelectTrigger>
                        <SelectContent>
                          {courses.map(course => (
                            <SelectItem key={course.id} value={course.id}>
                              {course.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="module">Module (Optional)</Label>
                      <Select 
                        value={assessmentData.module} 
                        onValueChange={(value) => setAssessmentData({...assessmentData, module: value})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select module" />
                        </SelectTrigger>
                        <SelectContent>
                          {modules.map(module => (
                            <SelectItem key={module.id} value={module.id}>
                              {module.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Brief description of the assessment"
                      value={assessmentData.description}
                      onChange={(e) => setAssessmentData({...assessmentData, description: e.target.value})}
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Questions */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Questions</CardTitle>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm"
                      onClick={addQuestion}
                      className="gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      Add Question
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {questions.map((question, index) => (
                    <div key={question.id} className="space-y-4 p-4 border rounded-lg">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 space-y-4">
                          <div className="flex items-center gap-4">
                            <Badge variant="secondary">Q{index + 1}</Badge>
                            <Select
                              value={question.type}
                              onValueChange={(value: any) => updateQuestion(question.id, { type: value })}
                            >
                              <SelectTrigger className="w-[180px]">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="multiple-choice">Multiple Choice</SelectItem>
                                <SelectItem value="true-false">True/False</SelectItem>
                                <SelectItem value="short-answer">Short Answer</SelectItem>
                                <SelectItem value="essay">Essay</SelectItem>
                              </SelectContent>
                            </Select>
                            <div className="flex items-center gap-2">
                              <Label>Points:</Label>
                              <Input
                                type="number"
                                min="1"
                                className="w-20"
                                value={question.points}
                                onChange={(e) => updateQuestion(question.id, { points: parseInt(e.target.value) || 1 })}
                              />
                            </div>
                          </div>

                          <Textarea
                            placeholder="Enter your question here..."
                            value={question.question}
                            onChange={(e) => updateQuestion(question.id, { question: e.target.value })}
                            rows={2}
                          />

                          {question.type === 'multiple-choice' && (
                            <div className="space-y-2">
                              <Label>Answer Options</Label>
                              {question.options?.map((option, optIndex) => (
                                <div key={optIndex} className="flex items-center gap-2">
                                  <input
                                    type="radio"
                                    name={`correct-${question.id}`}
                                    checked={question.correctAnswer === optIndex}
                                    onChange={() => updateQuestion(question.id, { correctAnswer: optIndex })}
                                    className="mt-1"
                                  />
                                  <Input
                                    placeholder={`Option ${optIndex + 1}`}
                                    value={option}
                                    onChange={(e) => updateOption(question.id, optIndex, e.target.value)}
                                  />
                                </div>
                              ))}
                            </div>
                          )}

                          {question.type === 'true-false' && (
                            <Select
                              value={String(question.correctAnswer)}
                              onValueChange={(value) => updateQuestion(question.id, { correctAnswer: value })}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select correct answer" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="true">True</SelectItem>
                                <SelectItem value="false">False</SelectItem>
                              </SelectContent>
                            </Select>
                          )}
                        </div>

                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeQuestion(question.id)}
                          disabled={questions.length === 1}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="dueDate">Due Date</Label>
                    <Input
                      id="dueDate"
                      type="date"
                      value={assessmentData.dueDate}
                      onChange={(e) => setAssessmentData({...assessmentData, dueDate: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dueTime">Due Time</Label>
                    <Input
                      id="dueTime"
                      type="time"
                      value={assessmentData.dueTime}
                      onChange={(e) => setAssessmentData({...assessmentData, dueTime: e.target.value})}
                    />
                  </div>
                  <Separator />
                  <div className="space-y-2">
                    <Label htmlFor="timeLimit">Time Limit (minutes)</Label>
                    <Input
                      id="timeLimit"
                      type="number"
                      placeholder="Leave blank for no limit"
                      value={assessmentData.timeLimit}
                      onChange={(e) => setAssessmentData({...assessmentData, timeLimit: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="attempts">Allowed Attempts</Label>
                    <Select 
                      value={assessmentData.attempts} 
                      onValueChange={(value) => setAssessmentData({...assessmentData, attempts: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 Attempt</SelectItem>
                        <SelectItem value="2">2 Attempts</SelectItem>
                        <SelectItem value="3">3 Attempts</SelectItem>
                        <SelectItem value="unlimited">Unlimited</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="passingScore">Passing Score (%)</Label>
                    <Input
                      id="passingScore"
                      type="number"
                      min="0"
                      max="100"
                      value={assessmentData.passingScore}
                      onChange={(e) => setAssessmentData({...assessmentData, passingScore: e.target.value})}
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <Label htmlFor="shuffle">Shuffle Questions</Label>
                    <Switch
                      id="shuffle"
                      checked={assessmentData.shuffleQuestions}
                      onCheckedChange={(checked) => setAssessmentData({...assessmentData, shuffleQuestions: checked})}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="showAnswers">Show Correct Answers</Label>
                    <Switch
                      id="showAnswers"
                      checked={assessmentData.showAnswers}
                      onCheckedChange={(checked) => setAssessmentData({...assessmentData, showAnswers: checked})}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5" />
                    Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Questions:</span>
                    <span className="font-medium">{questions.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Points:</span>
                    <span className="font-medium">{totalPoints}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Time Limit:</span>
                    <span className="font-medium">
                      {assessmentData.timeLimit ? `${assessmentData.timeLimit} min` : 'No limit'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Passing Score:</span>
                    <span className="font-medium">{assessmentData.passingScore}%</span>
                  </div>
                  <Separator />
                  <Button type="submit" className="w-full gap-2">
                    <Save className="h-4 w-4" />
                    Create Assessment
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="w-full"
                    onClick={() => toast.info('Saved as draft')}
                  >
                    Save as Draft
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </div>
    </InstructorLayout>
  );
}