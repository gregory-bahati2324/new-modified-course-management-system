import { Calendar as CalendarIcon, Clock, MapPin, Video, Users } from 'lucide-react';
import StudentLayout from '@/components/layout/StudentLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export default function StudentSchedule() {
  const schedule = [
    {
      id: 1,
      title: "Database Systems Lecture",
      course: "Advanced Database Systems",
      instructor: "Dr. Sarah Johnson",
      day: "Monday",
      time: "09:00 - 11:00",
      location: "Room A101",
      type: "lecture",
      color: "bg-blue-500"
    },
    {
      id: 2,
      title: "ML Lab Session",
      course: "Machine Learning Fundamentals",
      instructor: "Prof. Michael Chen",
      day: "Monday",
      time: "14:00 - 16:00",
      location: "Computer Lab 2",
      type: "lab",
      color: "bg-green-500"
    },
    {
      id: 3,
      title: "Software Engineering Tutorial",
      course: "Software Engineering Principles",
      instructor: "Dr. Emily Davis",
      day: "Tuesday",
      time: "10:00 - 12:00",
      location: "Online",
      type: "tutorial",
      color: "bg-purple-500"
    },
    {
      id: 4,
      title: "Database Lab",
      course: "Advanced Database Systems",
      instructor: "Dr. Sarah Johnson",
      day: "Wednesday",
      time: "13:00 - 15:00",
      location: "Computer Lab 1",
      type: "lab",
      color: "bg-blue-500"
    },
    {
      id: 5,
      title: "ML Project Discussion",
      course: "Machine Learning Fundamentals",
      instructor: "Prof. Michael Chen",
      day: "Thursday",
      time: "15:00 - 17:00",
      location: "Online",
      type: "discussion",
      color: "bg-green-500"
    },
    {
      id: 6,
      title: "SE Code Review",
      course: "Software Engineering Principles",
      instructor: "Dr. Emily Davis",
      day: "Friday",
      time: "09:00 - 11:00",
      location: "Room B204",
      type: "workshop",
      color: "bg-purple-500"
    }
  ];

  const upcomingEvents = [
    {
      title: "Mid-Term Exam: Database Systems",
      date: "Dec 18, 2024",
      time: "09:00 AM",
      location: "Main Hall",
      type: "exam"
    },
    {
      title: "Project Presentation: ML",
      date: "Dec 20, 2024",
      time: "14:00 PM",
      location: "Online",
      type: "presentation"
    },
    {
      title: "Final Project Submission",
      date: "Dec 22, 2024",
      time: "23:59 PM",
      location: "Online Portal",
      type: "deadline"
    }
  ];

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

  return (
    <StudentLayout>
      <div className="container py-8 space-y-8 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold">My Schedule</h1>
          <p className="text-muted-foreground">View your weekly class schedule and upcoming events</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Weekly Schedule */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CalendarIcon className="h-5 w-5" />
                  Weekly Schedule
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {days.map((day) => {
                  const daySchedule = schedule.filter(s => s.day === day);
                  return (
                    <div key={day} className="space-y-3">
                      <h3 className="font-semibold text-lg border-b pb-2">{day}</h3>
                      {daySchedule.length > 0 ? (
                        <div className="space-y-3">
                          {daySchedule.map((session) => (
                            <div key={session.id} className="flex items-start gap-4 p-4 rounded-lg border hover:bg-accent transition-colors">
                              <div className={`w-1 self-stretch rounded ${session.color}`} />
                              <div className="flex-1 space-y-2">
                                <div className="flex items-start justify-between">
                                  <div>
                                    <h4 className="font-semibold">{session.title}</h4>
                                    <p className="text-sm text-muted-foreground">{session.course}</p>
                                    <p className="text-sm text-muted-foreground">{session.instructor}</p>
                                  </div>
                                  <Badge variant="outline">
                                    {session.type}
                                  </Badge>
                                </div>
                                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                                  <div className="flex items-center gap-1">
                                    <Clock className="h-4 w-4" />
                                    {session.time}
                                  </div>
                                  <div className="flex items-center gap-1">
                                    {session.location === "Online" ? (
                                      <Video className="h-4 w-4" />
                                    ) : (
                                      <MapPin className="h-4 w-4" />
                                    )}
                                    {session.location}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground pl-4">No classes scheduled</p>
                      )}
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>

          {/* Upcoming Events */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Events</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {upcomingEvents.map((event, index) => (
                  <div key={index} className="p-4 rounded-lg border space-y-2">
                    <div className="flex items-start justify-between">
                      <h4 className="font-semibold text-sm">{event.title}</h4>
                      <Badge variant={
                        event.type === 'exam' ? 'destructive' :
                        event.type === 'presentation' ? 'default' :
                        'secondary'
                      }>
                        {event.type}
                      </Badge>
                    </div>
                    <div className="space-y-1 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <CalendarIcon className="h-3 w-3" />
                        {event.date}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {event.time}
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {event.location}
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle>This Week</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Total Classes</span>
                  <span className="text-2xl font-bold">{schedule.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Lectures</span>
                  <span className="text-lg font-semibold">{schedule.filter(s => s.type === 'lecture').length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Labs</span>
                  <span className="text-lg font-semibold">{schedule.filter(s => s.type === 'lab').length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Online Sessions</span>
                  <span className="text-lg font-semibold">{schedule.filter(s => s.location === 'Online').length}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </StudentLayout>
  );
}
