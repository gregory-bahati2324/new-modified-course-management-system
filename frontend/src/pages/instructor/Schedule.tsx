import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock, MapPin, Users, Plus, Edit, Trash2, Video } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function InstructorSchedule() {
  const navigate = useNavigate();
  const [selectedWeek, setSelectedWeek] = useState('current');
  const [viewMode, setViewMode] = useState('week');

  const sessions = [
    {
      id: 1,
      title: "Advanced Database Systems - Lecture 8",
      course: "CS 401",
      courseTitle: "Advanced Database Systems",
      date: "2024-12-12",
      time: "10:00 AM - 12:00 PM",
      location: "Room 201, CS Building",
      type: "lecture",
      students: 45,
      status: "scheduled",
      description: "Database Optimization Techniques"
    },
    {
      id: 2,
      title: "Data Structures Lab Session",
      course: "CS 201", 
      courseTitle: "Data Structures & Algorithms",
      date: "2024-12-13",
      time: "2:00 PM - 4:00 PM",
      location: "Computer Lab 1",
      type: "lab",
      students: 67,
      status: "scheduled",
      description: "Binary Tree Implementation Exercise"
    },
    {
      id: 3,
      title: "ML Project Presentations",
      course: "CS 451",
      courseTitle: "Machine Learning Fundamentals", 
      date: "2024-12-14",
      time: "9:00 AM - 11:00 AM",
      location: "Conference Hall",
      type: "presentation",
      students: 38,
      status: "scheduled",
      description: "Student Project Presentations"
    },
    {
      id: 4,
      title: "Database Design Workshop",
      course: "CS 401",
      courseTitle: "Advanced Database Systems",
      date: "2024-12-15",
      time: "1:00 PM - 3:00 PM", 
      location: "Virtual Session",
      type: "workshop",
      students: 45,
      status: "online",
      description: "Hands-on Database Design Exercise"
    },
    {
      id: 5,
      title: "Algorithm Analysis Discussion",
      course: "CS 201",
      courseTitle: "Data Structures & Algorithms",
      date: "2024-12-16",
      time: "11:00 AM - 12:00 PM",
      location: "Room 305, CS Building", 
      type: "discussion",
      students: 67,
      status: "scheduled",
      description: "Big O Notation and Time Complexity"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-success text-success-foreground';
      case 'online': return 'bg-primary text-primary-foreground';
      case 'cancelled': return 'bg-destructive text-destructive-foreground';
      case 'completed': return 'bg-muted text-muted-foreground';
      default: return 'bg-secondary text-secondary-foreground';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'lecture': return <Users className="h-4 w-4" />;
      case 'lab': return <Edit className="h-4 w-4" />;
      case 'presentation': return <Video className="h-4 w-4" />;
      case 'workshop': return <Edit className="h-4 w-4" />;
      case 'discussion': return <Users className="h-4 w-4" />;
      default: return <Calendar className="h-4 w-4" />;
    }
  };

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
          <h1 className="text-3xl font-bold">My Schedule</h1>
          <p className="text-muted-foreground">Manage your teaching schedule and sessions</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={viewMode} onValueChange={setViewMode}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Week</SelectItem>
              <SelectItem value="month">Month</SelectItem>
              <SelectItem value="agenda">Agenda</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={() => navigate('/instructor/schedule-session')}>
            <Plus className="mr-2 h-4 w-4" />
            Schedule Session
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-primary">12</div>
            <p className="text-sm text-muted-foreground">This Week</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-success">8</div>
            <p className="text-sm text-muted-foreground">Scheduled</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-warning">2</div>
            <p className="text-sm text-muted-foreground">Online</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-accent">186</div>
            <p className="text-sm text-muted-foreground">Total Students</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Upcoming Sessions
          </CardTitle>
          <CardDescription>
            Your scheduled teaching sessions and activities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {sessions.map((session) => (
              <div key={session.id} className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                <div className="flex items-start gap-4 flex-1">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary">
                    {getTypeIcon(session.type)}
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold">{session.title}</h3>
                        <p className="text-sm text-muted-foreground">{session.course} • {session.courseTitle}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(session.status)}>
                          {session.status}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {session.students} students
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {new Date(session.date).toLocaleDateString('en-US', { 
                          weekday: 'short', 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {session.time}
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {session.location}
                      </div>
                    </div>
                    
                    <p className="text-sm text-muted-foreground">{session.description}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 ml-4">
                  <Button size="sm" variant="outline">
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </Button>
                  {session.status === 'online' && (
                    <Button size="sm" className="bg-success hover:bg-success/90">
                      <Video className="mr-2 h-4 w-4" />
                      Join
                    </Button>
                  )}
                  <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}