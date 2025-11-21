import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft, Save, BookOpen, Target, Clock, BarChart3,
  FileText, Video, Image, File, Code, MessageSquare,
  CheckCircle2, ChevronDown, ChevronRight, Star, Bookmark,
  Award, Sun, Moon, Type, Download, Play, Volume2, Eye
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from '@/components/ui/collapsible';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { toast } from 'sonner';
import { InstructorLayout } from '@/components/layout/InstructorLayout';
import { LessonPreview } from '@/components/LessonPreview';

interface ContentBlock {
  id: number;
  type: 'text' | 'video' | 'image' | 'pdf' | 'ppt' | 'audio' | 'code';
  content: string;       // For URLs or text
  title?: string;
  file?: File | null;    // For uploaded files
  previewUrl?: string;   // For temporary preview
}


interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
}

export default function AddLesson() {
  const navigate = useNavigate();
  const { courseId, moduleId } = useParams();

  const handleFileUpload = (id: number, file: File) => {
    const previewUrl = URL.createObjectURL(file); // temporary local preview
    setContentBlocks(contentBlocks.map(block =>
      block.id === id ? { ...block, file, previewUrl, content: file.name } : block
    ));
  };


  // Lesson Overview States
  const [lessonData, setLessonData] = useState({
    title: '',
    objectives: '',
    prerequisites: '',
    estimatedDuration: '',
    difficulty: 'beginner',
    tags: '',
  });

  // Check if the URL is a YouTube link
  const isYouTubeUrl = (url: string) => /youtube\.com|youtu\.be/.test(url);

  // Extract YouTube video ID
  const extractYouTubeID = (url: string) => {
    const regExp = /(?:youtube\.com\/.*v=|youtu\.be\/)([^&]+)/;
    const match = url.match(regExp);
    return match ? match[1] : '';
  };



  // Content Blocks
  const [contentBlocks, setContentBlocks] = useState<ContentBlock[]>([
    { id: 1, type: 'text', content: '', title: 'Introduction' }
  ]);

  // Quiz Questions
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([
    { id: 1, question: '', options: ['', '', '', ''], correctAnswer: 0 }
  ]);

  // UI States
  const [expandedSections, setExpandedSections] = useState<{ [key: string]: boolean }>({
    overview: true,
    content: true,
    interactive: true,
    feedback: false,
    accessibility: false,
    analytics: false,
  });

  const [darkMode, setDarkMode] = useState(false);
  const [fontSize, setFontSize] = useState('medium');
  const [transcriptEnabled, setTranscriptEnabled] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const addContentBlock = (type: ContentBlock['type']) => {
    const newBlock: ContentBlock = {
      id: contentBlocks.length + 1,
      type,
      content: '',
      title: `${type.charAt(0).toUpperCase() + type.slice(1)} Content ${contentBlocks.length + 1}`
    };
    setContentBlocks([...contentBlocks, newBlock]);
    toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} block added`);
  };

  const updateContentBlock = (id: number, field: keyof ContentBlock, value: string) => {
    setContentBlocks(contentBlocks.map(block =>
      block.id === id ? { ...block, [field]: value } : block
    ));
  };

  const removeContentBlock = (id: number) => {
    setContentBlocks(contentBlocks.filter(block => block.id !== id));
    toast.success('Content block removed');
  };

  const addQuizQuestion = () => {
    setQuizQuestions([...quizQuestions, {
      id: quizQuestions.length + 1,
      question: '',
      options: ['', '', '', ''],
      correctAnswer: 0
    }]);
  };

  const updateQuizQuestion = (id: number, field: string, value: any) => {
    setQuizQuestions(quizQuestions.map(q =>
      q.id === id ? { ...q, [field]: value } : q
    ));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Lesson data:', {
      ...lessonData,
      contentBlocks,
      quizQuestions,
      settings: { darkMode, fontSize, transcriptEnabled }
    });
    toast.success('Lesson created successfully!');
    navigate(`/instructor/course/${courseId}/manage`);
  };

  const getContentIcon = (type: string) => {
    const icons = {
      text: FileText,
      video: Video,
      image: Image,
      pdf: File,
      ppt: File,
      audio: Volume2,
      code: Code
    };
    return icons[type as keyof typeof icons] || FileText;
  };

  return (
    <InstructorLayout>
      <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-background'} transition-colors`}>
        <div className="container py-6 space-y-6 animate-fade-in" style={{ fontSize: fontSize === 'small' ? '14px' : fontSize === 'large' ? '18px' : '16px' }}>
          {/* Header with Breadcrumbs */}
          <div className="space-y-4">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="/instructor/dashboard">Dashboard</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink href="/instructor/courses">Courses</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink href={`/instructor/course/${courseId}/manage`}>Course Management</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>Add Lesson</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate(`/instructor/course/${courseId}/manage`)}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
                <div>
                  <h1 className="text-4xl font-bold">Create New Lesson</h1>
                  <p className="text-muted-foreground">Build a comprehensive learning experience</p>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowPreview(true)}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Preview
                </Button>
                <Button
                  variant={bookmarked ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    setBookmarked(!bookmarked);
                    toast.success(bookmarked ? 'Bookmark removed' : 'Lesson bookmarked');
                  }}
                >
                  <Bookmark className={`h-4 w-4 mr-2 ${bookmarked ? 'fill-current' : ''}`} />
                  {bookmarked ? 'Bookmarked' : 'Bookmark'}
                </Button>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Main Content Area */}
              <div className="lg:col-span-3 space-y-6">

                {/* Lesson Overview Section */}
                <Collapsible open={expandedSections.overview} onOpenChange={() => toggleSection('overview')}>
                  <Card>
                    <CollapsibleTrigger className="w-full">
                      <CardHeader className="cursor-pointer hover:bg-accent/50 transition-colors">
                        <div className="flex items-center justify-between">
                          <CardTitle className="flex items-center gap-2">
                            <Target className="h-5 w-5 text-primary" />
                            Lesson Overview
                          </CardTitle>
                          {expandedSections.overview ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
                        </div>
                      </CardHeader>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="title">Lesson Title *</Label>
                          <Input
                            id="title"
                            placeholder="Enter an engaging lesson title"
                            value={lessonData.title}
                            onChange={(e) => setLessonData({ ...lessonData, title: e.target.value })}
                            required
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="duration">
                              <Clock className="h-4 w-4 inline mr-1" />
                              Estimated Duration
                            </Label>
                            <Input
                              id="duration"
                              placeholder="e.g., 45 minutes"
                              value={lessonData.estimatedDuration}
                              onChange={(e) => setLessonData({ ...lessonData, estimatedDuration: e.target.value })}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="difficulty">
                              <BarChart3 className="h-4 w-4 inline mr-1" />
                              Difficulty Level
                            </Label>
                            <Select
                              value={lessonData.difficulty}
                              onValueChange={(value) => setLessonData({ ...lessonData, difficulty: value })}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="beginner">Beginner</SelectItem>
                                <SelectItem value="intermediate">Intermediate</SelectItem>
                                <SelectItem value="advanced">Advanced</SelectItem>
                                <SelectItem value="expert">Expert</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="tags">Tags</Label>
                            <Input
                              id="tags"
                              placeholder="programming, python, basics"
                              value={lessonData.tags}
                              onChange={(e) => setLessonData({ ...lessonData, tags: e.target.value })}
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="objectives">Learning Objectives</Label>
                          <Textarea
                            id="objectives"
                            placeholder="What will students learn from this lesson? (one per line)"
                            value={lessonData.objectives}
                            onChange={(e) => setLessonData({ ...lessonData, objectives: e.target.value })}
                            rows={4}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="prerequisites">Prerequisites</Label>
                          <Textarea
                            id="prerequisites"
                            placeholder="What should students know before starting this lesson?"
                            value={lessonData.prerequisites}
                            onChange={(e) => setLessonData({ ...lessonData, prerequisites: e.target.value })}
                            rows={2}
                          />
                        </div>

                        {lessonData.tags && (
                          <div className="flex flex-wrap gap-2">
                            {lessonData.tags.split(',').map((tag, idx) => (
                              <Badge key={idx} variant="secondary">{tag.trim()}</Badge>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </CollapsibleContent>
                  </Card>
                </Collapsible>

                {/* Content Area Section */}
                <Collapsible open={expandedSections.content} onOpenChange={() => toggleSection('content')}>
                  <Card>
                    <CollapsibleTrigger className="w-full">
                      <CardHeader className="cursor-pointer hover:bg-accent/50 transition-colors">
                        <div className="flex items-center justify-between">
                          <CardTitle className="flex items-center gap-2">
                            <BookOpen className="h-5 w-5 text-primary" />
                            Lesson Content
                          </CardTitle>
                          {expandedSections.content ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
                        </div>
                        <CardDescription>Add text, videos, images, files, and code examples</CardDescription>
                      </CardHeader>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <CardContent className="space-y-4">
                        <div className="flex flex-wrap gap-2">
                          <Button type="button" variant="outline" size="sm" onClick={() => addContentBlock('text')}>
                            <FileText className="h-4 w-4 mr-2" />
                            Add Text
                          </Button>
                          <Button type="button" variant="outline" size="sm" onClick={() => addContentBlock('video')}>
                            <Video className="h-4 w-4 mr-2" />
                            Add Video
                          </Button>
                          <Button type="button" variant="outline" size="sm" onClick={() => addContentBlock('image')}>
                            <Image className="h-4 w-4 mr-2" />
                            Add Image
                          </Button>
                          <Button type="button" variant="outline" size="sm" onClick={() => addContentBlock('pdf')}>
                            <File className="h-4 w-4 mr-2" />
                            Add PDF
                          </Button>
                          <Button type="button" variant="outline" size="sm" onClick={() => addContentBlock('ppt')}>
                            <File className="h-4 w-4 mr-2" />
                            Add PPT
                          </Button>
                          <Button type="button" variant="outline" size="sm" onClick={() => addContentBlock('audio')}>
                            <Volume2 className="h-4 w-4 mr-2" />
                            Add Audio
                          </Button>
                          <Button type="button" variant="outline" size="sm" onClick={() => addContentBlock('code')}>
                            <Code className="h-4 w-4 mr-2" />
                            Add Code
                          </Button>
                        </div>

                        <Separator />

                        {contentBlocks.map((block, index) => {
                          const Icon = getContentIcon(block.type);
                          return (
                            <Card key={block.id} className="border-2">
                              <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <Icon className="h-4 w-4 text-primary" />
                                    <Input
                                      placeholder="Section title"
                                      value={block.title}
                                      onChange={(e) => updateContentBlock(block.id, 'title', e.target.value)}
                                      className="max-w-xs"
                                    />
                                    <Badge variant="outline">{block.type}</Badge>
                                  </div>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeContentBlock(block.id)}
                                  >
                                    Remove
                                  </Button>
                                </div>
                              </CardHeader>
                              <CardContent>

                                {/* Text Block */}
                                {block.type === 'text' && (
                                  <div className="space-y-2">
                                    <textarea
                                      className="w-full border rounded-lg p-2 text-sm"
                                      rows={4}
                                      placeholder="Write your text here..."
                                      value={block.content || ''}
                                      onChange={(e) => updateContentBlock(block.id, 'content', e.target.value)}
                                    />
                                  </div>
                                )}
                                {block.type === 'video' && (
                                  <div className="space-y-2">
                                    {/* File Upload */}
                                    <input
                                      type="file"
                                      accept="video/*"
                                      onChange={(e) => e.target.files && handleFileUpload(block.id, e.target.files[0])}
                                    />

                                    {/* Local Video Preview */}
                                    {block.previewUrl && (
                                      <video controls className="w-full aspect-video rounded-lg">
                                        <source src={block.previewUrl} />
                                      </video>
                                    )}

                                    {/* YouTube Embed */}
                                    {!block.previewUrl && block.content && isYouTubeUrl(block.content) && (
                                      <div className="aspect-video w-full rounded-lg overflow-hidden">
                                        <iframe
                                          className="w-full h-full"
                                          src={`https://www.youtube.com/embed/${extractYouTubeID(block.content)}`}
                                          title="YouTube video"
                                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                          allowFullScreen
                                        />
                                      </div>
                                    )}

                                    {/* Other URL Input */}
                                    {!block.previewUrl && (!block.content || !isYouTubeUrl(block.content)) && (
                                      <Input
                                        placeholder="Video URL (YouTube only)"
                                        value={block.content}
                                        onChange={(e) => updateContentBlock(block.id, 'content', e.target.value)}
                                      />
                                    )}
                                  </div>
                                )}

                                {/* Image Block */}
                                {block.type === 'image' && (
                                  <div className="space-y-2">
                                    <input
                                      type="file"
                                      accept="image/*"
                                      onChange={(e) => e.target.files && handleFileUpload(block.id, e.target.files[0])}
                                    />
                                    {block.previewUrl ? (
                                      <img src={block.previewUrl} alt="preview" className="w-full rounded-lg" />
                                    ) : block.content ? (
                                      <img src={block.content} alt="preview" className="w-full rounded-lg" />
                                    ) : (
                                      <Input
                                        placeholder="Image URL"
                                        value={block.content}
                                        onChange={(e) => updateContentBlock(block.id, 'content', e.target.value)}
                                      />
                                    )}
                                  </div>
                                )}

                                {/* PDF / PPT / Word / Other Files */}
                                {['pdf', 'ppt', 'pptx', 'doc', 'docx'].includes(block.type) && (
                                  <div className="space-y-2">
                                    <input
                                      type="file"
                                      accept=".pdf,.ppt,.pptx,.doc,.docx"
                                      onChange={(e) => e.target.files && handleFileUpload(block.id, e.target.files[0])}
                                    />
                                    {block.file ? (
                                      <a
                                        href={block.previewUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-4 border rounded-lg flex items-center gap-2 text-blue-600 underline"
                                      >
                                        <File className="h-8 w-8 text-primary" />
                                        <div className="flex-1">
                                          <p className="text-sm font-medium">{block.file.name}</p>
                                          <p className="text-xs text-muted-foreground">Click to open</p>
                                        </div>
                                      </a>
                                    ) : block.content ? (
                                      <a
                                        href={block.content}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-4 border rounded-lg flex items-center gap-2 text-blue-600 underline"
                                      >
                                        <File className="h-8 w-8 text-primary" />
                                        <div className="flex-1">
                                          <p className="text-sm font-medium">{block.content}</p>
                                          <p className="text-xs text-muted-foreground">Click to open</p>
                                        </div>
                                      </a>
                                    ) : null}
                                  </div>
                                )}

                                {/* Audio Block */}
                                {block.type === 'audio' && (
                                  <div className="space-y-2">
                                    <input
                                      type="file"
                                      accept="audio/*"
                                      onChange={(e) => e.target.files && handleFileUpload(block.id, e.target.files[0])}
                                    />
                                    {block.previewUrl ? (
                                      <audio controls src={block.previewUrl} className="w-full" />
                                    ) : block.content ? (
                                      <audio controls src={block.content} className="w-full" />
                                    ) : (
                                      <Input
                                        placeholder="Audio URL"
                                        value={block.content}
                                        onChange={(e) => updateContentBlock(block.id, 'content', e.target.value)}
                                      />
                                    )}
                                  </div>
                                )}

                                {/* Code Block */}
                                {block.type === 'code' && (
                                  <div className="space-y-2">
                                    <textarea
                                      className="w-full border rounded-lg p-2 font-mono text-sm"
                                      rows={6}
                                      placeholder="Write your code here..."
                                      value={block.content || ''}
                                      onChange={(e) => updateContentBlock(block.id, 'content', e.target.value)}
                                    />
                                  </div>
                                )}

                              </CardContent>
                            </Card>
                          );
                        })}
                      </CardContent>
                    </CollapsibleContent>
                  </Card>
                </Collapsible>

                {/* Interactive Area Section */}
                <Collapsible open={expandedSections.interactive} onOpenChange={() => toggleSection('interactive')}>
                  <Card>
                    <CollapsibleTrigger className="w-full">
                      <CardHeader className="cursor-pointer hover:bg-accent/50 transition-colors">
                        <div className="flex items-center justify-between">
                          <CardTitle className="flex items-center gap-2">
                            <CheckCircle2 className="h-5 w-5 text-primary" />
                            Interactive Components
                          </CardTitle>
                          {expandedSections.interactive ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
                        </div>
                        <CardDescription>Quizzes, discussions, and progress tracking</CardDescription>
                      </CardHeader>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <CardContent>
                        <Tabs defaultValue="quiz">
                          <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="quiz">Quiz</TabsTrigger>
                            <TabsTrigger value="discussion">Discussion</TabsTrigger>
                            <TabsTrigger value="progress">Progress</TabsTrigger>
                          </TabsList>

                          <TabsContent value="quiz" className="space-y-4">
                            <div className="flex justify-between items-center">
                              <h4 className="font-semibold">Quiz Questions</h4>
                              <Button type="button" variant="outline" size="sm" onClick={addQuizQuestion}>
                                Add Question
                              </Button>
                            </div>

                            {quizQuestions.map((question, qIndex) => (
                              <Card key={question.id}>
                                <CardContent className="pt-6 space-y-3">
                                  <Input
                                    placeholder={`Question ${qIndex + 1}`}
                                    value={question.question}
                                    onChange={(e) => updateQuizQuestion(question.id, 'question', e.target.value)}
                                  />
                                  {question.options.map((option, oIndex) => (
                                    <div key={oIndex} className="flex items-center gap-2">
                                      <input
                                        type="radio"
                                        name={`question-${question.id}`}
                                        checked={question.correctAnswer === oIndex}
                                        onChange={() => updateQuizQuestion(question.id, 'correctAnswer', oIndex)}
                                      />
                                      <Input
                                        placeholder={`Option ${oIndex + 1}`}
                                        value={option}
                                        onChange={(e) => {
                                          const newOptions = [...question.options];
                                          newOptions[oIndex] = e.target.value;
                                          updateQuizQuestion(question.id, 'options', newOptions);
                                        }}
                                      />
                                    </div>
                                  ))}
                                </CardContent>
                              </Card>
                            ))}
                          </TabsContent>

                          <TabsContent value="discussion" className="space-y-4">
                            <Card>
                              <CardHeader>
                                <CardTitle className="text-base flex items-center gap-2">
                                  <MessageSquare className="h-4 w-4" />
                                  Discussion & Comments
                                </CardTitle>
                              </CardHeader>
                              <CardContent className="space-y-4">
                                <div className="flex items-center gap-2">
                                  <Switch id="enable-discussion" />
                                  <Label htmlFor="enable-discussion">Enable student discussions</Label>
                                </div>
                                <Textarea
                                  placeholder="Add a discussion prompt or question to encourage student engagement..."
                                  rows={3}
                                />
                              </CardContent>
                            </Card>
                          </TabsContent>

                          <TabsContent value="progress" className="space-y-4">
                            <Card>
                              <CardHeader>
                                <CardTitle className="text-base">Progress Tracker Settings</CardTitle>
                              </CardHeader>
                              <CardContent className="space-y-4">
                                <div className="space-y-3">
                                  <div className="flex items-center gap-2">
                                    <Switch id="track-completion" defaultChecked />
                                    <Label htmlFor="track-completion">Track lesson completion</Label>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Switch id="track-time" defaultChecked />
                                    <Label htmlFor="track-time">Track time spent</Label>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Switch id="track-quiz" defaultChecked />
                                    <Label htmlFor="track-quiz">Record quiz scores</Label>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          </TabsContent>
                        </Tabs>
                      </CardContent>
                    </CollapsibleContent>
                  </Card>
                </Collapsible>

                {/* Feedback Section */}
                <Collapsible open={expandedSections.feedback} onOpenChange={() => toggleSection('feedback')}>
                  <Card>
                    <CollapsibleTrigger className="w-full">
                      <CardHeader className="cursor-pointer hover:bg-accent/50 transition-colors">
                        <div className="flex items-center justify-between">
                          <CardTitle className="flex items-center gap-2">
                            <Star className="h-5 w-5 text-primary" />
                            Student Feedback
                          </CardTitle>
                          {expandedSections.feedback ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
                        </div>
                        <CardDescription>Ratings, reviews, and feedback collection</CardDescription>
                      </CardHeader>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <CardContent className="space-y-4">
                        <div className="flex items-center gap-2">
                          <Switch id="enable-ratings" defaultChecked />
                          <Label htmlFor="enable-ratings">Allow students to rate this lesson</Label>
                        </div>
                        <div className="flex items-center gap-2">
                          <Switch id="enable-reviews" defaultChecked />
                          <Label htmlFor="enable-reviews">Allow student reviews and comments</Label>
                        </div>
                        <Separator />
                        <div className="space-y-2">
                          <Label>Custom Feedback Questions</Label>
                          <Textarea
                            placeholder="Add custom feedback questions (one per line)..."
                            rows={3}
                          />
                        </div>
                      </CardContent>
                    </CollapsibleContent>
                  </Card>
                </Collapsible>

                {/* Accessibility Features */}
                <Collapsible open={expandedSections.accessibility} onOpenChange={() => toggleSection('accessibility')}>
                  <Card>
                    <CollapsibleTrigger className="w-full">
                      <CardHeader className="cursor-pointer hover:bg-accent/50 transition-colors">
                        <div className="flex items-center justify-between">
                          <CardTitle className="flex items-center gap-2">
                            <Type className="h-5 w-5 text-primary" />
                            Accessibility Settings
                          </CardTitle>
                          {expandedSections.accessibility ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
                        </div>
                        <CardDescription>Visual and content accessibility options</CardDescription>
                      </CardHeader>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="dark-mode" className="flex items-center gap-2">
                            {darkMode ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                            Dark Mode
                          </Label>
                          <Switch
                            id="dark-mode"
                            checked={darkMode}
                            onCheckedChange={setDarkMode}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Font Size</Label>
                          <Select value={fontSize} onValueChange={setFontSize}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="small">Small</SelectItem>
                              <SelectItem value="medium">Medium</SelectItem>
                              <SelectItem value="large">Large</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="flex items-center justify-between">
                          <Label htmlFor="transcript">Video/Audio Transcripts</Label>
                          <Switch
                            id="transcript"
                            checked={transcriptEnabled}
                            onCheckedChange={setTranscriptEnabled}
                          />
                        </div>

                        {transcriptEnabled && (
                          <Textarea
                            placeholder="Add video/audio transcripts here for accessibility..."
                            rows={4}
                          />
                        )}
                      </CardContent>
                    </CollapsibleContent>
                  </Card>
                </Collapsible>

                {/* Analytics Section */}
                <Collapsible open={expandedSections.analytics} onOpenChange={() => toggleSection('analytics')}>
                  <Card>
                    <CollapsibleTrigger className="w-full">
                      <CardHeader className="cursor-pointer hover:bg-accent/50 transition-colors">
                        <div className="flex items-center justify-between">
                          <CardTitle className="flex items-center gap-2">
                            <BarChart3 className="h-5 w-5 text-primary" />
                            Analytics & Tracking
                          </CardTitle>
                          {expandedSections.analytics ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
                        </div>
                        <CardDescription>Track student engagement and performance</CardDescription>
                      </CardHeader>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <p className="text-sm text-muted-foreground">Completion Rate</p>
                            <p className="text-2xl font-bold">0%</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-sm text-muted-foreground">Avg. Quiz Score</p>
                            <p className="text-2xl font-bold">N/A</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-sm text-muted-foreground">Total Students</p>
                            <p className="text-2xl font-bold">0</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-sm text-muted-foreground">Avg. Time Spent</p>
                            <p className="text-2xl font-bold">0 min</p>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Analytics will be available after students start engaging with this lesson.
                        </p>
                      </CardContent>
                    </CollapsibleContent>
                  </Card>
                </Collapsible>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Quick Actions */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Button type="submit" className="w-full">
                      <Save className="h-4 w-4 mr-2" />
                      Save Lesson
                    </Button>
                    <Button type="button" variant="outline" className="w-full">
                      Preview Lesson
                    </Button>
                  </CardContent>
                </Card>

                {/* Lesson Summary */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Lesson Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Content Blocks:</span>
                      <span className="font-medium">{contentBlocks.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Quiz Questions:</span>
                      <span className="font-medium">{quizQuestions.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Difficulty:</span>
                      <Badge variant="outline" className="capitalize">{lessonData.difficulty}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Duration:</span>
                      <span className="font-medium">{lessonData.estimatedDuration || 'Not set'}</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Certificate Badge */}
                <Card className="border-primary/50 bg-primary/5">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                      <Award className="h-8 w-8 text-primary" />
                      <div className="flex-1">
                        <p className="font-semibold text-sm">Certificate Available</p>
                        <p className="text-xs text-muted-foreground">Students earn a certificate upon completion</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Navigation Controls */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Navigation</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Button type="button" variant="outline" className="w-full" disabled>
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Previous Lesson
                    </Button>
                    <Button type="button" variant="outline" className="w-full" disabled>
                      Next Lesson
                      <ChevronRight className="h-4 w-4 ml-2" />
                    </Button>
                    <div className="pt-2">
                      <Label className="text-xs text-muted-foreground">Progress</Label>
                      <Progress value={0} className="mt-2" />
                    </div>
                  </CardContent>
                </Card>

                {/* Lesson Outline */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Lesson Outline</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <button
                      type="button"
                      className="w-full text-left text-sm hover:bg-accent p-2 rounded transition-colors"
                      onClick={() => toggleSection('overview')}
                    >
                      Overview
                    </button>
                    <button
                      type="button"
                      className="w-full text-left text-sm hover:bg-accent p-2 rounded transition-colors"
                      onClick={() => toggleSection('content')}
                    >
                      Content ({contentBlocks.length})
                    </button>
                    <button
                      type="button"
                      className="w-full text-left text-sm hover:bg-accent p-2 rounded transition-colors"
                      onClick={() => toggleSection('interactive')}
                    >
                      Interactive
                    </button>
                    <button
                      type="button"
                      className="w-full text-left text-sm hover:bg-accent p-2 rounded transition-colors"
                      onClick={() => toggleSection('feedback')}
                    >
                      Feedback
                    </button>
                    <button
                      type="button"
                      className="w-full text-left text-sm hover:bg-accent p-2 rounded transition-colors"
                      onClick={() => toggleSection('accessibility')}
                    >
                      Accessibility
                    </button>
                    <button
                      type="button"
                      className="w-full text-left text-sm hover:bg-accent p-2 rounded transition-colors"
                      onClick={() => toggleSection('analytics')}
                    >
                      Analytics
                    </button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </form>

          {/* Lesson Preview Modal */}
          {showPreview && (
            <LessonPreview
              lessonData={lessonData}
              contentBlocks={contentBlocks}
              quizQuestions={quizQuestions}
              onClose={() => setShowPreview(false)}
            />
          )}
        </div>
      </div>
    </InstructorLayout>
  );
}