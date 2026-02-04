/**
 * Exam History Page - Shows all completed exams and results
 * Created: 2025-02-04
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Trophy,
  Calendar,
  Clock,
  Search,
  Filter,
  Download,
  Eye,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { studentExamService, ExamListItem } from '@/services/studentExamService';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

export default function ExamHistory() {
  const navigate = useNavigate();
  const [exams, setExams] = useState<ExamListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [resultFilter, setResultFilter] = useState('all');

  useEffect(() => {
    fetchCompletedExams();
  }, []);

  const fetchCompletedExams = async () => {
    try {
      setLoading(true);
      const data = await studentExamService.getExams({ status: 'completed' });
      // Add some mock completed exams for demonstration
      const completedExams: ExamListItem[] = [
        ...data,
        {
          id: '4',
          title: 'Algorithms Final Exam',
          type: 'final',
          course_id: 'cs401',
          course_title: 'Advanced Algorithms',
          due_date: '2025-01-20T14:00:00',
          time_limit: 120,
          attempts_allowed: '1',
          attempts_used: 1,
          passing_score: 60,
          total_points: 150,
          question_count: 30,
          status: 'completed',
          best_score: 78,
          last_attempt_date: '2025-01-20T16:00:00'
        },
        {
          id: '5',
          title: 'Web Development Quiz',
          type: 'quiz',
          course_id: 'cs301',
          course_title: 'Web Technologies',
          due_date: '2025-01-15T10:00:00',
          time_limit: 20,
          attempts_allowed: '3',
          attempts_used: 2,
          passing_score: 70,
          total_points: 40,
          question_count: 8,
          status: 'completed',
          best_score: 95,
          last_attempt_date: '2025-01-15T10:15:00'
        }
      ];
      setExams(completedExams.filter(e => e.status === 'completed'));
    } catch (error: any) {
      toast.error(error.message || 'Failed to load exam history');
    } finally {
      setLoading(false);
    }
  };

  /* CHANGE: Filter exams */
  const filteredExams = exams.filter(exam => {
    const matchesSearch = exam.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         exam.course_title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || exam.type === typeFilter;
    const matchesResult = resultFilter === 'all' || 
                         (resultFilter === 'passed' && (exam.best_score || 0) >= exam.passing_score) ||
                         (resultFilter === 'failed' && (exam.best_score || 0) < exam.passing_score);
    return matchesSearch && matchesType && matchesResult;
  });

  /* CHANGE: Calculate statistics */
  const stats = {
    total: exams.length,
    passed: exams.filter(e => (e.best_score || 0) >= e.passing_score).length,
    failed: exams.filter(e => (e.best_score || 0) < e.passing_score).length,
    averageScore: exams.length > 0 
      ? Math.round(exams.reduce((sum, e) => sum + (e.best_score || 0), 0) / exams.length) 
      : 0,
    totalPoints: exams.reduce((sum, e) => sum + Math.floor((e.best_score || 0) / 100 * e.total_points), 0),
    maxPoints: exams.reduce((sum, e) => sum + e.total_points, 0)
  };

  const passRate = stats.total > 0 ? Math.round((stats.passed / stats.total) * 100) : 0;

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
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
            <p className="text-muted-foreground">View all your completed assessments</p>
          </div>
        </div>
        <Button variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          Export Results
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Trophy className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-xs text-muted-foreground">Total Exams</p>
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
                <p className="text-2xl font-bold text-green-600">{stats.passed}</p>
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
                <p className="text-2xl font-bold text-destructive">{stats.failed}</p>
                <p className="text-xs text-muted-foreground">Failed</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900">
                <TrendingUp className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.averageScore}%</p>
                <p className="text-xs text-muted-foreground">Average Score</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="col-span-2 lg:col-span-1">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900">
                <Calendar className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{passRate}%</p>
                <p className="text-xs text-muted-foreground">Pass Rate</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Overall Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Points Earned</span>
                <span className="font-medium">{stats.totalPoints} / {stats.maxPoints}</span>
              </div>
              <Progress value={stats.maxPoints > 0 ? (stats.totalPoints / stats.maxPoints) * 100 : 0} className="h-3" />
            </div>
            <div className="flex justify-between text-sm">
              <span>Pass Rate</span>
              <span className={cn("font-medium", passRate >= 70 ? "text-green-600" : "text-destructive")}>
                {passRate}%
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
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
          <SelectTrigger className="w-full sm:w-[150px]">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="quiz">Quiz</SelectItem>
            <SelectItem value="test">Test</SelectItem>
            <SelectItem value="exam">Exam</SelectItem>
            <SelectItem value="midterm">Midterm</SelectItem>
            <SelectItem value="final">Final</SelectItem>
          </SelectContent>
        </Select>
        <Select value={resultFilter} onValueChange={setResultFilter}>
          <SelectTrigger className="w-full sm:w-[150px]">
            <SelectValue placeholder="Result" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Results</SelectItem>
            <SelectItem value="passed">Passed</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Results Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 space-y-4">
              {[1, 2, 3].map(i => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : filteredExams.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Trophy className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No exam history</h3>
              <p className="text-muted-foreground text-center">
                Complete some exams to see your history here.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Exam</TableHead>
                    <TableHead className="hidden sm:table-cell">Type</TableHead>
                    <TableHead className="hidden md:table-cell">Date</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead className="hidden sm:table-cell">Result</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredExams.map((exam) => {
                    const passed = (exam.best_score || 0) >= exam.passing_score;
                    return (
                      <TableRow key={exam.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{exam.title}</p>
                            <p className="text-sm text-muted-foreground">{exam.course_title}</p>
                          </div>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          <Badge variant="outline" className="capitalize">
                            {exam.type}
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {exam.last_attempt_date && format(new Date(exam.last_attempt_date), 'MMM d, yyyy')}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className={cn(
                              "font-bold text-lg",
                              passed ? "text-green-600" : "text-destructive"
                            )}>
                              {exam.best_score}%
                            </span>
                            {passed ? (
                              <TrendingUp className="h-4 w-4 text-green-600" />
                            ) : (
                              <TrendingDown className="h-4 w-4 text-destructive" />
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          <Badge className={passed ? "bg-green-600" : "bg-destructive"}>
                            {passed ? 'Passed' : 'Failed'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(`/student/exams/${exam.id}/result`)}
                            className="gap-2"
                          >
                            <Eye className="h-4 w-4" />
                            <span className="hidden sm:inline">View</span>
                          </Button>
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