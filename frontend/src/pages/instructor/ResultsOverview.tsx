import { useState } from 'react';
import { Download, Filter, Search, TrendingUp, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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
import { InstructorLayout } from '@/components/layout/InstructorLayout';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface StudentResult {
  id: string;
  studentName: string;
  studentAvatar: string;
  course: string;
  module: string;
  assessmentType: string;
  assessmentTitle: string;
  score: number;
  maxScore: number;
  percentage: number;
  letterGrade: string;
  markingMode: 'AI' | 'Manual' | 'Hybrid';
  dateMarked: string;
}

export default function ResultsOverview() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCourse, setFilterCourse] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  const results: StudentResult[] = [
    {
      id: '1',
      studentName: 'John Doe',
      studentAvatar: 'JD',
      course: 'Database Systems',
      module: 'Advanced SQL',
      assessmentType: 'Exam',
      assessmentTitle: 'Midterm Exam',
      score: 85,
      maxScore: 100,
      percentage: 85,
      letterGrade: 'B',
      markingMode: 'AI',
      dateMarked: '2024-03-15'
    },
    {
      id: '2',
      studentName: 'Jane Smith',
      studentAvatar: 'JS',
      course: 'Web Development',
      module: 'React Fundamentals',
      assessmentType: 'Assignment',
      assessmentTitle: 'React Project',
      score: 95,
      maxScore: 100,
      percentage: 95,
      letterGrade: 'A',
      markingMode: 'Manual',
      dateMarked: '2024-03-14'
    },
    {
      id: '3',
      studentName: 'Mike Johnson',
      studentAvatar: 'MJ',
      course: 'Database Systems',
      module: 'Database Design',
      assessmentType: 'Quiz',
      assessmentTitle: 'Weekly Quiz 5',
      score: 78,
      maxScore: 100,
      percentage: 78,
      letterGrade: 'C+',
      markingMode: 'Hybrid',
      dateMarked: '2024-03-16'
    },
    {
      id: '4',
      studentName: 'Sarah Williams',
      studentAvatar: 'SW',
      course: 'Data Structures',
      module: 'Trees and Graphs',
      assessmentType: 'Test',
      assessmentTitle: 'Data Structures Test',
      score: 92,
      maxScore: 100,
      percentage: 92,
      letterGrade: 'A-',
      markingMode: 'AI',
      dateMarked: '2024-03-13'
    }
  ];

  const courses = ['all', 'Database Systems', 'Web Development', 'Data Structures'];
  const assessmentTypes = ['all', 'Assignment', 'Quiz', 'Test', 'Exam'];

  const filteredResults = results.filter(result => {
    const matchesSearch =
      result.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      result.assessmentTitle.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCourse = filterCourse === 'all' || result.course === filterCourse;
    const matchesType = filterType === 'all' || result.assessmentType === filterType;
    return matchesSearch && matchesCourse && matchesType;
  });

  const averageScore = filteredResults.reduce((sum, r) => sum + r.percentage, 0) / filteredResults.length;
  const passRate = (filteredResults.filter(r => r.percentage >= 60).length / filteredResults.length) * 100;

  const getGradeColor = (grade: string) => {
    if (grade.startsWith('A')) return 'bg-green-500';
    if (grade.startsWith('B')) return 'bg-blue-500';
    if (grade.startsWith('C')) return 'bg-yellow-500';
    if (grade.startsWith('D')) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getMarkingModeBadge = (mode: string) => {
    const variants = {
      'AI': 'default' as const,
      'Manual': 'secondary' as const,
      'Hybrid': 'outline' as const
    };
    return <Badge variant={variants[mode as keyof typeof variants]}>{mode}</Badge>;
  };

  const handleExport = () => {
    console.log('Exporting results...');
  };

  return (
    <InstructorLayout>
      <div className="container py-8 space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Results Overview</h1>
            <p className="text-muted-foreground">
              All marked and graded assessments across courses
            </p>
          </div>
          <Button variant="outline" onClick={handleExport} className="gap-2">
            <Download className="h-4 w-4" />
            Export All
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Results</p>
                  <p className="text-3xl font-bold">{filteredResults.length}</p>
                </div>
                <Award className="h-10 w-10 text-primary" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Average Score</p>
                  <p className="text-3xl font-bold">{averageScore.toFixed(1)}%</p>
                </div>
                <TrendingUp className="h-10 w-10 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pass Rate</p>
                  <p className="text-3xl font-bold">{passRate.toFixed(0)}%</p>
                </div>
                <TrendingUp className="h-10 w-10 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">AI Marked</p>
                  <p className="text-3xl font-bold">
                    {results.filter(r => r.markingMode === 'AI').length}
                  </p>
                </div>
                <Award className="h-10 w-10 text-purple-500" />
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
                    placeholder="Search by student name or assessment..."
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
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  {assessmentTypes.map(type => (
                    <SelectItem key={type} value={type}>
                      {type === 'all' ? 'All Types' : type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Results Table */}
        <Card>
          <CardHeader>
            <CardTitle>
              {filteredResults.length} {filteredResults.length === 1 ? 'Result' : 'Results'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Course & Module</TableHead>
                  <TableHead>Assessment</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Grade</TableHead>
                  <TableHead>Marking Mode</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredResults.map((result) => (
                  <TableRow key={result.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                            {result.studentAvatar}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{result.studentName}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium text-sm">{result.course}</p>
                        <p className="text-xs text-muted-foreground">{result.module}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="font-medium">{result.assessmentTitle}</p>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{result.assessmentType}</Badge>
                    </TableCell>
                    <TableCell>
                      <div>
                        <span className="font-bold text-lg">{result.score}</span>
                        <span className="text-muted-foreground">/{result.maxScore}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">{result.percentage}%</p>
                    </TableCell>
                    <TableCell>
                      <Badge className={`${getGradeColor(result.letterGrade)} text-white`}>
                        {result.letterGrade}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {getMarkingModeBadge(result.markingMode)}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(result.dateMarked).toLocaleDateString()}
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