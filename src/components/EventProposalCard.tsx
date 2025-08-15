import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, MapPin, Users, DollarSign, Eye, CheckCircle, AlertCircle, Sparkles } from "lucide-react";
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
        return 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg';
      case 'rejected':
        return 'bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-lg';
      case 'under_consideration':
        return 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-lg';
      default:
        return 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'approved':
        return 'Approved';
      case 'rejected':
        return 'Rejected';
      case 'under_consideration':
        return 'Under Review';
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
    <Card className="hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02] bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-purple-200/50 dark:border-purple-700/50">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-xl bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              {proposal.event_name}
            </CardTitle>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>{proposal.organizer_name}</span>
              <span>•</span>
              <span>{formatDistanceToNow(new Date(proposal.created_at))} ago</span>
            </div>
          </div>
          <Badge className={`${getStatusColor(proposal.status)} font-medium border-0`}>
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
            <Calendar className="h-4 w-4 text-purple-500" />
            <span>{new Date(proposal.event_date).toLocaleDateString()}</span>
          </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 p-4 rounded-lg">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-blue-500" />
            <span>{proposal.start_time} - {proposal.end_time}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-green-500" />
            <span>{proposal.venue}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-orange-500" />
            <span>{proposal.expected_participants} attendees</span>
          </div>
          
          {proposal.budget_estimate && (
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-emerald-500" />
              <span>₹{proposal.budget_estimate.toLocaleString()}</span>
            </div>
          )}
          
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs border-purple-300 text-purple-600 dark:border-purple-600 dark:text-purple-400">
              {proposal.event_type}
            </Badge>
          </div>
        </div>
        
        <div className="flex items-center justify-between pt-4">
          <Button
            variant="outline"
            onClick={() => onViewDetails(proposal)}
            className="flex items-center gap-2 border-purple-300 hover:bg-purple-50 dark:border-purple-600 dark:hover:bg-purple-900/50"
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
                className="flex items-center gap-2 border-yellow-400 text-yellow-600 hover:bg-yellow-50 dark:border-yellow-500 dark:text-yellow-400 dark:hover:bg-yellow-900/50"
              >
                <Sparkles className="h-4 w-4" />
                Mark for Ideation
              </Button>
              <Button
                size="sm"
                onClick={handleApprove}
                className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-lg"
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