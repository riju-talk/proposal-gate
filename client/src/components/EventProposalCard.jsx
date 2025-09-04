import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  DollarSign, 
  User, 
  Mail, 
  FileText,
  Eye,
  CheckCircle,
  AlertCircle,
  XCircle,
  ExternalLink
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export const EventProposalCard = ({ 
  proposal, 
  onViewDetails, 
  showActions, 
  onStatusUpdate,
  userRole 
}) => {
  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved':
        return (
          <Badge className="bg-success/20 text-success border-success/30">
            <CheckCircle className="h-3 w-3 mr-1" />
            Approved
          </Badge>
        );
      case 'rejected':
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

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
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

  const status = proposal.status || 'pending';
  const eventName = proposal.event_name || proposal.eventName || 'Untitled Event';
  const organizerName = proposal.organizer_name || proposal.organizerName || 'Unknown Organizer';
  const eventDate = proposal.event_date || proposal.eventDate;
  const startTime = proposal.start_time || proposal.startTime;
  const endTime = proposal.end_time || proposal.endTime;
  const venue = proposal.venue || 'Not specified';
  const expectedParticipants = proposal.expected_participants || proposal.expectedParticipants;
  const createdAt = proposal.created_at || proposal.createdAt;

  return (
    <Card className="professional-card card-hover group">
      {/* Status Header */}
      <div className="px-6 py-3 border-b border-border">
        <div className="flex items-center justify-between">
          {getStatusBadge(status)}
          <span className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(createdAt), { addSuffix: true })}
          </span>
        </div>
      </div>
      
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold line-clamp-2 text-foreground group-hover:text-primary transition-colors">
          {eventName}
        </CardTitle>
        <div className="flex items-center text-sm text-muted-foreground">
          <User className="h-4 w-4 mr-2" />
          <span>Organized by {organizerName}</span>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Event Details Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="flex items-center text-xs text-muted-foreground">
              <Calendar className="h-3 w-3 mr-1" />
              Date
            </div>
            <div className="text-sm font-medium text-foreground">
              {formatDate(eventDate)}
            </div>
          </div>
          
          <div className="space-y-1">
            <div className="flex items-center text-xs text-muted-foreground">
              <Clock className="h-3 w-3 mr-1" />
              Time
            </div>
            <div className="text-sm font-medium text-foreground">
              {formatTime(startTime)} - {formatTime(endTime)}
            </div>
          </div>
          
          <div className="space-y-1">
            <div className="flex items-center text-xs text-muted-foreground">
              <MapPin className="h-3 w-3 mr-1" />
              Venue
            </div>
            <div className="text-sm font-medium text-foreground line-clamp-1">
              {venue}
            </div>
          </div>
          
          <div className="space-y-1">
            <div className="flex items-center text-xs text-muted-foreground">
              <Users className="h-3 w-3 mr-1" />
              Expected
            </div>
            <div className="text-sm font-medium text-foreground">
              {expectedParticipants || 'N/A'} attendees
            </div>
          </div>
        </div>
        
        {/* Description Preview */}
        <div className="pt-2">
          <p className="text-sm text-muted-foreground line-clamp-2">
            {proposal.description || 'No description provided.'}
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

export default EventProposalCard;