import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { apiClient } from '@/lib/api';
import { CheckCircle, XCircle, Clock, Shield, User, Loader2, MessageSquare, AlertCircle, Building2, Users2 } from 'lucide-react';
import ApprovalConfirmationModal from '@/components/ApprovalConfirmationModal';

export const ApprovalTracker = ({ eventId, showActions = true, proposalType = 'event', isAuthorized = false, proposal = null }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [approvals, setApprovals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [comments, setComments] = useState({});
  const [overallStatus, setOverallStatus] = useState('pending');
  const [confirmationModal, setConfirmationModal] = useState({
    isOpen: false,
    action: null,
    proposal: null
  });
  const [approving, setApproving] = useState(null);

  // Determine proposal type more robustly - moved before useEffect
  const currentProposalType = proposal?.type || proposalType;

  const computeOverallStatus = (approvals) => {
    if (approvals.every(a => a.status === 'approved')) return 'approved';
    if (approvals.every(a => a.status === 'rejected')) return 'rejected';
    return 'pending';
  };

  // Get approvals when component mounts or eventId changes
  useEffect(() => {
    const fetchApprovals = async () => {
      try {
        setLoading(true);
        const result = await apiClient.getApprovals(eventId);
        const list = Array.isArray(result.data)
          ? result.data
          : result.data?.approvals;
        if (Array.isArray(list)) {
          setApprovals(list);
          setOverallStatus(computeOverallStatus(list));
        } else {
          throw new Error(result.error || 'Failed to fetch approvals');
        }
      } catch (err) {
        console.error('Error fetching approvals:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (eventId) {
      fetchApprovals();
      console.log('EventApprovalTracker - proposalType:', currentProposalType, 'isAuthorized:', isAuthorized);
    }
  }, [eventId, currentProposalType, isAuthorized]);

  const handleAction = async (action, comment = '') => {
    try {
      setApproving(action);

      const userApproval = getUserApproval();
      if (!userApproval) {
        throw new Error('No approval found for current user');
      }

      let result;
      if (action === 'approve') {
        result = await apiClient.approveProposal(userApproval.id, comment);
      } else if (action === 'reject') {
        result = await apiClient.rejectProposal(userApproval.id, comment);
      } else {
        throw new Error(`Unknown action: ${action}`);
      }

      if (result.error) throw new Error(result.error);

      // Refresh the approvals
      const updatedResult = await apiClient.getApprovals(eventId);
      const updatedList = Array.isArray(updatedResult.data)
        ? updatedResult.data
        : updatedResult.data?.approvals;
      if (Array.isArray(updatedList)) {
        setApprovals(updatedList);
        setOverallStatus(computeOverallStatus(updatedList));
      }

      // Clear the comment
      setComments(prev => ({ ...prev, [user?.email]: '' }));

      toast({
        title: 'Success',
        description: result.message || `Proposal ${action}d successfully`,
      });

      setConfirmationModal({ isOpen: false, action: null, proposal: null });
    } catch (err) {
      console.error(`Error ${action}ing proposal:`, err);
      toast({
        title: 'Error',
        description: err.message || `Failed to ${action} proposal`,
        variant: 'destructive',
      });
    } finally {
      setApproving(null);
    }
  };

  const handleConfirmation = (action, proposal) => {
    setConfirmationModal({
      isOpen: true,
      action,
      proposal
    });
  };

  const handleConfirmAction = async () => {
    const { action, proposal } = confirmationModal;
    await handleAction(action, comments[user?.email]);
  };

  const getStatusBadge = (status) => {
    const statusToCheck = status?.toString().toLowerCase() || 'pending';
    console.log('getStatusBadge - status:', status, 'normalized:', statusToCheck);
    switch (statusToCheck) {
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

  const getTypeIcon = (type) => {
    const typeToCheck = type || currentProposalType;
    console.log('getTypeIcon - type:', typeToCheck);
    switch (typeToCheck?.toLowerCase()) {
      case 'club':
        return <Building2 className="h-4 w-4 text-purple-500" />;
      case 'event':
      default:
        return <Users2 className="h-4 w-4 text-blue-500" />;
    }
  };

  const canUserApprove = (approval) => {
    // Block developers completely from approving
    if (user?.role === 'developer') {
      return false;
    }

    // Use the isAuthorized prop if provided, otherwise fall back to role-based check
    const hasPermission = isAuthorized !== undefined ? isAuthorized : user?.role === 'admin';

    return (
      showActions &&
      hasPermission &&
      approval?.status === 'pending' &&
      approval?.admin_email === user?.email
    );
  };

  const getUserApproval = () => approvals.find(a => a.admin_email === user?.email);

  // Filter out developers from approvals list
  const filteredApprovals = approvals.filter(approval => approval.admin_role !== 'developer' && approval.admin_email !== user?.email);

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

  // Show error if user is a developer trying to approve
  if (user?.role === 'developer' && showActions) {
    return (
      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-500">
            <AlertCircle className="h-5 w-5" />
            <p>Developers cannot approve or reject proposals.</p>
          </div>
        </CardContent>
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
  const canApprove = userApproval && canUserApprove(userApproval);

  return (
    <>
      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardHeader>
          <CardTitle className="text-foreground flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Approval Status
            {getTypeIcon(proposalType)}
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="mb-4">
            <h4 className="font-medium text-lg">Overall Proposal Status</h4>
            {getStatusBadge(overallStatus)}
          </div>

          {canApprove && (
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
                  onClick={() => handleConfirmation('reject', { id: eventId, type: currentProposalType })}
                  disabled={approving === 'reject'}
                  className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                >
                  {approving === 'reject' ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Reject'}
                </Button>
                <Button
                  size="sm"
                  onClick={() => handleConfirmation('approve', { id: eventId, type: currentProposalType })}
                  disabled={approving === 'approve'}
                  className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0"
                >
                  {approving === 'approve' ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Approve'}
                </Button>
              </div>
            </div>
          )}

          {filteredApprovals.length === 0 ? (
            <p className="text-muted-foreground">No approvals found for this proposal.</p>
          ) : (
            <div className="space-y-4">
              {filteredApprovals.map((approval) => (
                <div key={approval.admin_email} className="border border-border/50 rounded-lg p-4 bg-card/30 backdrop-blur-sm">
                  <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-primary" />
                    <div>
                      <h4 className="font-medium text-foreground">{approval.admin_name || 'Unknown Admin'}</h4>
                      <p className="text-sm text-muted-foreground">{approval.admin_email || 'No email'}</p>
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
                      {approval.status?.toLowerCase() === 'approved' ? 'Approved' : 'Rejected'} on{' '}
                      {new Date(approval.approved_at).toLocaleDateString()}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <ApprovalConfirmationModal
        isOpen={confirmationModal.isOpen}
        onClose={() => setConfirmationModal({ isOpen: false, action: null, proposal: null })}
        onConfirm={handleConfirmAction}
        action={confirmationModal.action}
        proposal={confirmationModal.proposal}
        loading={approving !== null}
      />
    </>
  );
};
