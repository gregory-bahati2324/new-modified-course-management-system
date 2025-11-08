import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle2, 
  PlayCircle, 
  FileText, 
  Download,
  Clock,
  BookOpen,
  Lock,
  MessageSquare
} from 'lucide-react';
import StudentLayout from '@/components/layout/StudentLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function CourseLearn() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [currentModuleId, setCurrentModuleId] = useState(1);
  const [currentLessonId, setCurrentLessonId] = useState(1);

  const course = {
    id: courseId,
    title: "Advanced Database Systems",
    instructor: "Dr. Sarah Johnson",
    progress: 75,
    totalModules: 12,
    completedModules: 9
  };

  const modules = [
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

  const getLessonIcon = (type: string) => {
    switch (type) {
      case 'video': return <PlayCircle className="h-4 w-4" />;
      case 'reading': return <BookOpen className="h-4 w-4" />;
      case 'quiz': return <FileText className="h-4 w-4" />;
      case 'assignment': return <FileText className="h-4 w-4" />;
      case 'lab': return <FileText className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
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

  return (
    <StudentLayout>
      <div className="h-[calc(100vh-4rem)] flex flex-col">
        {/* Top Navigation Bar */}
        <div className="border-b bg-background px-4 py-3">
          <div className="container flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={() => navigate('/student/courses')}>
                <ChevronLeft className="h-4 w-4 mr-2" />
                Back to Courses
              </Button>
              <Separator orientation="vertical" className="h-6" />
              <div>
                <h1 className="font-semibold">{course.title}</h1>
                <p className="text-xs text-muted-foreground">by {course.instructor}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-sm text-muted-foreground">
                {course.completedModules}/{course.totalModules} modules completed
              </div>
              <Progress value={course.progress} className="w-32 h-2" />
              <span className="text-sm font-medium">{course.progress}%</span>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex overflow-hidden">
          {/* Sidebar - Module List */}
          <div className="w-80 border-r bg-muted/30">
            <ScrollArea className="h-full">
              <div className="p-4 space-y-2">
                <h2 className="font-semibold text-sm text-muted-foreground mb-4">COURSE CONTENT</h2>
                {modules.map((module) => (
                  <Card 
                    key={module.id} 
                    className={`${module.locked ? 'opacity-60' : ''} ${currentModuleId === module.id ? 'border-primary' : ''}`}
                  >
                    <CardHeader className="p-4 pb-2">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-sm flex items-center gap-2">
                            {module.completed && <CheckCircle2 className="h-4 w-4 text-success" />}
                            {module.locked && <Lock className="h-4 w-4 text-muted-foreground" />}
                            Module {module.id}
                          </CardTitle>
                          <CardDescription className="text-xs mt-1">
                            {module.title}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <div className="space-y-1">
                        {module.lessons.map((lesson) => (
                          <button
                            key={lesson.id}
                            onClick={() => {
                              if (!module.locked) {
                                setCurrentModuleId(module.id);
                                setCurrentLessonId(lesson.id);
                              }
                            }}
                            disabled={module.locked}
                            className={`w-full flex items-center gap-2 p-2 rounded text-left text-sm hover:bg-accent transition-colors ${
                              currentModuleId === module.id && currentLessonId === lesson.id 
                                ? 'bg-accent font-medium' 
                                : ''
                            } ${module.locked ? 'cursor-not-allowed' : ''}`}
                          >
                            {lesson.completed ? (
                              <CheckCircle2 className="h-4 w-4 text-success flex-shrink-0" />
                            ) : (
                              <div className="h-4 w-4 flex-shrink-0">
                                {getLessonIcon(lesson.type)}
                              </div>
                            )}
                            <span className="flex-1 truncate">{lesson.title}</span>
                            <span className="text-xs text-muted-foreground flex-shrink-0">{lesson.duration}</span>
                          </button>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* Main Content - Lesson Viewer */}
          <div className="flex-1 flex flex-col">
            <ScrollArea className="flex-1">
              <div className="container py-6 max-w-4xl">
                <div className="space-y-6">
                  {/* Lesson Header */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>Module {currentModuleId}</span>
                      <span>•</span>
                      <span>Lesson {currentLessonId}</span>
                    </div>
                    <h2 className="text-3xl font-bold">{currentLesson.title}</h2>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {currentLesson.duration}
                      </div>
                      <Badge variant="secondary">{currentLesson.type}</Badge>
                      {currentLesson.completed && (
                        <Badge className="bg-success">Completed</Badge>
                      )}
                    </div>
                  </div>

                  {/* Lesson Content */}
                  <Card>
                    <CardContent className="p-6">
                      {currentLesson.type === 'video' && (
                        <div className="space-y-4">
                          <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                            <div className="text-center space-y-4">
                              <PlayCircle className="h-16 w-16 mx-auto text-muted-foreground" />
                              <p className="text-muted-foreground">Video player would be embedded here</p>
                              <Button>
                                <PlayCircle className="mr-2 h-4 w-4" />
                                Play Video
                              </Button>
                            </div>
                          </div>
                          <div className="prose max-w-none">
                            <h3>Lesson Overview</h3>
                            <p>
                              In this lesson, you'll learn about {currentLesson.title.toLowerCase()}. 
                              We'll cover the key concepts, practical applications, and best practices that 
                              industry professionals use daily.
                            </p>
                            <h4>Learning Objectives:</h4>
                            <ul>
                              <li>Understand the fundamental concepts</li>
                              <li>Apply knowledge to real-world scenarios</li>
                              <li>Recognize common patterns and anti-patterns</li>
                              <li>Practice with hands-on examples</li>
                            </ul>
                          </div>
                        </div>
                      )}

                      {currentLesson.type === 'reading' && (
                        <div className="prose max-w-none">
                          <h3>{currentLesson.title}</h3>
                          <p>
                            This reading material covers important concepts in {currentLesson.title.toLowerCase()}.
                            Take your time to read through the content and make notes of key points.
                          </p>
                          <h4>Key Topics:</h4>
                          <ul>
                            <li>Core principles and foundations</li>
                            <li>Best practices and methodologies</li>
                            <li>Real-world applications</li>
                            <li>Common challenges and solutions</li>
                          </ul>
                          <p>
                            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor 
                            incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud 
                            exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
                          </p>
                        </div>
                      )}

                      {(currentLesson.type === 'quiz' || currentLesson.type === 'assignment') && (
                        <div className="space-y-4 text-center py-8">
                          <FileText className="h-16 w-16 mx-auto text-muted-foreground" />
                          <h3 className="text-xl font-semibold">{currentLesson.title}</h3>
                          <p className="text-muted-foreground">
                            This {currentLesson.type} will test your understanding of the module content.
                          </p>
                          <Button size="lg">
                            Start {currentLesson.type === 'quiz' ? 'Quiz' : 'Assignment'}
                          </Button>
                        </div>
                      )}

                      {currentLesson.type === 'lab' && (
                        <div className="space-y-4">
                          <div className="bg-muted p-6 rounded-lg">
                            <h3 className="font-semibold mb-2">Lab Exercise: {currentLesson.title}</h3>
                            <p className="text-sm text-muted-foreground mb-4">
                              Complete the following practical exercise to reinforce your learning.
                            </p>
                            <div className="space-y-2">
                              <Button variant="outline" className="w-full justify-start">
                                <Download className="mr-2 h-4 w-4" />
                                Download Lab Materials
                              </Button>
                              <Button variant="outline" className="w-full justify-start">
                                <FileText className="mr-2 h-4 w-4" />
                                View Instructions
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Resources & Notes */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Additional Resources</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <Button variant="outline" size="sm" className="w-full justify-start">
                        <Download className="mr-2 h-4 w-4" />
                        Download Slides
                      </Button>
                      <Button variant="outline" size="sm" className="w-full justify-start">
                        <FileText className="mr-2 h-4 w-4" />
                        Supplementary Reading
                      </Button>
                      <Button variant="outline" size="sm" className="w-full justify-start">
                        <MessageSquare className="mr-2 h-4 w-4" />
                        Discussion Forum
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </ScrollArea>

            {/* Bottom Navigation */}
            <div className="border-t bg-background p-4">
              <div className="container flex items-center justify-between max-w-4xl">
                <Button 
                  variant="outline" 
                  onClick={goToPreviousLesson}
                  disabled={currentModuleId === 1 && currentLessonId === 1}
                >
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  Previous Lesson
                </Button>
                
                {!currentLesson.completed && (
                  <Button variant="outline">
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Mark as Complete
                  </Button>
                )}

                <Button onClick={goToNextLesson}>
                  Next Lesson
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </StudentLayout>
  );
}
