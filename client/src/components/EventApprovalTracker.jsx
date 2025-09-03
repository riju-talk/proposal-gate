import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, XCircle, Clock, AlertCircle, MessageSquare, Shield, User } from 'lucide-react';

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

  const handleApprove = async (adminEmail, status, comment = '') => {
    try {
      setApproving(adminEmail);
      const token = localStorage.getItem('admin_token');
      
      const response = await fetch(`/api/events/${eventId}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          adminEmail,
          status,
          comments: comment,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update approval status');
      }

      const result = await response.json();
      
      // Refresh approvals
      const approvalsResponse = await fetch(`/api/events/${eventId}/approvals`);
      const updatedApprovals = await approvalsResponse.json();
      setApprovals(updatedApprovals);
      
      // Clear comment for this admin
      setComments(prev => ({ ...prev, [adminEmail]: '' }));
      
      toast({
        title: 'Success',
        description: `Approval ${status === 'approved' ? 'granted' : 'rejected'} successfully. ${result.message}`,
      });
    } catch (err) {
      console.error('Error updating approval:', err);
      toast({
        title: 'Error',
        description: err.message || 'Failed to update approval status',
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
          <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
            <CheckCircle className="w-4 h-4 mr-1" />
            Approved
          </Badge>
        );
      case 'rejected':
        return (
          <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
            <XCircle className="w-4 h-4 mr-1" />
            Rejected
          </Badge>
        );
      case 'pending':
      default:
        return (
          <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
            <Clock className="w-4 h-4 mr-1" />
            Pending
          </Badge>
        );
    }
  };

  const canUserApprove = (adminEmail) => {
    return user?.email === adminEmail && showActions;
  };

  if (loading) {
    return (
      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Loading approvals...</CardTitle>
        </CardHeader>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Error loading approvals</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-400">{error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white/5 border-white/10">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Shield className="h-5 w-5 text-cyan-400" />
          Approval Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {approvals.length === 0 ? (
          <p className="text-white/70">No approvals found for this event.</p>
        ) : (
          approvals.map((approval) => (
            <div key={approval.id} className="border border-white/10 rounded-lg p-4 bg-white/5">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-cyan-400" />
                  <div>
                    <h4 className="font-medium text-white">{approval.admin_name || 'Admin'}</h4>
                    <p className="text-sm text-white/70 capitalize">
                      {approval.admin_role?.replace('_', ' ') || 'Reviewer'} (Order: {approval.approval_order})
                    </p>
                  </div>
                </div>
                {getStatusBadge(approval.status)}
              </div>
              
              {approval.comments && (
                <div className="mb-3 text-sm text-white/70 flex items-start">
                  <MessageSquare className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0 text-blue-400" />
                  <p className="bg-white/5 rounded p-2 border border-white/10">{approval.comments}</p>
                </div>
              )}

              {canUserApprove(approval.admin_email) && approval.status === 'pending' && (
                <div className="space-y-3 pt-3 border-t border-white/10">
                  <Textarea
                    placeholder="Add a comment (optional)"
                    value={comments[approval.admin_email] || ''}
                    onChange={(e) =>
                      setComments(prev => ({
                        ...prev,
                        [approval.admin_email]: e.target.value
                      }))
                    }
                    className="text-sm bg-white/5 border-white/20 text-white placeholder:text-white/50"
                  />
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleApprove(approval.admin_email, 'rejected', comments[approval.admin_email])}
                      disabled={approving === approval.admin_email}
                      className="bg-red-500/20 border-red-500/30 text-red-400 hover:bg-red-500/30"
                    >
                      {approving === approval.admin_email ? 'Processing...' : 'Reject'}
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleApprove(approval.admin_email, 'approved', comments[approval.admin_email])}
                      disabled={approving === approval.admin_email}
                      className="bg-green-500/20 border-green-500/30 text-green-400 hover:bg-green-500/30"
                    >
                      {approving === approval.admin_email ? 'Processing...' : 'Approve'}
                    </Button>
                  </div>
                </div>
              )}

              {approval.approved_at && (
                <div className="text-xs text-white/50 mt-2">
                  {approval.status === 'approved' ? 'Approved' : 'Updated'} on{' '}
                  {new Date(approval.approved_at).toLocaleDateString()}
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