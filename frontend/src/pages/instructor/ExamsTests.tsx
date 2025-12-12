import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FileQuestion,
  Plus,
  Search,
  Calendar,
  Clock,
  Users,
  Edit,
  Eye,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { InstructorLayout } from '@/components/layout/InstructorLayout';
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

import { assessmentService } from '@/services/assessmentService';
import { courseService } from '@/services/courseService';
import AssessmentPreview from '@/components/AssessmentPreview';

export default function ExamsTests() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  const [examsTests, setExamsTests] = useState<any[]>([]);
  const [courseMap, setCourseMap] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewAssessment, setPreviewAssessment] = useState(null);
  const [previewQuestions, setPreviewQuestions] = useState([]);


  // Load courses
  useEffect(() => {
    const loadData = async () => {
      try {
         // 1️⃣ Load courses and create local map
        const coursesResponse = await courseService.getCourses();
        const courseMapping: Record<string, string> = {};
        coursesResponse.courses.forEach((course) => {
          courseMapping[course.id] = course.title;
        });
        setCourseMap(courseMapping);

        // 2️⃣ Load assessments
        const assessments = await assessmentService.getAssessments();

        // 3️⃣ Map assessments using local map (100% ready)
        const mapped = assessments.map((a: any) => ({
          id: a.id,
          title: a.title,
          course: courseMapping[a.course_id] || 'Unknown Course',
          type: a.type,
          duration: a.time_limit ? `${a.time_limit} min` : "N/A",
          totalMarks: a.passing_score || 0,
          date: a.due_date ? a.due_date.split("T")[0] : "—",
          time: a.due_date
            ? new Date(a.due_date).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })
            : "",
          students: 0,
          status: a.status,
          submitted: 0,
        }));

        setExamsTests(mapped);
      } catch (error) {
        console.error("Failed loading data", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);


  const filteredExams = examsTests.filter((exam) => {
    const matchesSearch = exam.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exam.course.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || exam.type === filterType;
    const matchesStatus = filterStatus === 'all' || exam.status === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-success text-success-foreground';
      case 'scheduled':
        return 'bg-primary text-primary-foreground';
      case 'completed':
        return 'bg-secondary text-secondary-foreground';
      case 'draft':
        return 'bg-muted text-muted-foreground';
      default:
        return '';
    }
  };

  if (loading) {
    return (
      <InstructorLayout>
        <div className="p-6 text-center text-lg">Loading assessments...</div>
      </InstructorLayout>
    );
  }

  return (
    <InstructorLayout>
      <div className="container py-6 lg:py-8 space-y-6 lg:space-y-8 animate-fade-in">

        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold">Tests & Exams</h1>
            <p className="text-muted-foreground">
              Create, manage, and monitor student assessments
            </p>
          </div>
          <Button asChild>
            <Link to="/instructor/create-assessment">
              <Plus className="mr-2 h-4 w-4" />
              Create Assessment
            </Link>
          </Button>
        </div>

        {/* Table */}
        <Card>
          <CardHeader>
            <CardTitle>Assessments</CardTitle>
            <CardDescription>View and manage your assessments</CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">

            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 text-muted-foreground -translate-y-1/2" />
                <Input
                  placeholder="Search assessments..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="exam">Exams</SelectItem>
                  <SelectItem value="test">Tests</SelectItem>
                  <SelectItem value="quiz">Quizzes</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="published">Scheduled</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Assessment</TableHead>
                    <TableHead className="hidden md:table-cell">Course</TableHead>
                    <TableHead className="hidden lg:table-cell">Type</TableHead>
                    <TableHead className="hidden lg:table-cell">Date & Time</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {filteredExams.map((exam) => (
                    <TableRow key={exam.id}>
                      <TableCell>
                        <p className="font-medium">{exam.title}</p>
                        <p className="text-xs text-muted-foreground lg:hidden">
                          {exam.date} at {exam.time}
                        </p>
                      </TableCell>

                      <TableCell className="hidden md:table-cell">{exam.course}</TableCell>

                      <TableCell className="hidden lg:table-cell">
                        <Badge variant="outline">{exam.type}</Badge>
                      </TableCell>

                      <TableCell className="hidden lg:table-cell">
                        <div>
                          <p>{exam.date}</p>
                          <p className="text-muted-foreground">{exam.time}</p>
                        </div>
                      </TableCell>

                      <TableCell>
                        <Badge className={getStatusColor(exam.status)}>
                          {exam.status}
                        </Badge>
                      </TableCell>

                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            onClick={async () => {
                              try {
                                const data = await assessmentService.getAssessmentDetail(exam.id);

                                setPreviewAssessment({
                                  title: data.title,
                                  type: data.type,
                                  description: data.description,
                                  course: data.course_id,
                                  module: data.module_id,
                                  dueDate: data.due_date?.split("T")[0],
                                  dueTime: data.due_date
                                    ? new Date(data.due_date).toLocaleTimeString([], {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })
                                    : "",
                                  timeLimit: data.time_limit,
                                  attempts: data.attempts,
                                  passingScore: data.passing_score,
                                  shuffleQuestions: data.shuffle_questions,
                                  showAnswers: data.show_answers,
                                });

                                setPreviewQuestions(data.questions || []);

                                setPreviewOpen(true);
                              } catch (error) {
                                console.error("Failed to load assessment", error);
                              }
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>


                          <Button size="sm" variant="ghost" asChild>
                            <Link to={`/instructor/exam/${exam.id}/edit`}>
                              <Edit className="h-4 w-4" />
                            </Link>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

          </CardContent>
        </Card>
      </div>

      <AssessmentPreview
        isOpen={previewOpen}
        onClose={() => setPreviewOpen(false)}
        assessmentData={previewAssessment}
        questions={previewQuestions}
      />

    </InstructorLayout>
  );
}