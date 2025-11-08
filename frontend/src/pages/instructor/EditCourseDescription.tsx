import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';

export default function EditCourseDescription() {
  const navigate = useNavigate();
  const { id } = useParams();
  
  const [courseData, setCourseData] = useState({
    title: 'Advanced Database Systems',
    code: 'CS 401',
    description: 'This course covers advanced topics in database systems including query optimization, transaction processing, distributed databases, and NoSQL systems.',
    objectives: 'Students will learn advanced database concepts, optimization techniques, and modern database architectures.',
    prerequisites: 'CS 201 - Data Structures & Algorithms, CS 301 - Database Systems Fundamentals'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log('Updated course data:', courseData);
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
          <h1 className="text-3xl font-bold">Edit Course Description</h1>
          <p className="text-muted-foreground">Update course information and description</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Course Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Course Title</Label>
                    <Input
                      id="title"
                      value={courseData.title}
                      onChange={(e) => setCourseData({...courseData, title: e.target.value})}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="code">Course Code</Label>
                    <Input
                      id="code"
                      value={courseData.code}
                      onChange={(e) => setCourseData({...courseData, code: e.target.value})}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Course Description</Label>
                  <Textarea
                    id="description"
                    value={courseData.description}
                    onChange={(e) => setCourseData({...courseData, description: e.target.value})}
                    rows={6}
                    placeholder="Describe what this course covers, its main topics, and learning outcomes"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="objectives">Learning Objectives</Label>
                  <Textarea
                    id="objectives"
                    value={courseData.objectives}
                    onChange={(e) => setCourseData({...courseData, objectives: e.target.value})}
                    rows={4}
                    placeholder="What will students learn and be able to do after completing this course?"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="prerequisites">Prerequisites</Label>
                  <Textarea
                    id="prerequisites"
                    value={courseData.prerequisites}
                    onChange={(e) => setCourseData({...courseData, prerequisites: e.target.value})}
                    rows={3}
                    placeholder="Required courses or knowledge students should have before taking this course"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Preview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold">{courseData.title || 'Course Title'}</h3>
                  <p className="text-sm text-muted-foreground">{courseData.code || 'Course Code'}</p>
                </div>
                <div>
                  <p className="text-sm leading-relaxed">
                    {courseData.description || 'Course description will appear here...'}
                  </p>
                </div>
                {courseData.objectives && (
                  <div>
                    <h4 className="font-medium text-sm mb-1">Learning Objectives</h4>
                    <p className="text-xs text-muted-foreground">{courseData.objectives}</p>
                  </div>
                )}
                {courseData.prerequisites && (
                  <div>
                    <h4 className="font-medium text-sm mb-1">Prerequisites</h4>
                    <p className="text-xs text-muted-foreground">{courseData.prerequisites}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <Button type="submit" className="w-full">
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}