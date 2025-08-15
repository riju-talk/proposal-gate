import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
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
  FileText,
  Check,
  X,
  AlertCircle
} from 'lucide-react';
import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';

interface ProposalDetailsModalProps {
  proposal: EventProposal | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusUpdate: (id: string, status: 'approved' | 'rejected' | 'under_consideration', comments: string) => Promise<void>;
  showActions: boolean;
}

export const ProposalDetailsModal = ({ 
  proposal, 
  isOpen, 
  onClose, 
  onStatusUpdate,
  showActions 
}: ProposalDetailsModalProps) => {
  const [comments, setComments] = useState('');

  if (!proposal) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-success text-success-foreground';
      case 'rejected':
        return 'bg-destructive text-destructive-foreground';
      case 'under_consideration':
        return 'bg-warning text-warning-foreground';
      default:
        return 'bg-accent text-accent-foreground';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'approved':
        return 'Approved';
      case 'rejected':
        return 'Rejected';
      case 'under_consideration':
        return 'Under Consideration';
      default:
        return 'Pending';
    }
  };

  const handleApprove = async () => {
    await onStatusUpdate(proposal.id, 'approved', comments);
    onClose();
  };

  const handleReject = async () => {
    await onStatusUpdate(proposal.id, 'rejected', comments);
    onClose();
  };

  const handleMarkForConsideration = async () => {
    await onStatusUpdate(proposal.id, 'under_consideration', comments);
    onClose();
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
                {proposal.event_name}
              </DialogTitle>
              <p className="text-muted-foreground mt-1">{proposal.event_type}</p>
            </div>
            <Badge className={`${getStatusColor(proposal.status)} border-0 font-medium`}>
              {getStatusText(proposal.status)}
            </Badge>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Event Description */}
          <div className="space-y-2">
            <h3 className="font-semibold text-lg">Event Description</h3>
            <p className="text-muted-foreground leading-relaxed bg-muted/30 p-4 rounded-lg">
              {proposal.description}
            </p>
          </div>

          {/* Event Details Grid */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Event Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InfoRow icon={Calendar} label="Event Date" value={new Date(proposal.event_date).toLocaleDateString()} />
              <InfoRow icon={Clock} label="Time" value={`${proposal.start_time} - ${proposal.end_time}`} />
              <InfoRow icon={MapPin} label="Venue" value={proposal.venue} />
              <InfoRow icon={Users} label="Expected Participants" value={proposal.expected_participants} />
              {proposal.budget_estimate && (
                <InfoRow icon={DollarSign} label="Budget Estimate" value={`₹${proposal.budget_estimate.toLocaleString()}`} />
              )}
            </div>
          </div>

          {/* Organizer Information */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Organizer Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InfoRow icon={User} label="Organizer Name" value={proposal.organizer_name} />
              <InfoRow icon={Mail} label="Email Address" value={proposal.organizer_email} />
              {proposal.organizer_phone && (
                <InfoRow icon={Phone} label="Phone Number" value={proposal.organizer_phone} />
              )}
            </div>
          </div>

          {/* Additional Requirements */}
          {proposal.additional_requirements && (
            <div className="space-y-2">
              <h3 className="font-semibold text-lg">Additional Requirements</h3>
              <p className="text-muted-foreground leading-relaxed bg-muted/30 p-4 rounded-lg">
                {proposal.additional_requirements}
              </p>
            </div>
          )}

          {/* Submission Info */}
          <div className="bg-muted/20 p-4 rounded-lg">
            <p className="text-sm text-muted-foreground">
              <strong>Submitted:</strong> {formatDistanceToNow(new Date(proposal.created_at), { addSuffix: true })}
            </p>
            {proposal.updated_at !== proposal.created_at && (
              <p className="text-sm text-muted-foreground mt-1">
                <strong>Last Updated:</strong> {formatDistanceToNow(new Date(proposal.updated_at), { addSuffix: true })}
              </p>
            )}
          </div>

          {/* PDF Viewer */}
          {proposal.pdf_document_url && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-4">Event Proposal Document</h3>
              <div className="border rounded-lg overflow-hidden">
                <iframe
                  src={proposal.pdf_document_url}
                  className="w-full h-96"
                  title="Event Proposal PDF"
                />
              </div>
            </div>
          )}

          <DialogFooter className="flex items-center justify-between">
            {showActions && (
              <>
                <div className="flex items-center space-x-2">
                  <Textarea
                    placeholder="Add comments (optional)"
                    value={comments}
                    onChange={(e) => setComments(e.target.value)}
                    className="min-w-[300px]"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" onClick={onClose}>
                    Close
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={handleMarkForConsideration}
                    className="bg-warning hover:bg-warning/90 text-warning-foreground"
                  >
                    <AlertCircle className="h-4 w-4 mr-2" />
                    Mark for Ideation
                  </Button>
                  <Button 
                    variant="destructive" 
                    onClick={handleReject}
                    className="bg-destructive hover:bg-destructive/90"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Reject
                  </Button>
                  <Button 
                    onClick={handleApprove}
                    className="bg-success hover:bg-success/90"
                  >
                    <Check className="h-4 w-4 mr-2" />
                    Approve
                  </Button>
                </div>
              </>
            )}
            {!showActions && (
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
            )}
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
};