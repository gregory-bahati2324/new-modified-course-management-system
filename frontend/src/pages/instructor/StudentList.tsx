import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, Download, Mail, MoreVertical,
  UserCheck, Eye, TrendingUp, Award, Loader2
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
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
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
import { Progress } from '@/components/ui/progress';
import { InstructorLayout } from '@/components/layout/InstructorLayout';
import { courseService } from '@/services/courseService';
import type { Course, Enrollment } from '@/services/courseService';
import { authService } from '@/services/authService';
import type { UserProfile } from '@/services/authService';
import { useToast } from '@/hooks/use-toast';

// One row = one student enrolled in one of this instructor's courses.
// Every field here comes from the backend:
//   - name / registrationNumber -> auth service   GET /auth/student/{id}/details
//   - course                    -> course service GET /api/courses/me
//   - progress / status         -> course service GET /api/courses/enrollments/course/{id}
//
// The backend has no email, avatar, per-student grade or last-active data,
// so those are intentionally not shown on this page.
type EnrollmentStatus = 'in_progress' | 'completed';

interface StudentRow {
  enrollmentId: string;
  studentId: string;
  name: string;
  registrationNumber: string;
  courseId: string;
  course: string;
  progress: number;
  status: EnrollmentStatus;
}

const STATUS_LABELS: Record<EnrollmentStatus, string> = {
  in_progress: 'In Progress',
  completed: 'Completed',
};

export default function StudentList() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterCourse, setFilterCourse] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  const [courses, setCourses] = useState<Course[]>([]);
  const [students, setStudents] = useState<StudentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const loadStudents = useCallback(async () => {
    setLoading(true);
    setLoadError(null);

    try {
      // 1. The instructor's own courses
      const { courses: myCourses } = await courseService.getCourses({});
      setCourses(myCourses);

      // 2. Enrollments for each course (one failing course shouldn't blank the page)
      const enrollmentResults = await Promise.allSettled(
        myCourses.map((course) => courseService.getCourseEnrollments(course.id))
      );

      const enrolled: { course: Course; enrollment: Enrollment }[] = [];
      let failedCourses = 0;
      enrollmentResults.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          result.value.forEach((enrollment) =>
            enrolled.push({ course: myCourses[index], enrollment })
          );
        } else {
          failedCourses += 1;
        }
      });

      // 3. Student identities (deduplicated: a student may be in several courses)
      const studentIds = Array.from(new Set(enrolled.map((e) => e.enrollment.student_id)));
      const detailResults = await Promise.allSettled(
        studentIds.map((id) => authService.getStudentDetails(id))
      );
      const studentDetails = new Map<string, UserProfile>();
      detailResults.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          studentDetails.set(studentIds[index], result.value);
        }
      });

      // 4. Build the table rows
      const rows: StudentRow[] = enrolled.map(({ course, enrollment }) => {
        const details = studentDetails.get(enrollment.student_id);
        const fullName = details
          ? `${details.first_name} ${details.last_name}`.trim()
          : '';
        const progress = Math.min(100, Math.max(0, Math.round(enrollment.progress ?? 0)));

        return {
          enrollmentId: enrollment.id,
          studentId: enrollment.student_id,
          // If the identity lookup failed, fall back to the raw id rather than inventing a name.
          name: fullName || enrollment.student_id,
          registrationNumber: details?.registrationNumber ?? '—',
          courseId: course.id,
          course: course.title,
          progress,
          status: enrollment.completed ? 'completed' : 'in_progress',
        };
      });

      setStudents(rows);

      if (failedCourses > 0) {
        toast({
          title: 'Some students could not be loaded',
          description: `Enrollments failed to load for ${failedCourses} of ${myCourses.length} course(s).`,
          variant: 'destructive',
        });
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load students';
      setLoadError(message);
      toast({
        title: 'Error',
        description: 'Failed to load students',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadStudents();
  }, [loadStudents]);

  const filteredStudents = students.filter(student => {
    const query = searchQuery.toLowerCase();
    const matchesSearch = student.name.toLowerCase().includes(query) ||
                         student.registrationNumber.toLowerCase().includes(query);
    const matchesCourse = filterCourse === 'all' || student.courseId === filterCourse;
    const matchesStatus = filterStatus === 'all' || student.status === filterStatus;

    return matchesSearch && matchesCourse && matchesStatus;
  });

  // "Total Students" counts distinct people; a student enrolled in two of the
  // instructor's courses appears in two rows but is still one student.
  const countStudents = (rows: StudentRow[]) => new Set(rows.map(s => s.studentId)).size;
  const inProgressCount = students.filter(s => s.status === 'in_progress').length;
  const completedCount = students.filter(s => s.status === 'completed').length;
  const averageProgress = students.length
    ? Math.round(students.reduce((acc, s) => acc + s.progress, 0) / students.length)
    : 0;
  const filteredStudentCount = countStudents(filteredStudents);

  const getStatusColor = (status: EnrollmentStatus) => {
    return status === 'completed' ? 'outline' : 'default';
  };

  const getInitials = (name: string) => {
    return name.split(' ').filter(Boolean).map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const handleExport = () => {
    console.log('Exporting student data...');
  };

  const renderTableBody = () => {
    if (loading) {
      return (
        <TableRow>
          <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
            <div className="flex items-center justify-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading students...
            </div>
          </TableCell>
        </TableRow>
      );
    }

    if (loadError) {
      return (
        <TableRow>
          <TableCell colSpan={6} className="h-32 text-center">
            <p className="mb-3 text-muted-foreground">{loadError}</p>
            <Button variant="outline" size="sm" onClick={loadStudents}>
              Try again
            </Button>
          </TableCell>
        </TableRow>
      );
    }

    if (filteredStudents.length === 0) {
      return (
        <TableRow>
          <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
            {students.length === 0
              ? 'No students are enrolled in your courses yet.'
              : 'No students match your filters.'}
          </TableCell>
        </TableRow>
      );
    }

    return filteredStudents.map((student) => (
      <TableRow key={student.enrollmentId}>
        <TableCell>
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarFallback>{getInitials(student.name)}</AvatarFallback>
            </Avatar>
            <p className="font-medium">{student.name}</p>
          </div>
        </TableCell>
        <TableCell className="font-mono text-sm">
          {student.registrationNumber}
        </TableCell>
        <TableCell>{student.course}</TableCell>
        <TableCell>
          <div className="space-y-1">
            <Progress value={student.progress} className="h-2" />
            <p className="text-xs text-muted-foreground">{student.progress}%</p>
          </div>
        </TableCell>
        <TableCell>
          <Badge variant={getStatusColor(student.status)}>
            {STATUS_LABELS[student.status]}
          </Badge>
        </TableCell>
        <TableCell className="text-right">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => navigate(`/instructor/student/${student.studentId}`)}>
                <Eye className="mr-2 h-4 w-4" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate(`/instructor/messages?student=${student.studentId}`)}>
                <Mail className="mr-2 h-4 w-4" />
                Send Message
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate(`/instructor/student-review?student=${student.studentId}`)}>
                <Award className="mr-2 h-4 w-4" />
                View Progress
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </TableCell>
      </TableRow>
    ));
  };

  return (
    <InstructorLayout>
      <div className="container py-8 space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Student List</h1>
            <p className="text-muted-foreground">
              Manage and monitor all enrolled students
            </p>
          </div>
          
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Students</p>
                  <p className="text-2xl font-bold">{countStudents(students)}</p>
                </div>
                <UserCheck className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">In Progress</p>
                  <p className="text-2xl font-bold">{inProgressCount}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Completed</p>
                  <p className="text-2xl font-bold">{completedCount}</p>
                </div>
                <Award className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Avg. Progress</p>
                  <p className="text-2xl font-bold">{averageProgress}%</p>
                </div>
                <TrendingUp className="h-8 w-8 text-orange-500" />
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
                    placeholder="Search by name or registration number..."
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
                  <SelectItem value="all">All Courses</SelectItem>
                  {courses.map(course => (
                    <SelectItem key={course.id} value={course.id}>
                      {course.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="in_progress">{STATUS_LABELS.in_progress}</SelectItem>
                  <SelectItem value="completed">{STATUS_LABELS.completed}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Students Table */}
        <Card>
          <CardHeader>
            <CardTitle>
              {loading
                ? 'Students'
                : `${filteredStudentCount} ${filteredStudentCount === 1 ? 'Student' : 'Students'}`}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Registration No.</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>{renderTableBody()}</TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </InstructorLayout>
  );
}
