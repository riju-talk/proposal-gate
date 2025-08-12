import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { EventProposal } from '@/hooks/useEventProposals';
import { Calendar, Clock, MapPin, Users, DollarSign, User, Mail, Building } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface ProposalCardProps {
  proposal: EventProposal;
  onViewDetails: (proposal: EventProposal) => void;
}

export const ProposalCard = ({ proposal, onViewDetails }: ProposalCardProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new':
        return 'bg-dashboard-status-new text-white';
      case 'approved':
        return 'bg-dashboard-status-approved text-white';
      case 'rejected':
        return 'bg-dashboard-status-rejected text-white';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'new':
        return 'Pending Review';
      case 'approved':
        return 'Approved';
      case 'rejected':
        return 'Rejected';
      default:
        return status;
    }
  };

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 hover:scale-[1.02] bg-gradient-card border-0">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg text-card-foreground truncate">
              {proposal.eventName}
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              {proposal.eventType}
            </p>
          </div>
          <Badge className={`${getStatusColor(proposal.status)} border-0 font-medium`}>
            {getStatusText(proposal.status)}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground line-clamp-2">
          {proposal.eventDescription}
        </p>
        
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="h-4 w-4 flex-shrink-0" />
            <span className="truncate">{proposal.eventDate}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="h-4 w-4 flex-shrink-0" />
            <span className="truncate">{proposal.startTime}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="h-4 w-4 flex-shrink-0" />
            <span className="truncate">{proposal.preferredVenue}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Users className="h-4 w-4 flex-shrink-0" />
            <span className="truncate">{proposal.expectedAttendees} attendees</span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-2 text-sm border-t pt-3">
          <div className="flex items-center gap-2 text-muted-foreground">
            <User className="h-4 w-4 flex-shrink-0" />
            <span className="truncate">{proposal.primaryOrganizer}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Building className="h-4 w-4 flex-shrink-0" />
            <span className="truncate">{proposal.department}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <DollarSign className="h-4 w-4 flex-shrink-0" />
            <span className="truncate">₹{proposal.estimatedBudget.toLocaleString()}</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t">
          <div className="text-xs text-muted-foreground">
            Submitted {formatDistanceToNow(proposal.submittedAt, { addSuffix: true })}
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => onViewDetails(proposal)}
            className="hover:bg-primary hover:text-primary-foreground transition-colors"
          >
            View Details
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};