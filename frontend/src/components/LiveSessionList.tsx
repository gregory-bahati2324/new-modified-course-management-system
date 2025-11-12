import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Video, Calendar, Clock, Users, ExternalLink, Edit, Trash2 } from 'lucide-react';
import { LiveSession } from '@/services/liveSessionService';
import { format } from 'date-fns';

interface LiveSessionListProps {
  sessions: LiveSession[];
  onJoin?: (session: LiveSession) => void;
  onEdit?: (session: LiveSession) => void;
  onDelete?: (sessionId: string) => void;
  onStart?: (sessionId: string) => void;
  showActions?: boolean;
}

export const LiveSessionList = ({
  sessions,
  onJoin,
  onEdit,
  onDelete,
  onStart,
  showActions = false,
}: LiveSessionListProps) => {
  const getPlatformIcon = (platform: string) => {
    return <Video className="h-4 w-4" />;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'live':
        return (
          <Badge variant="default" className="bg-red-500 animate-pulse">
            <div className="h-2 w-2 rounded-full bg-white mr-1" />
            Live Now
          </Badge>
        );
      case 'upcoming':
        return <Badge variant="secondary">Upcoming</Badge>;
      case 'completed':
        return <Badge variant="outline">Completed</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {sessions.map((session) => (
        <Card key={session.id} className="p-6">
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                {getPlatformIcon(session.platform)}
                <h3 className="font-semibold text-lg line-clamp-2">{session.title}</h3>
              </div>
              {getStatusBadge(session.status)}
            </div>

            <p className="text-sm text-muted-foreground line-clamp-3">{session.description}</p>

            <div className="space-y-2">
              <Badge variant="outline">{session.courseName}</Badge>
              {session.moduleName && <Badge variant="secondary">{session.moduleName}</Badge>}
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>{format(new Date(session.startTime), 'PPP')}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>
                  {format(new Date(session.startTime), 'p')} ({session.duration} min)
                </span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Users className="h-4 w-4" />
                <span>
                  {session.participants} participant{session.participants !== 1 ? 's' : ''}
                  {session.maxParticipants && ` / ${session.maxParticipants}`}
                </span>
              </div>
            </div>

            <div className="flex gap-2">
              {session.status === 'live' && onJoin && (
                <Button onClick={() => onJoin(session)} className="flex-1">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Join Now
                </Button>
              )}
              {session.status === 'upcoming' && onJoin && (
                <Button onClick={() => onJoin(session)} variant="outline" className="flex-1">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Preview
                </Button>
              )}
              {session.status === 'completed' && session.recordingUrl && (
                <Button onClick={() => window.open(session.recordingUrl, '_blank')} variant="outline" className="flex-1">
                  <Video className="h-4 w-4 mr-2" />
                  Recording
                </Button>
              )}
              {showActions && (
                <>
                  {session.status === 'upcoming' && onStart && (
                    <Button onClick={() => onStart(session.id)} size="sm">
                      Start
                    </Button>
                  )}
                  {onEdit && (
                    <Button onClick={() => onEdit(session)} variant="outline" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                  )}
                  {onDelete && (
                    <Button
                      onClick={() => onDelete(session.id)}
                      variant="outline"
                      size="sm"
                      className="text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </>
              )}
            </div>

            {session.status === 'upcoming' && (
              <div className="text-xs text-center text-muted-foreground pt-2 border-t">
                Starts in {Math.round((new Date(session.startTime).getTime() - Date.now()) / (1000 * 60 * 60))} hours
              </div>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
};