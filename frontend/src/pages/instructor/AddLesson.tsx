import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft, Save, BookOpen, Target, Clock, BarChart3,
  FileText, Video, Image, File, Code, MessageSquare,
  CheckCircle2, ChevronDown, ChevronRight, Star, Bookmark,
  Award, Sun, Moon, Type, Eye, Volume2
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
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { toast } from 'sonner';
import { lessonService } from '@/services/lessonService';
import { InstructorLayout } from '@/components/layout/InstructorLayout';
import { LessonPreview } from '@/components/LessonPreview';

interface ContentBlock {
  id: number;
  type: 'text' | 'video' | 'image' | 'pdf' | 'ppt' | 'audio' | 'code';
  content: string;
  title?: string;
  file?: File | null;
  previewUrl?: string;
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

  // Lesson Overview State
  const [lessonData, setLessonData] = useState({
    title: '',
    objectives: '',
    prerequisites: '',
    estimatedDuration: '',
    difficulty: 'beginner',
    tags: '',
  });

  // Content blocks & Quiz questions
  const [contentBlocks, setContentBlocks] = useState<ContentBlock[]>([
    { id: 1, type: 'text', content: '', title: 'Introduction' }
  ]);
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

  // File Upload Handler
  const handleFileUpload = async (id: number, file: File) => {
    try {
      const previewUrl = URL.createObjectURL(file);
      setContentBlocks(prev =>
        prev.map(block => block.id === id ? { ...block, file, previewUrl } : block)
      );

      // Upload file to backend
      if (!moduleId) throw new Error('Missing moduleId'); // make sure moduleId exists

      const { filepath } = await lessonService.uploadFile(moduleId, file); // pass moduleId first

      setContentBlocks(prev =>
        prev.map(block => block.id === id ? { ...block, content: filepath } : block)
      );

      toast.success('File uploaded successfully');
    } catch (err: any) {
      console.error(err);
      toast.error('Failed to upload file');
    }
  };

  // Content block management
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
    setContentBlocks(prev =>
      prev.map(block => block.id === id ? { ...block, [field]: value } : block)
    );
  };

  const removeContentBlock = (id: number) => {
    setContentBlocks(prev => prev.filter(block => block.id !== id));
    toast.success('Content block removed');
  };

  // Quiz management
  const addQuizQuestion = () => {
    setQuizQuestions(prev => [...prev, {
      id: prev.length + 1,
      question: '',
      options: ['', '', '', ''],
      correctAnswer: 0
    }]);
  };

  const updateQuizQuestion = (id: number, field: string, value: any) => {
    setQuizQuestions(prev =>
      prev.map(q => q.id === id ? { ...q, [field]: value } : q)
    );
  };

  // YouTube helpers
  const isYouTubeUrl = (url: string) => /youtube\.com|youtu\.be/.test(url);
  const extractYouTubeID = (url: string) => {
    const regExp = /(?:youtube\.com\/.*v=|youtu\.be\/)([^&]+)/;
    const match = url.match(regExp);
    return match ? match[1] : '';
  };

  // Icon mapping
  const getContentIcon = (type: string) => {
    const icons: Record<string, any> = {
      text: FileText,
      video: Video,
      image: Image,
      pdf: File,
      ppt: File,
      audio: Volume2,
      code: Code
    };
    return icons[type] || FileText;
  };

  // Submit lesson
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!moduleId) return toast.error('Module ID is missing');

    const payload = {
      title: lessonData.title,
      objectives: lessonData.objectives,
      prerequisites: lessonData.prerequisites,
      estimatedDuration: lessonData.estimatedDuration,
      difficulty: lessonData.difficulty,
      tags: lessonData.tags.split(',').map(t => t.trim()),
      contentBlocks: contentBlocks.map(b => ({
        type: b.type,
        title: b.title,
        content: b.content
      })),
      quizQuestions: quizQuestions.map(q => ({
        id: q.id,
        question: q.question,
        options: q.options,
        correctAnswer: q.correctAnswer
      })),
      order: 1
    };

    try {
      await lessonService.createLesson(moduleId, payload);
      toast.success('Lesson created successfully');
      navigate(`/instructor/course/${courseId}/manage`);
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || 'Failed to create lesson');
    }
  };

  return (
    <InstructorLayout>
      <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-background'} transition-colors`}>
        <div className="container py-6 space-y-6 animate-fade-in" style={{ fontSize: fontSize === 'small' ? '14px' : fontSize === 'large' ? '18px' : '16px' }}>
          {/* Breadcrumbs */}
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem><BreadcrumbLink href="/instructor/dashboard">Dashboard</BreadcrumbLink></BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem><BreadcrumbLink href="/instructor/courses">Courses</BreadcrumbLink></BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem><BreadcrumbLink href={`/instructor/course/${courseId}/manage`}>Course Management</BreadcrumbLink></BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem><BreadcrumbPage>Add Lesson</BreadcrumbPage></BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={() => navigate(`/instructor/course/${courseId}/manage`)}>
                <ArrowLeft className="h-4 w-4 mr-2" /> Back
              </Button>
              <div>
                <h1 className="text-4xl font-bold">Create New Lesson</h1>
                <p className="text-muted-foreground">Build a comprehensive learning experience</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setShowPreview(true)}>
                <Eye className="h-4 w-4 mr-2" /> Preview
              </Button>
              <Button variant={bookmarked ? "default" : "outline"} size="sm" onClick={() => {
                setBookmarked(!bookmarked);
                toast.success(bookmarked ? 'Bookmark removed' : 'Lesson bookmarked');
              }}>
                <Bookmark className={`h-4 w-4 mr-2 ${bookmarked ? 'fill-current' : ''}`} />
                {bookmarked ? 'Bookmarked' : 'Bookmark'}
              </Button>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Main Content */}
              <div className="lg:col-span-3 space-y-6">
                {/* Collapsible Sections */}
                {/* Lesson Overview, Content Blocks, Interactive Components, Feedback, Accessibility, Analytics */}
                {/* Use the same structure you already have for each section */}
                {/* All the handlers are already wired: addContentBlock, updateContentBlock, handleFileUpload, addQuizQuestion, updateQuizQuestion */}
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Quick Actions */}
                <Card>
                  <CardHeader><CardTitle>Quick Actions</CardTitle></CardHeader>
                  <CardContent className="space-y-2">
                    <Button type="submit" className="w-full"><Save className="h-4 w-4 mr-2" /> Save Lesson</Button>
                  </CardContent>
                </Card>

                {/* Lesson Summary */}
                <Card>
                  <CardHeader><CardTitle>Lesson Summary</CardTitle></CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <div className="flex justify-between"><span>Content Blocks:</span><span>{contentBlocks.length}</span></div>
                    <div className="flex justify-between"><span>Quiz Questions:</span><span>{quizQuestions.length}</span></div>
                    <div className="flex justify-between"><span>Difficulty:</span><Badge variant="outline" className="capitalize">{lessonData.difficulty}</Badge></div>
                    <div className="flex justify-between"><span>Duration:</span><span>{lessonData.estimatedDuration || 'Not set'}</span></div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </form>

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
