import { useState } from 'react';
import {
    X,
    BookOpen,
    Clock,
    BarChart3,
    CheckCircle2,
    Play,
    FileText,
    Image,
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
    previewUrl?: string; // this is the local uploaded file URL
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
    tags: string;
}

interface LessonPreviewProps {
    lessonData: LessonData;
    contentBlocks: ContentBlock[];
    quizQuestions: QuizQuestion[];
    onClose: () => void;
}

export function LessonPreview({
    lessonData,
    contentBlocks,
    quizQuestions,
    onClose
}: LessonPreviewProps) {
    const [selectedAnswer, setSelectedAnswer] = useState<{ [key: number]: number }>({});
    const [showResults, setShowResults] = useState(false);

    const handleOptionSelect = (questionId: number, optionIdx: number) => {
        setSelectedAnswer({ ...selectedAnswer, [questionId]: optionIdx });
    };

    const submitQuiz = () => setShowResults(true);
    function isYouTubeUrl(url: string) {
        return /youtube\.com|youtu\.be/.test(url);
    }

    function extractYouTubeID(url: string) {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return match && match[2].length === 11 ? match[2] : '';
    }


    const getContentIcon = (type: string) => {
        const icons = {
            text: FileText,
            video: Play,
            image: Image,
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

    const getFileUrl = (block: ContentBlock) => block.previewUrl || block.content;

    return (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm">
            <div className="fixed inset-4 md:inset-8 z-50 bg-background border rounded-lg shadow-xl flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b">
                    <div className="flex items-center gap-3">
                        <BookOpen className="h-6 w-6 text-primary" />
                        <h2 className="text-2xl font-bold">Lesson Preview</h2>
                    </div>
                    <Button variant="ghost" size="icon" onClick={onClose}>
                        <X className="h-5 w-5" />
                    </Button>
                </div>

                {/* Scrollable Content */}
                <ScrollArea className="flex-1 p-6">
                    <div className="max-w-4xl mx-auto space-y-6">
                        {/* Lesson Header */}
                        <div className="space-y-4">
                            <h1 className="text-3xl font-bold">{lessonData.title || 'Untitled Lesson'}</h1>

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
                                {lessonData.tags &&
                                    lessonData.tags.split(',').map((tag, idx) => (
                                        <Badge key={idx} variant="outline">
                                            {tag.trim()}
                                        </Badge>
                                    ))}
                            </div>

                            {/* Objectives */}
                            {lessonData.objectives && (
                                <Card>
                                    <CardHeader>
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
                                    <CardHeader>
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
                                        <CardHeader>
                                            <CardTitle className="text-lg flex items-center gap-2">
                                                {getContentIcon(block.type)}
                                                {block.title || `${block.type} Content`}
                                                <Badge variant="outline" className="ml-auto">
                                                    {block.type}
                                                </Badge>
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            {block.type === 'text' && (
                                                <div className="prose max-w-none">
                                                    <p className="whitespace-pre-wrap">{block.content || 'No content added yet'}</p>
                                                </div>
                                            )}

                                            {block.type === 'code' && (
                                                <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
                                                    <code>{block.content || '// No code added yet'}</code>
                                                </pre>
                                            )}

                                            {block.type === 'image' && getFileUrl(block) && (
                                                <img
                                                    src={getFileUrl(block)}
                                                    alt={block.title || 'Image'}
                                                    className="rounded-lg w-full"
                                                />
                                            )}

                                            {block.type === 'video' && (block.previewUrl || block.content) && (
                                                <>
                                                    {/* YouTube URL */}
                                                    {isYouTubeUrl(block.content) && !block.previewUrl ? (
                                                        <div className="aspect-video w-full rounded-lg overflow-hidden">
                                                            <iframe
                                                                className="w-full h-full"
                                                                src={`https://www.youtube.com/embed/${extractYouTubeID(block.content)}`}
                                                                title="YouTube video"
                                                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                                allowFullScreen
                                                            />
                                                        </div>
                                                    ) : (
                                                        // Uploaded or direct video URL
                                                        <video
                                                            controls
                                                            className="w-full aspect-video rounded-lg"
                                                            src={block.previewUrl || block.content}
                                                        >
                                                            Your browser does not support the video tag.
                                                        </video>
                                                    )}
                                                </>
                                            )}


                                            {block.type === 'audio' && getFileUrl(block) && (
                                                <audio controls className="w-full" src={getFileUrl(block)}>
                                                    Your browser does not support the audio element.
                                                </audio>
                                            )}

                                            {['pdf', 'ppt', 'pptx', 'doc', 'docx'].includes(block.type) && getFileUrl(block) && (
                                                <a
                                                    href={getFileUrl(block)}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="p-4 border rounded-lg flex items-center gap-2 text-blue-600 underline"
                                                >
                                                    <File className="h-5 w-5" />
                                                    <span>{block.title || getFileUrl(block).split('/').pop()}</span>
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
                                            <CardHeader>
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
                                                            className={`p-3 rounded-lg border cursor-pointer transition-colors ${isSelected ? 'border-primary bg-primary/5' : 'hover:bg-muted'
                                                                } ${isCorrect ? 'border-green-500 bg-green-100' : ''} ${isWrong ? 'border-red-500 bg-red-100' : ''
                                                                }`}
                                                            onClick={() => !showResults && handleOptionSelect(question.id, optIdx)}
                                                        >
                                                            <div className="flex items-center gap-2">
                                                                <div
                                                                    className={`w-4 h-4 rounded-full border-2 ${isSelected ? 'border-primary bg-primary' : 'border-muted-foreground'
                                                                        }`}
                                                                />
                                                                <span>{option}</span>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </CardContent>
                                        </Card>
                                    ))}
                                    {!showResults && (
                                        <Button onClick={submitQuiz} className="mt-2">
                                            Submit Quiz
                                        </Button>
                                    )}
                                    {showResults && (
                                        <div className="text-lg font-semibold">
                                            Score: {calculateQuizScore()} / {quizQuestions.length}
                                        </div>
                                    )}
                                </div>
                            </>
                        )}

                        {/* Lesson Progress */}
                        <Card>
                            <CardContent className="pt-6">
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="font-medium">Lesson Progress</span>
                                        <span className="text-muted-foreground">
                                            {Math.round((Object.keys(selectedAnswer).length / quizQuestions.length) * 100) || 0}%
                                        </span>
                                    </div>
                                    <Progress
                                        value={(Object.keys(selectedAnswer).length / quizQuestions.length) * 100 || 0}
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </ScrollArea>
            </div>
        </div>
    );
}
