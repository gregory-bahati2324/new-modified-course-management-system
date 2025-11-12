import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Send,
  Paperclip,
  Pin,
  HelpCircle,
  ThumbsUp,
  Heart,
  Smile,
  MoreVertical,
  Reply,
  CheckCircle,
  Users,
  MessageSquare,
} from 'lucide-react';
import { Discussion, Message } from '@/services/discussionService';
import { formatDistanceToNow } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

interface DiscussionChatProps {
  discussion: Discussion;
  onSendMessage: (content: string, attachments?: any[]) => void;
  onTogglePin: (messageId: string) => void;
  onMarkQuestion: (messageId: string) => void;
  onReact: (messageId: string, emoji: string) => void;
}

export const DiscussionChat = ({
  discussion,
  onSendMessage,
  onTogglePin,
  onMarkQuestion,
  onReact,
}: DiscussionChatProps) => {
  const [message, setMessage] = useState('');
  const [showParticipants, setShowParticipants] = useState(false);
  const { toast } = useToast();

  const handleSend = () => {
    if (message.trim()) {
      onSendMessage(message);
      setMessage('');
    }
  };

  const handleFileAttach = () => {
    toast({ title: 'File upload', description: 'File upload feature coming soon' });
  };

  const reactions = ['👍', '❤️', '😊', '🎉', '🤔', '👏'];

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b bg-card p-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">{discussion.title}</h2>
            <p className="text-sm text-muted-foreground">{discussion.description}</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowParticipants(!showParticipants)}
          >
            <Users className="h-4 w-4 mr-2" />
            {discussion.participants.length}
          </Button>
        </div>
        <div className="flex gap-2 mt-2">
          <Badge variant="outline">{discussion.courseName}</Badge>
          {discussion.moduleName && <Badge variant="secondary">{discussion.moduleName}</Badge>}
        </div>
      </div>

      {/* Participants Sidebar */}
      {showParticipants && (
        <div className="border-b bg-muted/50 p-4">
          <h3 className="text-sm font-semibold mb-3">Participants</h3>
          <div className="flex flex-wrap gap-2">
            {discussion.participants.map((participant) => (
              <div
                key={participant.id}
                className="flex items-center gap-2 bg-background rounded-full px-3 py-1 text-sm"
              >
                <div className="relative">
                  <Avatar className="h-6 w-6">
                    <AvatarFallback className="text-xs">
                      {participant.name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  {participant.online && (
                    <div className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-green-500 border-2 border-background" />
                  )}
                </div>
                <span>{participant.name}</span>
                {participant.role === 'instructor' && (
                  <Badge variant="default" className="text-xs">
                    Instructor
                  </Badge>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {discussion.messages.map((msg) => (
            <MessageBubble
              key={msg.id}
              message={msg}
              onTogglePin={onTogglePin}
              onMarkQuestion={onMarkQuestion}
              onReact={onReact}
              reactions={reactions}
            />
          ))}
          {discussion.messages.length === 0 && (
            <div className="text-center text-muted-foreground py-12">
              <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No messages yet. Start the conversation!</p>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="border-t bg-card p-4">
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={handleFileAttach}>
            <Paperclip className="h-4 w-4" />
          </Button>
          <Input
            placeholder="Type your message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          />
          <Button onClick={handleSend} disabled={!message.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

const MessageBubble = ({
  message,
  onTogglePin,
  onMarkQuestion,
  onReact,
  reactions,
}: {
  message: Message;
  onTogglePin: (id: string) => void;
  onMarkQuestion: (id: string) => void;
  onReact: (id: string, emoji: string) => void;
  reactions: string[];
}) => {
  const isInstructor = message.senderRole === 'instructor';

  return (
    <Card className={`p-4 ${isInstructor ? 'bg-primary/5 border-primary/20' : ''}`}>
      <div className="flex gap-3">
        <Avatar>
          <AvatarFallback>{message.senderName.substring(0, 2).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-semibold text-sm">{message.senderName}</span>
            {isInstructor && (
              <Badge variant="default" className="text-xs">
                Instructor
              </Badge>
            )}
            {message.isPinned && <Pin className="h-3 w-3 text-primary" />}
            {message.isQuestion && <HelpCircle className="h-3 w-3 text-blue-500" />}
            {message.isAcceptedAnswer && <CheckCircle className="h-3 w-3 text-green-500" />}
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(message.timestamp), { addSuffix: true })}
            </span>
          </div>
          <p className="text-sm mb-2 whitespace-pre-wrap">{message.content}</p>

          {message.attachments && message.attachments.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-2">
              {message.attachments.map((att, idx) => (
                <Badge key={idx} variant="outline">
                  {att.name}
                </Badge>
              ))}
            </div>
          )}

          <div className="flex items-center gap-2 mt-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="sm" className="h-7 px-2">
                  <Smile className="h-3 w-3 mr-1" />
                  <span className="text-xs">React</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-2">
                <div className="flex gap-1">
                  {reactions.map((emoji) => (
                    <Button
                      key={emoji}
                      variant="ghost"
                      size="sm"
                      onClick={() => onReact(message.id, emoji)}
                    >
                      {emoji}
                    </Button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>

            <Button variant="ghost" size="sm" className="h-7 px-2">
              <Reply className="h-3 w-3 mr-1" />
              <span className="text-xs">Reply</span>
            </Button>

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="sm" className="h-7 px-2">
                  <MoreVertical className="h-3 w-3" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-48">
                <div className="space-y-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => onTogglePin(message.id)}
                  >
                    <Pin className="h-4 w-4 mr-2" />
                    {message.isPinned ? 'Unpin' : 'Pin Message'}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => onMarkQuestion(message.id)}
                  >
                    <HelpCircle className="h-4 w-4 mr-2" />
                    Mark as Question
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          </div>

          {message.reactions.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {message.reactions.map((reaction, idx) => (
                <Badge key={idx} variant="secondary" className="text-xs">
                  {reaction.emoji} {reaction.count}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};