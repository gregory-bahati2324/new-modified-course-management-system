import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, BookOpen, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function AddModule() {
  const navigate = useNavigate();
  const { id } = useParams();
  
  const [moduleData, setModuleData] = useState({
    title: '',
    description: '',
    order: '',
    duration: '',
    objectives: '',
    status: 'draft'
  });

  const [lessons, setLessons] = useState([
    { id: 1, title: '', description: '', type: 'video', duration: '' }
  ]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Module data:', { ...moduleData, lessons });
    navigate(`/instructor/course/${id}/manage`);
  };

  const addLesson = () => {
    setLessons([...lessons, { 
      id: lessons.length + 1, 
      title: '', 
      description: '', 
      type: 'video', 
      duration: '' 
    }]);
  };

  const removeLesson = (lessonId: number) => {
    setLessons(lessons.filter(lesson => lesson.id !== lessonId));
  };

  const updateLesson = (lessonId: number, field: string, value: string) => {
    setLessons(lessons.map(lesson => 
      lesson.id === lessonId ? { ...lesson, [field]: value } : lesson
    ));
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
          <h1 className="text-3xl font-bold">Add New Module</h1>
          <p className="text-muted-foreground">Create a new learning module for your course</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Module Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Module Title</Label>
                    <Input
                      id="title"
                      placeholder="Enter module title"
                      value={moduleData.title}
                      onChange={(e) => setModuleData({...moduleData, title: e.target.value})}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="order">Module Order</Label>
                    <Input
                      id="order"
                      type="number"
                      placeholder="1, 2, 3..."
                      value={moduleData.order}
                      onChange={(e) => setModuleData({...moduleData, order: e.target.value})}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="duration">Duration</Label>
                    <Input
                      id="duration"
                      placeholder="e.g., 2 weeks, 5 days"
                      value={moduleData.duration}
                      onChange={(e) => setModuleData({...moduleData, duration: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select value={moduleData.status} onValueChange={(value) => setModuleData({...moduleData, status: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Module Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe what this module covers"
                    value={moduleData.description}
                    onChange={(e) => setModuleData({...moduleData, description: e.target.value})}
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="objectives">Learning Objectives</Label>
                  <Textarea
                    id="objectives"
                    placeholder="What will students learn in this module?"
                    value={moduleData.objectives}
                    onChange={(e) => setModuleData({...moduleData, objectives: e.target.value})}
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Module Lessons</CardTitle>
                  <Button type="button" variant="outline" size="sm" onClick={addLesson}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Lesson
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {lessons.map((lesson, index) => (
                  <div key={lesson.id} className="p-4 border rounded-lg space-y-3">
                    <div className="flex justify-between items-center">
                      <h4 className="font-medium">Lesson {index + 1}</h4>
                      {lessons.length > 1 && (
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => removeLesson(lesson.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <Input
                        placeholder="Lesson title"
                        value={lesson.title}
                        onChange={(e) => updateLesson(lesson.id, 'title', e.target.value)}
                      />
                      <Select 
                        value={lesson.type} 
                        onValueChange={(value) => updateLesson(lesson.id, 'type', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="video">Video</SelectItem>
                          <SelectItem value="reading">Reading</SelectItem>
                          <SelectItem value="quiz">Quiz</SelectItem>
                          <SelectItem value="assignment">Assignment</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <Input
                      placeholder="Duration (e.g., 30 min)"
                      value={lesson.duration}
                      onChange={(e) => updateLesson(lesson.id, 'duration', e.target.value)}
                    />
                    
                    <Textarea
                      placeholder="Lesson description"
                      value={lesson.description}
                      onChange={(e) => updateLesson(lesson.id, 'description', e.target.value)}
                      rows={2}
                    />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Module Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Lessons:</span>
                  <span>{lessons.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status:</span>
                  <span className="capitalize">{moduleData.status}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Duration:</span>
                  <span>{moduleData.duration || 'Not set'}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <Button type="submit" className="w-full">
                  <Save className="mr-2 h-4 w-4" />
                  Create Module
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}