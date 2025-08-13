import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { EventProposal } from '@/hooks/useEventProposals';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  DollarSign, 
  User, 
  Mail, 
  Phone, 
  Building, 
  FileText,
  Check,
  X,
  Download
} from 'lucide-react';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';

interface ProposalDetailsModalProps {
  proposal: EventProposal | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusUpdate: (id: string, status: 'approved' | 'rejected', comments: string) => void;
}

export const ProposalDetailsModal = ({ 
  proposal, 
  isOpen, 
  onClose, 
  onStatusUpdate 
}: ProposalDetailsModalProps) => {
  const [reviewComments, setReviewComments] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  if (!proposal) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new':
        return 'bg-dashboard-status-new text-white';
      case 'approved':
        return 'bg-dashboard-status-approved text-white';
      case 'rejected':
        return 'bg-dashboard-status-rejected text-white';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const handleStatusUpdate = async (status: 'approved' | 'rejected') => {
    if (!reviewComments.trim()) {
      toast({
        title: "Comments required",
        description: "Please provide review comments before updating the status.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      onStatusUpdate(proposal.id, status, reviewComments);
      toast({
        title: `Proposal ${status}`,
        description: `The event proposal has been ${status} successfully.`,
        variant: status === 'approved' ? 'default' : 'destructive',
      });
      onClose();
      setReviewComments('');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update proposal status. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const InfoRow = ({ icon: Icon, label, value }: { icon: any, label: string, value: string | number }) => (
    <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
      <Icon className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground">{label}</p>
        <p className="text-sm text-muted-foreground break-words">{value}</p>
      </div>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <DialogTitle className="text-2xl font-bold text-foreground">
                {proposal.eventName}
              </DialogTitle>
              <p className="text-muted-foreground mt-1">{proposal.eventType}</p>
            </div>
            <Badge className={`${getStatusColor(proposal.status)} border-0 font-medium`}>
              {proposal.status === 'pending' ? 'Pending Review' : proposal.status.charAt(0).toUpperCase() + proposal.status.slice(1)}
            </Badge>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Event Description */}
          <div className="space-y-2">
            <h3 className="font-semibold text-lg">Event Description</h3>
            <p className="text-muted-foreground leading-relaxed bg-muted/30 p-4 rounded-lg">
              {proposal.eventDescription}
            </p>
          </div>

          {/* Event Details Grid */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Event Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InfoRow icon={Calendar} label="Event Date" value={proposal.eventDate} />
              <InfoRow icon={Clock} label="Start Time & Duration" value={`${proposal.startTime} (${proposal.duration})`} />
              <InfoRow icon={MapPin} label="Preferred Venue" value={proposal.preferredVenue} />
              <InfoRow icon={Users} label="Expected Attendees" value={proposal.expectedAttendees} />
              <InfoRow icon={DollarSign} label="Estimated Budget" value={`₹${proposal.estimatedBudget.toLocaleString()}`} />
            </div>
          </div>

          {/* Organizer Information */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Organizer Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InfoRow icon={User} label="Primary Organizer" value={proposal.primaryOrganizer} />
              <InfoRow icon={Mail} label="Email Address" value={proposal.emailAddress} />
              <InfoRow icon={Phone} label="Phone Number" value={proposal.phoneNumber} />
              <InfoRow icon={Building} label="Department/Club" value={proposal.department} />
            </div>
          </div>

          {/* Additional Information */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Additional Information</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="font-medium">Special Requirements</Label>
                <p className="text-sm text-muted-foreground bg-muted/30 p-3 rounded-lg">
                  {proposal.specialRequirements || 'None specified'}
                </p>
              </div>
              <div className="space-y-2">
                <Label className="font-medium">Marketing & Promotion Plan</Label>
                <p className="text-sm text-muted-foreground bg-muted/30 p-3 rounded-lg">
                  {proposal.marketingPlan || 'None specified'}
                </p>
              </div>
            </div>
          </div>

          {/* Supporting Documents */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Supporting Documents</h3>
            <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              {proposal.supportingDocuments ? (
                <div className="space-y-2">
                  <p className="font-medium">Document Available</p>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Download className="h-4 w-4" />
                    Download PDF
                  </Button>
                </div>
              ) : (
                <p className="text-muted-foreground">No supporting documents uploaded</p>
              )}
            </div>
          </div>

          {/* Submission Info */}
          <div className="bg-muted/20 p-4 rounded-lg">
            <p className="text-sm text-muted-foreground">
              <strong>Submitted:</strong> {formatDistanceToNow(proposal.submittedAt, { addSuffix: true })}
            </p>
            {proposal.reviewedAt && (
              <p className="text-sm text-muted-foreground mt-1">
                <strong>Reviewed:</strong> {formatDistanceToNow(proposal.reviewedAt, { addSuffix: true })} by {proposal.reviewedBy}
              </p>
            )}
          </div>

          {/* Review Comments (if reviewed) */}
          {proposal.reviewComments && (
            <div className="space-y-2">
              <Label className="font-medium">Review Comments</Label>
              <p className="text-sm text-muted-foreground bg-muted/30 p-3 rounded-lg">
                {proposal.reviewComments}
              </p>
            </div>
          )}

          {/* Review Section (for pending proposals) */}
          {proposal.status === 'pending' && (
            <div className="space-y-4 border-t pt-6">
              <h3 className="font-semibold text-lg">Review Proposal</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="review-comments">Review Comments *</Label>
                  <Textarea
                    id="review-comments"
                    value={reviewComments}
                    onChange={(e) => setReviewComments(e.target.value)}
                    placeholder="Provide your review comments, feedback, or reasons for approval/rejection..."
                    className="min-h-[100px]"
                  />
                </div>
                <div className="flex gap-3">
                  <Button
                    onClick={() => handleStatusUpdate('approved')}
                    disabled={isSubmitting}
                    className="bg-gradient-success hover:opacity-90 gap-2"
                  >
                    <Check className="h-4 w-4" />
                    Approve Proposal
                  </Button>
                  <Button
                    onClick={() => handleStatusUpdate('rejected')}
                    disabled={isSubmitting}
                    variant="destructive"
                    className="gap-2"
                  >
                    <X className="h-4 w-4" />
                    Reject Proposal
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};