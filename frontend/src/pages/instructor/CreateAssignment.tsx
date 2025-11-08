import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, FileText, Calendar, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function CreateAssignment() {
  const navigate = useNavigate();
  const { id } = useParams();
  
  const [assignmentData, setAssignmentData] = useState({
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

  const assignmentTypes = [
    { id: 'assignment', name: 'Assignment' },
    { id: 'quiz', name: 'Quiz' },
    { id: 'exam', name: 'Exam' },
    { id: 'project', name: 'Project' },
    { id: 'discussion', name: 'Discussion' }
  ];

  const modules = [
    { id: '1', name: 'Introduction to Database Systems' },
    { id: '2', name: 'Relational Database Design' },
    { id: '3', name: 'Query Optimization' },
    { id: '4', name: 'Transaction Processing' }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Assignment data:', assignmentData);
    navigate(`/instructor/course/${id}/manage`);
  };

  return (
    <div className="container py-8 space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => navigate(`/instructor/course/${id}/manage`)}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Course Management
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Create Assignment</h1>
          <p className="text-muted-foreground">Create a new assignment or assessment for your course</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Assignment Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Assignment Title</Label>
                    <Input
                      id="title"
                      placeholder="Enter assignment title"
                      value={assignmentData.title}
                      onChange={(e) => setAssignmentData({...assignmentData, title: e.target.value})}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="type">Assignment Type</Label>
                    <Select value={assignmentData.type} onValueChange={(value) => setAssignmentData({...assignmentData, type: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {assignmentTypes.map(type => (
                          <SelectItem key={type.id} value={type.id}>
                            {type.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="module">Module</Label>
                    <Select value={assignmentData.module} onValueChange={(value) => setAssignmentData({...assignmentData, module: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select module" />
                      </SelectTrigger>
                      <SelectContent>
                        {modules.map(module => (
                          <SelectItem key={module.id} value={module.id}>
                            {module.name}
                          </SelectItem>
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
                      onChange={(e) => setAssignmentData({...assignmentData, points: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Brief description of the assignment"
                    value={assignmentData.description}
                    onChange={(e) => setAssignmentData({...assignmentData, description: e.target.value})}
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="instructions">Instructions</Label>
                  <Textarea
                    id="instructions"
                    placeholder="Detailed instructions for students"
                    value={assignmentData.instructions}
                    onChange={(e) => setAssignmentData({...assignmentData, instructions: e.target.value})}
                    rows={6}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Due Date & Settings
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
                      onChange={(e) => setAssignmentData({...assignmentData, dueDate: e.target.value})}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dueTime">Due Time</Label>
                    <Input
                      id="dueTime"
                      type="time"
                      value={assignmentData.dueTime}
                      onChange={(e) => setAssignmentData({...assignmentData, dueTime: e.target.value})}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="attempts">Allowed Attempts</Label>
                    <Select value={assignmentData.attempts} onValueChange={(value) => setAssignmentData({...assignmentData, attempts: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
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
                      onChange={(e) => setAssignmentData({...assignmentData, timeLimit: e.target.value})}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Assignment Summary
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
                  <span>
                    {assignmentData.dueDate ? 
                      `${new Date(assignmentData.dueDate).toLocaleDateString()}${assignmentData.dueTime ? ` at ${assignmentData.dueTime}` : ''}` 
                      : 'Not set'}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 space-y-3">
                <Button type="submit" className="w-full">
                  <Save className="mr-2 h-4 w-4" />
                  Create Assignment
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  className="w-full"
                  onClick={() => setAssignmentData({...assignmentData, status: 'draft'})}
                >
                  Save as Draft
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}