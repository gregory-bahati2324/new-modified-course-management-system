import { useState, useEffect } from 'react';
import { InstructorLayout } from '@/components/layout/InstructorLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search } from 'lucide-react';
import { DiscussionList } from '@/components/DiscussionList';
import { DiscussionChat } from '@/components/DiscussionChat';
import { CreateDiscussionModal } from '@/components/CreateDiscussionModal';
import { discussionService, Discussion } from '@/services/discussionService';
import { useToast } from '@/hooks/use-toast';

const InstructorDiscussions = () => {
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [selectedDiscussion, setSelectedDiscussion] = useState<Discussion | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadDiscussions();
  }, []);

  const loadDiscussions = async () => {
    try {
      setLoading(true);
      const data = await discussionService.getDiscussions();
      setDiscussions(data);
      if (data.length > 0 && !selectedDiscussion) {
        setSelectedDiscussion(data[0]);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load discussions',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDiscussion = async (data: any) => {
    try {
      const newDiscussion = await discussionService.createDiscussion(data);
      setDiscussions([newDiscussion, ...discussions]);
      toast({ title: 'Success', description: 'Discussion created successfully' });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create discussion',
        variant: 'destructive',
      });
    }
  };

  const handleSendMessage = async (content: string, attachments?: any[]) => {
    if (!selectedDiscussion) return;
    try {
      const message = await discussionService.sendMessage(selectedDiscussion.id, {
        content,
        attachments,
      });
      setSelectedDiscussion({
        ...selectedDiscussion,
        messages: [...selectedDiscussion.messages, message],
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to send message',
        variant: 'destructive',
      });
    }
  };

  const handleTogglePin = async (messageId: string) => {
    try {
      await discussionService.togglePin(messageId);
      toast({ title: 'Success', description: 'Message pin status updated' });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update pin status',
        variant: 'destructive',
      });
    }
  };

  const handleMarkQuestion = async (messageId: string) => {
    try {
      await discussionService.markAsQuestion(messageId);
      toast({ title: 'Success', description: 'Message marked as question' });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to mark as question',
        variant: 'destructive',
      });
    }
  };

  const handleReact = async (messageId: string, emoji: string) => {
    try {
      await discussionService.addReaction(messageId, emoji);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to add reaction',
        variant: 'destructive',
      });
    }
  };

  const filteredDiscussions = discussions.filter(
    (d) =>
      d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <InstructorLayout>
      <div className="h-[calc(100vh-4rem)] flex flex-col">
        <div className="border-b bg-card p-4">
          <div className="flex items-center justify-between gap-4">
            <h1 className="text-2xl font-bold">Discussions</h1>
            <Button onClick={() => setShowCreateModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              New Discussion
            </Button>
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Left Panel - Discussion List */}
          <div className="w-80 border-r flex flex-col">
            <div className="p-4 border-b">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search discussions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <DiscussionList
              discussions={filteredDiscussions}
              selectedId={selectedDiscussion?.id}
              onSelect={setSelectedDiscussion}
            />
          </div>

          {/* Right Panel - Chat */}
          <div className="flex-1">
            {selectedDiscussion ? (
              <DiscussionChat
                discussion={selectedDiscussion}
                onSendMessage={handleSendMessage}
                onTogglePin={handleTogglePin}
                onMarkQuestion={handleMarkQuestion}
                onReact={handleReact}
              />
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground">
                Select a discussion to start chatting
              </div>
            )}
          </div>
        </div>
      </div>

      <CreateDiscussionModal
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
        onSubmit={handleCreateDiscussion}
      />
    </InstructorLayout>
  );
};

export default InstructorDiscussions;