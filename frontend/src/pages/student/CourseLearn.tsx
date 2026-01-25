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
import { ProgressService } from '@/services/progressService';
import { Lesson } from '@/types/lesson';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export interface Module {
  id: string;
  title: string;
  lessons: Lesson[];
  completed: boolean;
  locked?: boolean;
  order?: number;
}

export default function CourseLearn() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [modules, setModules] = useState<Module[]>([]);
  const [currentModuleId, setCurrentModuleId] = useState<string | null>(null);
  const [currentLessonId, setCurrentLessonId] = useState<string | null>(null);
  const [course, setCourse] = useState<Course | null>(null);
  const [moduleNavOpen, setModuleNavOpen] = useState(true);
  const [progressMap, setProgressMap] = useState<Record<string, boolean>>({});
  const [courseProgress, setCourseProgress] = useState<number>(0);



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

        // Sort modules by order if not already sorted by backend
        const sortedModules = [...modulesWithLessons].sort((a, b) =>
          (a.order || 0) - (b.order || 0)
        );

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

        // Sort lessons by order before setting them
        const sortedLessons = [...data].sort((a: any, b: any) =>
          (a.order || 0) - (b.order || 0)
        );

        setModules(prev =>
          prev.map(m =>
            m.id === currentModuleId
              ? {
                ...m,
                lessons: data.map((lesson: any) => ({
                  id: String(lesson.id),
                  title: lesson.title,
                  order: lesson.order ?? 0,
                  description: lesson.description ?? '',

                  duration_minutes: lesson.duration_minutes ?? 0,
                  difficulty: lesson.difficulty ?? undefined,
                  objectives: lesson.objectives ?? '',
                  prerequisites: lesson.prerequisites ?? '',
                  tags: lesson.tags ?? [],

                  content_blocks: lesson.contentBlocks ?? [],   // ✅ REQUIRED
                  quiz_questions: lesson.quizQuestions ?? [],

                  is_completed: lesson.completed ?? false,
                }))

              }
              : m
          )
        );

        // Auto-select first lesson
        if (sortedLessons.length > 0) {
          setCurrentLessonId(sortedLessons[0].id);
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

  useEffect(() => {
    if (!courseId) return;

    const lessonsLoaded = modules.some(m => m.lessons.length > 0);
    if (!lessonsLoaded) return;

    const loadProgress = async () => {
      try {
        const progressService = new ProgressService();
        const progressList = await progressService.getCourseLessonsProgress(courseId);

        const progressMap: Record<string, any> = {};
        progressList.forEach(p => {
          progressMap[p.lesson_id] = p;
        });

        setModules(prev =>
          prev.map(module => ({
            ...module,
            lessons: module.lessons.map(lesson => {
              const progress = progressMap[lesson.id];
              if (!progress) return lesson;

              return {
                ...lesson,
                is_completed: progress.is_completed,
                quiz_score: progress.quiz_score,
                completed_at: progress.completed_at,
                time_spent_seconds: progress.time_spent_seconds
              };
            })
          }))
        );
      } catch {
        toast.error('Failed to load lesson progress');
      }
    };

    loadProgress();
  }, [courseId, modules]);

  useEffect(() => {
    if (!courseId) return;

    const loadCourseProgress = async () => {
      try {
        const progressService = new ProgressService();
        const progress = await progressService.getCourseProgress(courseId);

        setCourseProgress(progress.progress_percentage);
      } catch {
        toast.error('Failed to load course progress');
      }
    };

    loadCourseProgress();
  }, [courseId]);



  const handleMarkComplete = async (data: {
    quizScore?: number;
    timeSpentSeconds: number;
  }) => {
    if (!currentLesson) return;

    try {
      const progressService = new ProgressService();

      await progressService.completeLesson(currentLesson.id, {
        course_id: courseId!,
        module_id: currentModuleId!,
        quiz_score: data.quizScore,
        time_spent_seconds: data.timeSpentSeconds
      });

      toast.success('Lesson marked as complete!');


      const updatedCourseProgress =
        await progressService.getCourseProgress(courseId!);

      setCourseProgress(updatedCourseProgress.progress_percentage);


      setModules(prev =>
        prev.map(m =>
          m.id === currentModuleId
            ? {
              ...m,
              lessons: m.lessons.map(l =>
                l.id === currentLesson.id
                  ? {
                    ...l,
                    is_completed: true,
                    quiz_score: data.quizScore ?? null,
                    time_spent_seconds: data.timeSpentSeconds,
                    completed_at: new Date().toISOString()
                  }
                  : l
              )

            }
            : m
        )
      );
    } catch (err: any) {
      toast.error(err.message || 'Failed to mark lesson as complete');
    }
  };

  const currentModule = useMemo(
    () => modules.find(m => m.id === currentModuleId),
    [modules, currentModuleId]
  );

  const currentLesson = useMemo(
    () => currentModule?.lessons?.find(l => String(l.id) === currentLessonId),
    [currentModule, currentLessonId]
  );

  const hasLessons =
    !!currentModule &&
    Array.isArray(currentModule.lessons) &&
    currentModule.lessons.length > 0;

  const isLessonReady =
    hasLessons &&
    !!currentLesson &&
    currentLesson.content_blocks !== undefined;


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


  if (!course) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Loading course...</p>
      </div>
    );
  }

  if (modules.length === 0) {
    return (
      <div className="h-full flex flex-col">
        {/* Top bar stays */}
        <div className="border-b px-4 py-2">
          <h1 className="font-semibold">{course.title}</h1>
        </div>

        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-2">
            <p className="text-lg font-medium">No modules yet</p>
            <p className="text-sm text-muted-foreground">
              The instructor hasn’t added any modules to this course.
            </p>
          </div>
        </div>
      </div>
    );
  }



  const isFirstLesson =
    !!currentModule &&
    !!currentLesson &&
    currentModule.lessons[0]?.id === currentLesson.id &&
    modules[0]?.id === currentModule.id;

  const isLastLesson = (() => {
    if (!currentModule || !currentLesson || modules.length === 0) return false;

    const lastModule = modules[modules.length - 1];
    if (!lastModule || lastModule.lessons.length === 0) return false;

    const lastLesson = lastModule.lessons[lastModule.lessons.length - 1];

    return (
      lastModule.id === currentModule.id &&
      lastLesson.id === currentLesson.id
    );
  })();



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
              courseProgress={courseProgress}

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
              {currentModule && (
                <>
                  <span>Module {currentModule.order || 1}</span>
                  <ChevronRight className="h-3 w-3 inline mx-1" />
                </>
              )}

              {currentLesson ? (
                <span className="text-foreground font-medium">
                  {currentLesson.title}
                </span>
              ) : (
                <span className="italic">Loading lesson…</span>
              )}
            </div>

          </div>

          {/* Lesson Viewer */}
          <div className="flex-1 overflow-hidden">
            {/* Module exists but has no lessons */}
            {currentModule && !hasLessons && (
              <div className="h-full flex items-center justify-center">
                <div className="text-center space-y-2">
                  <p className="text-lg font-medium">No lessons in this module</p>
                  <p className="text-sm text-muted-foreground">
                    Lessons will appear here once the instructor adds them.
                  </p>
                </div>
              </div>
            )}

            {/* Lessons exist but lesson not selected yet */}
            {currentModule && hasLessons && !currentLesson && (
              <div className="h-full flex items-center justify-center text-muted-foreground">
                Loading lesson…
              </div>
            )}

            {/* Lesson fully ready */}
            {isLessonReady && (
              <LessonViewer
                lesson={currentLesson}
                onComplete={handleMarkComplete}
              />
            )}
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
                {currentLesson && currentModule ? (
                  <>Lesson {currentLesson.order || 1} of {currentModule.lessons.length}</>
                ) : (
                  <>Loading…</>
                )}
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