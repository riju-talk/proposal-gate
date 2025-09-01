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
  Phone, 
  FileText,
  Eye,
  CheckCircle,
  Sparkles,
  AlertCircle,
  XCircle
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { EventProposal } from "@/hooks/useEventProposals";

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


  return (
    <Card className="group hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 bg-gradient-to-br from-white to-purple-50 dark:from-slate-800 dark:to-purple-900/20 border border-purple-200 dark:border-purple-700 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <CardHeader className="pb-3 relative z-10">
        <div className="flex items-start justify-between">
          <div className="space-y-2 flex-1">
            <CardTitle className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent group-hover:from-purple-700 group-hover:to-blue-700 transition-all duration-300">
              {proposal.event_name}
            </CardTitle>
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Sparkles className="h-4 w-4 text-purple-400" />
                <span className="font-medium">{proposal.event_type}</span>
              </div>
              <span>•</span>
              <span>{formatDistanceToNow(new Date(proposal.created_at))} ago</span>
            </div>
          </div>
          <Badge className={`${getStatusColor(proposal.status)} border-0 font-medium shadow-lg`}>
            {getStatusText(proposal.status)}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4 relative z-10">
        <p className="text-foreground leading-relaxed line-clamp-2 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 p-3 rounded-lg border border-purple-100 dark:border-purple-800">
          {proposal.description}
        </p>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
          <div className="flex items-center gap-2 p-2 bg-white/50 dark:bg-slate-800/50 rounded-lg border border-purple-100 dark:border-purple-700">
            <Calendar className="h-4 w-4 text-purple-500" />
            <span className="font-medium">{new Date(proposal.event_date).toLocaleDateString()}</span>
          </div>
          
          <div className="flex items-center gap-2 p-2 bg-white/50 dark:bg-slate-800/50 rounded-lg border border-purple-100 dark:border-purple-700">
            <Clock className="h-4 w-4 text-blue-500" />
            <span className="font-medium">{proposal.start_time}</span>
          </div>
          
          <div className="flex items-center gap-2 p-2 bg-white/50 dark:bg-slate-800/50 rounded-lg border border-purple-100 dark:border-purple-700">
            <MapPin className="h-4 w-4 text-green-500" />
            <span className="font-medium truncate">{proposal.venue}</span>
          </div>
          
          <div className="flex items-center gap-2 p-2 bg-white/50 dark:bg-slate-800/50 rounded-lg border border-purple-100 dark:border-purple-700">
            <Users className="h-4 w-4 text-orange-500" />
            <span className="font-medium">{proposal.expected_participants}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2 p-2 bg-white/50 dark:bg-slate-800/50 rounded-lg border border-purple-100 dark:border-purple-700">
            <User className="h-4 w-4 text-indigo-500" />
            <span className="font-medium">{proposal.organizer_name}</span>
          </div>
          
          <div className="flex items-center gap-2 p-2 bg-white/50 dark:bg-slate-800/50 rounded-lg border border-purple-100 dark:border-purple-700">
            <Mail className="h-4 w-4 text-pink-500" />
            <span className="font-medium truncate">{proposal.organizer_email}</span>
          </div>
        </div>

        {proposal.budget_estimate && (
          <div className="flex items-center gap-2 p-2 bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 rounded-lg border border-emerald-200 dark:border-emerald-700">
            <DollarSign className="h-4 w-4 text-emerald-500" />
            <span className="font-medium">Budget: ₹{proposal.budget_estimate.toLocaleString()}</span>
          </div>
        )}

        {proposal.pdf_document_url && (
          <div className="flex items-center gap-2 p-2 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
            <FileText className="h-4 w-4 text-blue-500" />
            <span className="font-medium text-blue-600 dark:text-blue-400">PDF Document Available</span>
          </div>
        )}
        
        <div className="flex items-center justify-between pt-4 border-t border-purple-200 dark:border-purple-700">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onViewDetails(proposal)}
            className="flex items-center gap-2 border-purple-200 dark:border-purple-700 hover:bg-purple-50 dark:hover:bg-purple-900/50 hover:border-purple-300 dark:hover:border-purple-600 transition-all duration-200"
          >
            <Eye className="h-4 w-4" />
            View Details
          </Button>
          
          {showActions && (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onStatusUpdate(proposal.id, 'approved', 'Event proposal approved')}
                className="flex items-center gap-2 border-green-200 hover:bg-green-50 hover:border-green-300 text-green-600 hover:text-green-700 transition-all duration-200"
              >
                <CheckCircle className="h-4 w-4" />
                Approve
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onStatusUpdate(proposal.id, 'under_consideration', 'Marked for further review')}
                className="flex items-center gap-2 border-orange-200 hover:bg-orange-50 hover:border-orange-300 text-orange-600 hover:text-orange-700 transition-all duration-200"
              >
                <AlertCircle className="h-4 w-4" />
                Under Review
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onStatusUpdate(proposal.id, 'rejected', 'Event proposal rejected')}
                className="flex items-center gap-2 border-red-200 hover:bg-red-50 hover:border-red-300 text-red-600 hover:text-red-700 transition-all duration-200"
              >
                <XCircle className="h-4 w-4" />
                Reject
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};