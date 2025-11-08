import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowLeft, 
  BookOpen, 
  Users, 
  Settings, 
  FileText, 
  Video, 
  Plus, 
  Edit, 
  Trash2, 
  Eye,
  Upload,
  Download,
  BarChart3
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ModuleView } from '@/components/ModuleView';

export default function CourseManage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState('overview');

  const course = {
    id: 1,
    title: "Advanced Database Systems",
    code: "CS 401",
    students: 45,
    status: "published",
    progress: 75,
    description: "This course covers advanced topics in database systems including query optimization, transaction processing, distributed databases, and NoSQL systems.",
    enrollments: 45,
    completions: 12,
    avgRating: 4.8,
    totalSessions: 16,
    completedSessions: 12
  };

  const modules = [
    {
      id: 1,
      title: "Introduction to Database Systems",
      order: 1,
      status: "completed",
      lessons: 5,
      duration: "2 weeks",
      students: 45,
      avgProgress: 100
    },
    {
      id: 2, 
      title: "Relational Database Design",
      order: 2,
      status: "completed", 
      lessons: 6,
      duration: "3 weeks",
      students: 45,
      avgProgress: 100
    },
    {
      id: 3,
      title: "Query Optimization",
      order: 3,
      status: "active",
      lessons: 4,
      duration: "2 weeks", 
      students: 42,
      avgProgress: 75
    },
    {
      id: 4,
      title: "Transaction Processing",
      order: 4,
      status: "draft",
      lessons: 5,
      duration: "2 weeks",
      students: 0,
      avgProgress: 0
    }
  ];

  const assignments = [
    {
      id: 1,
      title: "Database Design Project",
      type: "project",
      dueDate: "2024-12-20",
      submissions: 38,
      pending: 7,
      graded: 31,
      status: "active"
    },
    {
      id: 2,
      title: "Query Optimization Quiz",
      type: "quiz", 
      dueDate: "2024-12-15",
      submissions: 42,
      pending: 3,
      graded: 39,
      status: "active"
    },
    {
      id: 3,
      title: "Midterm Examination",
      type: "exam",
      dueDate: "2024-12-10",
      submissions: 45,
      pending: 0,
      graded: 45,
      status: "completed"
    }
  ];

  return (
    <div className="container py-8 space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => navigate('/instructor')}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">{course.title}</h1>
          <p className="text-muted-foreground">{course.code} • Managing course content and students</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={course.status === 'published' ? 'default' : 'secondary'}>
            {course.status}
          </Badge>
          <Button variant="outline" size="sm">
            <Eye className="mr-2 h-4 w-4" />
            Preview
          </Button>
          <Button variant="outline" size="sm">
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 text-primary" />
              <div>
                <div className="text-2xl font-bold">{course.enrollments}</div>
                <p className="text-sm text-muted-foreground">Students</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <BarChart3 className="h-8 w-8 text-success" />
              <div>
                <div className="text-2xl font-bold">{course.progress}%</div>
                <p className="text-sm text-muted-foreground">Avg Progress</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <FileText className="h-8 w-8 text-warning" />
              <div>
                <div className="text-2xl font-bold">{course.completions}</div>
                <p className="text-sm text-muted-foreground">Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <BookOpen className="h-8 w-8 text-accent" />
              <div>
                <div className="text-2xl font-bold">{course.avgRating}</div>
                <p className="text-sm text-muted-foreground">Avg Rating</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="assignments">Assignments</TabsTrigger>
          <TabsTrigger value="students">Students</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Course Description</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">{course.description}</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-4"
                    onClick={() => navigate(`/instructor/course/${id}/edit-description`)}
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Description
                  </Button>
                </CardContent>
              </Card>
            </div>
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Content
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <FileText className="mr-2 h-4 w-4" />
                    Create Assignment
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <Video className="mr-2 h-4 w-4" />
                    Schedule Session
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <Download className="mr-2 h-4 w-4" />
                    Export Data
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="content" className="space-y-6">
          <ModuleView courseId={id || '1'} />
        </TabsContent>

        <TabsContent value="assignments" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Assignments & Assessments</h3>
            <Button onClick={() => navigate(`/instructor/course/${id}/create-assignment`)}>
              <Plus className="mr-2 h-4 w-4" />
              Create Assignment
            </Button>
          </div>
          <div className="space-y-4">
            {assignments.map((assignment) => (
              <Card key={assignment.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-semibold">{assignment.title}</h4>
                        <Badge variant="outline">{assignment.type}</Badge>
                        <Badge variant={assignment.status === 'completed' ? 'default' : 'secondary'}>
                          {assignment.status}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Due Date</p>
                          <p className="font-medium">{new Date(assignment.dueDate).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Submissions</p>
                          <p className="font-medium">{assignment.submissions}/{course.enrollments}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Pending Review</p>
                          <p className="font-medium text-warning">{assignment.pending}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Graded</p>
                          <p className="font-medium text-success">{assignment.graded}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => navigate(`/instructor/course/${id}/assignment/${assignment.id}/view`)}
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        View
                      </Button>
                      <Button 
                        size="sm"
                        onClick={() => navigate(`/instructor/course/${id}/assignment/${assignment.id}/submission/1/grade`)}
                      >
                        <FileText className="mr-2 h-4 w-4" />
                        Grade
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="students" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Enrolled Students</CardTitle>
              <CardDescription>
                Manage student enrollment and progress
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Student Management</h3>
                <p className="text-muted-foreground mb-4">
                  Detailed student management features coming soon
                </p>
                <Button variant="outline">
                  <Upload className="mr-2 h-4 w-4" />
                  Import Students
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}