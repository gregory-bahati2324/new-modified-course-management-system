/* CHANGE 2025-02-04: Removed graded tab, linked buttons to view/submit pages */
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Calendar, Clock, CheckCircle2, AlertCircle, Upload, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { assignmentService, StudentAssignment } from '@/services/assignmentService';

export default function StudentAssignments() {
  const navigate = useNavigate();
  const [assignments, setAssignments] = useState<StudentAssignment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      const data = await assignmentService.getStudentAssignments();
      console.log('Fetched assignments:', data);
      setAssignments(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const pending = assignments.filter(a => a.status === 'pending');
  const overdue = assignments.filter(a => a.status === 'overdue');
  const submitted = assignments.filter(a => a.status === 'submitted');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'overdue':
        return 'destructive';
      case 'pending':
        return 'default';
      case 'submitted':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const getDaysLeft = (dueDate?: string) => {
    if (!dueDate) return null;

    const now = new Date();
    const due = new Date(dueDate);

    const diff = due.getTime() - now.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="container py-8 space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Assignments</h1>
          <p className="text-muted-foreground">Track and submit your course assignments</p>
        </div>
      </div>

      {/* CHANGE: Updated stats - removed graded card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Assignments</p>
                <h3 className="text-2xl font-bold">{assignments.length}</h3>
              </div>
              <FileText className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <h3 className="text-2xl font-bold text-warning">{pending.length}</h3>
              </div>
              <Clock className="h-8 w-8 text-warning" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Submitted</p>
                <h3 className="text-2xl font-bold text-primary">{submitted.length}</h3>
              </div>
              <Upload className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* CHANGE: Only pending and submitted tabs */}
      <Tabs defaultValue="pending" className="space-y-6">
        <TabsList>
          <TabsTrigger value="pending">Pending ({pending.length})</TabsTrigger>
          <TabsTrigger value="overdue">Overdue ({overdue.length})</TabsTrigger>
          <TabsTrigger value="submitted">Submitted ({submitted.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          {pending.map((assignment) => {
            const daysLeft = getDaysLeft(assignment.due_date);
            return (
              <Card key={assignment.id} className="hover:shadow-md transition-all">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle>{assignment.title}</CardTitle>
                      <p className="text-sm text-muted-foreground">{assignment.course_title}</p>
                    </div>
                    <Badge variant={getStatusColor(assignment.status)}>
                      {assignment.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">{assignment.description}</p>

                  <div className="flex flex-wrap gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>Due: {assignment.due_date}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className={daysLeft && daysLeft <= 3 ? 'text-destructive font-medium' : ''}>
                        {daysLeft ?? '-'} days left
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span>{assignment.total_points} points</span>
                    </div>
                  </div>

                  {daysLeft && daysLeft <= 3 && (
                    <div className="flex items-center gap-2 p-3 bg-destructive/10 text-destructive rounded-lg">
                      <AlertCircle className="h-4 w-4" />
                      <span className="text-sm font-medium">This assignment is due soon!</span>
                    </div>
                  )}

                  {/* CHANGE: Buttons navigate to view and submit pages */}
                  <div className="flex gap-2">
                    <Button
                      className="flex-1"
                      onClick={() => navigate(`/student/assignment/${assignment.id}/submit`)}
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      Submit Assignment
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => navigate(`/student/Myassignment/${assignment.id}/view`)}
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>

        <TabsContent value="submitted" className="space-y-4">
          {submitted.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-semibold mb-2">No Submitted Assignments</h3>
                <p className="text-sm text-muted-foreground">
                  Assignments you submit will appear here
                </p>
              </CardContent>
            </Card>
          ) : (
            submitted.map((assignment) => (
              <Card key={assignment.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="flex items-center gap-2">
                        {assignment.title}
                        <CheckCircle2 className="h-5 w-5 text-primary" />
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">{assignment.course_title}</p>
                    </div>
                    <Badge variant="secondary">Submitted</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>Submitted: {(assignment as any).submittedDate}</span>
                      <span>•</span>
                      <span>
                        {assignment.score !== undefined && assignment.score !== null
                          ? `Score: ${assignment.score}/${assignment.total_points}`
                          : "Not graded yet"}
                      </span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/student/assignments/${assignment.id}/view`)}
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      View
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
        <TabsContent value="overdue" className="space-y-4">
          {overdue.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
                <h3 className="font-semibold mb-2">No Overdue Assignments</h3>
                <p className="text-sm text-muted-foreground">
                  You're all caught up 🎉
                </p>
              </CardContent>
            </Card>
          ) : (
            overdue.map((assignment) => (
              <Card key={assignment.id} className="border-destructive/30">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-destructive">
                        {assignment.title}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {assignment.course_title}
                      </p>
                    </div>
                    <Badge variant="destructive">Overdue</Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    {assignment.description}
                  </p>

                  <div className="flex flex-wrap gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>Due: {assignment.due_date}</span>
                    </div>

                    <div className="flex items-center gap-2 text-destructive font-medium">
                      <AlertCircle className="h-4 w-4" />
                      <span>Deadline passed</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span>{assignment.total_points} points</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => navigate(`/student/Myassignment/${assignment.id}/view`)}
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}