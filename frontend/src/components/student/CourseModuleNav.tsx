import { useState } from 'react';
import {
  ChevronRight,
  ChevronDown,
  CheckCircle2,
  PlayCircle,
  FileText,
  BookOpen,
  Lock,
  ClipboardCheck,
  Beaker
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Module } from '@/types/module';
import { Lesson, ContentBlock } from '@/types/lesson';


interface CourseModuleNavProps {
  modules: Module[];
  currentModuleId: string | null;
  currentLessonId: string | null;
  onSelectLesson: (moduleId: string, lessonId: string) => void;
  courseProgress?: number;
}


export function CourseModuleNav({
  modules,
  currentModuleId,
  currentLessonId,
  onSelectLesson,
  courseProgress = 0
}: CourseModuleNavProps) {
  const [expandedModules, setExpandedModules] =
    useState<Record<string, boolean>>(() => (
      currentModuleId ? { [currentModuleId]: true } : {}
    ));


  const toggleModule = (moduleId: string) => {
    setExpandedModules(prev => ({
      ...prev,
      [moduleId]: !prev[moduleId]
    }));
  };


  const getLessonIcon = (lesson: Lesson) => {
    if (lesson.is_completed) {
      return <CheckCircle2 className="h-4 w-4 text-green-500" />;
    }

    const blocks = lesson.content_blocks ?? [];
    const quizQuestions = lesson.quiz_questions ?? [];

    if (blocks.some(b => b.type === 'video')) {
      return <PlayCircle className="h-4 w-4 text-blue-500" />;
    }

    if (quizQuestions.length > 0) {
      return <ClipboardCheck className="h-4 w-4 text-purple-500" />;
    }

    if (blocks.some(b => b.type === 'code')) {
      return <Beaker className="h-4 w-4 text-cyan-500" />;
    }

    if (blocks.some(b => b.type === 'text')) {
      return <BookOpen className="h-4 w-4 text-amber-500" />;
    }

    return <FileText className="h-4 w-4 text-muted-foreground" />;
  };


  const getModuleProgress = (module: Module) => {
    const completedLessons = module.lessons.filter(l => l.is_completed).length;
    return Math.round((completedLessons / module.lessons.length) * 100);
  };

  return (
    <div className="h-full flex flex-col bg-muted/30">
      {/* Progress Header */}
      <div className="p-4 border-b bg-background/50">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">Course Progress</span>
          <span className="text-sm text-muted-foreground">{courseProgress}%</span>
        </div>
        <Progress value={courseProgress} className="h-2" />
      </div>

      {/* Module List */}
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {modules.map((module) => {
            const isExpanded = expandedModules[module.id] ?? false;
            const isCurrentModule = module.id === currentModuleId;
            const moduleProgress = getModuleProgress(module);

            return (
              <Collapsible
                key={module.id}
                open={isExpanded}
                onOpenChange={() => !module.locked && toggleModule(module.id)}
              >
                <CollapsibleTrigger
                  className={cn(
                    "w-full flex items-center gap-2 p-3 rounded-lg text-left transition-colors",
                    "hover:bg-accent",
                    isCurrentModule && "bg-accent",
                    module.locked && "opacity-50 cursor-not-allowed"
                  )}
                  disabled={module.locked}
                >
                  {module.locked ? (
                    <Lock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  ) : module.completed ? (
                    <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                  ) : isExpanded ? (
                    <ChevronDown className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-muted-foreground">
                        M{module.order}
                      </span>
                      <span className="text-sm font-medium truncate">
                        {module.title}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <Progress value={moduleProgress} className="h-1 flex-1" />
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {module.lessons.filter(l => l.is_completed).length}/{module.lessons.length}
                      </span>
                    </div>
                  </div>
                </CollapsibleTrigger>

                <CollapsibleContent className="pl-4 pr-2 pb-2">
                  <div className="space-y-0.5 pt-1 border-l-2 border-border ml-2">
                    {module.lessons.length === 0 ? (
                      <p className="text-xs text-muted-foreground px-4 py-2">
                        No lessons yet
                      </p>
                    ) : (
                      module.lessons.map((lesson) => {
                        const isCurrentLesson = isCurrentModule && lesson.id === currentLessonId;

                        return (
                          <button
                            key={lesson.id}
                            onClick={() => !module.locked && onSelectLesson(module.id, lesson.id)}
                            disabled={module.locked}
                            className={cn(
                              "w-full flex items-center gap-2 py-2 px-3 -ml-[1px] text-left text-sm rounded-r-lg transition-colors",
                              "hover:bg-accent",
                              isCurrentLesson && "bg-primary/10 border-l-2 border-primary font-medium",
                              !isCurrentLesson && "border-l-2 border-transparent"
                            )}
                          >
                            {getLessonIcon(lesson)}
                            <span className="flex-1 truncate">{lesson.title}</span>
                          </button>
                        );
                      })
                    )}

                  </div>
                </CollapsibleContent>
              </Collapsible>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}