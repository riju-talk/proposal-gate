import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { EventProposal } from '@/hooks/useEventProposals';
import { EventApprovalTracker } from './EventApprovalTracker';
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
  AlertCircle,
  Sparkles
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
        return 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg';
      case 'rejected':
        return 'bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-lg';
      case 'under_consideration':
        return 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-lg';
      default:
        return 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'approved':
        return 'Approved';
      case 'rejected':
        return 'Rejected';
      case 'under_consideration':
        return 'Under Review';
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

  const InfoRow = ({ icon: Icon, label, value, iconColor }: { icon: any, label: string, value: string | number, iconColor?: string }) => (
    <div className="flex items-start gap-3 p-4 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-xl border border-purple-100 dark:border-purple-800">
      <Icon className={`h-5 w-5 ${iconColor || 'text-purple-500'} mt-0.5 flex-shrink-0`} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground">{label}</p>
        <p className="text-sm text-muted-foreground break-words">{value}</p>
      </div>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-purple-200 dark:border-purple-700">
        <DialogHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                {proposal.event_name}
              </DialogTitle>
              <p className="text-muted-foreground mt-1 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-purple-400" />
                {proposal.event_type}
              </p>
            </div>
            <Badge className={`${getStatusColor(proposal.status)} border-0 font-medium shadow-lg`}>
              {getStatusText(proposal.status)}
            </Badge>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Event Description */}
          <div className="space-y-2">
            <h3 className="font-semibold text-lg text-purple-700 dark:text-purple-300">Event Description</h3>
            <p className="text-muted-foreground leading-relaxed bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 p-4 rounded-xl border border-purple-100 dark:border-purple-800">
              {proposal.description}
            </p>
          </div>

          {/* Event Details Grid */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg text-purple-700 dark:text-purple-300">Event Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InfoRow icon={Calendar} label="Event Date" value={new Date(proposal.event_date).toLocaleDateString()} iconColor="text-purple-500" />
              <InfoRow icon={Clock} label="Time" value={`${proposal.start_time} - ${proposal.end_time}`} iconColor="text-blue-500" />
              <InfoRow icon={MapPin} label="Venue" value={proposal.venue} iconColor="text-green-500" />
              <InfoRow icon={Users} label="Expected Participants" value={proposal.expected_participants} iconColor="text-orange-500" />
              {proposal.budget_estimate && (
                <InfoRow icon={DollarSign} label="Budget Estimate" value={`₹${proposal.budget_estimate.toLocaleString()}`} iconColor="text-emerald-500" />
              )}
            </div>
          </div>

          {/* Organizer Information */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg text-purple-700 dark:text-purple-300">Organizer Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InfoRow icon={User} label="Organizer Name" value={proposal.organizer_name} iconColor="text-indigo-500" />
              <InfoRow icon={Mail} label="Email Address" value={proposal.organizer_email} iconColor="text-pink-500" />
              {proposal.organizer_phone && (
                <InfoRow icon={Phone} label="Phone Number" value={proposal.organizer_phone} iconColor="text-teal-500" />
              )}
            </div>
          </div>

          {/* Additional Requirements */}
          {proposal.additional_requirements && (
            <div className="space-y-2">
              <h3 className="font-semibold text-lg text-purple-700 dark:text-purple-300">Additional Requirements</h3>
              <p className="text-muted-foreground leading-relaxed bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 p-4 rounded-xl border border-purple-100 dark:border-purple-800">
                {proposal.additional_requirements}
              </p>
            </div>
          )}

          {/* Submission Info */}
          <div className="bg-gradient-to-r from-slate-50 to-gray-50 dark:from-slate-800/50 dark:to-gray-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
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
              <h3 className="text-lg font-semibold mb-4 text-purple-700 dark:text-purple-300 flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Event Proposal Document
              </h3>
              <div className="border border-purple-200 dark:border-purple-700 rounded-xl overflow-hidden shadow-lg">
                <iframe
                  src={proposal.pdf_document_url}
                  className="w-full h-[500px]"
                  title="Event Proposal PDF"
                />
              </div>
            </div>
          )}

          <Separator className="my-6" />
          
          {/* Approval Tracker */}
          <EventApprovalTracker eventId={proposal.id} />

          <DialogFooter className="flex items-center justify-between pt-6 border-t border-purple-200 dark:border-purple-700">
            {showActions && (
              <>
                <div className="flex items-center space-x-2">
                  <Textarea
                    placeholder="Add comments (optional)"
                    value={comments}
                    onChange={(e) => setComments(e.target.value)}
                    className="min-w-[300px] bg-white/50 dark:bg-slate-800/50 border-purple-200 dark:border-purple-700"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" onClick={onClose} className="border-purple-200 dark:border-purple-700">
                    Close
                  </Button>
                  <Button 
                    onClick={handleMarkForConsideration}
                    className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white shadow-lg"
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                    Mark for Ideation
                  </Button>
                  <Button 
                    onClick={handleReject}
                    className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white shadow-lg"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Reject
                  </Button>
                  <Button 
                    onClick={handleApprove}
                    className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-lg"
                  >
                    <Check className="h-4 w-4 mr-2" />
                    Approve
                  </Button>
                </div>
              </>
            )}
            {!showActions && (
              <Button variant="outline" onClick={onClose} className="border-purple-200 dark:border-purple-700">
                Close
              </Button>
            )}
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
};