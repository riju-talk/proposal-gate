import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PdfViewer } from "@/components/PdfViewer";
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
  Sparkles,
  Eye
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export const ProposalDetailsModal = ({ 
  proposal, 
  isOpen, 
  onClose, 
  showActions, 
  onStatusUpdate,
  userRole 
}) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg border-0';
      case 'rejected':
        return 'bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-lg border-0';
      case 'under_consideration':
        return 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg border-0';
      default:
        return 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-lg border-0';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-4 w-4" />;
      case 'rejected':
        return <XCircle className="h-4 w-4" />;
      case 'under_consideration':
        return <Sparkles className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const openPdfInNewTab = (url) => {
    if (url) {
      window.open(url, '_blank');
    }
  };

  if (!proposal) return null;

  const status = proposal.status || 'pending';
  const statusText = status.split('_').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto bg-slate-900/95 backdrop-blur-xl border-white/20">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold text-white">
              {proposal.event_name || proposal.eventName}
            </DialogTitle>
            <Badge className={`${getStatusColor(status)} flex items-center gap-1`}>
              {getStatusIcon(status)}
              {statusText}
            </Badge>
          </div>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Event Details */}
          <div className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <Calendar className="h-5 w-5 text-purple-400" />
                Event Information
              </h3>
              
              <div className="grid grid-cols-1 gap-4">
                <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg border border-white/10">
                  <Calendar className="h-5 w-5 text-purple-400 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-white">Event Date</p>
                    <p className="text-white/70">
                      {new Date(proposal.event_date || proposal.eventDate || '').toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg border border-white/10">
                  <Clock className="h-5 w-5 text-blue-400 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-white">Time</p>
                    <p className="text-white/70">
                      {proposal.start_time || proposal.startTime} - {proposal.end_time || proposal.endTime}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 p-3 bg-white/5 rounded-lg border border-white/10">
                  <MapPin className="h-5 w-5 text-red-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-white">Venue</p>
                    <p className="text-white/70">{proposal.venue || 'Not specified'}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg border border-white/10">
                  <Users className="h-5 w-5 text-green-400 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-white">Expected Participants</p>
                    <p className="text-white/70">
                      {proposal.expected_participants || proposal.expectedParticipants || 'Not specified'}
                    </p>
                  </div>
                </div>
                
                {(proposal.budget_estimate || proposal.budgetEstimate) && (
                  <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg border border-white/10">
                    <DollarSign className="h-5 w-5 text-amber-400 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-white">Budget Estimate</p>
                      <p className="text-white/70">
                        ₹{(proposal.budget_estimate || proposal.budgetEstimate)}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Organizer Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <User className="h-5 w-5 text-cyan-400" />
                Organizer Details
              </h3>
              
              <div className="grid grid-cols-1 gap-4">
                <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg border border-white/10">
                  <User className="h-5 w-5 text-cyan-400 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-white">Name</p>
                    <p className="text-white/70">{proposal.organizer_name || proposal.organizerName}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg border border-white/10">
                  <Mail className="h-5 w-5 text-rose-400 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-white">Email</p>
                    <p className="text-white/70">{proposal.organizer_email || proposal.organizerEmail}</p>
                  </div>
                </div>
                
                {(proposal.organizer_phone || proposal.organizerPhone) && (
                  <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg border border-white/10">
                    <Phone className="h-5 w-5 text-emerald-400 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-white">Phone</p>
                      <p className="text-white/70">{proposal.organizer_phone || proposal.organizerPhone}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Event Description */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <List className="h-5 w-5 text-blue-400" />
                Event Description
              </h3>
              <div className="prose prose-sm prose-invert max-w-none bg-white/5 rounded-lg p-4 border border-white/10">
                <p className="text-white/90 leading-relaxed">
                  {proposal.description || 'No description provided.'}
                </p>
              </div>
            </div>
            
            {/* Objectives */}
            {proposal.objectives && (
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Target className="h-5 w-5 text-green-400" />
                  Objectives
                </h3>
                <div className="prose prose-sm prose-invert max-w-none bg-white/5 rounded-lg p-4 border border-white/10">
                  <p className="text-white/90 leading-relaxed">{proposal.objectives}</p>
                </div>
              </div>
            )}
            
            {/* Additional Requirements */}
            {(proposal.additional_requirements || proposal.additionalRequirements) && (
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <FileText className="h-5 w-5 text-purple-400" />
                  Additional Requirements
                </h3>
                <div className="prose prose-sm prose-invert max-w-none bg-white/5 rounded-lg p-4 border border-white/10">
                  <p className="text-white/90 leading-relaxed">
                    {proposal.additional_requirements || proposal.additionalRequirements}
                  </p>
                </div>
              </div>
            )}

            {/* PDF Document */}
            {(proposal.pdf_document_url || proposal.pdfDocumentUrl) && (
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <FileText className="h-5 w-5 text-indigo-400" />
                  Proposal Document
                </h3>
                <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <Button
                    onClick={() => openPdfInNewTab(proposal.pdf_document_url || proposal.pdfDocumentUrl)}
                    className="w-full bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 text-white border-0"
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

        <div className="flex justify-end pt-4 border-t border-white/20">
          <Button
            variant="outline"
            onClick={onClose}
            className="bg-white/5 border-white/20 text-white hover:bg-white/10"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProposalDetailsModal;