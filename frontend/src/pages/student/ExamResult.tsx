import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Trophy,
  Clock,
  CheckCircle,
  XCircle,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';
import { assessmentService } from '@/services/assessmentService';



export default function ExamResultPage() {
  const navigate = useNavigate();
  const { attemptId } = useParams();
  const [expandedQuestions, setExpandedQuestions] = useState(new Set());
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResult = async () => {
      try {
        const data = await assessmentService.getExamResult(Number(attemptId));
        console.log("Exam result data:", data);
        setResult(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchResult();
  }, [attemptId]);

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  if (!result) {
    return <div className="p-6">No result found</div>;
  }


  const toggleQuestion = (questionId) => {
    setExpandedQuestions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(questionId)) newSet.delete(questionId);
      else newSet.add(questionId);
      return newSet;
    });
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const passedClass = result.passed ? 'text-green-600' : 'text-destructive';
  const passedBg = result.passed ? 'bg-green-100' : 'bg-red-100';

  // 🔥 Render answers based on type
  const renderAnswer = (q, isCorrectAnswer = false) => {
    const value = isCorrectAnswer ? q.correct_answer : q.student_answer;

    switch (q.type) {
      case 'multiple-choice':
        return q.options?.map((opt, i) => (
          <div key={i} className={cn(
            'p-2 rounded',
            value === i && (isCorrectAnswer ? 'bg-green-200' : 'bg-muted')
          )}>
            {opt}
          </div>
        ));

      case 'true-false':
      case 'short-answer':
      case 'essay':
      case 'coding':
        return <p>{value || 'No answer'}</p>;

      case 'matching':
        if (!value || typeof value !== 'object' || Array.isArray(value)) {
          return <p>No matching data</p>;
        }

        return (
          <div className="space-y-1">
            {Object.entries(value as Record<string, any>).map(([k, v]) => (
              <div key={k}>
                {k} → {String(v)}
              </div>
            ))}
          </div>
        );
      case 'ordering':
        return (
          <ol className="list-decimal ml-4">
            {(value || []).map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ol>
        );

      case 'file-upload':
        return (
          <div className="space-y-2">
            {isCorrectAnswer ? (
              q.correct_file_url ? (
                <a
                  href={q.correct_file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-green-600 underline"
                >
                  {q.correct_file_name}
                </a>
              ) : (
                <p>No correct file uploaded</p>
              )
            ) : (
              q.file_url ? (
                <a
                  href={q.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline"
                >
                  {q.file_name}
                </a>
              ) : (
                <p>No file uploaded</p>
              )
            )}
          </div>
        );
      default:
        return <p>{JSON.stringify(value)}</p>;
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <Button variant="ghost" onClick={() => navigate('/student/exams')} className="gap-2">
        <ArrowLeft className="h-4 w-4" /> Back
      </Button>

      <Card className={cn('overflow-hidden', passedBg)}>
        <CardContent className="p-6 flex flex-col sm:flex-row items-center gap-6">
          <div className="w-28 h-28 rounded-full bg-white flex items-center justify-center shadow">
            <div className="text-center">
              <div className={cn('text-3xl font-bold', passedClass)}>
                {result.score}
              </div>
              <div className="text-sm">Score</div>
            </div>
          </div>

          <div className="flex-1 text-center sm:text-left">

            <h2 className="text-xl font-bold mt-2">{result.exam_title}</h2>
            <p className="text-muted-foreground">{result.course_title}</p>

            <div className="flex gap-4 mt-3 text-sm">
              <div className="flex items-center gap-1">
                {result.score}/{result.total_points}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 space-y-4">
          <h3 className="font-semibold text-lg">Detailed Review</h3>

          {result.question_results.map((q, index) => (
            <Collapsible
              key={q.question_id}
              open={expandedQuestions.has(q.question_id)}
              onOpenChange={() => toggleQuestion(q.question_id)}
            >
              <CollapsibleTrigger asChild>
                <div
                  className="flex justify-between items-center p-4 rounded cursor-pointer bg-muted hover:bg-muted/70"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-medium">
                      Question {index + 1} ({q.type})
                    </span>
                  </div>

                  {expandedQuestions.has(q.question_id) ? <ChevronUp /> : <ChevronDown />}
                </div>
              </CollapsibleTrigger>

              <CollapsibleContent>
                <div className="p-4 space-y-4">
                  <p className="font-medium">{q.question_text}</p>

                  <div className="grid gap-4">
                    <div className="p-3 bg-muted rounded">
                      <p className="text-xs text-muted-foreground">Your Answer</p>
                      {renderAnswer(q, false)}
                    </div>

                    <div className="p-3 bg-green-50 rounded">
                      <p className="text-xs text-muted-foreground">Correct Answer</p>
                      {renderAnswer(q, true)}
                    </div>
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
