import { useState, useEffect } from 'react';
import { InstructorLayout } from '@/components/layout/InstructorLayout';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Video } from 'lucide-react';
import { LiveSessionScheduler } from '@/components/LiveSessionScheduler';
import { LiveSessionList } from '@/components/LiveSessionList';
import { liveSessionService, LiveSession } from '@/services/liveSessionService';
import { useToast } from '@/hooks/use-toast';

const InstructorLiveSessions = () => {
  const [sessions, setSessions] = useState<LiveSession[]>([]);
  const [showScheduler, setShowScheduler] = useState(false);
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

  const handleCreateSession = async (data: any) => {
    try {
      const newSession = await liveSessionService.createSession(data);
      setSessions([newSession, ...sessions]);
      toast({ title: 'Success', description: 'Session scheduled successfully' });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to schedule session',
        variant: 'destructive',
      });
    }
  };

  const handleStartSession = async (sessionId: string) => {
    try {
      await liveSessionService.startSession(sessionId);
      toast({ title: 'Success', description: 'Session started' });
      loadSessions();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to start session',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteSession = async (sessionId: string) => {
    try {
      await liveSessionService.deleteSession(sessionId);
      setSessions(sessions.filter((s) => s.id !== sessionId));
      toast({ title: 'Success', description: 'Session deleted' });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete session',
        variant: 'destructive',
      });
    }
  };

  const handleJoinSession = (session: LiveSession) => {
    window.open(session.meetingLink, '_blank');
  };

  const upcomingSessions = sessions.filter((s) => s.status === 'upcoming');
  const liveSessions = sessions.filter((s) => s.status === 'live');
  const completedSessions = sessions.filter((s) => s.status === 'completed');

  return (
    <InstructorLayout>
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Live Training Sessions</h1>
            <p className="text-muted-foreground mt-1">
              Schedule and manage live video sessions with students
            </p>
          </div>
          <Button onClick={() => setShowScheduler(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Schedule Session
          </Button>
        </div>

        <Tabs defaultValue="upcoming" className="space-y-6">
          <TabsList>
            <TabsTrigger value="upcoming">
              Upcoming ({upcomingSessions.length})
            </TabsTrigger>
            <TabsTrigger value="live">
              Live Now ({liveSessions.length})
            </TabsTrigger>
            <TabsTrigger value="completed">
              Completed ({completedSessions.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming" className="space-y-4">
            {upcomingSessions.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Video className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No upcoming sessions scheduled</p>
              </div>
            ) : (
              <LiveSessionList
                sessions={upcomingSessions}
                onJoin={handleJoinSession}
                onStart={handleStartSession}
                onDelete={handleDeleteSession}
                showActions
              />
            )}
          </TabsContent>

          <TabsContent value="live" className="space-y-4">
            {liveSessions.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Video className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No live sessions at the moment</p>
              </div>
            ) : (
              <LiveSessionList
                sessions={liveSessions}
                onJoin={handleJoinSession}
                showActions
              />
            )}
          </TabsContent>

          <TabsContent value="completed" className="space-y-4">
            {completedSessions.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Video className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No completed sessions yet</p>
              </div>
            ) : (
              <LiveSessionList sessions={completedSessions} onJoin={handleJoinSession} />
            )}
          </TabsContent>
        </Tabs>
      </div>

      <LiveSessionScheduler
        open={showScheduler}
        onOpenChange={setShowScheduler}
        onSubmit={handleCreateSession}
      />
    </InstructorLayout>
  );
};

export default InstructorLiveSessions;