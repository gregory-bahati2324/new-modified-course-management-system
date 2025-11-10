import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Filter, FileText, Calendar, Clock, Users, Eye, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { InstructorLayout } from '@/components/layout/InstructorLayout';
import { assignmentService } from '@/services/assignmentService';
import { courseService } from '@/services/courseService_fake';
import type { Assignment } from '@/services/assignmentService';
import type { Course } from '@/services/courseService';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { useParams } from "react-router-dom";

export default function InstructorAssignments() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [courseFilter, setCourseFilter] = useState<string>('all');
  const { toast } = useToast();

  const { id } = useParams();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [assignmentsData, coursesData] = await Promise.all([
        assignmentService.getAssignments(),
        courseService.getCourses({}),
      ]);
      setAssignments(assignmentsData);
      setCourses(coursesData.courses);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load assignments',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredAssignments = assignments.filter(assignment => {
    const matchesSearch = assignment.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      assignment.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || assignment.status === statusFilter;
    const matchesCourse = courseFilter === 'all' || assignment.course_id === courseFilter;
    return matchesSearch && matchesStatus && matchesCourse;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'draft':
        return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'closed':
        return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
      default:
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
    }
  };

  const activeAssignments = filteredAssignments.filter(a => !a.graded && !a.submitted);
  const gradedAssignments = filteredAssignments.filter(a => a.graded);
  const submittedAssignments = filteredAssignments.filter(a => a.submitted && !a.graded);

  const AssignmentCard = ({ assignment }: { assignment: Assignment }) => (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1 flex-1">
            <CardTitle className="line-clamp-1">{assignment.title}</CardTitle>
            <CardDescription className="line-clamp-2">{assignment.description}</CardDescription>
          </div>
          <Badge className={getStatusColor(assignment.status)}>
            {assignment.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {courses.find(c => c.id === assignment.course_id)?.title || 'Unknown Course'}
          </span>
        </div>

        <div className="space-y-2">
          <div className="flex items-center text-sm text-muted-foreground">
            <Calendar className="h-4 w-4 mr-2" />
            Due: {new Date(assignment.due_date).toLocaleDateString()}
          </div>
          <div className="flex items-center text-sm">
            <Badge variant={assignment.graded ? 'default' : assignment.submitted ? 'secondary' : 'outline'}>
              {assignment.status}
            </Badge>
          </div>
          <div className="flex items-center text-sm font-medium">
            <FileText className="h-4 w-4 mr-2" />
            {assignment.total_points} points
          </div>
        </div>
      </CardContent>
      <CardFooter className="gap-2">
        <Link to={`/instructor/assignment/${assignment.id}/view`} className="flex-1">
          <Button variant="outline" className="w-full">
            <Eye className="h-4 w-4 mr-2" />
            View
          </Button>
        </Link>
        <Link to={`/instructor/assignment/${assignment.id}/grade`} className="flex-1">
          <Button className="w-full">
            <Edit className="h-4 w-4 mr-2" />
            Grade
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );

  return (
    <InstructorLayout>
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">Assignments</h1>
            <p className="text-muted-foreground">Manage and grade student assignments</p>
          </div>
          <Link to="/instructor/create-assignment">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Assignment
            </Button>
          </Link>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search assignments..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={courseFilter} onValueChange={setCourseFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="All Courses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Courses</SelectItem>
                  {courses.map((course) => (
                    <SelectItem key={course.id} value={course.id}>
                      {course.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Assignments</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{assignments.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Not Submitted</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {assignments.filter(a => !a.submitted).length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Grading</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {assignments.filter(a => a.submitted && !a.graded).length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Graded</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {assignments.filter(a => a.graded).length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Assignments Tabs */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading assignments...</p>
          </div>
        ) : (
          <Tabs defaultValue="active" className="space-y-4">
            <TabsList>
              <TabsTrigger value="active">
                Not Submitted ({activeAssignments.length})
              </TabsTrigger>
              <TabsTrigger value="submitted">
                Pending Grading ({submittedAssignments.length})
              </TabsTrigger>
              <TabsTrigger value="graded">
                Graded ({gradedAssignments.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="active" className="space-y-4">
              {activeAssignments.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No active assignments</h3>
                    <p className="text-muted-foreground mb-4">Create an assignment to get started</p>
                    <Link to="/instructor/create-assignment">
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Create Assignment
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {activeAssignments.map((assignment) => (
                    <AssignmentCard key={assignment.id} assignment={assignment} />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="submitted" className="space-y-4">
              {submittedAssignments.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No pending submissions</h3>
                    <p className="text-muted-foreground">All submissions have been graded</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {submittedAssignments.map((assignment) => (
                    <AssignmentCard key={assignment.id} assignment={assignment} />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="graded" className="space-y-4">
              {gradedAssignments.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No graded assignments</h3>
                    <p className="text-muted-foreground">Assignments will appear here when graded</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {gradedAssignments.map((assignment) => (
                    <AssignmentCard key={assignment.id} assignment={assignment} />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>
    </InstructorLayout>
  );
}