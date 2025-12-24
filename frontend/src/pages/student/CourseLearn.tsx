import { useState, useEffect, useMemo } from 'react';
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
import { CourseModuleNav } from '@/components/student/CourseModuleNav';
import { LessonViewer } from '@/components/student/LessonViewer';
import { moduleService } from '@/services/moduleService';
import { lessonService } from '@/services/lessonService';
import { Course, courseService } from '@/services/courseService';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export interface Module {
  id: string;
  title: string;
  lessons: Lesson[];
  completed: boolean;
  locked?: boolean;
}
export interface Lesson {
  id: number;
  title: string;
  duration: string;
  type: 'video' | 'reading' | 'quiz' | 'assignment' | 'lab';
  completed: boolean;
}

export default function CourseLearn() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [modules, setModules] = useState<Module[]>([]);
  const [currentModuleId, setCurrentModuleId] = useState<string | null>(null);
  const [currentLessonId, setCurrentLessonId] = useState<string | null>(null);
  const [course, setCourse] = useState<Course | null>(null);
  const [moduleNavOpen, setModuleNavOpen] = useState(true);

  useEffect(() => {
    if (!courseId) return;

    const loadModules = async () => {
      try {
        const { data } = await moduleService.getModules(courseId);

        // Attach empty lessons initially
        const modulesWithLessons = data.map(m => ({
          ...m,
          lessons: [],
          completed: false
        }));

        setModules(modulesWithLessons);

        // Auto-select first module
        if (modulesWithLessons.length > 0) {
          setCurrentModuleId(modulesWithLessons[0].id);
        }
      } catch (err: any) {
        toast.error(err.message || 'Failed to load modules');
      }
    };

    loadModules();
  }, [courseId]);

  useEffect(() => {
    if (!currentModuleId) return;

    const loadLessons = async () => {
      try {
        const { data } = await lessonService.getLessons(currentModuleId);

        setModules(prev =>
          prev.map(m =>
            m.id === currentModuleId
              ? {
                ...m,
                lessons: data.map((lesson: any) => ({
                  id: lesson.id,
                  title: lesson.title,
                  duration: lesson.duration || '0 min', // fallback if missing
                  type: lesson.type || 'text',          // fallback
                  completed: lesson.completed || false  // default
                }))
              }
              : m
          )
        );

        // Auto-select first lesson
        if (data.length > 0) {
          setCurrentLessonId(data[0].id);
        }
      } catch (err) {
        toast.error('Failed to load lessons');
      }
    };

    loadLessons();
  }, [currentModuleId]);

  useEffect(() => {
    if (!courseId) return;

    const loadCourse = async () => {
      try {

        const courseData = await courseService.getCourseNameById(courseId); // currently returns only title
        // better: create a getCourseById method that returns full Course object
        setCourse(courseData);
      } catch (err: any) {
        toast.error(err.message || 'Failed to load course');
      }
    };

    loadCourse();
  }, [courseId]);


  const currentModule = useMemo(
    () => modules.find(m => m.id === currentModuleId),
    [modules, currentModuleId]
  );

  const currentLesson = useMemo(
    () => currentModule?.lessons?.find(l => String(l.id) === currentLessonId),
    [currentModule, currentLessonId]
  );

  const handleSelectLesson = (moduleId: string, lessonId: string) => {
    setCurrentModuleId(moduleId);
    setCurrentLessonId(lessonId);
  };


  const goToNextLesson = () => {
    if (!currentModule || !currentLesson) return;

    const index = currentModule.lessons.findIndex(l => l.id === currentLesson.id);

    if (index < currentModule.lessons.length - 1) {
      setCurrentLessonId(String(currentModule.lessons[index + 1].id));
      return;
    }

    const moduleIndex = modules.findIndex(m => m.id === currentModule.id);
    const nextModule = modules[moduleIndex + 1];

    if (nextModule) {
      setCurrentModuleId(nextModule.id);
    }
  };


  const goToPreviousLesson = () => {
    if (!currentModule || !currentLesson) return;

    const index = currentModule.lessons.findIndex(l => l.id === currentLesson.id);

    if (index > 0) {
      setCurrentLessonId(String(currentModule.lessons[index - 1].id));
      return;
    }

    const moduleIndex = modules.findIndex(m => m.id === currentModule.id);
    const prevModule = modules[moduleIndex - 1];

    if (prevModule) {
      setCurrentModuleId(prevModule.id);
    }
  };


  const handleMarkComplete = () => {
    toast.success('Lesson marked as complete!');
  };

  const isFirstLesson = Number(currentModuleId) === 1 && Number(currentLessonId) === 1;
  const isLastLesson = Number(currentModuleId) === modules.length &&
    Number(currentLessonId) === modules[modules.length - 1].lessons.length;

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
              <p className="text-xs text-muted-foreground">by {course.instructor_name || "Gregory"}</p>
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
              lesson={currentLesson}
              onComplete={handleMarkComplete}
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