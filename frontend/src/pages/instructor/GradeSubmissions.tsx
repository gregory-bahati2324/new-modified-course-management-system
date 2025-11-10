import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, Filter, Download, CheckCircle, Clock, 
  AlertCircle, MoreVertical, Eye, Edit, FileText 
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

interface Submission {
  id: string;
  studentName: string;
  studentId: string;
  registrationNumber: string;
  assignmentTitle: string;
  assignmentId: string;
  course: string;
  submittedAt: string;
  status: 'pending' | 'graded' | 'late';
  grade?: number;
  maxGrade: number;
  attemptNumber: number;
}

export default function GradeSubmissions() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCourse, setFilterCourse] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  const submissions: Submission[] = [
    {
      id: '1',
      studentName: 'John Doe',
      studentId: '1',
      registrationNumber: 'STU-2024-001',
      assignmentTitle: 'Database Design Project',
      assignmentId: 'a1',
      course: 'Database Systems',
      submittedAt: '2024-03-15T14:30:00Z',
      status: 'pending',
      maxGrade: 100,
      attemptNumber: 1
    },
    {
      id: '2',
      studentName: 'Jane Smith',
      studentId: '2',
      registrationNumber: 'STU-2024-002',
      assignmentTitle: 'SQL Query Optimization',
      assignmentId: 'a2',
      course: 'Database Systems',
      submittedAt: '2024-03-14T10:15:00Z',
      status: 'graded',
      grade: 92,
      maxGrade: 100,
      attemptNumber: 1
    },
    {
      id: '3',
      studentName: 'Mike Johnson',
      studentId: '3',
      registrationNumber: 'STU-2024-003',
      assignmentTitle: 'Database Design Project',
      assignmentId: 'a1',
      course: 'Database Systems',
      submittedAt: '2024-03-16T23:45:00Z',
      status: 'late',
      maxGrade: 100,
      attemptNumber: 2
    },
    {
      id: '4',
      studentName: 'Sarah Williams',
      studentId: '4',
      registrationNumber: 'STU-2024-004',
      assignmentTitle: 'React Component Development',
      assignmentId: 'a3',
      course: 'Web Development',
      submittedAt: '2024-03-13T16:20:00Z',
      status: 'graded',
      grade: 95,
      maxGrade: 100,
      attemptNumber: 1
    },
    {
      id: '5',
      studentName: 'David Brown',
      studentId: '5',
      registrationNumber: 'STU-2024-005',
      assignmentTitle: 'SQL Query Optimization',
      assignmentId: 'a2',
      course: 'Database Systems',
      submittedAt: '2024-03-15T09:30:00Z',
      status: 'pending',
      maxGrade: 100,
      attemptNumber: 1
    }
  ];

  const courses = ['all', 'Database Systems', 'Web Development', 'Data Structures'];
  const statuses = ['all', 'pending', 'graded', 'late'];

  const filteredSubmissions = submissions.filter(submission => {
    const matchesSearch = 
      submission.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      submission.registrationNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      submission.assignmentTitle.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCourse = filterCourse === 'all' || submission.course === filterCourse;
    const matchesStatus = filterStatus === 'all' || submission.status === filterStatus;
    
    return matchesSearch && matchesCourse && matchesStatus;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'graded': return <CheckCircle className="h-4 w-4" />;
      case 'late': return <AlertCircle className="h-4 w-4" />;
      default: return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'secondary';
      case 'graded': return 'default';
      case 'late': return 'destructive';
      default: return 'default';
    }
  };

  const pendingCount = submissions.filter(s => s.status === 'pending').length;
  const gradedCount = submissions.filter(s => s.status === 'graded').length;
  const lateCount = submissions.filter(s => s.status === 'late').length;

  const handleExport = () => {
    console.log('Exporting submissions...');
  };

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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Late Submissions</p>
                  <p className="text-2xl font-bold">{lateCount}</p>
                </div>
                <AlertCircle className="h-8 w-8 text-red-500" />
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
                    placeholder="Search by student name, registration number, or assignment..."
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
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Assignment</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Attempt</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Grade</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSubmissions.map((submission) => (
                  <TableRow key={submission.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{submission.studentName}</p>
                        <p className="text-sm text-muted-foreground font-mono">
                          {submission.registrationNumber}
                        </p>
                      </div>
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
                      <Badge variant="outline">
                        Attempt {submission.attemptNumber}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusColor(submission.status)} className="gap-1">
                        {getStatusIcon(submission.status)}
                        {submission.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {submission.grade !== undefined ? (
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
                          <DropdownMenuItem 
                            onClick={() => navigate(`/instructor/course/${submission.course}/assignment/${submission.assignmentId}/submission/${submission.id}/grade`)}
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            {submission.status === 'graded' ? 'Edit Grade' : 'Grade Now'}
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => navigate(`/instructor/submission/${submission.id}/view`)}
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            View Submission
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => navigate(`/instructor/student/${submission.studentId}`)}
                          >
                            <FileText className="mr-2 h-4 w-4" />
                            Student Profile
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </InstructorLayout>
  );
}