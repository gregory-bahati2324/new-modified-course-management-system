import { useState } from 'react';
import {
  BookOpen,
  Clock,
  BarChart3,
  CheckCircle2,
  Play,
  FileText,
  Image as ImageIcon,
  File,
  Code,
  Volume2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';

interface ContentBlock {
  id: number;
  type: 'text' | 'video' | 'image' | 'pdf' | 'ppt' | 'audio' | 'code' | 'doc';
  content: string;
  title?: string;
}

interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
}

interface LessonData {
  title: string;
  objectives: string;
  prerequisites: string;
  estimatedDuration: string;
  difficulty: string;
  tags: string | string[];
}

interface LessonViewerProps {
  lessonData: LessonData;
  contentBlocks: ContentBlock[];
  quizQuestions: QuizQuestion[];
  onComplete?: () => void;
  isCompleted?: boolean;
}

export function LessonViewer({
  lessonData,
  contentBlocks,
  quizQuestions,
  onComplete,
  isCompleted = false
}: LessonViewerProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<{ [key: number]: number }>({});
  const [showResults, setShowResults] = useState(false);

  const handleOptionSelect = (questionId: number, optionIdx: number) => {
    if (!showResults) {
      setSelectedAnswer({ ...selectedAnswer, [questionId]: optionIdx });
    }
  };

  const submitQuiz = () => setShowResults(true);

  const isYouTubeUrl = (url: string) => {
    return /youtube\.com|youtu\.be/.test(url);
  };

  const extractYouTubeID = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : '';
  };

  const getContentIcon = (type: string) => {
    const icons = {
      text: FileText,
      video: Play,
      image: ImageIcon,
      pdf: File,
      ppt: File,
      doc: File,
      audio: Volume2,
      code: Code
    };
    const Icon = icons[type as keyof typeof icons] || FileText;
    return <Icon className="h-5 w-5" />;
  };

  const calculateQuizScore = () =>
    quizQuestions.reduce((score, q) => (selectedAnswer[q.id] === q.correctAnswer ? score + 1 : score), 0);

  const tags = Array.isArray(lessonData.tags) 
    ? lessonData.tags 
    : lessonData.tags?.split(',').map(t => t.trim()).filter(Boolean) || [];

  const quizProgress = quizQuestions.length > 0 
    ? Math.round((Object.keys(selectedAnswer).length / quizQuestions.length) * 100) 
    : 0;

  return (
    <ScrollArea className="h-full">
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Lesson Header */}
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <h1 className="text-3xl font-bold">{lessonData.title || 'Untitled Lesson'}</h1>
            {isCompleted && (
              <Badge className="bg-green-500/10 text-green-600 border-green-500/20">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Completed
              </Badge>
            )}
          </div>

          <div className="flex flex-wrap gap-3">
            {lessonData.estimatedDuration && (
              <Badge variant="secondary" className="gap-1">
                <Clock className="h-3 w-3" />
                {lessonData.estimatedDuration}
              </Badge>
            )}
            {lessonData.difficulty && (
              <Badge variant="secondary" className="gap-1">
                <BarChart3 className="h-3 w-3" />
                {lessonData.difficulty}
              </Badge>
            )}
            {tags.map((tag, idx) => (
              <Badge key={idx} variant="outline">
                {tag}
              </Badge>
            ))}
          </div>

          {/* Objectives */}
          {lessonData.objectives && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                  Learning Objectives
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  {lessonData.objectives
                    .split('\n')
                    .filter((obj) => obj.trim())
                    .map((objective, idx) => (
                      <li key={idx}>{objective}</li>
                    ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Prerequisites */}
          {lessonData.prerequisites && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Prerequisites</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{lessonData.prerequisites}</p>
              </CardContent>
            </Card>
          )}
        </div>

        <Separator />

        {/* Content Blocks */}
        {contentBlocks.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Lesson Content</h3>
            {contentBlocks.map((block) => (
              <Card key={block.id}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    {getContentIcon(block.type)}
                    {block.title || `${block.type} Content`}
                    <Badge variant="outline" className="ml-auto text-xs">
                      {block.type}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {block.type === 'text' && (
                    <div className="prose max-w-none dark:prose-invert">
                      <p className="whitespace-pre-wrap text-muted-foreground">{block.content || 'No content added yet'}</p>
                    </div>
                  )}

                  {block.type === 'code' && (
                    <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
                      <code>{block.content || '// No code added yet'}</code>
                    </pre>
                  )}

                  {block.type === 'image' && block.content && (
                    <img
                      src={block.content}
                      alt={block.title || 'Lesson image'}
                      className="w-full max-h-[500px] object-contain rounded-lg"
                    />
                  )}

                  {block.type === 'video' && block.content && (
                    <>
                      {isYouTubeUrl(block.content) ? (
                        <div className="aspect-video">
                          <iframe
                            className="w-full h-full rounded-lg"
                            src={`https://www.youtube.com/embed/${extractYouTubeID(block.content)}`}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          />
                        </div>
                      ) : (
                        <video
                          controls
                          className="w-full aspect-video rounded-lg"
                          src={block.content}
                        >
                          Your browser does not support the video tag.
                        </video>
                      )}
                    </>
                  )}

                  {block.type === 'audio' && block.content && (
                    <audio controls className="w-full" src={block.content}>
                      Your browser does not support the audio element.
                    </audio>
                  )}

                  {['pdf', 'ppt', 'pptx', 'doc', 'docx', 'document'].includes(block.type) &&
                    block.content && (
                      <a
                        href={block.content}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-4 border rounded-lg flex items-center gap-2 text-primary hover:bg-muted transition-colors"
                      >
                        <File className="h-5 w-5" />
                        <span>{block.title || block.content.split('/').pop()}</span>
                      </a>
                    )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Quiz */}
        {quizQuestions.length > 0 && (
          <>
            <Separator />
            <div className="space-y-4">
              <h3 className="text-xl font-semibold">Knowledge Check</h3>
              {quizQuestions.map((question, qIdx) => (
                <Card key={question.id}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">
                      Question {qIdx + 1}: {question.question}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {question.options.map((option, optIdx) => {
                      const isSelected = selectedAnswer[question.id] === optIdx;
                      const isCorrect = showResults && optIdx === question.correctAnswer;
                      const isWrong = showResults && isSelected && optIdx !== question.correctAnswer;

                      return (
                        <div
                          key={optIdx}
                          className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                            isSelected ? 'border-primary bg-primary/5' : 'hover:bg-muted'
                          } ${isCorrect ? 'border-green-500 bg-green-500/10' : ''} ${
                            isWrong ? 'border-red-500 bg-red-500/10' : ''
                          }`}
                          onClick={() => handleOptionSelect(question.id, optIdx)}
                        >
                          <div className="flex items-center gap-2">
                            <div
                              className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                                isSelected ? 'border-primary bg-primary' : 'border-muted-foreground'
                              } ${isCorrect ? 'border-green-500 bg-green-500' : ''} ${
                                isWrong ? 'border-red-500 bg-red-500' : ''
                              }`}
                            >
                              {(isSelected || isCorrect) && (
                                <div className="w-2 h-2 rounded-full bg-white" />
                              )}
                            </div>
                            <span>{option}</span>
                          </div>
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>
              ))}
              {!showResults && Object.keys(selectedAnswer).length === quizQuestions.length && (
                <Button onClick={submitQuiz}>
                  Submit Quiz
                </Button>
              )}
              {showResults && (
                <Card className="border-primary/20 bg-primary/5">
                  <CardContent className="pt-6">
                    <div className="text-lg font-semibold text-center">
                      Score: {calculateQuizScore()} / {quizQuestions.length}
                      <p className="text-sm font-normal text-muted-foreground mt-1">
                        {calculateQuizScore() === quizQuestions.length 
                          ? 'Perfect score! Great job!' 
                          : 'Review the correct answers above.'}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </>
        )}

        {/* Lesson Progress */}
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="font-medium">Lesson Progress</span>
                <span className="text-muted-foreground">{quizProgress}%</span>
              </div>
              <Progress value={quizProgress} />
              {onComplete && !isCompleted && (
                <Button onClick={onComplete} className="w-full mt-4">
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Mark as Complete
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </ScrollArea>
  );
}