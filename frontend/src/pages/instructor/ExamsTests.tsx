import { useState } from 'react';
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
  Trash2,
  Filter
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

export default function ExamsTests() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  const examsTests = [
    {
      id: 1,
      title: 'Database Systems Final Exam',
      course: 'Advanced Database Systems',
      type: 'exam',
      duration: '2 hours',
      totalMarks: 100,
      date: '2024-12-20',
      time: '09:00 AM',
      students: 45,
      status: 'scheduled',
      submitted: 0
    },
    {
      id: 2,
      title: 'Data Structures Midterm Test',
      course: 'Data Structures & Algorithms',
      type: 'test',
      duration: '1 hour',
      totalMarks: 50,
      date: '2024-12-15',
      time: '02:00 PM',
      students: 67,
      status: 'active',
      submitted: 45
    },
    {
      id: 3,
      title: 'Machine Learning Quiz 3',
      course: 'Machine Learning Fundamentals',
      type: 'quiz',
      duration: '30 minutes',
      totalMarks: 20,
      date: '2024-12-10',
      time: '10:00 AM',
      students: 38,
      status: 'completed',
      submitted: 38
    },
    {
      id: 4,
      title: 'Web Development Practical Test',
      course: 'Web Development Basics',
      type: 'test',
      duration: '1.5 hours',
      totalMarks: 60,
      date: '2024-12-18',
      time: '11:00 AM',
      students: 52,
      status: 'draft',
      submitted: 0
    }
  ];

  const stats = [
    {
      title: 'Total Exams/Tests',
      value: '12',
      description: 'This semester',
      icon: FileQuestion,
    },
    {
      title: 'Active Assessments',
      value: '3',
      description: 'Currently running',
      icon: Clock,
    },
    {
      title: 'Pending Grading',
      value: '45',
      description: 'Submissions to review',
      icon: Users,
    },
    {
      title: 'Scheduled',
      value: '4',
      description: 'Upcoming assessments',
      icon: Calendar,
    },
  ];

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

  return (
    <InstructorLayout>
      <div className="container py-6 lg:py-8 space-y-6 lg:space-y-8 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-2">
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

        {/* Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {stats.map((stat, index) => (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Assessments</CardTitle>
            <CardDescription>
              View and manage all your tests and exams
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Search and Filters */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
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
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Exams/Tests Table */}
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
                        <div className="space-y-1">
                          <p className="font-medium">{exam.title}</p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span className="md:hidden">{exam.course}</span>
                            <span>{exam.duration}</span>
                            <span>•</span>
                            <span>{exam.totalMarks} marks</span>
                          </div>
                          <p className="text-xs text-muted-foreground lg:hidden">
                            {exam.date} at {exam.time}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">{exam.course}</TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <Badge variant="outline" className="capitalize">
                          {exam.type}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <div className="space-y-1 text-sm">
                          <p>{exam.date}</p>
                          <p className="text-muted-foreground">{exam.time}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <Badge className={getStatusColor(exam.status)}>
                            {exam.status}
                          </Badge>
                          {exam.submitted > 0 && (
                            <p className="text-xs text-muted-foreground">
                              {exam.submitted}/{exam.students} submitted
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button size="sm" variant="ghost" asChild>
                            <Link to={`/instructor/exam/${exam.id}`}>
                              <Eye className="h-4 w-4" />
                            </Link>
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
    </InstructorLayout>
  );
}
