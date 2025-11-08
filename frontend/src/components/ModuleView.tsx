import { useState } from 'react';
import { Eye, Edit, User, Calendar, Clock, BookOpen, Shield, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

interface Module {
  id: number;
  title: string;
  description: string;
  duration: string;
  order: number;
  objectives: string;
  instructor: {
    id: string;
    name: string;
    avatar?: string;
  };
  createdAt: string;
  status: 'published' | 'draft';
}

interface ModuleViewProps {
  courseId: string;
  currentInstructorId?: string;
}

export function ModuleView({ courseId, currentInstructorId = "MUST/STAFF/2020/045" }: ModuleViewProps) {
  const [viewType, setViewType] = useState<'cards' | 'table'>('cards');
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isPermissionOpen, setIsPermissionOpen] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState<'pending' | 'approved' | 'denied' | null>(null);
  const [editForm, setEditForm] = useState<Partial<Module>>({});
  const { toast } = useToast();

  // Mock modules data
  const modules: Module[] = [
    {
      id: 1,
      title: "Database Design Fundamentals",
      description: "Introduction to database design principles, normalization, and ER diagrams.",
      duration: "2 weeks",
      order: 1,
      objectives: "Understand database design principles, Create ER diagrams, Apply normalization techniques",
      instructor: {
        id: "MUST/STAFF/2020/045",
        name: "Dr. Sarah Johnson"
      },
      createdAt: "2024-01-15",
      status: "published"
    },
    {
      id: 2,
      title: "SQL Query Optimization",
      description: "Advanced SQL queries, indexing strategies, and performance optimization.",
      duration: "3 weeks",
      order: 2,
      objectives: "Write complex SQL queries, Understand indexing, Optimize query performance",
      instructor: {
        id: "MUST/STAFF/2021/022",
        name: "Prof. Michael Chen"
      },
      createdAt: "2024-01-22",
      status: "published"
    },
    {
      id: 3,
      title: "NoSQL Databases",
      description: "Introduction to NoSQL databases, MongoDB, and document-based systems.",
      duration: "2 weeks",
      order: 3,
      objectives: "Understand NoSQL concepts, Work with MongoDB, Compare SQL vs NoSQL",
      instructor: {
        id: "MUST/STAFF/2020/045",
        name: "Dr. Sarah Johnson"
      },
      createdAt: "2024-02-05",
      status: "published"
    },
    {
      id: 4,
      title: "Distributed Database Systems",
      description: "Concepts of distributed databases, replication, and consistency models.",
      duration: "4 weeks",
      order: 4,
      objectives: "Understand distributed systems, Learn about replication, Study consistency models",
      instructor: {
        id: "MUST/STAFF/2019/038",
        name: "Dr. James Wilson"
      },
      createdAt: "2024-02-12",
      status: "draft"
    }
  ];

  const canEdit = (module: Module) => {
    return module.instructor.id === currentInstructorId;
  };

  const handleEditModule = (module: Module) => {
    if (canEdit(module)) {
      setSelectedModule(module);
      setEditForm(module);
      setIsEditOpen(true);
    } else {
      setSelectedModule(module);
      setPermissionStatus('pending');
      setIsPermissionOpen(true);
      
      // Simulate permission response after 2 seconds
      setTimeout(() => {
        const isApproved = Math.random() > 0.3; // 70% approval rate
        setPermissionStatus(isApproved ? 'approved' : 'denied');
        
        if (isApproved) {
          setTimeout(() => {
            setIsPermissionOpen(false);
            setEditForm(module);
            setIsEditOpen(true);
            toast({
              title: "Permission Granted",
              description: "You can now edit this module.",
            });
          }, 1500);
        }
      }, 2000);
    }
  };

  const handleSaveModule = () => {
    toast({
      title: "Module Updated",
      description: `"${editForm.title}" has been updated successfully.`,
    });
    setIsEditOpen(false);
    setEditForm({});
  };

  const handleViewModule = (module: Module) => {
    // In a real app, this would navigate to module details
    toast({
      title: "View Module",
      description: `Opening "${module.title}" details...`,
    });
  };

  const renderCardsView = () => (
    <div className="grid gap-4">
      {modules.map((module) => (
        <Card key={module.id} className="hover:shadow-academic transition-all duration-300">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <CardTitle className="text-lg">{module.title}</CardTitle>
                <CardDescription>{module.description}</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={module.status === 'published' ? 'default' : 'secondary'}>
                  {module.status}
                </Badge>
                <Badge variant="outline">Week {module.order}</Badge>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{module.duration}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>Created {module.createdAt}</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={module.instructor.avatar} />
                  <AvatarFallback className="text-xs">
                    {module.instructor.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm text-muted-foreground">{module.instructor.name}</span>
                {canEdit(module) && (
                  <Badge variant="outline" className="text-xs">
                    <Shield className="mr-1 h-3 w-3" />
                    Owner
                  </Badge>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => handleViewModule(module)}
                >
                  <Eye className="mr-2 h-4 w-4" />
                  View
                </Button>
                <Button 
                  size="sm"
                  onClick={() => handleEditModule(module)}
                >
                  <Edit className="mr-2 h-4 w-4" />
                  {canEdit(module) ? 'Edit' : 'Request Edit'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const renderTableView = () => (
    <Card>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Module</TableHead>
            <TableHead>Instructor</TableHead>
            <TableHead>Duration</TableHead>
            <TableHead>Order</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {modules.map((module) => (
            <TableRow key={module.id}>
              <TableCell>
                <div className="space-y-1">
                  <p className="font-medium">{module.title}</p>
                  <p className="text-sm text-muted-foreground truncate max-w-[300px]">
                    {module.description}
                  </p>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={module.instructor.avatar} />
                    <AvatarFallback className="text-xs">
                      {module.instructor.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm">{module.instructor.name}</span>
                  {canEdit(module) && (
                    <Badge variant="outline" className="text-xs">
                      <Shield className="mr-1 h-3 w-3" />
                      Owner
                    </Badge>
                  )}
                </div>
              </TableCell>
              <TableCell>{module.duration}</TableCell>
              <TableCell>
                <Badge variant="outline">Week {module.order}</Badge>
              </TableCell>
              <TableCell>
                <Badge variant={module.status === 'published' ? 'default' : 'secondary'}>
                  {module.status}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleViewModule(module)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button 
                    size="sm"
                    onClick={() => handleEditModule(module)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Course Modules</h2>
          <p className="text-muted-foreground">Manage and view all modules in this course</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={viewType === 'cards' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewType('cards')}
          >
            Cards
          </Button>
          <Button
            variant={viewType === 'table' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewType('table')}
          >
            Table
          </Button>
        </div>
      </div>

      {viewType === 'cards' ? renderCardsView() : renderTableView()}

      {/* Permission Request Dialog */}
      <Dialog open={isPermissionOpen} onOpenChange={setIsPermissionOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Edit Permission Required
            </DialogTitle>
            <DialogDescription>
              You need permission to edit "{selectedModule?.title}" as it belongs to {selectedModule?.instructor.name}.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            {permissionStatus === 'pending' && (
              <div className="flex items-center gap-3 text-warning">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-warning"></div>
                <span>Requesting permission...</span>
              </div>
            )}
            
            {permissionStatus === 'approved' && (
              <div className="flex items-center gap-2 text-success">
                <div className="rounded-full h-4 w-4 bg-success text-success-foreground flex items-center justify-center">✓</div>
                <span>Permission approved! Redirecting to edit...</span>
              </div>
            )}
            
            {permissionStatus === 'denied' && (
              <div className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="h-4 w-4" />
                <span>Permission denied. Please contact the module owner.</span>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsPermissionOpen(false)}
              disabled={permissionStatus === 'pending'}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Module Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Module</DialogTitle>
            <DialogDescription>
              Make changes to "{editForm.title}"
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-title">Module Title</Label>
              <Input
                id="edit-title"
                value={editForm.title || ''}
                onChange={(e) => setEditForm({...editForm, title: e.target.value})}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={editForm.description || ''}
                onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                rows={3}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-duration">Duration</Label>
                <Select 
                  value={editForm.duration || ''} 
                  onValueChange={(value) => setEditForm({...editForm, duration: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select duration" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1 week">1 Week</SelectItem>
                    <SelectItem value="2 weeks">2 Weeks</SelectItem>
                    <SelectItem value="3 weeks">3 Weeks</SelectItem>
                    <SelectItem value="4 weeks">4 Weeks</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="edit-order">Week Order</Label>
                <Select 
                  value={editForm.order?.toString() || ''} 
                  onValueChange={(value) => setEditForm({...editForm, order: parseInt(value)})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select order" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({length: 16}, (_, i) => (
                      <SelectItem key={i + 1} value={(i + 1).toString()}>
                        Week {i + 1}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="edit-objectives">Learning Objectives</Label>
              <Textarea
                id="edit-objectives"
                value={editForm.objectives || ''}
                onChange={(e) => setEditForm({...editForm, objectives: e.target.value})}
                rows={3}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveModule}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}