import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ChevronLeft,
  ChevronRight,
  PanelLeftClose,
  PanelLeft,
  MessageSquare,
  Download
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { CourseModuleNav, Module } from '@/components/student/CourseModuleNav';
import { LessonViewer } from '@/components/student/LessonViewer';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export default function CourseLearn() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [currentModuleId, setCurrentModuleId] = useState(1);
  const [currentLessonId, setCurrentLessonId] = useState(1);
  const [moduleNavOpen, setModuleNavOpen] = useState(true);

  // Mock course data
  const course = {
    id: courseId,
    title: "Advanced Database Systems",
    instructor: "Dr. Sarah Johnson",
    progress: 75,
    totalModules: 12,
    completedModules: 9
  };

  // Mock modules with lessons
  const modules: Module[] = [
    {
      id: 1,
      title: "Introduction to Advanced Databases",
      lessons: [
        { id: 1, title: "Course Overview", duration: "15 min", type: "video", completed: true },
        { id: 2, title: "Database Fundamentals Review", duration: "30 min", type: "video", completed: true },
        { id: 3, title: "Advanced SQL Concepts", duration: "45 min", type: "video", completed: true },
        { id: 4, title: "Quiz: Introduction", duration: "10 min", type: "quiz", completed: true }
      ],
      completed: true
    },
    {
      id: 2,
      title: "Normalization & Optimization",
      lessons: [
        { id: 1, title: "Normal Forms Deep Dive", duration: "40 min", type: "video", completed: true },
        { id: 2, title: "Query Optimization Techniques", duration: "35 min", type: "video", completed: false },
        { id: 3, title: "Index Design Best Practices", duration: "30 min", type: "reading", completed: false },
        { id: 4, title: "Lab: Optimize Sample Database", duration: "60 min", type: "lab", completed: false }
      ],
      completed: false
    },
    {
      id: 3,
      title: "Transaction Management",
      lessons: [
        { id: 1, title: "ACID Properties", duration: "25 min", type: "video", completed: false },
        { id: 2, title: "Concurrency Control", duration: "40 min", type: "video", completed: false },
        { id: 3, title: "Deadlock Prevention", duration: "30 min", type: "reading", completed: false },
        { id: 4, title: "Assignment: Transaction Handling", duration: "90 min", type: "assignment", completed: false }
      ],
      completed: false,
      locked: false
    },
    {
      id: 4,
      title: "Distributed Databases",
      lessons: [
        { id: 1, title: "Distributed Architecture", duration: "35 min", type: "video", completed: false },
        { id: 2, title: "Data Fragmentation", duration: "30 min", type: "video", completed: false },
        { id: 3, title: "Replication Strategies", duration: "40 min", type: "reading", completed: false }
      ],
      completed: false,
      locked: true
    }
  ];

  const currentModule = modules.find(m => m.id === currentModuleId) || modules[0];
  const currentLesson = currentModule.lessons.find(l => l.id === currentLessonId) || currentModule.lessons[0];

  // Mock lesson content based on current lesson
  const lessonData = useMemo(() => ({
    title: currentLesson.title,
    objectives: `Understand the key concepts of ${currentLesson.title}\nApply knowledge to real-world scenarios\nRecognize common patterns and anti-patterns\nPractice with hands-on examples`,
    prerequisites: currentModuleId > 1 ? `Complete Module ${currentModuleId - 1}` : '',
    estimatedDuration: currentLesson.duration,
    difficulty: currentModuleId <= 2 ? 'Beginner' : currentModuleId === 3 ? 'Intermediate' : 'Advanced',
    tags: ['Database', 'SQL', course.title.split(' ')[0]]
  }), [currentLesson, currentModuleId, course.title]);

  const contentBlocks = useMemo(() => {
    if (currentLesson.type === 'video') {
      return [
        {
          id: 1,
          type: 'video' as const,
          content: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
          title: currentLesson.title
        },
        {
          id: 2,
          type: 'text' as const,
          content: `In this lesson, you'll learn about ${currentLesson.title.toLowerCase()}. We'll cover the key concepts, practical applications, and best practices that industry professionals use daily.\n\nThis is an essential topic for anyone working with database systems and forms the foundation for more advanced concepts we'll explore later in this course.`,
          title: 'Lesson Overview'
        }
      ];
    }
    if (currentLesson.type === 'reading') {
      return [
        {
          id: 1,
          type: 'text' as const,
          content: `This reading material covers important concepts in ${currentLesson.title.toLowerCase()}. Take your time to read through the content and make notes of key points.\n\nKey Topics:\n• Core principles and foundations\n• Best practices and methodologies\n• Real-world applications\n• Common challenges and solutions\n\nLorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.`,
          title: 'Reading Material'
        }
      ];
    }
    return [
      {
        id: 1,
        type: 'text' as const,
        content: `Complete the ${currentLesson.type} for ${currentLesson.title}. Follow the instructions carefully and submit your work when ready.`,
        title: 'Instructions'
      }
    ];
  }, [currentLesson]);

  const quizQuestions = useMemo(() => {
    if (currentLesson.type === 'quiz') {
      return [
        {
          id: 1,
          question: 'What is the primary purpose of database normalization?',
          options: [
            'To increase data redundancy',
            'To eliminate data redundancy and ensure data integrity',
            'To make queries slower',
            'To increase storage requirements'
          ],
          correctAnswer: 1
        },
        {
          id: 2,
          question: 'Which normal form eliminates transitive dependencies?',
          options: ['1NF', '2NF', '3NF', 'BCNF'],
          correctAnswer: 2
        }
      ];
    }
    return [];
  }, [currentLesson]);

  const handleSelectLesson = (moduleId: number, lessonId: number) => {
    setCurrentModuleId(moduleId);
    setCurrentLessonId(lessonId);
  };

  const goToNextLesson = () => {
    const currentLessonIndex = currentModule.lessons.findIndex(l => l.id === currentLessonId);
    if (currentLessonIndex < currentModule.lessons.length - 1) {
      setCurrentLessonId(currentModule.lessons[currentLessonIndex + 1].id);
    } else {
      const nextModule = modules.find(m => m.id === currentModuleId + 1);
      if (nextModule && !nextModule.locked) {
        setCurrentModuleId(nextModule.id);
        setCurrentLessonId(nextModule.lessons[0].id);
      }
    }
  };

  const goToPreviousLesson = () => {
    const currentLessonIndex = currentModule.lessons.findIndex(l => l.id === currentLessonId);
    if (currentLessonIndex > 0) {
      setCurrentLessonId(currentModule.lessons[currentLessonIndex - 1].id);
    } else if (currentModuleId > 1) {
      const prevModule = modules.find(m => m.id === currentModuleId - 1);
      if (prevModule) {
        setCurrentModuleId(prevModule.id);
        setCurrentLessonId(prevModule.lessons[prevModule.lessons.length - 1].id);
      }
    }
  };

  const handleMarkComplete = () => {
    toast.success('Lesson marked as complete!');
  };

  const isFirstLesson = currentModuleId === 1 && currentLessonId === 1;
  const isLastLesson = currentModuleId === modules.length && 
    currentLessonId === modules[modules.length - 1].lessons.length;

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col">
      {/* Top Navigation Bar */}
      <div className="border-b bg-background px-4 py-2 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate('/student/courses')}>
              <ChevronLeft className="h-4 w-4 mr-1" />
              Courses
            </Button>
            <Separator orientation="vertical" className="h-6" />
            <div className="hidden sm:block">
              <h1 className="font-semibold text-sm">{course.title}</h1>
              <p className="text-xs text-muted-foreground">by {course.instructor}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="hidden md:flex">
              <Download className="h-4 w-4 mr-2" />
              Resources
            </Button>
            <Button variant="outline" size="sm" className="hidden md:flex">
              <MessageSquare className="h-4 w-4 mr-2" />
              Discussion
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Module Navigation Sidebar */}
        <div
          className={cn(
            "border-r transition-all duration-300 flex-shrink-0 overflow-hidden",
            moduleNavOpen ? "w-72" : "w-0"
          )}
        >
          {moduleNavOpen && (
            <CourseModuleNav
              modules={modules}
              currentModuleId={currentModuleId}
              currentLessonId={currentLessonId}
              onSelectLesson={handleSelectLesson}
              courseProgress={course.progress}
            />
          )}
        </div>

        {/* Lesson Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Toggle and Breadcrumb */}
          <div className="flex items-center gap-2 px-4 py-2 border-b bg-muted/30">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setModuleNavOpen(!moduleNavOpen)}
              className="h-8 w-8 p-0"
            >
              {moduleNavOpen ? (
                <PanelLeftClose className="h-4 w-4" />
              ) : (
                <PanelLeft className="h-4 w-4" />
              )}
            </Button>
            <Separator orientation="vertical" className="h-4" />
            <div className="text-sm text-muted-foreground">
              <span>Module {currentModuleId}</span>
              <ChevronRight className="h-3 w-3 inline mx-1" />
              <span className="text-foreground font-medium">{currentLesson.title}</span>
            </div>
          </div>

          {/* Lesson Viewer */}
          <div className="flex-1 overflow-hidden">
            <LessonViewer
              lessonData={lessonData}
              contentBlocks={contentBlocks}
              quizQuestions={quizQuestions}
              onComplete={handleMarkComplete}
              isCompleted={currentLesson.completed}
            />
          </div>

          {/* Bottom Navigation */}
          <div className="border-t bg-background p-3 flex-shrink-0">
            <div className="flex items-center justify-between max-w-4xl mx-auto">
              <Button
                variant="outline"
                size="sm"
                onClick={goToPreviousLesson}
                disabled={isFirstLesson}
              >
                <ChevronLeft className="mr-1 h-4 w-4" />
                Previous
              </Button>

              <div className="text-sm text-muted-foreground hidden sm:block">
                Lesson {currentLessonId} of {currentModule.lessons.length}
              </div>

              <Button
                size="sm"
                onClick={goToNextLesson}
                disabled={isLastLesson}
              >
                Next
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}