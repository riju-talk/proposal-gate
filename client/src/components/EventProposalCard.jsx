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
        return <Lightbulb className="h-4 w-4 mr-1.5" />;
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

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const status = proposal.status || 'pending';
  const statusText = status.split('_').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');

  return (
    <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-primary/20 hover:shadow-primary/10">
      <div className={`px-4 py-2 ${getStatusColor(status)}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            {getStatusIcon(status)}
            <span className="text-sm font-medium">{statusText}</span>
          </div>
          <span className="text-xs opacity-90">
            {formatDistanceToNow(new Date(proposal.created_at), { addSuffix: true })}
          </span>
        </div>
      </div>
      
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-bold line-clamp-2">
          {proposal.event_name}
        </CardTitle>
        <div className="flex items-center text-sm text-muted-foreground mt-1">
          <User className="h-4 w-4 mr-1.5" />
          <span>{proposal.organizer_name}</span>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-start">
            <Calendar className="h-4 w-4 mt-0.5 mr-1.5 text-muted-foreground flex-shrink-0" />
            <div>
              <div className="font-medium">Date</div>
              <div className="text-muted-foreground">{formatDate(proposal.start_time)}</div>
            </div>
          </div>
          
          <div className="flex items-start">
            <Clock className="h-4 w-4 mt-0.5 mr-1.5 text-muted-foreground flex-shrink-0" />
            <div>
              <div className="font-medium">Time</div>
              <div className="text-muted-foreground">
                {formatTime(proposal.start_time)} - {formatTime(proposal.end_time)}
              </div>
            </div>
          </div>
          
          <div className="flex items-start">
            <MapPin className="h-4 w-4 mt-0.5 mr-1.5 text-muted-foreground flex-shrink-0" />
            <div>
              <div className="font-medium">Venue</div>
              <div className="text-muted-foreground line-clamp-1">
                {proposal.venue || 'Not specified'}
              </div>
            </div>
          </div>
          
          <div className="flex items-start">
            <Users className="h-4 w-4 mt-0.5 mr-1.5 text-muted-foreground flex-shrink-0" />
            <div>
              <div className="font-medium">Expected</div>
              <div className="text-muted-foreground">
                {proposal.expected_participants || 'N/A'} attendees
              </div>
            </div>
          </div>
        </div>
        
        <div className="pt-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full"
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
