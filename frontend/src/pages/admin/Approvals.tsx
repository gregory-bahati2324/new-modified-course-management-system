import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Clock, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { adminService, PendingApproval } from '@/services/adminService';
import { useToast } from '@/hooks/use-toast';
import { AdminLayout } from '@/components/layout/AdminLayout';

export default function AdminApprovals() {
  const [approvals, setApprovals] = useState<PendingApproval[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApproval, setSelectedApproval] = useState<PendingApproval | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [action, setAction] = useState<'approve' | 'reject'>('approve');
  const { toast } = useToast();

  useEffect(() => {
    loadApprovals();
  }, []);

  const loadApprovals = async () => {
    try {
      setLoading(true);
      const data = await adminService.getPendingApprovals();
      setApprovals(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load pending approvals',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApproval = async () => {
    if (!selectedApproval) return;

    try {
      await adminService.handleApproval(selectedApproval.id, action, reason);
      toast({
        title: 'Success',
        description: `Request ${action === 'approve' ? 'approved' : 'rejected'} successfully`,
      });
      setIsDialogOpen(false);
      setReason('');
      loadApprovals();
    } catch (error) {
      toast({
        title: 'Error',
        description: `Failed to ${action} request`,
        variant: 'destructive',
      });
    }
  };

  const openApprovalDialog = (approval: PendingApproval, approvalAction: 'approve' | 'reject') => {
    setSelectedApproval(approval);
    setAction(approvalAction);
    setIsDialogOpen(true);
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Badge variant="destructive">High Priority</Badge>;
      case 'medium':
        return <Badge variant="default">Medium Priority</Badge>;
      case 'low':
        return <Badge variant="secondary">Low Priority</Badge>;
      default:
        return null;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'course':
        return <Badge variant="outline">Course</Badge>;
      case 'user':
        return <Badge variant="outline">User</Badge>;
      case 'certificate':
        return <Badge variant="outline">Certificate</Badge>;
      case 'enrollment':
        return <Badge variant="outline">Enrollment</Badge>;
      default:
        return null;
    }
  };

  const filterByType = (type?: string) => {
    return type ? approvals.filter(a => a.type === type) : approvals;
  };

  const ApprovalCard = ({ approval }: { approval: PendingApproval }) => (
    <Card key={approval.id}>
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-2">
                {getTypeBadge(approval.type)}
                {getPriorityBadge(approval.priority)}
              </div>
              <h3 className="font-semibold text-lg">{approval.title}</h3>
              <p className="text-sm text-muted-foreground">{approval.description}</p>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <div className="space-y-1">
              <p className="text-muted-foreground">Requester</p>
              <p className="font-medium">{approval.requester}</p>
              <p className="text-xs text-muted-foreground">{approval.requester_email}</p>
            </div>
            <div className="space-y-1 text-right">
              <p className="text-muted-foreground">Requested</p>
              <p className="font-medium">
                {new Date(approval.requested_at).toLocaleDateString()}
              </p>
              <p className="text-xs text-muted-foreground">
                {new Date(approval.requested_at).toLocaleTimeString()}
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => openApprovalDialog(approval, 'approve')}
              className="flex-1"
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              Approve
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => openApprovalDialog(approval, 'reject')}
              className="flex-1"
            >
              <XCircle className="mr-2 h-4 w-4" />
              Reject
            </Button>
            <Button variant="ghost" size="sm">
              <Eye className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <AdminLayout>
      <div className="container py-8 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Pending Approvals</h1>
          <p className="text-muted-foreground">
            Review and manage requests requiring approval
          </p>
        </div>
        <Badge variant="secondary" className="text-lg px-4 py-2">
          <Clock className="mr-2 h-4 w-4" />
          {approvals.length} Pending
        </Badge>
      </div>

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All ({approvals.length})</TabsTrigger>
          <TabsTrigger value="course">
            Courses ({filterByType('course').length})
          </TabsTrigger>
          <TabsTrigger value="user">
            Users ({filterByType('user').length})
          </TabsTrigger>
          <TabsTrigger value="certificate">
            Certificates ({filterByType('certificate').length})
          </TabsTrigger>
          <TabsTrigger value="enrollment">
            Enrollments ({filterByType('enrollment').length})
          </TabsTrigger>
        </TabsList>

        {loading ? (
          <div className="text-center py-12">Loading approvals...</div>
        ) : (
          <>
            <TabsContent value="all" className="space-y-4">
              {approvals.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-12">
                    <CheckCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-semibold mb-2">No Pending Approvals</h3>
                    <p className="text-muted-foreground">
                      All requests have been processed
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4">
                  {approvals.map(approval => (
                    <ApprovalCard key={approval.id} approval={approval} />
                  ))}
                </div>
              )}
            </TabsContent>

            {['course', 'user', 'certificate', 'enrollment'].map(type => (
              <TabsContent key={type} value={type} className="space-y-4">
                {filterByType(type).length === 0 ? (
                  <Card>
                    <CardContent className="text-center py-12">
                      <p className="text-muted-foreground">
                        No pending {type} approvals
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid gap-4">
                    {filterByType(type).map(approval => (
                      <ApprovalCard key={approval.id} approval={approval} />
                    ))}
                  </div>
                )}
              </TabsContent>
            ))}
          </>
        )}
      </Tabs>

      {/* Approval/Rejection Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {action === 'approve' ? 'Approve Request' : 'Reject Request'}
            </DialogTitle>
            <DialogDescription>
              {action === 'approve'
                ? 'Confirm approval of this request'
                : 'Provide a reason for rejection'}
            </DialogDescription>
          </DialogHeader>
          {selectedApproval && (
            <div className="space-y-4">
              <div className="rounded-lg bg-muted p-4 space-y-2">
                <h4 className="font-semibold">{selectedApproval.title}</h4>
                <p className="text-sm text-muted-foreground">
                  {selectedApproval.description}
                </p>
                <p className="text-sm">
                  Requested by: {selectedApproval.requester} ({selectedApproval.requester_email})
                </p>
              </div>
              {action === 'reject' && (
                <div className="space-y-2">
                  <Label htmlFor="reason">Rejection Reason</Label>
                  <Textarea
                    id="reason"
                    placeholder="Please provide a reason for rejection..."
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="min-h-24"
                  />
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant={action === 'approve' ? 'default' : 'destructive'}
              onClick={handleApproval}
            >
              {action === 'approve' ? 'Approve' : 'Reject'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      </div>
    </AdminLayout>
  );
}
