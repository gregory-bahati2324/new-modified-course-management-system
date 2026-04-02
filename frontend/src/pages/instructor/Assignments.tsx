import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Filter, FileText, Calendar, Trash2, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { InstructorLayout } from '@/components/layout/InstructorLayout';
import { assignmentService } from '@/services/assignmentService';
import { courseService } from '@/services/courseService';
import type { Assignment } from '@/services/assignmentService';
import type { Course } from '@/services/courseService';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { useParams } from "react-router-dom";

export default function InstructorAssignments() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [deleteId, setDeleteId] = useState<string | null>(null);
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

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      await assignmentService.deleteAssignment(deleteId);

      toast({
        title: "Success",
        description: "Assignment deleted successfully",
      });

      setAssignments(prev => prev.filter(a => a.id !== deleteId));
      setDeleteId(null);

    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete assignment",
        variant: "destructive",
      });
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



  const AssignmentCard = ({ assignment, onDelete }: { assignment: Assignment; onDelete: (id: string) => void }) => (
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
      <CardFooter className="flex gap-2">
        <Link to={`/instructor/assignment/${assignment.id}/edit`} className="flex-1">
          <Button className="w-full">
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
        </Link>

        <Button
          variant="destructive"
          className="flex-1"
          onClick={() => setDeleteId(assignment.id)}
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Delete
        </Button>
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
                <SelectContent className="bg-white text-black shadow-lg rounded-md z-50">
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
                <SelectContent className="bg-white text-black shadow-lg rounded-md z-50">
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

        </div>

        {/* Assignments */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading assignments...</p>
          </div>
        ) : (
          filteredAssignments.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No assignments</h3>
                <p className="text-muted-foreground mb-4">
                  Create an assignment to get started
                </p>
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
              {filteredAssignments.map((assignment) => (
                <AssignmentCard key={assignment.id} assignment={assignment} onDelete={handleDelete} />
              ))}
            </div>
          )
        )}
      </div>
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Assignment</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this assignment? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteId(null)}>
              Cancel
            </AlertDialogCancel>

            <AlertDialogAction onClick={handleDelete}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </InstructorLayout>
  );
}