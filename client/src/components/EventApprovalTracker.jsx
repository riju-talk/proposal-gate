import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { apiClient } from '@/lib/api';
import { CheckCircle, XCircle, Clock, Shield, User, Loader2, MessageSquare } from 'lucide-react';

export const EventApprovalTracker = ({ eventId, showActions = true }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [approvals, setApprovals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [comments, setComments] = useState({});
  const [approving, setApproving] = useState(null);
  const [overallStatus, setOverallStatus] = useState('pending');

  const computeOverallStatus = (approvals) => {
    if (approvals.every(a => a.status === 'approved')) return 'approved';
    if (approvals.every(a => a.status === 'rejected')) return 'rejected';
    return 'pending';
  };

  useEffect(() => {
    const fetchApprovals = async () => {
      try {
        setLoading(true);
        const result = await apiClient.getEventApprovals(eventId);
        if (result.data?.approvals) {
          setApprovals(result.data.approvals);
          setOverallStatus(computeOverallStatus(result.data.approvals));
        } else {
          throw new Error(result.error || 'Failed to fetch event approvals');
        }
      } catch (err) {
        console.error('Error fetching approvals:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
  
    if (eventId) fetchApprovals();
  }, [eventId]);
  
  const handleAction = async (action, comment = '') => {
    try {
      setApproving(action);
  
      let result;
      if (action === 'approve') {
        result = await apiClient.approveEvent(eventId, comment);
      } else if (action === 'reject') {
        result = await apiClient.rejectEvent(eventId, comment);
      } else {
        throw new Error(`Unknown action: ${action}`);
      }
  
      if (result.error) throw new Error(result.error);
  
      const updatedResult = await apiClient.getEventApprovals(eventId);
      if (updatedResult.data?.approvals) {
        setApprovals(updatedResult.data.approvals);
        setOverallStatus(computeOverallStatus(updatedResult.data.approvals));
      }
  
      setComments(prev => ({ ...prev, [user?.email]: '' }));
  
      toast({
        title: 'Success',
        description: result.message || `Event ${action} successfully`,
      });
    } catch (err) {
      console.error(`Error ${action} event:`, err);
      toast({
        title: 'Error',
        description: err.message || `Failed to ${action} event`,
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
          <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg border-0">
            <CheckCircle className="w-3 h-3 mr-1" /> Approved
          </Badge>
        );
      case 'rejected':
        return (
          <Badge className="bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-lg border-0">
            <XCircle className="w-3 h-3 mr-1" /> Rejected
          </Badge>
        );
      case 'pending':
      default:
        return (
          <Badge className="bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg border-0">
            <Clock className="w-3 h-3 mr-1" /> Pending
          </Badge>
        );
    }
  };

  const canUserApprove = (adminEmail) => {
    return user?.email === adminEmail && showActions && user?.role !== 'developer';
  };

  const getUserApproval = () => approvals.find(a => a.admin_email === user?.email);

  if (loading) {
    return (
      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardHeader>
          <CardTitle className="text-foreground flex items-center gap-2">
            <Loader2 className="h-5 w-5 text-primary animate-spin" />
            Loading Approvals...
          </CardTitle>
        </CardHeader>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardHeader>
          <CardTitle className="text-foreground">Error Loading Approvals</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-destructive">{error}</p>
        </CardContent>
      </Card>
    );
  }

  const userApproval = getUserApproval();

  return (
    <Card className="bg-card/50 backdrop-blur-sm border-border/50">
      <CardHeader>
        <CardTitle className="text-foreground flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" /> Approval Status
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="mb-4">
          <h4 className="font-medium text-lg">Overall Event Status</h4>
          {getStatusBadge(overallStatus)}
        </div>

        {user && userApproval && canUserApprove(user.email) && userApproval.status === 'pending' && (
          <div className="bg-gradient-to-r from-primary/10 to-purple-500/10 rounded-lg p-4 border border-primary/20">
            <h4 className="font-medium text-foreground mb-3">Your Action Required</h4>
            <Textarea
              placeholder="Add a comment (optional)"
              value={comments[user.email] || ''}
              onChange={(e) => setComments(prev => ({ ...prev, [user.email]: e.target.value }))}
              className="text-sm bg-background/50 border-border mb-3"
            />
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleAction('reject', comments[user.email])}
                disabled={approving === 'reject'}
                className="border-red-500/30 text-red-400 hover:bg-red-500/10"
              >
                {approving === 'reject' ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Reject'}
              </Button>
              <Button
                size="sm"
                onClick={() => handleAction('approve', comments[user.email])}
                disabled={approving === 'approve'}
                className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0"
              >
                {approving === 'approve' ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Approve'}
              </Button>
            </div>
          </div>
        )}

        {approvals.length === 0 ? (
          <p className="text-muted-foreground">No approvals found for this event.</p>
        ) : (
          approvals.map((approval) => (
            <div key={approval.admin_email} className="border border-border/50 rounded-lg p-4 bg-card/30 backdrop-blur-sm">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-primary" />
                  <div>
                    <h4 className="font-medium text-foreground">{approval.admin_name}</h4>
                    <p className="text-sm text-muted-foreground">{approval.admin_email}</p>
                  </div>
                </div>
                {getStatusBadge(approval.status)}
              </div>

              {approval.comments && (
                <div className="mb-3 text-sm text-muted-foreground flex items-start">
                  <MessageSquare className="w-4 h-4 mr-2 mt-0.5 text-blue-400" />
                  <p className="bg-muted/50 rounded p-3 border border-border flex-1">
                    {approval.comments}
                  </p>
                </div>
              )}

              {approval.approved_at && (
                <div className="text-xs text-muted-foreground mt-2">
                  {approval.status === 'approved' ? 'Approved' : 'Rejected'} on{' '}
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
