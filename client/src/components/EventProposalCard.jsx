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
  Sparkles,
  AlertCircle,
  XCircle,
  Lightbulb,
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
  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg border-0';
      case 'rejected':
        return 'bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-lg border-0';
      case 'under_consideration':
        return 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-lg border-0';
      default:
        return 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg border-0';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-4 w-4 mr-1.5" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 mr-1.5" />;
      case 'under_consideration':
        return <AlertCircle className="h-4 w-4 mr-1.5" />;
      default:
        return <Clock className="h-4 w-4 mr-1.5" />;
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
    
    // Handle both time formats (HH:MM and HH:MM:SS)
    const timeParts = timeString.split(':');
    const hours = parseInt(timeParts[0]);
    const minutes = timeParts[1];
    
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    
    return `${displayHours}:${minutes} ${ampm}`;
  };

  const status = proposal.status || 'pending';
  const statusText = status.split('_').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');

  const eventName = proposal.event_name || proposal.eventName || 'Untitled Event';
  const organizerName = proposal.organizer_name || proposal.organizerName || 'Unknown Organizer';
  const eventDate = proposal.event_date || proposal.eventDate;
  const startTime = proposal.start_time || proposal.startTime;
  const endTime = proposal.end_time || proposal.endTime;
  const venue = proposal.venue || 'Not specified';
  const expectedParticipants = proposal.expected_participants || proposal.expectedParticipants;
  const createdAt = proposal.created_at || proposal.createdAt;

  return (
    <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-primary/20 hover:shadow-primary/10 bg-white/5 border-white/10">
      <div className={`px-4 py-2 ${getStatusColor(status)}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            {getStatusIcon(status)}
            <span className="text-sm font-medium">{statusText}</span>
          </div>
          <span className="text-xs opacity-90">
            {formatDistanceToNow(new Date(createdAt), { addSuffix: true })}
          </span>
        </div>
      </div>
      
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-bold line-clamp-2 text-white">
          {eventName}
        </CardTitle>
        <div className="flex items-center text-sm text-white/70 mt-1">
          <User className="h-4 w-4 mr-1.5" />
          <span>{organizerName}</span>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-start">
            <Calendar className="h-4 w-4 mt-0.5 mr-1.5 text-purple-400 flex-shrink-0" />
            <div>
              <div className="font-medium text-white">Date</div>
              <div className="text-white/70">{formatDate(eventDate)}</div>
            </div>
          </div>
          
          <div className="flex items-start">
            <Clock className="h-4 w-4 mt-0.5 mr-1.5 text-blue-400 flex-shrink-0" />
            <div>
              <div className="font-medium text-white">Time</div>
              <div className="text-white/70">
                {formatTime(startTime)} - {formatTime(endTime)}
              </div>
            </div>
          </div>
          
          <div className="flex items-start">
            <MapPin className="h-4 w-4 mt-0.5 mr-1.5 text-red-400 flex-shrink-0" />
            <div>
              <div className="font-medium text-white">Venue</div>
              <div className="text-white/70 line-clamp-1">{venue}</div>
            </div>
          </div>
          
          <div className="flex items-start">
            <Users className="h-4 w-4 mt-0.5 mr-1.5 text-green-400 flex-shrink-0" />
            <div>
              <div className="font-medium text-white">Expected</div>
              <div className="text-white/70">
                {expectedParticipants || 'N/A'} attendees
              </div>
            </div>
          </div>
        </div>
        
        <div className="pt-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full bg-white/5 border-white/20 text-white hover:bg-white/10"
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