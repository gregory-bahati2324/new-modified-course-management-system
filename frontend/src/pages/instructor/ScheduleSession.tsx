import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock, MapPin, Users, Video, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function ScheduleSession() {
  const navigate = useNavigate();
  const [sessionData, setSessionData] = useState({
    title: '',
    course: '',
    date: '',
    startTime: '',
    endTime: '',
    location: '',
    type: 'lecture',
    description: '',
    capacity: '',
    isOnline: false
  });

  const courses = [
    { id: 'cs401', name: 'Advanced Database Systems' },
    { id: 'cs201', name: 'Data Structures & Algorithms' },
    { id: 'cs451', name: 'Machine Learning Fundamentals' }
  ];

  const sessionTypes = [
    { id: 'lecture', name: 'Lecture' },
    { id: 'lab', name: 'Lab Session' },
    { id: 'workshop', name: 'Workshop' },
    { id: 'presentation', name: 'Presentation' },
    { id: 'discussion', name: 'Discussion' },
    { id: 'exam', name: 'Examination' }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log('Session data:', sessionData);
    navigate('/instructor/schedule');
  };

  return (
    <div className="container py-8 space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => navigate('/instructor/schedule')}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Schedule
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Schedule New Session</h1>
          <p className="text-muted-foreground">Create a new teaching session or activity</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Session Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Session Title</Label>
                    <Input
                      id="title"
                      placeholder="Enter session title"
                      value={sessionData.title}
                      onChange={(e) => setSessionData({...sessionData, title: e.target.value})}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="course">Course</Label>
                    <Select value={sessionData.course} onValueChange={(value) => setSessionData({...sessionData, course: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select course" />
                      </SelectTrigger>
                      <SelectContent>
                        {courses.map(course => (
                          <SelectItem key={course.id} value={course.id}>
                            {course.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="date">Date</Label>
                    <Input
                      id="date"
                      type="date"
                      value={sessionData.date}
                      onChange={(e) => setSessionData({...sessionData, date: e.target.value})}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="startTime">Start Time</Label>
                    <Input
                      id="startTime"
                      type="time"
                      value={sessionData.startTime}
                      onChange={(e) => setSessionData({...sessionData, startTime: e.target.value})}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endTime">End Time</Label>
                    <Input
                      id="endTime"
                      type="time"
                      value={sessionData.endTime}
                      onChange={(e) => setSessionData({...sessionData, endTime: e.target.value})}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="type">Session Type</Label>
                    <Select value={sessionData.type} onValueChange={(value) => setSessionData({...sessionData, type: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {sessionTypes.map(type => (
                          <SelectItem key={type.id} value={type.id}>
                            {type.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="capacity">Expected Capacity</Label>
                    <Input
                      id="capacity"
                      type="number"
                      placeholder="Number of students"
                      value={sessionData.capacity}
                      onChange={(e) => setSessionData({...sessionData, capacity: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    placeholder="Room number, building, or online platform"
                    value={sessionData.location}
                    onChange={(e) => setSessionData({...sessionData, location: e.target.value})}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Session description, agenda, or special instructions"
                    value={sessionData.description}
                    onChange={(e) => setSessionData({...sessionData, description: e.target.value})}
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Video className="h-5 w-5" />
                  Session Options
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Online Session</p>
                    <p className="text-sm text-muted-foreground">Enable video conferencing</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={sessionData.isOnline}
                    onChange={(e) => setSessionData({...sessionData, isOnline: e.target.checked})}
                    className="rounded"
                  />
                </div>
                
                <div className="pt-4 border-t">
                  <Button type="submit" className="w-full">
                    <Save className="mr-2 h-4 w-4" />
                    Schedule Session
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Quick Info
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Duration:</span>
                    <span>
                    {sessionData.startTime && sessionData.endTime ? 
                      `${Math.round((new Date(`2000-01-01T${sessionData.endTime}`).getTime() - new Date(`2000-01-01T${sessionData.startTime}`).getTime()) / 60000)} minutes` 
                      : 'Not set'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Session Type:</span>
                  <span className="capitalize">{sessionData.type || 'Not set'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Format:</span>
                  <span>{sessionData.isOnline ? 'Online' : 'In-person'}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}