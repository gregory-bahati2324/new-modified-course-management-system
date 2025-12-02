import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Video, Calendar, Clock } from 'lucide-react';
import { LiveSessionList } from '@/components/LiveSessionList';
import { liveSessionService, LiveSession } from '@/services/liveSessionService';
import { useToast } from '@/hooks/use-toast';
import { format, addHours } from 'date-fns';

const StudentLiveSessions = () => {
  const [sessions, setSessions] = useState<LiveSession[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      setLoading(true);
      const data = await liveSessionService.getSessions();
      setSessions(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load sessions',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleJoinSession = async (session: LiveSession) => {
    try {
      const link = await liveSessionService.joinSession(session.id);
      window.open(link, '_blank');
      toast({ title: 'Success', description: 'Joining session...' });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to join session',
        variant: 'destructive',
      });
    }
  };

  const upcomingSessions = sessions.filter((s) => s.status === 'upcoming');
  const liveSessions = sessions.filter((s) => s.status === 'live');
  const completedSessions = sessions.filter((s) => s.status === 'completed');

  // Get next session happening within 24 hours
  const nextSession = upcomingSessions
    .filter((s) => new Date(s.startTime).getTime() - Date.now() < 86400000)
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())[0];

  return (
      <div className="container mx-auto p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Live Training Sessions</h1>
          <p className="text-muted-foreground mt-1">
            Join live sessions with your instructors and classmates
          </p>
        </div>

        {nextSession && (
          <Card className="p-6 bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Video className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-1">Next Session Starting Soon</h3>
                <p className="text-muted-foreground mb-3">{nextSession.title}</p>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>{format(new Date(nextSession.startTime), 'PPP')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>{format(new Date(nextSession.startTime), 'p')}</span>
                  </div>
                </div>
                <div className="mt-3 text-sm font-medium text-primary">
                  Starts in {Math.round((new Date(nextSession.startTime).getTime() - Date.now()) / (1000 * 60))} minutes
                </div>
              </div>
            </div>
          </Card>
        )}

        <Tabs defaultValue="live" className="space-y-6">
          <TabsList>
            <TabsTrigger value="live">
              Live Now ({liveSessions.length})
            </TabsTrigger>
            <TabsTrigger value="upcoming">
              Upcoming ({upcomingSessions.length})
            </TabsTrigger>
            <TabsTrigger value="completed">
              Past Sessions ({completedSessions.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="live" className="space-y-4">
            {liveSessions.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Video className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No live sessions at the moment</p>
                <p className="text-sm mt-2">Check back later or view upcoming sessions</p>
              </div>
            ) : (
              <LiveSessionList sessions={liveSessions} onJoin={handleJoinSession} />
            )}
          </TabsContent>

          <TabsContent value="upcoming" className="space-y-4">
            {upcomingSessions.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No upcoming sessions scheduled</p>
              </div>
            ) : (
              <LiveSessionList sessions={upcomingSessions} onJoin={handleJoinSession} />
            )}
          </TabsContent>

          <TabsContent value="completed" className="space-y-4">
            {completedSessions.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Video className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No past sessions available</p>
              </div>
            ) : (
              <LiveSessionList sessions={completedSessions} onJoin={handleJoinSession} />
            )}
          </TabsContent>
        </Tabs>
      </div>
  );
};

export default StudentLiveSessions;