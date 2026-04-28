import { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, Video, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { courseService } from '@/services/courseService';
import { scheduleService, Schedule } from '@/services/scheduleService';

export default function StudentSchedule() {
  const [sessions, setSessions] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudentSchedule = async () => {
      try {
        setLoading(true);

        // ✅ 1. Get enrolled courses
        const courses = await courseService.getEnrolledCourses();

        // ✅ 2. Fetch sessions for each course
        const allSessions: Schedule[] = [];

        for (const course of courses) {
          const courseSessions = await scheduleService.getCourseSchedules(course.id);
          allSessions.push(...courseSessions);
        }

        // ✅ 3. Sort by date
        allSessions.sort((a, b) =>
          new Date(a.date).getTime() - new Date(b.date).getTime()
        );

        setSessions(allSessions);

      } catch (error) {
        console.error("Failed to load student schedule:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStudentSchedule();
  }, []);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'lecture': return <Users className="h-4 w-4" />;
      case 'lab': return <Users className="h-4 w-4" />;
      case 'presentation': return <Video className="h-4 w-4" />;
      default: return <Calendar className="h-4 w-4" />;
    }
  };

  return (
    <div className="container py-8 space-y-6 animate-fade-in max-w-full">
      
      {/* HEADER */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">
          My Schedule
        </h1>
        <p className="text-muted-foreground">
          View your upcoming sessions
        </p>
      </div>

      {/* LIST */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Upcoming Sessions
          </CardTitle>
        </CardHeader>

        <CardContent>
          <div className="space-y-4">
            {loading ? (
              <p className="text-muted-foreground">Loading sessions...</p>
            ) : sessions.length === 0 ? (
              <p className="text-muted-foreground">No sessions available</p>
            ) : (
              sessions.map((session) => (
                <div
                  key={session.id}
                  className="flex flex-col md:flex-row md:items-center md:justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors gap-4"
                >
                  {/* LEFT */}
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    <div className="p-2 rounded-lg bg-primary/10 text-primary">
                      {getTypeIcon(session.type)}
                    </div>

                    <div className="flex-1 space-y-2">
                      <div className="flex flex-col sm:flex-row sm:justify-between gap-2">
                        <div>
                          <h3 className="font-semibold">{session.title}</h3>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {session.description}
                          </p>
                        </div>

                        <Badge variant="outline">
                          {session.type}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {new Date(session.date).toLocaleDateString()}
                        </div>

                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {session.start_time} - {session.end_time}
                        </div>

                        <div className="flex items-center gap-1">
                          {session.is_online ? (
                            <Video className="h-4 w-4" />
                          ) : (
                            <MapPin className="h-4 w-4" />
                          )}
                          {session.is_online ? "Online" : session.location}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* RIGHT (ONLY JOIN) */}
                  <div className="flex flex-wrap gap-2">
                    {session.is_online && session.meeting_link && (
                      <a href={session.meeting_link} target="_blank">
                        <button className="px-3 py-1 text-sm bg-green-600 text-white rounded-md hover:bg-green-700">
                          <Video className="inline mr-1 h-4 w-4" />
                          Join
                        </button>
                      </a>
                    )}
                  </div>

                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}