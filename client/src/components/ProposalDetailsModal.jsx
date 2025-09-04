import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  ExternalLink,
  Eye
} from "lucide-react";

export const ProposalDetailsModal = ({ 
  proposal, 
  isOpen, 
  onClose, 
  showActions, 
  onStatusUpdate,
  userRole 
}) => {
  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved':
        return (
          <Badge className="bg-success/20 text-success border-success/30">
            <CheckCircle className="h-4 w-4 mr-1" />
            Approved
          </Badge>
        );
      case 'rejected':
        return (
          <Badge className="bg-destructive/20 text-destructive border-destructive/30">
            <XCircle className="h-4 w-4 mr-1" />
            Rejected
          </Badge>
        );
      default:
        return (
          <Badge className="bg-primary/20 text-primary border-primary/30">
            <AlertCircle className="h-4 w-4 mr-1" />
            Pending Approval
          </Badge>
        );
    }
  };

  const openPdfInNewTab = (url) => {
    if (url) {
      window.open(url, '_blank');
    }
  };

  const formatTime = (timeString) => {
    if (!timeString) return 'N/A';
    
    const timeParts = timeString.split(':');
    const hours = parseInt(timeParts[0]);
    const minutes = timeParts[1];
    
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    
    return `${displayHours}:${minutes} ${ampm}`;
  };

  if (!proposal) return null;

  const status = proposal.status || 'pending';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto bg-background border-border">
        <DialogHeader className="border-b border-border pb-4">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold text-foreground">
              {proposal.event_name || proposal.eventName}
            </DialogTitle>
            {getStatusBadge(status)}
          </div>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 py-6">
          {/* Left Column - Event Details */}
          <div className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                Event Information
              </h3>
              
              <div className="grid grid-cols-1 gap-4">
                <div className="flex items-center gap-3 p-4 bg-card rounded-lg border border-border">
                  <Calendar className="h-5 w-5 text-primary flex-shrink-0" />
                  <div>
                    <p className="font-medium text-foreground">Event Date</p>
                    <p className="text-muted-foreground">
                      {new Date(proposal.event_date || proposal.eventDate || '').toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-4 bg-card rounded-lg border border-border">
                  <Clock className="h-5 w-5 text-blue-400 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-foreground">Time</p>
                    <p className="text-muted-foreground">
                      {formatTime(proposal.start_time || proposal.startTime)} - {formatTime(proposal.end_time || proposal.endTime)}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 p-4 bg-card rounded-lg border border-border">
                  <MapPin className="h-5 w-5 text-red-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-foreground">Venue</p>
                    <p className="text-muted-foreground">{proposal.venue || 'Not specified'}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-4 bg-card rounded-lg border border-border">
                  <Users className="h-5 w-5 text-green-400 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-foreground">Expected Participants</p>
                    <p className="text-muted-foreground">
                      {proposal.expected_participants || proposal.expectedParticipants || 'Not specified'}
                    </p>
                  </div>
                </div>
                
                {(proposal.budget_estimate || proposal.budgetEstimate) && (
                  <div className="flex items-center gap-3 p-4 bg-card rounded-lg border border-border">
                    <DollarSign className="h-5 w-5 text-amber-400 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-foreground">Budget Estimate</p>
                      <p className="text-muted-foreground">
                        ₹{(proposal.budget_estimate || proposal.budgetEstimate)}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Organizer Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                Organizer Details
              </h3>
              
              <div className="grid grid-cols-1 gap-4">
                <div className="flex items-center gap-3 p-4 bg-card rounded-lg border border-border">
                  <User className="h-5 w-5 text-primary flex-shrink-0" />
                  <div>
                    <p className="font-medium text-foreground">Name</p>
                    <p className="text-muted-foreground">{proposal.organizer_name || proposal.organizerName}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-4 bg-card rounded-lg border border-border">
                  <Mail className="h-5 w-5 text-rose-400 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-foreground">Email</p>
                    <p className="text-muted-foreground">{proposal.organizer_email || proposal.organizerEmail}</p>
                  </div>
                </div>
                
                {(proposal.organizer_phone || proposal.organizerPhone) && (
                  <div className="flex items-center gap-3 p-4 bg-card rounded-lg border border-border">
                    <Phone className="h-5 w-5 text-emerald-400 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-foreground">Phone</p>
                      <p className="text-muted-foreground">{proposal.organizer_phone || proposal.organizerPhone}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Event Description */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <List className="h-5 w-5 text-blue-400" />
                Event Description
              </h3>
              <div className="bg-card rounded-lg p-4 border border-border">
                <p className="text-foreground leading-relaxed">
                  {proposal.description || 'No description provided.'}
                </p>
              </div>
            </div>
            
            {/* Objectives */}
            {proposal.objectives && (
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                  <Target className="h-5 w-5 text-green-400" />
                  Objectives
                </h3>
                <div className="bg-card rounded-lg p-4 border border-border">
                  <p className="text-foreground leading-relaxed">{proposal.objectives}</p>
                </div>
              </div>
            )}
            
            {/* Additional Requirements */}
            {(proposal.additional_requirements || proposal.additionalRequirements) && (
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                  <FileText className="h-5 w-5 text-purple-400" />
                  Additional Requirements
                </h3>
                <div className="bg-card rounded-lg p-4 border border-border">
                  <p className="text-foreground leading-relaxed">
                    {proposal.additional_requirements || proposal.additionalRequirements}
                  </p>
                </div>
              </div>
            )}

            {/* PDF Document */}
            {(proposal.pdf_document_url || proposal.pdfDocumentUrl) && (
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                  <FileText className="h-5 w-5 text-indigo-400" />
                  Proposal Document
                </h3>
                <div className="bg-card rounded-lg p-4 border border-border">
                  <Button
                    onClick={() => openPdfInNewTab(proposal.pdf_document_url || proposal.pdfDocumentUrl)}
                    className="w-full btn-primary"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View Proposal Document
                    <ExternalLink className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Approval Tracker */}
          <div className="space-y-6">
            <EventApprovalTracker 
              eventId={proposal.id} 
              showActions={userRole === 'admin'} 
            />
          </div>
        </div>

        <div className="flex justify-end pt-6 border-t border-border">
          <Button
            variant="outline"
            onClick={onClose}
            className="border-border hover:bg-muted"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProposalDetailsModal;