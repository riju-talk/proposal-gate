import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  User, 
  Eye,
  CheckCircle,
  AlertCircle,
  XCircle,
  Building2,
  Users2
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export const ProposalCard = ({ proposal, onViewDetails }) => {
  // Handle different fields for club vs event proposals
  const type = proposal?.type || (proposal?.club_name ? 'club' : 'event');

  // Common fields
  const created_at = proposal?.created_at;
  const status = proposal?.status || "pending";

  // Event-specific fields
  const event_name = proposal?.event_name;
  const organizer_name = proposal?.organizer_name;
  const event_date = proposal?.event_date;
  const start_time = proposal?.start_time;
  const end_time = proposal?.end_time;
  const venue = proposal?.venue;
  const expected_participants = proposal?.expected_participants;
  const description = proposal?.description;

  // Club-specific fields
  const club_name = proposal?.club_name;
  const founders = proposal?.founders;
  const proposal_link = proposal?.proposal_link;

  const getStatusBadge = (status) => {
    switch (status.toLowerCase()) {
      case "approved":
        return (
          <Badge className="bg-success/20 text-success border-success/30">
            <CheckCircle className="h-3 w-3 mr-1" />
            Approved
          </Badge>
        );
      case "rejected":
        return (
          <Badge className="bg-destructive/20 text-destructive border-destructive/30">
            <XCircle className="h-3 w-3 mr-1" />
            Rejected
          </Badge>
        );
      default:
        return (
          <Badge className="bg-primary/20 text-primary border-primary/30">
            <AlertCircle className="h-3 w-3 mr-1" />
            Pending Approval
          </Badge>
        );
    }
  };

  const getTypeBadge = (type) => {
    switch (type) {
      case "club":
        return (
          <Badge className="bg-purple-500/20 text-purple-600 border-purple-500/30">
            <Building2 className="h-3 w-3 mr-1" />
            Club Proposal
          </Badge>
        );
      case "event":
      default:
        return (
          <Badge className="bg-blue-500/20 text-blue-600 border-blue-500/30">
            <Users2 className="h-3 w-3 mr-1" />
            Event Proposal
          </Badge>
        );
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return "N/A";
    const [hoursStr, minutes] = timeString.split(":");
    const hours = parseInt(hoursStr, 10);
    const ampm = hours >= 12 ? "PM" : "AM";
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${minutes} ${ampm}`;
  };

  return (
    <Card className="professional-card card-hover group">
      {/* Status Header */}
      <div className="px-6 py-3 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getTypeBadge(type)}
            {getStatusBadge(status)}
          </div>
          <span className="text-xs text-muted-foreground">
            {created_at
              ? formatDistanceToNow(new Date(created_at), { addSuffix: true })
              : "N/A"}
          </span>
        </div>
      </div>

      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold line-clamp-2 text-foreground group-hover:text-primary transition-colors">
          {type === 'club' ? (club_name || "Untitled Club") : (event_name || "Untitled Event")}
        </CardTitle>
        <div className="flex items-center text-sm text-muted-foreground">
          <User className="h-4 w-4 mr-2" />
          <span>
            {type === 'club'
              ? `Founded by ${Array.isArray(founders) ? founders.join(", ") : (founders || "Unknown")}`
              : `Organized by ${organizer_name || "Unknown"}`
            }
          </span>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Event Details Grid */}
        <div className="grid grid-cols-2 gap-4">
          {type === "event" ? (
            <>
              <div className="space-y-1">
                <div className="flex items-center text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3 mr-1" />
                  Date
                </div>
                <div className="text-sm font-medium text-foreground">
                  {formatDate(event_date)}
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center text-xs text-muted-foreground">
                  <Clock className="h-3 w-3 mr-1" />
                  Time
                </div>
                <div className="text-sm font-medium text-foreground">
                  {formatTime(start_time)} - {formatTime(end_time)}
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center text-xs text-muted-foreground">
                  <MapPin className="h-3 w-3 mr-1" />
                  Venue
                </div>
                <div className="text-sm font-medium text-foreground line-clamp-1">
                  {venue || "Not specified"}
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center text-xs text-muted-foreground">
                  <Users className="h-3 w-3 mr-1" />
                  Expected
                </div>
                <div className="text-sm font-medium text-foreground">
                  {expected_participants || "N/A"} attendees
                </div>
              </div>
            </>
          ) : (
            // For club proposals, show different info
            <>
              <div className="space-y-1 col-span-2">
                <div className="flex items-center text-xs text-muted-foreground">
                  <Building2 className="h-3 w-3 mr-1" />
                  Club Information
                </div>
                <div className="text-sm font-medium text-foreground">
                  {proposal.club_name || "Club name not available"}
                </div>
              </div>

              <div className="space-y-1 col-span-2">
                <div className="flex items-center text-xs text-muted-foreground">
                  <Users className="h-3 w-3 mr-1" />
                  Founders
                </div>
                <div className="text-sm font-medium text-foreground">
                  {Array.isArray(proposal.founders) ? proposal.founders.join(", ") : "Not specified"}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Description Preview */}
        <div className="pt-2">
          <p className="text-sm text-muted-foreground line-clamp-2">
            {description || "No description provided."}
          </p>
        </div>

        {/* Action Button */}
        <div className="pt-2">
          <Button
            variant="outline"
            size="sm"
            className="w-full border-primary/20 hover:bg-primary/10 hover:border-primary/40 hover:text-primary"
            onClick={() => onViewDetails(proposal)}
          >
            <Eye className="h-4 w-4 mr-2" />
            View Details
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProposalCard;
