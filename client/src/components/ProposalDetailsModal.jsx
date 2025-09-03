import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { PdfViewer } from "@/components/PdfViewer";
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
import { useState } from "react";

export const ProposalDetailsModal = ({ 
  proposal, 
  isOpen, 
  onClose, 
  showActions, 
  onStatusUpdate 
}) => {
  const [comments, setComments] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [showPdfViewer, setShowPdfViewer] = useState(false);

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

  const handleStatusUpdate = async (status) => {
    if (!onStatusUpdate) return;
    
    try {
      setIsUpdating(true);
      await onStatusUpdate(proposal.id, status, comments);
      setComments("");
    } finally {
      setIsUpdating(false);
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
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-slate-900/95 backdrop-blur-xl border-white/20">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold text-white">{proposal.event_name}</DialogTitle>
            <Badge className={`${getStatusColor(status)} flex items-center gap-1`}>
              {getStatusIcon(status)}
              {statusText}
            </Badge>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-purple-400" />
                <div>
                  <p className="font-semibold text-white">Event Date</p>
                  <p className="text-white/70">{new Date(proposal.event_date || proposal.start_time || '').toLocaleDateString()}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-blue-400" />
                <div>
                  <p className="font-semibold text-white">Time</p>
                  <p className="text-white/70">{proposal.start_time} - {proposal.end_time}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-2">
                <MapPin className="h-5 w-5 text-red-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-white">Venue</p>
                  <p className="text-white/70">{proposal.venue || 'Not specified'}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-green-400" />
                <div>
                  <p className="font-semibold text-white">Expected Participants</p>
                  <p className="text-white/70">{proposal.expected_participants || 'Not specified'}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-amber-400" />
                <div>
                  <p className="font-semibold text-white">Budget</p>
                  <p className="text-white/70">
                    {proposal.budget ? `$${proposal.budget.toLocaleString()}` : 'Not specified'}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <User className="h-5 w-5 text-cyan-400" />
                <div>
                  <p className="font-semibold text-white">Organizer</p>
                  <p className="text-white/70">{proposal.organizer_name}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-rose-400" />
                <div>
                  <p className="font-semibold text-white">Email</p>
                  <p className="text-white/70">{proposal.organizer_email}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Phone className="h-5 w-5 text-emerald-400" />
                <div>
                  <p className="font-semibold text-white">Contact</p>
                  <p className="text-white/70">{proposal.organizer_phone || 'Not provided'}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-2">
                <FileText className="h-5 w-5 text-indigo-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-white">Proposal Document</p>
                  {proposal.document_url || proposal.pdf_document_url ? (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openPdfInNewTab(proposal.document_url || proposal.pdf_document_url)}
                        className="text-cyan-400 hover:text-cyan-300 hover:underline flex items-center gap-1 transition-colors"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        View Document
                        <ExternalLink className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ) : (
                    <p className="text-white/70">No document attached</p>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Target className="h-5 w-5 text-pink-400" />
                <div>
                  <p className="font-semibold text-white">Event Type</p>
                  <p className="text-white/70 capitalize">
                    {proposal.event_type?.replace('_', ' ') || 'Not specified'}
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Description */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-lg font-semibold text-white">
              <List className="h-5 w-5 text-blue-400" />
              <h3>Event Description</h3>
            </div>
            <div className="prose prose-sm prose-invert max-w-none bg-white/5 rounded-lg p-4 border border-white/10">
              {proposal.description || 'No description provided.'}
            </div>
          </div>
          
          {/* Objectives */}
          {proposal.objectives && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-lg font-semibold text-white">
                <Target className="h-5 w-5 text-green-400" />
                <h3>Objectives</h3>
              </div>
              <div className="prose prose-sm prose-invert max-w-none bg-white/5 rounded-lg p-4 border border-white/10">
                {proposal.objectives}
              </div>
            </div>
          )}
          
          {/* Additional Information */}
          {proposal.additional_info && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-lg font-semibold text-white">
                <FileText className="h-5 w-5 text-purple-400" />
                <h3>Additional Information</h3>
              </div>
              <div className="prose prose-sm prose-invert max-w-none bg-white/5 rounded-lg p-4 border border-white/10">
                {proposal.additional_info}
              </div>
            </div>
          )}
          
          {/* Admin Actions */}
          {showActions && (
            <div className="space-y-4 pt-4 border-t border-white/20">
              <div className="space-y-2">
                <label htmlFor="comments" className="text-sm font-medium text-white">
                  Add Comments (Optional)
                </label>
                <Textarea
                  id="comments"
                  placeholder="Add any comments or feedback..."
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  className="min-h-[100px] bg-white/5 border-white/20 text-white placeholder:text-white/50 focus:border-cyan-400/50"
                />
              </div>
              
              <div className="flex flex-wrap gap-3">
                <Button
                  variant="outline"
                  onClick={onClose}
                  disabled={isUpdating}
                  className="bg-white/5 border-white/20 text-white hover:bg-white/10"
                >
                  Close
                </Button>
                
                <div className="flex-1 flex justify-end gap-2">
                  <Button
                    onClick={() => handleStatusUpdate('rejected')}
                    disabled={isUpdating}
                    className="bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-500 hover:to-pink-500 text-white border-0"
                  >
                    {isUpdating ? 'Updating...' : 'Reject'}
                  </Button>
                  
                  <Button
                    onClick={() => handleStatusUpdate('under_consideration')}
                    disabled={isUpdating}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white border-0"
                  >
                    {isUpdating ? 'Updating...' : 'Mark for Ideation'}
                  </Button>
                  
                  <Button
                    onClick={() => handleStatusUpdate('approved')}
                    disabled={isUpdating}
                    className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white border-0"
                  >
                    {isUpdating ? 'Updating...' : 'Approve'}
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