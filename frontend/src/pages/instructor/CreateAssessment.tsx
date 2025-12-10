import { useState } from 'react';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useParams } from "react-router-dom";

import {
  ArrowLeft, Save, FileQuestion, Plus, Trash2, Clock,
  CheckCircle, Calendar, Settings, Eye
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
import AssessmentPreview from '@/components/AssessmentPreview';
import { courseService } from "@/services/courseService";
import { assessmentService, AssessmentCreate, QuestionCreate } from '@/services/assessmentService';

interface Question {
  id: number;
  type: 'multiple-choice' | 'true-false' | 'short-answer' | 'essay' | 'coding' | 'file-upload' | 'matching' | 'ordering';
  question_text: string;
  points: number;
  options?: string[];
  correct_answer?: number | string | string[];
  model_answer?: string;
  test_cases?: { input: string; expectedOutput: string }[];
  reference_file?: File | null;
  matching_pairs?: { left: string; right: string }[];
  correct_order?: string[];
}

function convertTo24Hour(time12h: string) {
  const [time, modifier] = time12h.split(" "); // "01:01", "AM"
  let [hours, minutes] = time.split(":");

  if (hours === "12") {
    hours = "00";
  }

  if (modifier === "PM") {
    hours = String(Number(hours) + 12);
  }

  return `${hours}:${minutes}`;
}

function convertTo12Hour(time24: string) {
  let [hours, minutes] = time24.split(":");
  let modifier = "AM";

  if (Number(hours) >= 12) {
    modifier = "PM";
    if (Number(hours) > 12) hours = String(Number(hours) - 12);
  }

  if (hours === "00") hours = "12";

  return `${hours}:${minutes} ${modifier}`;
}


export default function CreateAssessment() {
  const navigate = useNavigate();
  const { examId } = useParams<{ examId: string }>();
  const isEditMode = Boolean(examId);



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
      question_text: '',
      points: 1,
      options: ['', '', '', ''],
      correct_answer: 0,
      test_cases: [],
      matching_pairs: [],
      correct_order: []
    }
  ]);

  const [showPreview, setShowPreview] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'published' | 'draft'>('published');



  const assessmentTypes = [
    { id: 'quiz', name: 'Quiz' },
    { id: 'exam', name: 'Exam' },
    { id: 'test', name: 'Test' },
    { id: 'midterm', name: 'Midterm' },
    { id: 'final', name: 'Final Exam' }
  ];

  const [courses, setCourses] = useState<{ id: string; title: string }[]>([]);

  const addQuestion = () => {
    const newQuestion: Question = {
      id: questions.length + 1,
      type: 'multiple-choice',
      question_text: '',
      points: 1,
      options: ['', '', '', ''],
      correct_answer: 0,
      test_cases: [],
      matching_pairs: [],
      correct_order: []
    };
    setQuestions([...questions, newQuestion]);
  };


  // Add test case for coding questions
  const addTestCase = (questionId: number) => {
    setQuestions(prevQuestions => prevQuestions.map(q => {
      if (q.id === questionId) {
        const newTestCases = [...(q.test_cases || []), { input: '', expectedOutput: '' }];
        return { ...q, test_cases: newTestCases };
      }
      return q;
    }));
  };

  // Update test case
  const updateTestCase = (questionId: number, index: number, field: 'input' | 'expectedOutput', value: string) => {
    setQuestions(prevQuestions => prevQuestions.map(q => {
      if (q.id === questionId && q.test_cases) {
        const newTestCases = [...q.test_cases];
        newTestCases[index] = { ...newTestCases[index], [field]: value };
        return { ...q, test_cases: newTestCases };
      }
      return q;
    }));
  };

  // Add matching pair
  const addMatchingPair = (questionId: number) => {
    setQuestions(prevQuestions => prevQuestions.map(q => {
      if (q.id === questionId) {
        const newPairs = [...(q.matching_pairs || []), { left: '', right: '' }];
        return { ...q, matching_pairs: newPairs };
      }
      return q;
    }));
  };

  // Update matching pair
  const updateMatchingPair = (questionId: number, index: number, field: 'left' | 'right', value: string) => {
    setQuestions(prevQuestions => prevQuestions.map(q => {
      if (q.id === questionId && q.matching_pairs) {
        const newPairs = [...q.matching_pairs];
        newPairs[index] = { ...newPairs[index], [field]: value };
        return { ...q, matching_pairs: newPairs };
      }
      return q;
    }));
  };

  // Add ordering item
  const addOrderItem = (questionId: number) => {
    setQuestions(prevQuestions => prevQuestions.map(q => {
      if (q.id === questionId) {
        const newOrder = [...(q.correct_order || []), ''];
        return { ...q, correct_order: newOrder };
      }
      return q;
    }));
  };

  // Update ordering item
  const updateOrderItem = (questionId: number, index: number, value: string) => {
    setQuestions(prevQuestions => prevQuestions.map(q => {
      if (q.id === questionId && q.correct_order) {
        const newOrder = [...q.correct_order];
        newOrder[index] = value;
        return { ...q, correct_order: newOrder };
      }
      return q;
    }));
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

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const { courses } = await courseService.getCourses();
        setCourses(
          courses.map((c) => ({
            id: c.id,
            title: c.title
          }))
        );
      } catch (error) {
        toast.error("Failed to load courses");
      }
    };
    fetchCourses();
  }, []);

  useEffect(() => {
    if (!isEditMode) return;
    console.log("Edit mode, id:", examId);

    const fetchAssessment = async () => {
      try {
        const data = await assessmentService.getAssessmentDetail(examId);
        console.log("Fetched assessment data:", data);


        // 1. Fill main assessment details
        setAssessmentData({
          title: data.title,
          type: data.type,
          description: data.description,
          course: data.course_id,
          module: data.module_id || '',
          dueDate: data.due_date?.split(" ")[0] || '',
          dueTime: data.due_date ? convertTo12Hour(data.due_date.split(" ")[1]) : '',
          timeLimit: data.time_limit ? String(data.time_limit) : '',
          attempts: String(data.attempts),
          passingScore: String(data.passing_score),
          shuffleQuestions: data.shuffle_questions,
          showAnswers: data.show_answers,
          status: data.status,
        });

        // 2. Fill questions
        const formattedQuestions = data.questions.map((q: any, index: number) => ({
          id: index + 1,
          type: q.type,
          question_text: q.question_text,
          points: q.points,
          options: q.options || [],
          correct_answer: q.correct_answer,
          model_answer: q.model_answer,
          test_cases: q.test_cases || [],
          reference_file: null,
          matching_pairs: q.matching_pairs || [],
          correct_order: q.correct_order || []
        }));

        console.log("Formatted questions:", formattedQuestions);

        setQuestions(formattedQuestions);

      } catch (err: any) {
        console.error(err);
      }
    };

    fetchAssessment();
  }, [examId]);



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const time24 = convertTo24Hour(assessmentData.dueTime);
    const dueDateString = `${assessmentData.dueDate} ${time24}:00`;

    const payload: AssessmentCreate = {
      title: assessmentData.title,
      type: assessmentData.type as any,
      description: assessmentData.description,
      course_id: assessmentData.course,
      module_id: assessmentData.module || null,
      due_date: dueDateString,
      time_limit: assessmentData.timeLimit ? parseInt(assessmentData.timeLimit) : null,
      attempts: assessmentData.attempts,
      passing_score: parseInt(assessmentData.passingScore),
      shuffle_questions: assessmentData.shuffleQuestions,
      show_answers: assessmentData.showAnswers,
      status: submitStatus,
      questions: questions.map(q => ({
        type: q.type,
        question_text: q.question_text,
        points: q.points,
        options: q.options,
        correct_answer: q.correct_answer,
        model_answer: q.model_answer,
        test_cases: q.test_cases,
        matching_pairs: q.matching_pairs,
        correct_order: q.correct_order,
      }))
    };

    try {
      if (isEditMode) {
        await assessmentService.assessmentUpdate(examId, payload);
        toast.success("Assessment updated successfully!");
      } else {
        await assessmentService.createAssessment(payload);
        toast.success(
          submitStatus === "draft"
            ? "Draft saved successfully!"
            : "Assessment created!"
        );
      }

      navigate('/instructor/exams');

    } catch (err: any) {
      toast.error(err.message || "Something went wrong");
    }
  };


  const totalPoints = questions.reduce((sum, q) => sum + q.points, 0);

  return (
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
            <h1 className="text-3xl font-bold">
              {isEditMode ? "Edit Assessment" : "Create Assessment"}
            </h1>
            <p className="text-muted-foreground">
              {isEditMode ? "Update this test, quiz, or exam" : "Create a new test, quiz, or exam"}
            </p>

          </div>
        </div>
        <div className="flex items-center gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowPreview(true)}
            className="gap-2"
          >
            <Eye className="h-4 w-4" />
            Preview
          </Button>
          <Badge variant="outline" className="text-lg px-4 py-2">
            Total: {totalPoints} points
          </Badge>
        </div>
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
                      onChange={(e) => setAssessmentData({ ...assessmentData, title: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="type">Assessment Type</Label>
                    <Select
                      value={assessmentData.type}
                      onValueChange={(value) => setAssessmentData({ ...assessmentData, type: value })}
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
                      onValueChange={(value) => setAssessmentData({ ...assessmentData, course: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select course" />
                      </SelectTrigger>
                      <SelectContent>
                        {courses.map(course => (
                          <SelectItem key={course.id} value={course.id}>
                            {course.title}
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
                    onChange={(e) => setAssessmentData({ ...assessmentData, description: e.target.value })}
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
                              <SelectItem value="coding">Coding Question</SelectItem>
                              <SelectItem value="file-upload">File Upload</SelectItem>
                              <SelectItem value="matching">Matching</SelectItem>
                              <SelectItem value="ordering">Ordering/Sequence</SelectItem>
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
                          value={question.question_text}
                          onChange={(e) => updateQuestion(question.id, { question_text: e.target.value })}
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
                                  checked={question.correct_answer === optIndex}
                                  onChange={() => updateQuestion(question.id, { correct_answer: optIndex })}
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
                          <div className="space-y-2">
                            <Label>Correct Answer</Label>
                            <Select
                              value={String(question.correct_answer)}
                              onValueChange={(value) => updateQuestion(question.id, { correct_answer: value })}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select correct answer" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="true">True</SelectItem>
                                <SelectItem value="false">False</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        )}

                        {(question.type === 'short-answer' || question.type === 'essay') && (
                          <div className="space-y-2">
                            <Label>Model Answer / Answer Key</Label>
                            <Textarea
                              placeholder="Enter the model answer or expected response..."
                              value={question.model_answer || ''}
                              onChange={(e) => updateQuestion(question.id, { model_answer: e.target.value })}
                              rows={4}
                              className="font-mono text-sm"
                            />
                            <p className="text-xs text-muted-foreground">
                              This will be used by AI to compare and grade student responses
                            </p>
                          </div>
                        )}

                        {question.type === 'coding' && (
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <Label>Expected Output</Label>
                              <Textarea
                                placeholder="Enter expected code output..."
                                value={question.model_answer || ''}
                                onChange={(e) => updateQuestion(question.id, { model_answer: e.target.value })}
                                rows={3}
                                className="font-mono text-sm"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Test Cases (Optional)</Label>
                              <div className="p-3 border rounded-lg space-y-2 bg-muted/30">
                                {question.test_cases?.map((tc, tcIndex) => (
                                  <div key={tcIndex} className="flex gap-2">
                                    <Input
                                      placeholder="Input"
                                      className="font-mono text-xs"
                                      value={tc.input}
                                      onChange={(e) => updateTestCase(question.id, tcIndex, 'input', e.target.value)}
                                    />
                                    <Input
                                      placeholder="Expected Output"
                                      className="font-mono text-xs"
                                      value={tc.expectedOutput}
                                      onChange={(e) => updateTestCase(question.id, tcIndex, 'expectedOutput', e.target.value)}
                                    />
                                  </div>
                                ))}
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  className="w-full"
                                  onClick={() => addTestCase(question.id)}
                                >
                                  + Add Test Case
                                </Button>
                              </div>
                            </div>
                          </div>
                        )}

                        {question.type === 'file-upload' && (
                          <div className="space-y-2">
                            <Label>Reference/Sample Solution (Optional)</Label>
                            <Input
                              type="file"
                              onChange={(e) => updateQuestion(question.id, { reference_file: e.target.files?.[0] || null })}
                              className="cursor-pointer"
                            />
                            <p className="text-xs text-muted-foreground">
                              Upload a reference file or sample solution for comparison
                            </p>
                          </div>
                        )}

                        {question.type === 'matching' && (
                          <div className="space-y-2">
                            <Label>Matching Pairs</Label>
                            <div className="space-y-2 p-3 border rounded-lg bg-muted/30">
                              {question.matching_pairs?.map((pair, pairIndex) => (
                                <div key={pairIndex} className="grid grid-cols-2 gap-2">
                                  <Input
                                    placeholder="Left item"
                                    className="text-sm"
                                    value={pair.left}
                                    onChange={(e) => updateMatchingPair(question.id, pairIndex, 'left', e.target.value)}
                                  />
                                  <Input
                                    placeholder="Right item (correct match)"
                                    className="text-sm"
                                    value={pair.right}
                                    onChange={(e) => updateMatchingPair(question.id, pairIndex, 'right', e.target.value)}
                                  />
                                </div>
                              ))}
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="w-full"
                                onClick={() => addMatchingPair(question.id)}
                              >
                                + Add Pair
                              </Button>
                            </div>
                          </div>
                        )}

                        {question.type === 'ordering' && (
                          <div className="space-y-2">
                            <Label>Correct Order</Label>
                            <div className="space-y-2 p-3 border rounded-lg bg-muted/30">
                              {question.correct_order?.map((item, itemIndex) => (
                                <Input
                                  key={itemIndex}
                                  placeholder={`Item ${itemIndex + 1}`}
                                  className="text-sm"
                                  value={item}
                                  onChange={(e) => updateOrderItem(question.id, itemIndex, e.target.value)}
                                />
                              ))}
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="w-full"
                                onClick={() => addOrderItem(question.id)}
                              >
                                + Add Item
                              </Button>
                            </div>
                          </div>
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
                    onChange={(e) => setAssessmentData({ ...assessmentData, dueDate: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dueTime">Due Time</Label>
                  <Input
                    id="dueTime"
                    type="time"
                    value={assessmentData.dueTime}
                    onChange={(e) => setAssessmentData({ ...assessmentData, dueTime: e.target.value })}
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
                    onChange={(e) => setAssessmentData({ ...assessmentData, timeLimit: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="attempts">Allowed Attempts</Label>
                  <Select
                    value={assessmentData.attempts}
                    onValueChange={(value) => setAssessmentData({ ...assessmentData, attempts: value })}
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
                    onChange={(e) => setAssessmentData({ ...assessmentData, passingScore: e.target.value })}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <Label htmlFor="shuffle">Shuffle Questions</Label>
                  <Switch
                    id="shuffle"
                    checked={assessmentData.shuffleQuestions}
                    onCheckedChange={(checked) => setAssessmentData({ ...assessmentData, shuffleQuestions: checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="showAnswers">Show Correct Answers</Label>
                  <Switch
                    id="showAnswers"
                    checked={assessmentData.showAnswers}
                    onCheckedChange={(checked) => setAssessmentData({ ...assessmentData, showAnswers: checked })}
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
                <Button
                  type="submit"
                  className="w-full gap-2"
                  onClick={() => setSubmitStatus("published")}
                >
                  <Save className="h-4 w-4" />
                  {isEditMode ? "Save Changes" : "Create Assessment"}
                </Button>

                <Button
                  type="submit"
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    setSubmitStatus("draft");
                    toast.info("Saved as draft");
                  }}
                >
                  Save as Draft
                </Button>


              </CardContent>
            </Card>
          </div>
        </div>
      </form>

      <AssessmentPreview
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        assessmentData={assessmentData}
        questions={questions}
      />
    </div>
  );

}