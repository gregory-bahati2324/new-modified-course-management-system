import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, Download, CheckCircle, Clock,
  MoreVertical, Eye, Edit, FileText
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { InstructorLayout } from '@/components/layout/InstructorLayout';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { markingGradingService, StudentSubmission } from '@/services/markingGradingService';

// -----------------------------------------------------------------------------
// Local shape used by this page. Only fields the backend actually returns
// (see marking_grading service's /grading/dashboard aggregator) are kept.
// Fields the mock data used to invent — registration number, attempt number,
// and a "late" status — aren't provided by the backend, so they've been
// removed rather than faked.
// -----------------------------------------------------------------------------
interface Submission {
  id: string;
  studentId: string;
  studentName: string;
  assignmentId: string;
  assignmentTitle: string;
  courseId: string;
  course: string;
  submittedAt: string;
  status: 'pending' | 'graded';
  grade?: number;
  maxGrade: number;
  type: string;
  submissionType: string; // "assignment" | "assessment" — used for routing to the grading page
}

function mapSubmission(sub: StudentSubmission): Submission {
  return {
    id: sub.id,
    studentId: sub.student_id,
    studentName: sub.student_name,
    assignmentId: sub.assignment_id,
    assignmentTitle: sub.assignment_title,
    courseId: sub.course_id,
    course: sub.course_name,
    submittedAt: sub.submitted_at,
    status: sub.grade !== undefined && sub.grade !== null ? 'graded' : 'pending',
    grade: sub.grade,
    maxGrade: sub.max_score ?? 100,
    type: sub.type,
    submissionType: sub.submission_type,
  };
}

export default function GradeSubmissions() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCourse, setFilterCourse] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubmissions = async () => {
      setLoading(true);
      try {
        const data = await markingGradingService.getStudentSubmissions();
        setSubmissions(data.map(mapSubmission));
      } catch (error) {
        toast.error(
          error instanceof Error
            ? `Failed to load submissions: ${error.message}`
            : 'Failed to load submissions.'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchSubmissions();
  }, []);

  // Courses and statuses are derived from the real data rather than hardcoded,
  // since the set of courses/statuses is whatever the backend actually returns.
  const courses = useMemo(() => {
    const unique = Array.from(new Set(submissions.map(s => s.course).filter(Boolean)));
    return ['all', ...unique];
  }, [submissions]);

  const statuses = ['all', 'pending', 'graded'];

  const filteredSubmissions = submissions.filter(submission => {
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      submission.studentName.toLowerCase().includes(query) ||
      submission.assignmentTitle.toLowerCase().includes(query);
    const matchesCourse = filterCourse === 'all' || submission.course === filterCourse;
    const matchesStatus = filterStatus === 'all' || submission.status === filterStatus;

    return matchesSearch && matchesCourse && matchesStatus;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'graded': return <CheckCircle className="h-4 w-4" />;
      default: return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'secondary';
      case 'graded': return 'default';
      default: return 'default';
    }
  };

  const pendingCount = submissions.filter(s => s.status === 'pending').length;
  const gradedCount = submissions.filter(s => s.status === 'graded').length;

  const handleExport = async () => {
    if (filteredSubmissions.length === 0) {
      toast.error('There are no submissions to export.');
      return;
    }

    try {
      const XLSX = await import('xlsx');

      const rows = filteredSubmissions.map(s => ({
        'Student Name': s.studentName,
        'Student ID': s.studentId,
        'Course': s.course,
        'Assignment/Assessment': s.assignmentTitle,
        'Type': s.type,
        'Submitted At': format(new Date(s.submittedAt), 'yyyy-MM-dd HH:mm'),
        'Status': s.status,
        'Grade': s.grade ?? '',
        'Max Grade': s.maxGrade,
      }));

      const worksheet = XLSX.utils.json_to_sheet(rows);
      worksheet['!cols'] = [
        { wch: 22 }, { wch: 14 }, { wch: 20 }, { wch: 28 },
        { wch: 12 }, { wch: 18 }, { wch: 10 }, { wch: 8 }, { wch: 10 },
      ];

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Grades');
      XLSX.writeFile(workbook, `grades-export-${format(new Date(), 'yyyy-MM-dd')}.xlsx`);

      toast.success('Grades exported successfully.');
    } catch (error) {
      toast.error('Failed to export grades.');
    }
  };

  const handleOpenSubmission = (submission: Submission) => {
    navigate(`/instructor/marking/submission/${submission.id}`, {
      state: { submissionType: submission.submissionType },
    });
  };

  if (loading) {
    return (
      <InstructorLayout>
        <div className="container py-8">
          <p className="text-muted-foreground">Loading submissions...</p>
        </div>
      </InstructorLayout>
    );
  }

  return (
    <InstructorLayout>
      <div className="container py-8 space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Grade Submissions</h1>
            <p className="text-muted-foreground">
              Review and grade student assignment submissions
            </p>
          </div>
          <Button variant="outline" onClick={handleExport} className="gap-2">
            <Download className="h-4 w-4" />
            Export Grades
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Submissions</p>
                  <p className="text-2xl font-bold">{submissions.length}</p>
                </div>
                <FileText className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending Review</p>
                  <p className="text-2xl font-bold">{pendingCount}</p>
                </div>
                <Clock className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Graded</p>
                  <p className="text-2xl font-bold">{gradedCount}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by student name or assignment..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={filterCourse} onValueChange={setFilterCourse}>
                <SelectTrigger className="w-full md:w-[200px]">
                  <SelectValue placeholder="All Courses" />
                </SelectTrigger>
                <SelectContent>
                  {courses.map(course => (
                    <SelectItem key={course} value={course}>
                      {course === 'all' ? 'All Courses' : course}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  {statuses.map(status => (
                    <SelectItem key={status} value={status}>
                      {status === 'all' ? 'All Statuses' : status.charAt(0).toUpperCase() + status.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Submissions Table */}
        <Card>
          <CardHeader>
            <CardTitle>
              {filteredSubmissions.length} {filteredSubmissions.length === 1 ? 'Submission' : 'Submissions'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredSubmissions.length === 0 ? (
              <p className="text-muted-foreground text-sm py-8 text-center">
                No submissions found.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Assignment</TableHead>
                    <TableHead>Course</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Grade</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSubmissions.map((submission) => (
                    <TableRow key={submission.id}>
                      <TableCell>
                        <p className="font-medium">{submission.studentName}</p>
                      </TableCell>
                      <TableCell>
                        <p className="font-medium">{submission.assignmentTitle}</p>
                      </TableCell>
                      <TableCell>{submission.course}</TableCell>
                      <TableCell className="text-sm">
                        {format(new Date(submission.submittedAt), 'MMM dd, yyyy')}
                        <br />
                        <span className="text-muted-foreground">
                          {format(new Date(submission.submittedAt), 'hh:mm a')}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusColor(submission.status)} className="gap-1">
                          {getStatusIcon(submission.status)}
                          {submission.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {submission.grade !== undefined && submission.grade !== null ? (
                          <div>
                            <span className="font-bold text-lg">{submission.grade}</span>
                            <span className="text-muted-foreground">/{submission.maxGrade}</span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">Not graded</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleOpenSubmission(submission)}>
                              <Edit className="mr-2 h-4 w-4" />
                              {submission.status === 'graded' ? 'Edit Grade' : 'Grade Now'}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleOpenSubmission(submission)}>
                              <Eye className="mr-2 h-4 w-4" />
                              View Submission
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </InstructorLayout>
  );
}