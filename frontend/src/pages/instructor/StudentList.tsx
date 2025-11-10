import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, Filter, Download, Mail, MoreVertical, 
  UserCheck, UserX, Eye, TrendingUp, Award 
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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

interface Student {
  id: string;
  name: string;
  email: string;
  registrationNumber: string;
  avatar?: string;
  course: string;
  enrolledDate: string;
  progress: number;
  grade: number;
  status: 'active' | 'inactive' | 'completed';
  lastActive: string;
}

export default function StudentList() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCourse, setFilterCourse] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  const students: Student[] = [
    {
      id: '1',
      name: 'John Doe',
      email: 'john.doe@example.com',
      registrationNumber: 'STU-2024-001',
      course: 'Database Systems',
      enrolledDate: '2024-01-15',
      progress: 75,
      grade: 85,
      status: 'active',
      lastActive: '2 hours ago'
    },
    {
      id: '2',
      name: 'Jane Smith',
      email: 'jane.smith@example.com',
      registrationNumber: 'STU-2024-002',
      course: 'Web Development',
      enrolledDate: '2024-01-18',
      progress: 90,
      grade: 92,
      status: 'active',
      lastActive: '1 day ago'
    },
    {
      id: '3',
      name: 'Mike Johnson',
      email: 'mike.j@example.com',
      registrationNumber: 'STU-2024-003',
      course: 'Database Systems',
      enrolledDate: '2024-01-20',
      progress: 45,
      grade: 68,
      status: 'active',
      lastActive: '3 days ago'
    },
    {
      id: '4',
      name: 'Sarah Williams',
      email: 'sarah.w@example.com',
      registrationNumber: 'STU-2024-004',
      course: 'Data Structures',
      enrolledDate: '2023-12-10',
      progress: 100,
      grade: 95,
      status: 'completed',
      lastActive: '1 week ago'
    },
    {
      id: '5',
      name: 'David Brown',
      email: 'david.b@example.com',
      registrationNumber: 'STU-2024-005',
      course: 'Web Development',
      enrolledDate: '2024-01-25',
      progress: 30,
      grade: 72,
      status: 'inactive',
      lastActive: '2 weeks ago'
    }
  ];

  const courses = ['all', 'Database Systems', 'Web Development', 'Data Structures'];
  const statuses = ['all', 'active', 'inactive', 'completed'];

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         student.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         student.registrationNumber.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCourse = filterCourse === 'all' || student.course === filterCourse;
    const matchesStatus = filterStatus === 'all' || student.status === filterStatus;
    
    return matchesSearch && matchesCourse && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'default';
      case 'inactive': return 'secondary';
      case 'completed': return 'outline';
      default: return 'default';
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const handleExport = () => {
    console.log('Exporting student data...');
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
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleExport} className="gap-2">
              <Download className="h-4 w-4" />
              Export
            </Button>
            <Button onClick={() => navigate('/instructor/messages')} className="gap-2">
              <Mail className="h-4 w-4" />
              Message All
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Students</p>
                  <p className="text-2xl font-bold">{students.length}</p>
                </div>
                <UserCheck className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active</p>
                  <p className="text-2xl font-bold">
                    {students.filter(s => s.status === 'active').length}
                  </p>
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
                  <p className="text-2xl font-bold">
                    {students.filter(s => s.status === 'completed').length}
                  </p>
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
                  <p className="text-2xl font-bold">
                    {Math.round(students.reduce((acc, s) => acc + s.progress, 0) / students.length)}%
                  </p>
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
                    placeholder="Search by name, email, or registration number..."
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

        {/* Students Table */}
        <Card>
          <CardHeader>
            <CardTitle>
              {filteredStudents.length} {filteredStudents.length === 1 ? 'Student' : 'Students'}
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
                  <TableHead>Grade</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Active</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={student.avatar} />
                          <AvatarFallback>{getInitials(student.name)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{student.name}</p>
                          <p className="text-sm text-muted-foreground">{student.email}</p>
                        </div>
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
                      <Badge variant={student.grade >= 80 ? 'default' : 'secondary'}>
                        {student.grade}%
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusColor(student.status)}>
                        {student.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {student.lastActive}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => navigate(`/instructor/student/${student.id}`)}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => navigate(`/instructor/messages?student=${student.id}`)}>
                            <Mail className="mr-2 h-4 w-4" />
                            Send Message
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => navigate(`/instructor/student-review?student=${student.id}`)}>
                            <Award className="mr-2 h-4 w-4" />
                            View Progress
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