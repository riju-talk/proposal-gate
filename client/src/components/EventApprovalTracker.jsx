import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, XCircle, Clock, AlertCircle, MessageSquare } from 'lucide-react';

export const EventApprovalTracker = ({ eventId, showActions = true }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [approvals, setApprovals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [comments, setComments] = useState({});
  const [approving, setApproving] = useState(null);

  useEffect(() => {
    const fetchApprovals = async () => {
      try {
        setLoading(true);
        // Replace with your actual API endpoint
        const response = await fetch(`/api/events/${eventId}/approvals`);
        if (!response.ok) {
          throw new Error('Failed to fetch approvals');
        }
        const data = await response.json();
        setApprovals(data);
      } catch (err) {
        console.error('Error fetching approvals:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (eventId) {
      fetchApprovals();
    }
  }, [eventId]);

  const handleApprove = async (approvalId, status, comment = '') => {
    try {
      setApproving(approvalId);
      // Replace with your actual API endpoint
      const response = await fetch(`/api/events/approvals/${approvalId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status,
          comment,
          updatedBy: user?.id,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update approval status');
      }

      const updatedApproval = await response.json();
      setApproals(prev => 
        prev.map(a => a.id === updatedApproval.id ? updatedApproval : a)
      );
      
      toast({
        title: 'Success',
        description: 'Approval status updated successfully',
      });
    } catch (err) {
      console.error('Error updating approval:', err);
      toast({
        title: 'Error',
        description: 'Failed to update approval status',
        variant: 'destructive',
      });
    } finally {
      setApproving(null);
    }
  };

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'approved':
        return (
          <Badge className="bg-green-100 text-green-800">
            <CheckCircle className="w-4 h-4 mr-1" />
            Approved
          </Badge>
        );
      case 'rejected':
        return (
          <Badge className="bg-red-100 text-red-800">
            <XCircle className="w-4 h-4 mr-1" />
            Rejected
          </Badge>
        );
      case 'pending':
      default:
        return (
          <Badge variant="outline">
            <Clock className="w-4 h-4 mr-1" />
            Pending
          </Badge>
        );
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading approvals...</CardTitle>
        </CardHeader>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Error loading approvals</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-500">{error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Approval Status</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {approvals.length === 0 ? (
          <p className="text-muted-foreground">No approvals found for this event.</p>
        ) : (
          approvals.map((approval) => (
            <div key={approval.id} className="border rounded-lg p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-medium">{approval.approverName || 'Approver'}</h4>
                  <p className="text-sm text-muted-foreground">
                    {approval.role || 'Reviewer'}
                  </p>
                </div>
                {getStatusBadge(approval.status)}
              </div>
              
              {approval.comment && (
                <div className="mt-2 text-sm text-muted-foreground flex items-start">
                  <MessageSquare className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                  <p>{approval.comment}</p>
                </div>
              )}

              {showActions && approval.status === 'pending' && (
                <div className="mt-3 space-y-2">
                  <Textarea
                    placeholder="Add a comment (optional)"
                    value={comments[approval.id] || ''}
                    onChange={(e) =>
                      setComments(prev => ({
                        ...prev,
                        [approval.id]: e.target.value
                      }))
                    }
                    className="text-sm"
                  />
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleApprove(approval.id, 'rejected', comments[approval.id])}
                      disabled={approving === approval.id}
                    >
                      {approving === approval.id ? 'Processing...' : 'Reject'}
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleApprove(approval.id, 'approved', comments[approval.id])}
                      disabled={approving === approval.id}
                    >
                      {approving === approval.id ? 'Processing...' : 'Approve'}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
};

export default EventApprovalTracker;
