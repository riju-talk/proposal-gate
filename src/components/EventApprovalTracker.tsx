import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useEventApprovals } from '@/hooks/useEventApprovals';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, XCircle, Clock, AlertCircle, MessageSquare } from 'lucide-react';

interface EventApprovalTrackerProps {
  eventId: string;
}

export const EventApprovalTracker = ({ eventId }: EventApprovalTrackerProps) => {
  const { approvals, isLoading, updateApprovalStatus, canApprove } = useEventApprovals(eventId);
  const { user } = useAuth();
  const { toast } = useToast();
  const [comments, setComments] = useState<{ [key: string]: string }>({});
  const [processingApproval, setProcessingApproval] = useState<string | null>(null);

  const handleApproval = async (status: 'approved' | 'rejected', adminEmail: string) => {
    if (!user?.email) return;

    setProcessingApproval(`${adminEmail}-${status}`);
    
    const result = await updateApprovalStatus(
      eventId,
      adminEmail,
      status,
      comments[adminEmail] || ''
    );

    if (result.success) {
      toast({
        title: status === 'approved' ? 'Event Approved' : 'Event Rejected',
        description: `You have ${status} this event proposal.`,
      });
      setComments(prev => ({ ...prev, [adminEmail]: '' }));
    } else {
      toast({
        title: 'Error',
        description: result.error || 'Failed to update approval status',
        variant: 'destructive',
      });
    }

    setProcessingApproval(null);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      approved: 'default',
      rejected: 'destructive',
      pending: 'secondary'
    } as const;

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'outline'}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Approval Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const overallStatus = approvals.every(a => a.status === 'approved') 
    ? 'fully_approved' 
    : approvals.some(a => a.status === 'rejected') 
    ? 'rejected' 
    : 'pending';

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Approval Status
          {overallStatus === 'fully_approved' && <CheckCircle className="h-5 w-5 text-green-500" />}
          {overallStatus === 'rejected' && <XCircle className="h-5 w-5 text-red-500" />}
          {overallStatus === 'pending' && <Clock className="h-5 w-5 text-yellow-500" />}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {approvals.map((approval) => {
            const { canApprove: canUserApprove, reason } = canApprove(user?.email || '', eventId);
            const isCurrentUserApproval = approval.admin_email === user?.email;
            const canCurrentUserApprove = isCurrentUserApproval && canUserApprove && approval.status === 'pending';

            return (
              <div key={approval.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(approval.status)}
                    <div>
                      <h4 className="font-medium">{approval.admin_name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {approval.admin_role?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </p>
                    </div>
                  </div>
                  {getStatusBadge(approval.status)}
                </div>

                {approval.approved_at && (
                  <p className="text-sm text-muted-foreground">
                    {approval.status === 'approved' ? 'Approved' : 'Rejected'} on{' '}
                    {new Date(approval.approved_at).toLocaleDateString('en-IN', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                )}

                {approval.comments && (
                  <div className="flex items-start gap-2 p-3 bg-muted rounded-md">
                    <MessageSquare className="h-4 w-4 mt-0.5 text-muted-foreground" />
                    <p className="text-sm">{approval.comments}</p>
                  </div>
                )}

                {canCurrentUserApprove && (
                  <div className="space-y-3 pt-3 border-t">
                    <Textarea
                      placeholder="Add comments (optional)"
                      value={comments[approval.admin_email] || ''}
                      onChange={(e) => setComments(prev => ({ 
                        ...prev, 
                        [approval.admin_email]: e.target.value 
                      }))}
                      className="min-h-[80px]"
                    />
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleApproval('approved', approval.admin_email)}
                        disabled={processingApproval === `${approval.admin_email}-approved`}
                        size="sm"
                        className="bg-green-600 hover:bg-green-700"
                      >
                        {processingApproval === `${approval.admin_email}-approved` ? 'Approving...' : 'Approve'}
                      </Button>
                      <Button
                        onClick={() => handleApproval('rejected', approval.admin_email)}
                        disabled={processingApproval === `${approval.admin_email}-rejected`}
                        variant="destructive"
                        size="sm"
                      >
                        {processingApproval === `${approval.admin_email}-rejected` ? 'Rejecting...' : 'Reject'}
                      </Button>
                    </div>
                  </div>
                )}

                {isCurrentUserApproval && !canUserApprove && approval.status === 'pending' && reason && (
                  <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                    <AlertCircle className="h-4 w-4 text-yellow-600" />
                    <p className="text-sm text-yellow-800">{reason}</p>
                  </div>
                )}
              </div>
            );
          })}

          {overallStatus === 'fully_approved' && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <h4 className="font-medium text-green-800">Event Fully Approved</h4>
              </div>
              <p className="text-sm text-green-700 mt-1">
                This event has been approved by all required authorities and can proceed as planned.
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};