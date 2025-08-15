import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, MapPin, Users, DollarSign, Eye, CheckCircle, AlertCircle } from "lucide-react";
import { EventProposal } from "@/hooks/useEventProposals";
import { formatDistanceToNow } from "date-fns";

interface EventProposalCardProps {
  proposal: EventProposal;
  onViewDetails: (proposal: EventProposal) => void;
  showActions: boolean;
  onStatusUpdate: (id: string, status: 'approved' | 'rejected' | 'under_consideration', comments: string) => Promise<void>;
}

export const EventProposalCard = ({ 
  proposal, 
  onViewDetails, 
  showActions, 
  onStatusUpdate 
}: EventProposalCardProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-success text-success-foreground';
      case 'rejected':
        return 'bg-destructive text-destructive-foreground';
      case 'under_consideration':
        return 'bg-warning text-warning-foreground';
      default:
        return 'bg-accent text-accent-foreground';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'approved':
        return 'Approved';
      case 'rejected':
        return 'Rejected';
      case 'under_consideration':
        return 'Under Consideration';
      default:
        return 'Pending';
    }
  };

  const handleMarkForConsideration = async () => {
    await onStatusUpdate(proposal.id, 'under_consideration', 'Marked for further ideation');
  };

  const handleApprove = async () => {
    await onStatusUpdate(proposal.id, 'approved', 'Approved for execution');
  };

  return (
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-xl">{proposal.event_name}</CardTitle>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>{proposal.organizer_name}</span>
              <span>•</span>
              <span>{formatDistanceToNow(new Date(proposal.created_at))} ago</span>
            </div>
          </div>
          <Badge className={`${getStatusColor(proposal.status)} font-medium`}>
            {getStatusText(proposal.status)}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <p className="text-foreground leading-relaxed line-clamp-2">
          {proposal.description}
        </p>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-primary" />
            <span>{new Date(proposal.event_date).toLocaleDateString()}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-primary" />
            <span>{proposal.start_time} - {proposal.end_time}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-primary" />
            <span>{proposal.venue}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" />
            <span>{proposal.expected_participants} attendees</span>
          </div>
          
          {proposal.budget_estimate && (
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-primary" />
              <span>₹{proposal.budget_estimate.toLocaleString()}</span>
            </div>
          )}
          
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {proposal.event_type}
            </Badge>
          </div>
        </div>
        
        <div className="flex items-center justify-between pt-4">
          <Button
            variant="outline"
            onClick={() => onViewDetails(proposal)}
            className="flex items-center gap-2"
          >
            <Eye className="h-4 w-4" />
            View Details
          </Button>
          
          {showActions && proposal.status === 'pending' && (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleMarkForConsideration}
                className="flex items-center gap-2"
              >
                <AlertCircle className="h-4 w-4" />
                Mark for Ideation
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={handleApprove}
                className="flex items-center gap-2"
              >
                <CheckCircle className="h-4 w-4" />
                Approve
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};