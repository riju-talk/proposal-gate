import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  Eye,
} from "lucide-react";

export const ProposalDetailsModal = ({
  proposal,
  isOpen,
  onClose,
  onStatusUpdate,
  userRole,
}) => {
  if (!proposal) return null;

  const status = proposal.status || "pending";

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

  const formatTime = (timeString) => {
    if (!timeString) return "N/A";
    const [h, m] = timeString.split(":");
    const hours = parseInt(h, 10);
    const ampm = hours >= 12 ? "PM" : "AM";
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${m} ${ampm}`;
  };

  const openPdfInNewTab = (url) => {
    if (url && /^https?:\/\//.test(url)) {
      window.open(url, "_blank", "noopener,noreferrer");
    } else {
      alert("Invalid or missing PDF link");
    }
  };

  const eventDate = proposal.event_date || proposal.eventDate;

  // ---- Render ----
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto bg-background border-border">
        {/* Header */}
        <DialogHeader className="border-b border-border pb-4">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold text-foreground">
              {proposal.event_name || proposal.eventName || "Untitled Event"}
            </DialogTitle>
            {getStatusBadge(status)}
          </div>
        </DialogHeader>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 py-6">
          {/* LEFT: Event + Organizer Details */}
          <div className="space-y-6">
            {/* Event Information */}
            <section className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" /> Event Information
              </h3>
              <div className="grid gap-4">
                <InfoCard
                  icon={<Calendar className="h-5 w-5 text-primary" />}
                  label="Event Date"
                  value={
                    eventDate
                      ? new Date(eventDate).toLocaleDateString("en-US", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })
                      : "Not specified"
                  }
                />
                <InfoCard
                  icon={<Clock className="h-5 w-5 text-blue-400" />}
                  label="Time"
                  value={`${formatTime(
                    proposal.start_time || proposal.startTime
                  )} - ${formatTime(proposal.end_time || proposal.endTime)}`}
                />
                <InfoCard
                  icon={<MapPin className="h-5 w-5 text-red-400" />}
                  label="Venue"
                  value={proposal.venue || "Not specified"}
                />
                <InfoCard
                  icon={<Users className="h-5 w-5 text-green-400" />}
                  label="Expected Participants"
                  value={
                    proposal.expected_participants ||
                    proposal.expectedParticipants ||
                    "Not specified"
                  }
                />
                {(proposal.budget_estimate || proposal.budgetEstimate) && (
                  <InfoCard
                    icon={<DollarSign className="h-5 w-5 text-amber-400" />}
                    label="Budget Estimate"
                    value={`₹${
                      proposal.budget_estimate || proposal.budgetEstimate
                    }`}
                  />
                )}
              </div>
            </section>

            {/* Organizer Details */}
            <section className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <User className="h-5 w-5 text-primary" /> Organizer Details
              </h3>
              <div className="grid gap-4">
                <InfoCard
                  icon={<User className="h-5 w-5 text-primary" />}
                  label="Name"
                  value={proposal.organizer_name || proposal.organizerName}
                />
                <InfoCard
                  icon={<Mail className="h-5 w-5 text-rose-400" />}
                  label="Email"
                  value={proposal.organizer_email || proposal.organizerEmail}
                />
                {(proposal.organizer_phone || proposal.organizerPhone) && (
                  <InfoCard
                    icon={<Phone className="h-5 w-5 text-emerald-400" />}
                    label="Phone"
                    value={
                      proposal.organizer_phone || proposal.organizerPhone
                    }
                  />
                )}
              </div>
            </section>

            {/* Description */}
            <SectionBlock
              icon={<List className="h-5 w-5 text-blue-400" />}
              title="Event Description"
              content={proposal.description || "No description provided."}
            />

            {/* Objectives */}
            {proposal.objectives && (
              <SectionBlock
                icon={<Target className="h-5 w-5 text-green-400" />}
                title="Objectives"
                content={proposal.objectives}
              />
            )}

            {/* Additional Requirements */}
            {(proposal.additional_requirements ||
              proposal.additionalRequirements) && (
              <SectionBlock
                icon={<FileText className="h-5 w-5 text-purple-400" />}
                title="Additional Requirements"
                content={
                  proposal.additional_requirements ||
                  proposal.additionalRequirements
                }
              />
            )}

            {/* PDF Document */}
            {(proposal.pdf_document_url || proposal.pdfDocumentUrl) && (
              <SectionBlock
                icon={<FileText className="h-5 w-5 text-indigo-400" />}
                title="Proposal Document"
                content={
                  <Button
                    onClick={() =>
                      openPdfInNewTab(
                        proposal.pdf_document_url || proposal.pdfDocumentUrl
                      )
                    }
                    className="w-full"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View Proposal Document
                    <ExternalLink className="h-4 w-4 ml-2" />
                  </Button>
                }
              />
            )}
          </div>

          {/* RIGHT: Approval Tracker */}
          <div className="space-y-6">
            <EventApprovalTracker
              eventId={proposal.id}
              showActions={userRole === "admin"}
              onStatusUpdate={onStatusUpdate}
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
  <div className="flex items-center gap-3 p-4 bg-card rounded-lg border border-border">
    {icon}
    <div>
      <p className="font-medium text-foreground">{label}</p>
      <p className="text-muted-foreground">{value}</p>
    </div>
  </div>
);

const SectionBlock = ({ icon, title, content }) => (
  <div className="space-y-3">
    <h3 className="text-lg font-semibold flex items-center gap-2">
      {icon} {title}
    </h3>
    <div className="bg-card rounded-lg p-4 border border-border">
      {typeof content === "string" ? (
        <p className="text-foreground leading-relaxed">{content}</p>
      ) : (
        content
      )}
    </div>
  </div>
);

export default ProposalDetailsModal;
