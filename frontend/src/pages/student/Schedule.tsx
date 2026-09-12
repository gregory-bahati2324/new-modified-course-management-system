import { useEffect, useMemo, useState } from 'react';
import { Calendar, Clock, MapPin, Video, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { courseService } from '@/services/courseService';
import { scheduleService, Schedule } from '@/services/scheduleService';

// A session enriched with the course it belongs to, so the student
// knows which of their courses each lecture / live session is for.
interface StudentSession extends Schedule {
  course_title?: string;
  course_code?: string;
}

export default function StudentSchedule() {
  const [sessions, setSessions] = useState<StudentSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasEnrolledCourses, setHasEnrolledCourses] = useState(true);

  useEffect(() => {
    const fetchStudentSchedule = async () => {
      try {
        setLoading(true);

        // 1. Get the courses the student is actually enrolled in
        const courses = await courseService.getEnrolledCourses();

        if (!courses || courses.length === 0) {
          setHasEnrolledCourses(false);
          setSessions([]);
          return;
        }

        setHasEnrolledCourses(true);

        // 2. Fetch the sessions (normal + live) each instructor scheduled
        //    for those courses, in parallel so one slow/broken course
        //    doesn't block the rest.
        const results = await Promise.allSettled(
          courses.map((course) => scheduleService.getCourseSchedules(course.id))
        );

        const allSessions: StudentSession[] = [];

        results.forEach((result, index) => {
          const course = courses[index];

          if (result.status === 'fulfilled') {
            const enriched = (result.value || []).map((session) => ({
              ...session,
              course_title: course.title,
              course_code: course.code,
            }));
            allSessions.push(...enriched);
          } else {
            // Log and skip this course's sessions instead of failing the whole page
            console.error(
              `Failed to load sessions for course ${course.id}:`,
              result.reason
            );
          }
        });

        // 3. Sort by date, then start time
        allSessions.sort((a, b) => {
          const dateDiff = new Date(a.date).getTime() - new Date(b.date).getTime();
          if (dateDiff !== 0) return dateDiff;
          return (a.start_time || '').localeCompare(b.start_time || '');
        });

        setSessions(allSessions);
      } catch (error: any) {
        console.error('Failed to load student schedule:', error);
        toast.error(error.message || 'Failed to load your schedule');
      } finally {
        setLoading(false);
      }
    };

    fetchStudentSchedule();
  }, []);

  const upcomingCount = useMemo(
    () =>
      sessions.filter((s) => {
        const sessionDate = new Date(s.date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return sessionDate >= today;
      }).length,
    [sessions]
  );

  const liveCount = useMemo(
    () => sessions.filter((s) => s.is_online).length,
    [sessions]
  );

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'lecture':
        return <Users className="h-4 w-4" />;
      case 'lab':
        return <Users className="h-4 w-4" />;
      case 'presentation':
        return <Video className="h-4 w-4" />;
      default:
        return <Calendar className="h-4 w-4" />;
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
          View sessions your instructors have scheduled for the courses you're taking
        </p>
      </div>

      {/* SUMMARY */}
      {!loading && sessions.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <p className="text-2xl font-bold">{sessions.length}</p>
              <p className="text-xs text-muted-foreground">Total Sessions</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-2xl font-bold">{upcomingCount}</p>
              <p className="text-xs text-muted-foreground">Upcoming</p>
            </CardContent>
          </Card>
          <Card className="col-span-2 sm:col-span-1">
            <CardContent className="p-4">
              <p className="text-2xl font-bold">{liveCount}</p>
              <p className="text-xs text-muted-foreground">Online</p>
            </CardContent>
          </Card>
        </div>
      )}

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
            ) : !hasEnrolledCourses ? (
              <p className="text-muted-foreground">
                You're not enrolled in any courses yet.
              </p>
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
                          {session.course_title && (
                            <p className="text-sm text-muted-foreground">
                              {session.course_title}
                              {session.course_code ? ` (${session.course_code})` : ''}
                            </p>
                          )}
                          {session.description && (
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {session.description}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <Badge variant="outline">
                            {session.type}
                          </Badge>
                          {session.is_online && (
                            <Badge variant="secondary" className="gap-1">
                              <Video className="h-3 w-3" />
                              Live
                            </Badge>
                          )}
                        </div>
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
                          {session.is_online ? 'Online' : session.location}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* RIGHT (ONLY JOIN) */}
                  <div className="flex flex-wrap gap-2">
                    {session.is_online && session.meeting_link && (
                      <a href={session.meeting_link} target="_blank" rel="noopener noreferrer">
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