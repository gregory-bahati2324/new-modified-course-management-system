import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Save, FileText, Calendar, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { assignmentService, AssignmentCreate } from '@/services/assignmentService';
import { courseService } from '@/services/courseService';
import { moduleService } from '@/services/moduleService';
import { useToast } from '@/hooks/use-toast';

type AssignmentStatus = 'draft' | 'published' | 'closed';
type AssignmentType = 'assignment' | 'quiz' | 'exam' | 'project' | 'discussion';

interface Module {
  id: string;
  name: string;
}

interface AssignmentData {
  title: string;
  type: AssignmentType;
  description: string;
  instructions: string;
  dueDate: string;
  dueTime: string;
  points: string;
  attempts: '1' | '2' | '3' | 'unlimited';
  timeLimit: string;
  module: string;
  status: AssignmentStatus;
}

export default function CreateAssignment() {
  const navigate = useNavigate();
  const { id: courseId } = useParams<{ id: string }>();
  const { toast } = useToast();

  const [assignmentData, setAssignmentData] = useState<AssignmentData>({
    title: '',
    type: 'assignment',
    description: '',
    instructions: '',
    dueDate: '',
    dueTime: '',
    points: '',
    attempts: '1',
    timeLimit: '',
    module: '',
    status: 'draft'
  });

  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch modules from backend
  useEffect(() => {
    const fetchModules = async () => {
      try {
        const { courses } = await courseService.getCourses();
        if (!courses || courses.length === 0) return setModules([]);

        const moduleArrays = await Promise.all(
          courses.map(async (course) => {
            try {
              const res = await moduleService.getModules(course.id);
              return res.data ?? [];
            } catch (err: any) {
              if ((err?.response?.status ?? err?.status) === 404) return [];
              throw err;
            }
          })
        );

        const allModules = moduleArrays.flat().map((m: any) => ({
          id: m.id,
          name: m.title ?? m.name,
        }));

        setModules(allModules);
      } catch (err: any) {
        console.error(err);
        toast({ title: 'Error', description: err?.message || 'Failed to load modules', variant: 'destructive' });
        setModules([]);
      }
    };

    fetchModules();
  }, [toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload: AssignmentCreate = {
        title: assignmentData.title,
        type: assignmentData.type,
        description: assignmentData.description || '',
        instructions: assignmentData.instructions || '',
        course_id: courseId!,
        module_id: assignmentData.module || undefined,
        due_date: assignmentData.dueDate
          ? new Date(`${assignmentData.dueDate}T${assignmentData.dueTime || '00:00'}`).toISOString()
          : new Date().toISOString(),
        attempts: assignmentData.attempts === 'unlimited' ? 0 : Number(assignmentData.attempts),
        time_limit: assignmentData.timeLimit ? Number(assignmentData.timeLimit) : undefined,
        total_points: assignmentData.points ? Number(assignmentData.points) : 0,
        status: assignmentData.status,
      };

      await assignmentService.createAssignment(payload);

      toast({ title: 'Success', description: 'Assignment created successfully!', variant: 'default' });
      navigate(`/instructor/course/${courseId}/manage`);
    } catch (err: any) {
      toast({ title: 'Error', description: err?.message || 'Failed to create assignment', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-8 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate(`/instructor/course/${courseId}/manage`)} className="gap-2">
          <ArrowLeft className="h-4 w-4" /> Back to Course Management
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Create Assignment</h1>
          <p className="text-muted-foreground">Create a new assignment or assessment for your course</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Assignment Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" /> Assignment Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Title & Type */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Assignment Title</Label>
                    <Input
                      id="title"
                      placeholder="Enter assignment title"
                      value={assignmentData.title}
                      onChange={(e) => setAssignmentData({ ...assignmentData, title: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="type">Assignment Type</Label>
                    <Select
                      value={assignmentData.type}
                      onValueChange={(value) => setAssignmentData({ ...assignmentData, type: value as AssignmentType })}
                    >
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent className="bg-white text-black shadow-lg rounded-md z-50">
                        <SelectItem value="assignment">Assignment</SelectItem>
                        <SelectItem value="quiz">Quiz</SelectItem>
                        <SelectItem value="exam">Exam</SelectItem>
                        <SelectItem value="project">Project</SelectItem>
                        <SelectItem value="discussion">Discussion</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Module & Points */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="module">Module</Label>
                    <Select
                      value={assignmentData.module}
                      onValueChange={(value) => setAssignmentData({ ...assignmentData, module: value })}
                    >
                      <SelectTrigger><SelectValue placeholder="Select module" /></SelectTrigger>
                      <SelectContent className="bg-white text-black shadow-lg rounded-md z-50">
                        {modules.map((module) => (
                          <SelectItem key={module.id} value={module.id}>{module.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="points">Total Points</Label>
                    <Input
                      id="points"
                      type="number"
                      placeholder="100"
                      value={assignmentData.points}
                      onChange={(e) => setAssignmentData({ ...assignmentData, points: e.target.value })}
                    />
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Brief description of the assignment"
                    value={assignmentData.description}
                    onChange={(e) => setAssignmentData({ ...assignmentData, description: e.target.value })}
                    rows={3}
                  />
                </div>

                {/* Instructions */}
                <div className="space-y-2">
                  <Label htmlFor="instructions">Instructions</Label>
                  <Textarea
                    id="instructions"
                    placeholder="Detailed instructions for students"
                    value={assignmentData.instructions}
                    onChange={(e) => setAssignmentData({ ...assignmentData, instructions: e.target.value })}
                    rows={6}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Due Date & Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" /> Due Date & Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="dueDate">Due Date</Label>
                    <Input
                      id="dueDate"
                      type="date"
                      value={assignmentData.dueDate}
                      onChange={(e) => setAssignmentData({ ...assignmentData, dueDate: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dueTime">Due Time</Label>
                    <Input
                      id="dueTime"
                      type="time"
                      value={assignmentData.dueTime}
                      onChange={(e) => setAssignmentData({ ...assignmentData, dueTime: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="attempts">Allowed Attempts</Label>
                    <Select
                      value={assignmentData.attempts}
                      onValueChange={(value) => setAssignmentData({ ...assignmentData, attempts: value as AssignmentData['attempts'] })}
                    >
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent className="bg-white text-black shadow-lg rounded-md z-50">
                        <SelectItem value="1">1 Attempt</SelectItem>
                        <SelectItem value="2">2 Attempts</SelectItem>
                        <SelectItem value="3">3 Attempts</SelectItem>
                        <SelectItem value="unlimited">Unlimited</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="timeLimit">Time Limit (minutes)</Label>
                    <Input
                      id="timeLimit"
                      type="number"
                      placeholder="Leave blank for no limit"
                      value={assignmentData.timeLimit}
                      onChange={(e) => setAssignmentData({ ...assignmentData, timeLimit: e.target.value })}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" /> Assignment Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Type:</span>
                  <span className="capitalize">{assignmentData.type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Points:</span>
                  <span>{assignmentData.points || 'Not set'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Attempts:</span>
                  <span>{assignmentData.attempts === 'unlimited' ? 'Unlimited' : `${assignmentData.attempts} attempt(s)`}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Time Limit:</span>
                  <span>{assignmentData.timeLimit ? `${assignmentData.timeLimit} min` : 'No limit'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Due:</span>
                  <span>{assignmentData.dueDate ? `${new Date(assignmentData.dueDate).toLocaleDateString()}${assignmentData.dueTime ? ` at ${assignmentData.dueTime}` : ''}` : 'Not set'}</span>
                </div>
              </CardContent>

              <CardContent className="p-4 space-y-3">
                <Button type="submit" className="w-full" disabled={loading}>
                  <Save className="mr-2 h-4 w-4" /> {loading ? 'Saving...' : 'Create Assignment'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => setAssignmentData({ ...assignmentData, status: 'draft' })}
                  disabled={loading}
                >
                  Save as Draft
                </Button>
                <Button asChild variant="outline" size="sm" className="flex-1 md:flex-none">
                  <Link to={`/instructor/course/${courseId}/assignment/:assignmentId/view`}>View Assignment</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}
