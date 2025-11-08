import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload, Plus, X, Calendar, Users, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { courseService, CreateCourseRequest } from '@/services/courseService';
import { toast } from '@/hooks/use-toast'; // <-- custom toast

export default function CreateCourse() {
  const navigate = useNavigate();
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [courseData, setCourseData] = useState<CreateCourseRequest>({
    title: '',
    code: '',
    description: '',
    category: '',
    level: '',
    duration: '',
    max_students: undefined,
    prerequisites: '',
    learning_outcomes: '',
    is_published: false,
    allow_self_enrollment: true,
    certificate: true,
  });

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const removeTag = (tag: string) => setTags(tags.filter(t => t !== tag));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const payload = { ...courseData, tags };
      console.debug('Submitting course payload:', payload);

      const newCourse = await courseService.createCourse(payload);
      console.log('Course created:', newCourse);

      // Show success toast
      toast({
        title: 'Course Created',
        description: `Course "${newCourse.title}" has been successfully created!`,
      });

      navigate('/instructor');
    } catch (error) {
      console.error('Failed to create course:', error);

      // Show error toast
      toast({
        title: 'Error',
        description: 'Failed to create course. Please try again later.',
      });

      const detail = error?.response?.data?.detail || error?.message || 'Unknown error';

    toast({
      title: 'Error creating course',
      description: Array.isArray(detail)
        ? detail.map((d: any) => d.msg || d).join(', ')
        : detail,
    });
    }

    
  };

  return (
    <div className="container py-8 space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate('/instructor')} className="gap-2">
          <ArrowLeft className="h-4 w-4" /> Back to Dashboard
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Create New Course</h1>
          <p className="text-muted-foreground">Design and structure your course content</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" /> Basic Information
              </CardTitle>
              <CardDescription>Provide fundamental details about your course</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Course Title *</Label>
                  <Input
                    id="title"
                    value={courseData.title}
                    onChange={e => setCourseData({ ...courseData, title: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="code">Course Code *</Label>
                  <Input
                    id="code"
                    value={courseData.code}
                    onChange={e => setCourseData({ ...courseData, code: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Course Description *</Label>
                <Textarea
                  id="description"
                  value={courseData.description}
                  onChange={e => setCourseData({ ...courseData, description: e.target.value })}
                  required
                  className="min-h-24"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Category *</Label>
                  <Select
                    value={courseData.category}
                    onValueChange={value => setCourseData({ ...courseData, category: value })}
                  >
                    <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                    <SelectContent className="bg-white text-black shadow-lg rounded-md z-50" >
                      <SelectItem value="computer-science">Computer Science</SelectItem>
                      <SelectItem value="engineering">Engineering</SelectItem>
                      <SelectItem value="mathematics">Mathematics</SelectItem>
                      <SelectItem value="business">Business</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Level *</Label>
                  <Select
                    value={courseData.level}
                    onValueChange={value => setCourseData({ ...courseData, level: value })}
                  >
                    <SelectTrigger><SelectValue placeholder="Select level" /></SelectTrigger>
                    <SelectContent className="bg-white text-black shadow-lg rounded-md z-50">
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Duration (weeks)</Label>
                  <Input
                    type="number"
                    value={courseData.duration}
                    onChange={e => setCourseData({ ...courseData, duration: e.target.value })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Content */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Upload className="h-5 w-5" /> Course Content</CardTitle>
              <CardDescription>Upload materials and structure your course</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Learning Objectives</Label>
                <Textarea
                  value={courseData.learning_outcomes}
                  onChange={e =>
                    setCourseData({ ...courseData, learning_outcomes: e.target.value })
                  }
                  className="min-h-20"
                />
              </div>

              <div className="space-y-2">
                <Label>Prerequisites</Label>
                <Textarea
                  value={courseData.prerequisites}
                  onChange={e => setCourseData({ ...courseData, prerequisites: e.target.value})}
                  className="min-h-16"
                />
              </div>

              <div className="space-y-2">
                <Label>Tags</Label>
                <div className="flex gap-2 mb-2 flex-wrap">
                  {tags.map(tag => (
                    <Badge key={tag} variant="secondary" className="gap-1">
                      {tag} <X className="h-3 w-3 cursor-pointer hover:text-destructive" onClick={() => removeTag(tag)} />
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add a tag..."
                    value={newTag}
                    onChange={e => setNewTag(e.target.value)}
                    onKeyPress={e => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  />
                  <Button type="button" onClick={addTag} size="sm"><Plus className="h-4 w-4" /></Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Users className="h-5 w-5" /> Enrollment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Maximum Students</Label>
                <Input
                  type="number"
                  value={courseData.max_students || ''}
                  onChange={e => setCourseData({ ...courseData, max_students: Number(e.target.value) })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Self-Enrollment</Label>
                  <p className="text-xs text-muted-foreground">Allow students to enroll themselves</p>
                </div>
                <Switch
                  checked={courseData.allow_self_enrollment}
                  onCheckedChange={checked => setCourseData({ ...courseData, allow_self_enrollment: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Certificate Available</Label>
                  <p className="text-xs text-muted-foreground">Issue certificates upon completion</p>
                </div>
                <Switch
                  checked={courseData.certificate}
                  onCheckedChange={checked => setCourseData({ ...courseData, certificate: checked })}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Calendar className="h-5 w-5" /> Publication</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Publish Course</Label>
                  <p className="text-xs text-muted-foreground">Make course visible to students</p>
                </div>
                <Switch
                  checked={courseData.is_published}
                  onCheckedChange={checked => setCourseData({ ...courseData, is_published: checked })}
                />
              </div>

              <div className="pt-4 space-y-3">
                <Button type="submit" className="w-full">Create Course</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </form>
    </div>
  );
}
