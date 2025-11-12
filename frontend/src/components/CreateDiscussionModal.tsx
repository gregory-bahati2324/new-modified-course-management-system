import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';

interface CreateDiscussionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: {
    title: string;
    description: string;
    courseId: string;
    moduleId?: string;
    visibility: string;
    participantIds: string[];
  }) => void;
}

export const CreateDiscussionModal = ({ open, onOpenChange, onSubmit }: CreateDiscussionModalProps) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [courseId, setCourseId] = useState('');
  const [moduleId, setModuleId] = useState('');
  const [visibility, setVisibility] = useState('course');
  const [participants, setParticipants] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSubmit = () => {
    onSubmit({
      title,
      description,
      courseId,
      moduleId: moduleId || undefined,
      visibility,
      participantIds: participants,
    });
    // Reset form
    setTitle('');
    setDescription('');
    setCourseId('');
    setModuleId('');
    setVisibility('course');
    setParticipants([]);
    onOpenChange(false);
  };

  const mockUsers = [
    { id: '1', name: 'John Doe', role: 'student' },
    { id: '2', name: 'Jane Smith', role: 'student' },
    { id: '3', name: 'Dr. Johnson', role: 'instructor' },
  ];

  const addParticipant = (userId: string) => {
    if (!participants.includes(userId)) {
      setParticipants([...participants, userId]);
    }
  };

  const removeParticipant = (userId: string) => {
    setParticipants(participants.filter((id) => id !== userId));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create New Discussion</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">Discussion Title *</Label>
            <Input
              id="title"
              placeholder="e.g., Introduction to React Hooks"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              placeholder="Brief description of what will be discussed..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="course">Course *</Label>
              <Select value={courseId} onValueChange={setCourseId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select course" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Web Development Fundamentals</SelectItem>
                  <SelectItem value="2">Data Structures</SelectItem>
                  <SelectItem value="3">Machine Learning</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="module">Module (Optional)</Label>
              <Select value={moduleId} onValueChange={setModuleId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select module" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">React Basics</SelectItem>
                  <SelectItem value="2">Advanced Concepts</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="visibility">Visibility *</Label>
            <Select value={visibility} onValueChange={setVisibility}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="private">Private (Selected participants only)</SelectItem>
                <SelectItem value="course">Course Level (All course participants)</SelectItem>
                <SelectItem value="public">Public (Anyone can join)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Add Participants</Label>
            <Input
              placeholder="Search students or instructors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <div className="max-h-32 overflow-y-auto border rounded-md p-2 space-y-1">
              {mockUsers
                .filter((user) => user.name.toLowerCase().includes(searchQuery.toLowerCase()))
                .map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-2 hover:bg-muted rounded-md cursor-pointer"
                    onClick={() => addParticipant(user.id)}
                  >
                    <span className="text-sm">{user.name}</span>
                    <Badge variant="outline" className="text-xs">
                      {user.role}
                    </Badge>
                  </div>
                ))}
            </div>
          </div>

          {participants.length > 0 && (
            <div className="space-y-2">
              <Label>Selected Participants ({participants.length})</Label>
              <div className="flex flex-wrap gap-2">
                {participants.map((pid) => {
                  const user = mockUsers.find((u) => u.id === pid);
                  return (
                    <Badge key={pid} variant="secondary" className="gap-1">
                      {user?.name}
                      <X
                        className="h-3 w-3 cursor-pointer"
                        onClick={() => removeParticipant(pid)}
                      />
                    </Badge>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!title || !description || !courseId}>
            Create Discussion
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};