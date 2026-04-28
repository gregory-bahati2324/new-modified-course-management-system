import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock, MapPin, Users, Plus, Edit, Trash2, Video } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { InstructorLayout } from '@/components/layout/InstructorLayout';
import { scheduleService, Schedule } from '@/services/scheduleService';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function InstructorSchedule() {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        setLoading(true);
        const data = await scheduleService.getMySchedules();
        setSessions(data);
      } catch (error) {
        console.error("Failed to load schedules:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
  }, []);

  const scheduledCount = sessions.filter(
    (s) => s.status === 'scheduled'
  ).length;

  const onlineCount = sessions.filter(
    (s) => s.is_online === true
  ).length;

  const handleDelete = async (id: string) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this session?");
    if (!confirmDelete) return;

    try {
      await scheduleService.deleteSchedule(id);

      // remove from UI instantly (no reload)
      setSessions((prev) => prev.filter((s) => s.id !== id));

    } catch (error) {
      console.error("Failed to delete session:", error);
    }
  };

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
    <InstructorLayout>
      <div className="container py-8 space-y-6 animate-fade-in overflow-x-hidden max-w-full">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

          {/* LEFT SECTION */}
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/instructor')}
              className="gap-2 shrink-0"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>

            <div>
              <h1 className="text-2xl md:text-3xl font-bold">
                My Schedule
              </h1>
              <p className="text-muted-foreground text-sm md:text-base">
                Manage your teaching schedule and sessions
              </p>
            </div>
          </div>

          {/* RIGHT ACTION */}
          <div className="flex justify-start md:justify-end">
            <Button
              onClick={() => navigate('/instructor/schedule-session')}
              className="w-full md:w-auto"
            >
              <Plus className="mr-2 h-4 w-4" />
              Schedule Session
            </Button>
          </div>

        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">

          {/* Scheduled */}
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-success">
                {loading ? "..." : scheduledCount}
              </div>
              <p className="text-sm text-muted-foreground">Scheduled</p>
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
              {loading ? (
                <p className="text-muted-foreground">Loading sessions...</p>
              ) : sessions.length === 0 ? (
                <p className="text-muted-foreground">No sessions found</p>
              ) : (
                sessions.map((session) => (
                  <div
                    key={session.id}
                    className="flex flex-col md:flex-row md:items-center md:justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors gap-4"
                  >
                    <div className="flex items-start gap-4 flex-1 min-w-0">
                      <div className="p-2 rounded-lg bg-primary/10 text-primary">
                        {getTypeIcon(session.type)}
                      </div>

                      <div className="flex-1 space-y-2">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                          <div>
                            <h3 className="font-semibold">{session.title}</h3>
                            <p className="text-sm text-muted-foreground">
                              {session.title}
                            </p>
                          </div>

                          <div className="flex items-center gap-2">
                            <Badge className={getStatusColor(session.status)}>
                              {session.status}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {session.capacity ?? 0} students
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
                            {session.start_time} - {session.end_time}
                          </div>

                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {session.location}
                          </div>
                        </div>

                        <p className="text-sm text-muted-foreground">
                          {session.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 md:ml-4">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 sm:flex-none"
                        onClick={() => navigate(`/instructor/schedule-session/${session.id}`)}
                      >
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </Button>

                      {session.is_online && session.meeting_link && (
                        <a href={session.meeting_link} target="_blank" rel="noopener noreferrer">
                          <Button size="sm" className="bg-success hover:bg-success/90 flex-1 sm:flex-none">
                            <Video className="mr-2 h-4 w-4" />
                            Join
                          </Button>
                        </a>
                      )}

                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-destructive hover:text-destructive flex-1 sm:flex-none"

                        onClick={() => handleDelete(session.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </InstructorLayout>
  );
}