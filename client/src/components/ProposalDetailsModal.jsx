import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { EventApprovalTracker } from "@/components/EventApprovalTracker";
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
  ExternalLink
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useState } from "react";
import { openPdfInNewTab } from "@/utils/pdfUtils";

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
        return 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-400';
      case 'rejected':
        return 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-400';
      case 'under_consideration':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-4 w-4" />;
      case 'rejected':
        return <XCircle className="h-4 w-4" />;
      case 'under_consideration':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return null;
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

  if (!proposal) return null;

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
                  <p className="text-muted-foreground">{new Date(proposal.event_date || '').toLocaleDateString()}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="font-semibold">Time</p>
                  <p className="text-muted-foreground">{proposal.start_time} - {proposal.end_time}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-2">
                <MapPin className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold">Venue</p>
                  <p className="text-muted-foreground">{proposal.venue || 'Not specified'}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-green-500" />
                <div>
                  <p className="font-semibold">Expected Participants</p>
                  <p className="text-muted-foreground">{proposal.expected_participants || 'Not specified'}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-amber-500" />
                <div>
                  <p className="font-semibold">Budget</p>
                  <p className="text-muted-foreground">
                    {proposal.budget ? `$${proposal.budget.toLocaleString()}` : 'Not specified'}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <User className="h-5 w-5 text-cyan-500" />
                <div>
                  <p className="font-semibold">Organizer</p>
                  <p className="text-muted-foreground">{proposal.organizer_name}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-rose-500" />
                <div>
                  <p className="font-semibold">Email</p>
                  <p className="text-muted-foreground">{proposal.organizer_email}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Phone className="h-5 w-5 text-emerald-500" />
                <div>
                  <p className="font-semibold">Contact</p>
                  <p className="text-muted-foreground">{proposal.organizer_phone || 'Not provided'}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-2">
                <FileText className="h-5 w-5 text-indigo-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold">Proposal Document</p>
                  {proposal.document_url ? (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openPdfInNewTab(proposal.document_url)}
                        className="text-blue-500 hover:underline flex items-center gap-1"
                      >
                        View Document <ExternalLink className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No document attached</p>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Target className="h-5 w-5 text-pink-500" />
                <div>
                  <p className="font-semibold">Event Type</p>
                  <p className="text-muted-foreground capitalize">
                    {proposal.event_type?.replace('_', ' ') || 'Not specified'}
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Description */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-lg font-semibold">
              <List className="h-5 w-5 text-blue-500" />
              <h3>Event Description</h3>
            </div>
            <div className="prose prose-sm dark:prose-invert max-w-none">
              {proposal.description || 'No description provided.'}
            </div>
          </div>
          
          {/* Objectives */}
          {proposal.objectives && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-lg font-semibold">
                <Target className="h-5 w-5 text-green-500" />
                <h3>Objectives</h3>
              </div>
              <div className="prose prose-sm dark:prose-invert max-w-none">
                {proposal.objectives}
              </div>
            </div>
          )}
          
          {/* Additional Information */}
          {proposal.additional_info && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-lg font-semibold">
                <FileText className="h-5 w-5 text-purple-500" />
                <h3>Additional Information</h3>
              </div>
              <div className="prose prose-sm dark:prose-invert max-w-none">
                {proposal.additional_info}
              </div>
            </div>
          )}
          
          {/* Approval Tracker */}
          {proposal.approvals && proposal.approvals.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-lg font-semibold">
                <CheckCircle className="h-5 w-5 text-amber-500" />
                <h3>Approval Status</h3>
              </div>
              <EventApprovalTracker approvals={proposal.approvals} />
            </div>
          )}
          
          {/* Admin Actions */}
          {showActions && (
            <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-800">
              <div className="space-y-2">
                <label htmlFor="comments" className="text-sm font-medium">
                  Add Comments (Optional)
                </label>
                <Textarea
                  id="comments"
                  placeholder="Add any comments or feedback..."
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  className="min-h-[100px]"
                />
              </div>
              
              <div className="flex flex-wrap gap-3">
                <Button
                  variant="outline"
                  onClick={onClose}
                  disabled={isUpdating}
                >
                  Close
                </Button>
                
                <div className="flex-1 flex justify-end gap-2">
                  <Button
                    variant="destructive"
                    onClick={() => handleStatusUpdate('rejected')}
                    disabled={isUpdating}
                  >
                    {isUpdating ? 'Updating...' : 'Reject'}
                  </Button>
                  
                  <Button
                    variant="secondary"
                    onClick={() => handleStatusUpdate('under_consideration')}
                    disabled={isUpdating}
                  >
                    {isUpdating ? 'Updating...' : 'Under Consideration'}
                  </Button>
                  
                  <Button
                    onClick={() => handleStatusUpdate('approved')}
                    disabled={isUpdating}
                  >
                    {isUpdating ? 'Updating...' : 'Approve'}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
      
      {/* PDF Viewer Modal */}
      {showPdfViewer && proposal.document_url && (
        <PdfViewer 
          url={proposal.document_url} 
          onClose={() => setShowPdfViewer(false)} 
        />
      )}
    </Dialog>
  );
};
