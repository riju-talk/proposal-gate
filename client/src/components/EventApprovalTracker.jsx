import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, XCircle, Clock, AlertCircle, MessageSquare } from 'lucide-react';
import { usePublicApprovalStatus } from '@/hooks/usePublicApprovalStatus';
import { useEventApprovals } from '@/hooks/useEventApprovals';

export const EventApprovalTracker = ({ eventId }) => {
  const { data: publicApprovalStatus, isLoading } = usePublicApprovalStatus(eventId);
  const { user } = useAuth();
  const { toast } = useToast();
  const [comments, setComments] = useState({});
  const [approving, setApproving] = useState(null);
  
  // For admin actions, we still need the full approvals data
  const { approvals, updateApprovalStatus, canApprove } = useEventApprovals(eventId);
  
  // Get the current user's email for permission checks
  const currentUserEmail = user?.email || '';
  
  // Use public data when available, fallback to local state
  const relevantApprovals = publicApprovalStatus?.approvals || [];
  const overallStatus = publicApprovalStatus?.status || 'pending';
  
  // Helper function to check if the current user can approve for a specific admin
  const canCurrentUserApprove = (adminEmail) => {
    if (!user || currentUserEmail !== adminEmail) return false;
    return canApprove(adminEmail);
  };

  const handleApprove = async (adminEmail) => {
    if (!eventId) return;

    // Check if the current user can approve
    const canApproveResult = canApprove(adminEmail);
    if (!canApproveResult) {
      alert('You are not authorized to approve at this time. Please ensure all previous approvers have approved.');
      return;
    }
    
    setApproving(adminEmail);
    try {
      await updateApprovalStatus(adminEmail, 'approved', comments[adminEmail] || '');
      
      toast({
        title: 'Approval submitted',
        description: 'Your approval has been recorded.',
      });
      
      // Clear the comment for this admin
      setComments(prev => ({
        ...prev,
        [adminEmail]: ''
      }));
    } catch (error) {
      console.error('Error approving:', error);
      toast({
        title: 'Error',
        description: 'Failed to submit approval. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setApproving(null);
    }
  };

  const handleReject = async (adminEmail) => {
    if (!eventId) return;
    
    // Check if the current user can approve
    const canApproveResult = canApprove(adminEmail);
    if (!canApproveResult) {
      alert('You are not authorized to reject at this time.');
      return;
    }
    
    if (!comments[adminEmail]?.trim()) {
      alert('Please provide a reason for rejection.');
      return;
    }
    
    setApproving(adminEmail);
    try {
      await updateApprovalStatus(adminEmail, 'rejected', comments[adminEmail]);
      
      toast({
        title: 'Rejection submitted',
        description: 'Your rejection has been recorded.',
      });
    } catch (error) {
      console.error('Error rejecting:', error);
      toast({
        title: 'Error',
        description: 'Failed to submit rejection. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setApproving(null);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved':
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
            <CheckCircle className="h-3.5 w-3.5 mr-1.5" />
            Approved
          </Badge>
        );
      case 'rejected':
        return (
          <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
            <XCircle className="h-3.5 w-3.5 mr-1.5" />
            Rejected
          </Badge>
        );
      case 'pending':
        return (
          <Badge variant="outline" className="text-muted-foreground">
            <Clock className="h-3.5 w-3.5 mr-1.5" />
            Pending
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="text-muted-foreground">
            <AlertCircle className="h-3.5 w-3.5 mr-1.5" />
            {status}
          </Badge>
        );
    }
  };

  if (isLoading) {
    return (
      <Card className="w-full max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle className="text-lg">Loading approval status...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center space-x-4 p-3 border rounded-lg">
                <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-muted rounded w-3/4 animate-pulse" />
                  <div className="h-3 bg-muted rounded w-1/2 animate-pulse" />
                </div>
                <div className="h-8 w-20 bg-muted rounded-md animate-pulse" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (relevantApprovals.length === 0) {
    return (
      <Card className="w-full max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle className="text-lg">Approval Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <p>No approval information available for this event.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Approval Status</CardTitle>
          {getStatusBadge(overallStatus)}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {relevantApprovals.map((approval) => {
            const canApproveCurrent = canCurrentUserApprove(approval.admin_email);
            const showCommentInput = canApproveCurrent && approving === approval.admin_email;
            const isCurrentUser = currentUserEmail === approval.admin_email;
            
            return (
              <div 
                key={approval.id} 
                className={`p-4 border rounded-lg ${
                  isCurrentUser ? 'border-primary/30 bg-primary/5' : ''
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-medium">{approval.admin_name || approval.admin_email}</div>
                    <div className="text-sm text-muted-foreground">
                      {approval.role || 'Reviewer'}
                    </div>
                  </div>
                  <div className="flex items-center">
                    {getStatusBadge(approval.status)}
                  </div>
                </div>
                
                {approval.comments && (
                  <div className="mt-3 text-sm text-muted-foreground">
                    <div className="flex items-start">
                      <MessageSquare className="h-4 w-4 mt-0.5 mr-2 flex-shrink-0" />
                      <p className="whitespace-pre-wrap">{approval.comments}</p>
                    </div>
                  </div>
                )}
                
                {showCommentInput && (
                  <div className="mt-3 space-y-2">
                    <Textarea
                      placeholder="Add comments (required for rejection)"
                      value={comments[approval.admin_email] || ''}
                      onChange={(e) => 
                        setComments(prev => ({
                          ...prev,
                          [approval.admin_email]: e.target.value
                        }))
                      }
                      className="min-h-[80px]"
                    />
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setApproving(null)}
                        disabled={approving === 'loading'}
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleReject(approval.admin_email)}
                        disabled={approving === 'loading' || !comments[approval.admin_email]?.trim()}
                      >
                        {approving === 'loading' ? 'Processing...' : 'Reject'}
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleApprove(approval.admin_email)}
                        disabled={approving === 'loading'}
                      >
                        {approving === 'loading' ? 'Processing...' : 'Approve'}
                      </Button>
                    </div>
                  </div>
                )}
                
                {canApproveCurrent && !showCommentInput && approval.status === 'pending' && (
                  <div className="mt-3 flex justify-end space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setApproving(approval.admin_email)}
                    >
                      Take Action
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default EventApprovalTracker;
