import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileQuestion,
  Clock,
  Calendar,
  CheckCircle,
  AlertCircle,
  Filter,
  Search,
  Play,
  Eye,
  Trophy,
  BookOpen,
  Timer,
  ChevronRight
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { assessmentService, Assessment } from '@/services/assessmentService';
import { format, formatDistanceToNow, isPast, isFuture } from 'date-fns';

export default function StudentExams() {
  const navigate = useNavigate();
  const [exams, setExams] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    fetchExams();
  }, [typeFilter]);

  const fetchExams = async () => {
    try {
      setLoading(true);
      const data = await assessmentService.getStudentAssessments();
      console.log("Student assessments response:", data);
      setExams(data);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load assessments');
    } finally {
      setLoading(false);
    }
  };


  /* CHANGE: Helper function to get status badge styling */
  const getStatusBadge = (status: string) => {
    const styles = {
      upcoming: 'bg-blue-100 text-blue-700',
      available: 'bg-green-100 text-green-700',
      in_progress: 'bg-yellow-100 text-yellow-700',
      completed: 'bg-gray-100 text-gray-700',
      missed: 'bg-red-100 text-red-700',

      graded: 'bg-purple-100 text-purple-700'
    };

    const labels = {
      upcoming: 'Upcoming',
      available: 'Available',
      in_progress: 'In Progress',
      completed: 'Completed',
      missed: 'Missed',

      graded: 'Graded'
    };
    return (
      <Badge className={styles[status as keyof typeof styles] || styles.upcoming}>
        {labels[status as keyof typeof labels] || status}
      </Badge>
    );
  };

  /* CHANGE: Helper function to get exam type badge */
  const getTypeBadge = (type: string) => {
    const styles = {
      quiz: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
      test: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300',
      exam: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
      midterm: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300',
      final: 'bg-pink-100 text-pink-700 dark:bg-pink-900 dark:text-pink-300'
    };
    return (
      <Badge variant="outline" className={styles[type as keyof typeof styles]}>
        {type.charAt(0).toUpperCase() + type.slice(1)}
      </Badge>
    );
  };

  /* CHANGE: Filter exams based on search and tab */
  const filteredExams = exams.filter(exam => {
    const matchesSearch = exam.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exam.course_title.toLowerCase().includes(searchTerm.toLowerCase());

    if (activeTab === 'all') return matchesSearch;
    if (activeTab === 'available') return matchesSearch && (exam.status === 'available' || exam.status === 'in_progress');
    if (activeTab === 'upcoming') return matchesSearch && exam.status === 'upcoming';
    if (activeTab === 'completed') return matchesSearch && (exam.status === 'completed' || exam.status === 'missed');
    return matchesSearch;
  });



  const stats = {
    total: exams.length,
    available: exams.filter(e => e.status === 'available' || e.status === 'in_progress').length,
    upcoming: exams.filter(e => e.status === 'upcoming').length,
    completed: exams.filter(e => e.status === 'completed').length,
    averageScore: (() => {
      const scoredExams = exams.filter(e => typeof (e as any).best_score === 'number');
      if (scoredExams.length === 0) return 0;
      const totalScore = scoredExams.reduce((sum, e) => sum + ((e as any).best_score ?? 0), 0);
      return totalScore / scoredExams.length;
    })(),
    totalQuestions: exams.reduce((sum, e) => sum + ((e as any).question_count ?? 0), 0),
    totalPoints: exams.reduce((sum, e) => sum + ((e as any).total_points ?? 0), 0),
    totalAttemptsAllowed: exams.reduce((sum, e) => {
      if ((e as any).attempts === 'Unlimited' || (e as any).attempts == null) return sum;
      return sum + parseInt((e as any).attempts);
    }, 0),
  };


  const handleStartExam = (examId: string) => {
    navigate(`/student/exam/${examId}/take`);
  };

  const handleViewResult = (attemptId?: number | null) => {
    console.log("attemptId: ", attemptId);

    if (!attemptId) {
      console.error("Invalid attemptId:", attemptId);
      return;
    }

    navigate(`/student/exam/${attemptId}/result`);
  };

  /* CHANGE: Exam card component */
  const ExamCard = ({ exam }: { exam: Assessment }) => {
    const dueDate = exam.due_date ? new Date(exam.due_date) : null;
    const isOverdue = dueDate ? isPast(dueDate) && exam.status !== 'completed' : false;

    const attemptsAllowed = exam.attempts ?? 'Unlimited';
    const attemptsUsed = (exam as any).attempts_used ?? 0; // if you start tracking attempts later

    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-4 sm:p-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-4">
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                {getTypeBadge(exam.type)}
                {getStatusBadge(exam.status)}
              </div>
              <h3 className="font-semibold text-lg truncate">{exam.title}</h3>
              <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                <BookOpen className="h-4 w-4" />
                {exam.course_title} ({exam.course_code})
              </p>
              <p className="text-sm text-muted-foreground">
                Instructor: {exam.instructor_name ?? 'N/A'}
              </p>
            </div>

            {/* Score display for completed exams */}
            {exam.status === 'completed' && exam.is_graded && exam.score !== null && (
              <div className="text-right">
                <div className="text-2xl font-bold text-primary">{exam.score}/{exam.passing_score}</div>
                <p className="text-xs text-muted-foreground">Score</p>
              </div>
            )}
            {exam.attempt_status === 'submitted' && !exam.is_graded && (
              <div className="mb-3 text-sm text-yellow-600 flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Waiting for grading...
              </div>
            )}
          </div>

          {/* Info grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4 text-sm">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className={isOverdue ? 'text-destructive' : ''}>
                {dueDate ? format(dueDate, 'MMM d, yyyy') : 'No due date'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>{exam.time_limit ? `${exam.time_limit} min` : 'No limit'}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-2">
            {(exam.status === 'available' || exam.status === 'in_progress') && (
              <Button onClick={() => handleStartExam(exam.id)} className="gap-2">
                <Play className="h-4 w-4" />
                {exam.status === 'in_progress' ? 'Continue' : 'Start Exam'}
              </Button>
            )}
            {exam.attempt_status === 'submitted' && exam.is_graded && exam.attempt_id && (
              <Button
                variant="outline"
                onClick={() => handleViewResult(exam.attempt_id)}
                className="gap-2"
              >
                <Eye className="h-4 w-4" />
                View Results
              </Button>
            )}
            {exam.attempt_status === 'submitted' && !exam.is_graded && (
              <Button variant="outline" disabled className="gap-2">
                <Clock className="h-4 w-4" />
                Awaiting Results
              </Button>
            )}
            {exam.status === 'upcoming' && dueDate && (
              <Button variant="outline" disabled className="gap-2">
                <Timer className="h-4 w-4" />
                Starts {formatDistanceToNow(dueDate, { addSuffix: true })}
              </Button>
            )}
            {exam.status === 'missed' && (
              <Button variant="outline" disabled className="gap-2 text-destructive">
                <AlertCircle className="h-4 w-4" />
                Deadline Passed
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };


  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Tests & Exams</h1>
          <p className="text-muted-foreground mt-1">
            View and take your assessments
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => navigate('/student/exam-history')}
          className="gap-2"
        >
          <Trophy className="h-4 w-4" />
          View All Results
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900">
                <Play className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.available}</p>
                <p className="text-xs text-muted-foreground">Available Now</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900">
                <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.upcoming}</p>
                <p className="text-xs text-muted-foreground">Upcoming</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800">
                <CheckCircle className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.completed}</p>
                <p className="text-xs text-muted-foreground">Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900">
                <Trophy className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{Math.round(stats.averageScore)}%</p>
                <p className="text-xs text-muted-foreground">Avg Score</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

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
          <SelectTrigger className="w-full sm:w-[180px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="quiz">Quizzes</SelectItem>
            <SelectItem value="test">Tests</SelectItem>
            <SelectItem value="exam">Exams</SelectItem>
            <SelectItem value="midterm">Midterms</SelectItem>
            <SelectItem value="final">Finals</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-flex">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="available">Available</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {loading ? (
            <div className="grid gap-4">
              {[1, 2, 3].map(i => (
                <Skeleton key={i} className="h-48 w-full" />
              ))}
            </div>
          ) : filteredExams.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <FileQuestion className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No exams found</h3>
                <p className="text-muted-foreground text-center">
                  {activeTab === 'all'
                    ? "You don't have any exams yet."
                    : `No ${activeTab} exams at the moment.`}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {filteredExams.map(exam => (
                <ExamCard key={exam.id} exam={exam} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}