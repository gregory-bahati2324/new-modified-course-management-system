import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageSquare, Users, Clock } from 'lucide-react';
import { Discussion } from '@/services/discussionService';
import { formatDistanceToNow } from 'date-fns';

interface DiscussionListProps {
  discussions: Discussion[];
  selectedId?: string;
  onSelect: (discussion: Discussion) => void;
}

export const DiscussionList = ({ discussions, selectedId, onSelect }: DiscussionListProps) => {
  return (
    <ScrollArea className="h-full">
      <div className="space-y-2 p-4">
        {discussions.map((discussion) => (
          <div
            key={discussion.id}
            onClick={() => onSelect(discussion)}
            className={`p-4 rounded-lg border cursor-pointer transition-all hover:border-primary ${
              selectedId === discussion.id ? 'bg-primary/5 border-primary' : 'bg-card'
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <MessageSquare className="h-4 w-4 text-primary flex-shrink-0" />
                  <h3 className="font-semibold text-sm truncate">{discussion.title}</h3>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                  {discussion.description}
                </p>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    <span>{discussion.participants.length}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>{formatDistanceToNow(new Date(discussion.createdAt), { addSuffix: true })}</span>
                  </div>
                </div>
              </div>
              {discussion.unreadCount > 0 && (
                <Badge variant="default" className="flex-shrink-0">
                  {discussion.unreadCount}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="outline" className="text-xs">
                {discussion.courseName}
              </Badge>
              {discussion.moduleName && (
                <Badge variant="secondary" className="text-xs">
                  {discussion.moduleName}
                </Badge>
              )}
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
};