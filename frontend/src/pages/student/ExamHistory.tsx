/**
 * Exam History Page - Shows all exams the student has attempted and their results
 * Connected to the real assessments backend (no mock data)
 */

import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Trophy,
  CheckCircle,
  XCircle,
  Search,
  TrendingUp,
  TrendingDown,
  Eye,
  Clock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { assessmentService, Assessment } from '@/services/assessmentService';
import { cn } from '@/lib/utils';

type ExamResult = 'passed' | 'failed' | 'pending';

export default function ExamHistory() {
  const navigate = useNavigate();
  const [exams, setExams] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [resultFilter, setResultFilter] = useState('all');

  useEffect(() => {
    const fetchExamHistory = async () => {
      try {
        setLoading(true);
        const data = await assessmentService.getStudentAssessments();

        // History = only assessments the student has actually submitted an attempt for
        const attempted = (data || []).filter(
          (exam) => exam.attempt_status === 'submitted'
        );

        setExams(attempted);
      } catch (error: any) {
        toast.error(error.message || 'Failed to load exam history');
      } finally {
        setLoading(false);
      }
    };

    fetchExamHistory();
  }, []);

  const availableTypes = useMemo(
    () => Array.from(new Set(exams.map((exam) => exam.type).filter(Boolean))),
    [exams]
  );

  const getResult = (exam: Assessment): ExamResult => {
    if (
      !exam.is_graded ||
      exam.score === null ||
      exam.score === undefined ||
      exam.passing_score === null ||
      exam.passing_score === undefined
    ) {
      return 'pending';
    }

    return exam.score >= exam.passing_score ? 'passed' : 'failed';
  };

  const filteredExams = exams.filter((exam) => {
    const search = searchTerm.toLowerCase();

    const matchesSearch =
      exam.title.toLowerCase().includes(search) ||
      (exam.course_title?.toLowerCase().includes(search) ?? false);

    const result = getResult(exam);
    const matchesType = typeFilter === 'all' || exam.type === typeFilter;
    const matchesResult = resultFilter === 'all' || result === resultFilter;

    return matchesSearch && matchesType && matchesResult;
  });

  const gradedExams = exams.filter(
    (exam) => exam.is_graded && exam.score !== null && exam.score !== undefined
  );

  const passedExams = exams.filter((exam) => getResult(exam) === 'passed');
  const failedExams = exams.filter((exam) => getResult(exam) === 'failed');

  const averageScore =
    gradedExams.length > 0
      ? Math.round(
          gradedExams.reduce((sum, exam) => sum + (exam.score ?? 0), 0) /
            gradedExams.length
        )
      : null;

  const passRate =
    passedExams.length + failedExams.length > 0
      ? Math.round(
          (passedExams.length / (passedExams.length + failedExams.length)) * 100
        )
      : null;

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate('/student/exams')}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>

        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Exam History</h1>
          <p className="text-muted-foreground">
            View your completed assessments
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Trophy className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{exams.length}</p>
                <p className="text-xs text-muted-foreground">Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">
                  {passedExams.length}
                </p>
                <p className="text-xs text-muted-foreground">Passed</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900">
                <XCircle className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <p className="text-2xl font-bold text-destructive">
                  {failedExams.length}
                </p>
                <p className="text-xs text-muted-foreground">Failed</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {averageScore !== null ? averageScore : '—'}
                </p>
                <p className="text-xs text-muted-foreground">Average Score</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-2 lg:col-span-1">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <CheckCircle className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {passRate !== null ? `${passRate}%` : '—'}
                </p>
                <p className="text-xs text-muted-foreground">Pass Rate</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search exams..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-full sm:w-[170px]">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {availableTypes.map((type) => (
              <SelectItem key={type} value={type} className="capitalize">
                {type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={resultFilter} onValueChange={setResultFilter}>
          <SelectTrigger className="w-full sm:w-[170px]">
            <SelectValue placeholder="Result" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Results</SelectItem>
            <SelectItem value="passed">Passed</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
            <SelectItem value="pending">Pending Grade</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 space-y-4">
              {[1, 2, 3].map((item) => (
                <Skeleton key={item} className="h-16 w-full" />
              ))}
            </div>
          ) : filteredExams.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Trophy className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No exam history</h3>
              <p className="text-muted-foreground text-center">
                Exams you have submitted will appear here once graded.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Exam</TableHead>
                    <TableHead className="hidden sm:table-cell">Type</TableHead>
                    <TableHead className="hidden md:table-cell">Due Date</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead className="hidden sm:table-cell">Result</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {filteredExams.map((exam) => {
                    const result = getResult(exam);
                    const hasScore =
                      exam.is_graded &&
                      exam.score !== null &&
                      exam.score !== undefined;

                    return (
                      <TableRow key={exam.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{exam.title}</p>
                            {exam.course_title && (
                              <p className="text-sm text-muted-foreground">
                                {exam.course_title}
                                {exam.course_code ? ` (${exam.course_code})` : ''}
                              </p>
                            )}
                          </div>
                        </TableCell>

                        <TableCell className="hidden sm:table-cell">
                          <Badge variant="outline" className="capitalize">
                            {exam.type}
                          </Badge>
                        </TableCell>

                        <TableCell className="hidden md:table-cell">
                          {exam.due_date
                            ? format(new Date(exam.due_date), 'MMM d, yyyy')
                            : '—'}
                        </TableCell>

                        <TableCell>
                          {hasScore ? (
                            <div className="flex items-center gap-2">
                              <span
                                className={cn(
                                  'font-bold text-lg',
                                  result === 'passed'
                                    ? 'text-green-600'
                                    : result === 'failed'
                                      ? 'text-destructive'
                                      : 'text-foreground'
                                )}
                              >
                                {exam.score}/{exam.passing_score}
                              </span>

                              {result === 'passed' && (
                                <TrendingUp className="h-4 w-4 text-green-600" />
                              )}
                              {result === 'failed' && (
                                <TrendingDown className="h-4 w-4 text-destructive" />
                              )}
                            </div>
                          ) : (
                            <span className="text-muted-foreground flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              Pending
                            </span>
                          )}
                        </TableCell>

                        <TableCell className="hidden sm:table-cell">
                          <Badge
                            variant={result === 'pending' ? 'outline' : 'default'}
                            className={
                              result === 'passed'
                                ? 'bg-green-600'
                                : result === 'failed'
                                  ? 'bg-destructive'
                                  : ''
                            }
                          >
                            {result === 'passed'
                              ? 'Passed'
                              : result === 'failed'
                                ? 'Failed'
                                : 'Pending Grade'}
                          </Badge>
                        </TableCell>

                        <TableCell className="text-right">
                          {exam.attempt_id !== null && exam.attempt_id !== undefined && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                navigate(`/student/exam/${exam.attempt_id}/result`)
                              }
                              className="gap-2"
                            >
                              <Eye className="h-4 w-4" />
                              <span className="hidden sm:inline">View</span>
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}