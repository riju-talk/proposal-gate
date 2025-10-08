import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ApprovalTracker } from "@/components/ApprovalTracker";
import {
  Building2,
  Users2,
  CheckCircle,
  XCircle,
  AlertCircle,
  ExternalLink,
  Eye,
  User,
  FileText,
} from "lucide-react";

export const ProposalDetailsModal = ({
  proposal,
  isOpen,
  onClose,
  onStatusUpdate,
  userRole,
  currentUser,
}) => {
  if (!proposal) return null;

  const status = proposal.status || "pending";
  const proposalType = proposal.type || (proposal.club_name ? 'club' : 'event');

  // Check if current user is authorized to approve based on email patterns
  const isAuthorizedAdmin = currentUser?.email && (
    currentUser.email.includes('treasurer@sc.iiitd.ac.in') ||
    currentUser.email.includes('admin-saoffice@iiitd.ac.in') ||
    currentUser.email.includes('vp@sc.iiitd.ac.in') ||
    currentUser.email.includes('smriti@iiitd.ac.in') ||
    currentUser.email.includes('ravi@iiitd.ac.in') ||
    currentUser.email.includes('president@sc.iiitd.ac.in')
  );

  // ---- Helpers ----
  const getStatusBadge = (status) => {
    switch (status) {
      case "approved":
        return (
          <Badge className="bg-success/20 text-success border-success/30">
            <CheckCircle className="h-4 w-4 mr-1" />
            Approved
          </Badge>
        );
      case "rejected":
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
            Pending
          </Badge>
        );
    }
  };

  const getTypeBadge = (type) => {
    switch (type) {
      case "club":
        return (
          <Badge className="bg-purple-500/20 text-purple-600 border-purple-500/30">
            <Building2 className="h-4 w-4 mr-1" />
            Club Proposal
          </Badge>
        );
      case "event":
      default:
        return (
          <Badge className="bg-blue-500/20 text-blue-600 border-blue-500/30">
            <Users2 className="h-4 w-4 mr-1" />
            Event Proposal
          </Badge>
        );
    }
  };

  const openPdfInNewTab = (url) => {
    if (url && /^https?:\/\//.test(url)) {
      window.open(url, "_blank", "noopener,noreferrer");
    } else {
      alert("Invalid or missing PDF link");
    }
  };

  // ---- Render ----
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-background border-border">
        {/* Header */}
        <DialogHeader className="border-b border-border pb-4">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold text-foreground">
              {proposalType === 'club'
                ? proposal.club_name || "Untitled Club"
                : proposal.event_name || "Untitled Event"
              }
            </DialogTitle>
            <div className="flex items-center gap-2">
              {getTypeBadge(proposalType)}
              {getStatusBadge(status)}
            </div>
          </div>
        </DialogHeader>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 py-6">
          {/* LEFT: Proposal Details */}
          <div className="space-y-6">
            {proposalType === "club" ? (
              // CLUB PROPOSAL DETAILS - Only show club_name, founders, and proposal_link
              <section className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-purple-500" /> Club Information
                </h3>
                <div className="space-y-4">
                  <InfoCard
                    icon={<Building2 className="h-5 w-5 text-purple-500" />}
                    label="Club Name"
                    value={proposal.club_name || "Not specified"}
                  />
                  <InfoCard
                    icon={<Users2 className="h-5 w-5 text-green-400" />}
                    label="Founders"
                    value={
                      Array.isArray(proposal.founders)
                        ? proposal.founders.join(", ")
                        : proposal.founders || "Not specified"
                    }
                  />
                  {proposal.proposal_link && (
                    <InfoCard
                      icon={<FileText className="h-5 w-5 text-blue-400" />}
                      label="Proposal Document"
                      value={
                        <Button
                          onClick={() => openPdfInNewTab(proposal.proposal_link)}
                          variant="outline"
                          size="sm"
                          className="w-full"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View Proposal PDF
                          <ExternalLink className="h-4 w-4 ml-2" />
                        </Button>
                      }
                    />
                  )}
                </div>
              </section>
            ) : (
              // EVENT PROPOSAL DETAILS - Show all event-specific fields
              <section className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Users2 className="h-5 w-5 text-blue-500" /> Event Information
                </h3>
                <div className="space-y-4">
                  <InfoCard
                    icon={<Users2 className="h-5 w-5 text-blue-500" />}
                    label="Event Name"
                    value={proposal.event_name || "Not specified"}
                  />
                  <InfoCard
                    icon={<User className="h-5 w-5 text-primary" />}
                    label="Organizer Email"
                    value={proposal.organizer_email || "Not specified"}
                  />
                  {proposal.organizer_phone && (
                    <InfoCard
                      icon={<User className="h-5 w-5 text-emerald-400" />}
                      label="Organizer Phone"
                      value={proposal.organizer_phone}
                    />
                  )}
                  <InfoCard
                    icon={<FileText className="h-5 w-5 text-purple-400" />}
                    label="Event Type"
                    value={proposal.event_type || "Not specified"}
                  />
                  <InfoCard
                    icon={<FileText className="h-5 w-5 text-indigo-400" />}
                    label="Description"
                    value={proposal.description || "No description provided"}
                  />
                  {proposal.pdf_document_url && (
                    <InfoCard
                      icon={<FileText className="h-5 w-5 text-red-400" />}
                      label="Proposal Document"
                      value={
                        <Button
                          onClick={() => openPdfInNewTab(proposal.pdf_document_url)}
                          variant="outline"
                          size="sm"
                          className="w-full"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View Proposal PDF
                          <ExternalLink className="h-4 w-4 ml-2" />
                        </Button>
                      }
                    />
                  )}
                </div>
              </section>
            )}
          </div>

          {/* RIGHT: Approval Tracker */}
          <div className="space-y-6">
            <ApprovalTracker
              eventId={proposal.id}
              showActions={userRole === "admin" && isAuthorizedAdmin}
              onStatusUpdate={onStatusUpdate}
              proposalType={proposalType}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-6 border-t border-border">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// --- Reusable small components ---
const InfoCard = ({ icon, label, value }) => (
  <div className="flex items-start gap-3 p-4 bg-card rounded-lg border border-border">
    {icon}
    <div className="flex-1">
      <p className="font-medium text-foreground mb-1">{label}</p>
      <div className="text-muted-foreground">
        {typeof value === "string" ? (
          <p>{value}</p>
        ) : (
          value
        )}
      </div>
    </div>
  </div>
);

export default ProposalDetailsModal;
