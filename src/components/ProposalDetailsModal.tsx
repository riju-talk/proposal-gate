
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { EventApprovalTracker } from "@/components/EventApprovalTracker";
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
  Target,
  List,
  CheckCircle,
  XCircle,
  AlertCircle,
  ExternalLink
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { EventProposal } from "@/hooks/useEventProposals";
import { useState } from "react";
import { openPdfInNewTab } from "@/utils/pdfUtils";

interface ProposalDetailsModalProps {
  proposal: EventProposal;
  isOpen: boolean;
  onClose: () => void;
  showActions: boolean;
  onStatusUpdate: (id: string, status: 'approved' | 'rejected' | 'under_consideration', comments: string) => Promise<void>;
}

export const ProposalDetailsModal = ({ 
  proposal, 
  isOpen, 
  onClose, 
  showActions, 
  onStatusUpdate 
}: ProposalDetailsModalProps) => {
  const [comments, setComments] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'under_consideration':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-4 w-4" />;
      case 'rejected':
        return <XCircle className="h-4 w-4" />;
      case 'under_consideration':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const handleStatusUpdate = async (status: 'approved' | 'rejected' | 'under_consideration') => {
    setIsUpdating(true);
    await onStatusUpdate(proposal.id, status, comments);
    setComments("");
    setIsUpdating(false);
  };

  const handleViewPdf = async () => {
    if (proposal.pdf_document_url) {
      await openPdfInNewTab(proposal.pdf_document_url);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold">{proposal.event_name}</DialogTitle>
            <Badge className={`${getStatusColor(proposal.status)} flex items-center gap-1`}>
              {getStatusIcon(proposal.status)}
              {proposal.status.charAt(0).toUpperCase() + proposal.status.slice(1).replace('_', ' ')}
            </Badge>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-purple-500" />
                <div>
                  <p className="font-semibold">Event Date</p>
                  <p className="text-muted-foreground">{new Date(proposal.event_date).toLocaleDateString()}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="font-semibold">Time</p>
                  <p className="text-muted-foreground">{proposal.start_time} - {proposal.end_time}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-green-500" />
                <div>
                  <p className="font-semibold">Venue</p>
                  <p className="text-muted-foreground">{proposal.venue}</p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-orange-500" />
                <div>
                  <p className="font-semibold">Expected Participants</p>
                  <p className="text-muted-foreground">{proposal.expected_participants}</p>
                </div>
              </div>
              
              {proposal.budget_estimate && (
                <div className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-emerald-500" />
                  <div>
                    <p className="font-semibold">Budget Estimate</p>
                    <p className="text-muted-foreground">₹{proposal.budget_estimate.toLocaleString()}</p>
                  </div>
                </div>
              )}
              
              <div>
                <p className="font-semibold text-sm text-muted-foreground">Event Type</p>
                <Badge variant="outline">{proposal.event_type}</Badge>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className="text-lg font-semibold mb-2">Description</h3>
            <p className="text-muted-foreground leading-relaxed">{proposal.description}</p>
          </div>

          {/* Objectives */}
          {proposal.objectives && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Target className="h-5 w-5 text-blue-500" />
                <h3 className="text-lg font-semibold">Objectives</h3>
              </div>
              <p className="text-muted-foreground leading-relaxed">{proposal.objectives}</p>
            </div>
          )}

          {/* Additional Requirements */}
          {proposal.additional_requirements && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <List className="h-5 w-5 text-purple-500" />
                <h3 className="text-lg font-semibold">Additional Requirements</h3>
              </div>
              <p className="text-muted-foreground leading-relaxed">{proposal.additional_requirements}</p>
            </div>
          )}

          {/* PDF Document */}
          {proposal.pdf_document_url && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <FileText className="h-5 w-5 text-red-500" />
                <h3 className="text-lg font-semibold">Supporting Document</h3>
              </div>
              <Button
                variant="outline"
                onClick={handleViewPdf}
                className="flex items-center gap-2"
              >
                <ExternalLink className="h-4 w-4" />
                View PDF Document
              </Button>
            </div>
          )}

          {/* Organizer Information */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Organizer Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <User className="h-5 w-5 text-indigo-500" />
                <div>
                  <p className="font-semibold">Name</p>
                  <p className="text-muted-foreground">{proposal.organizer_name}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-pink-500" />
                <div>
                  <p className="font-semibold">Email</p>
                  <p className="text-muted-foreground">{proposal.organizer_email}</p>
                </div>
              </div>
              
              {proposal.organizer_phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="font-semibold">Phone</p>
                    <p className="text-muted-foreground">{proposal.organizer_phone}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Approval Tracker */}
          <EventApprovalTracker eventId={proposal.id} />

          {/* Metadata */}
          <div className="text-sm text-muted-foreground border-t pt-4">
            <p>Created {formatDistanceToNow(new Date(proposal.created_at))} ago</p>
            <p>Last updated {formatDistanceToNow(new Date(proposal.updated_at))} ago</p>
          </div>

          {/* Admin Actions */}
          {showActions && proposal.status === 'pending' && (
            <div className="border-t pt-4 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Comments</label>
                <Textarea
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  placeholder="Add your comments about this proposal..."
                  className="min-h-[100px]"
                />
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => handleStatusUpdate('approved')}
                  disabled={isUpdating}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  {isUpdating ? 'Updating...' : 'Approve'}
                </Button>
                
                <Button
                  onClick={() => handleStatusUpdate('under_consideration')}
                  disabled={isUpdating}
                  variant="outline"
                  className="border-yellow-300 text-yellow-700 hover:bg-yellow-50"
                >
                  <AlertCircle className="h-4 w-4 mr-2" />
                  Mark for Review
                </Button>
                
                <Button
                  onClick={() => handleStatusUpdate('rejected')}
                  disabled={isUpdating}
                  variant="destructive"
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  {isUpdating ? 'Updating...' : 'Reject'}
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
