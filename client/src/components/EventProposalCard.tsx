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
  Lightbulb
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { EventProposal } from "@/hooks/useEventProposals";

interface EventProposalCardProps {
  proposal: EventProposal;
  onViewDetails: (proposal: EventProposal) => void;
  showActions: boolean;
  onStatusUpdate: (id: string, status: 'approved' | 'rejected' | 'under_consideration', comments: string) => Promise<void>;
  userRole: 'admin' | 'coordinator' | 'public';
}

export const EventProposalCard = ({ 
  proposal, 
  onViewDetails, 
  showActions, 
  onStatusUpdate,
  userRole 
}: EventProposalCardProps) => {
  const getStatusColor = (status: string) => {
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-4 w-4" />;
      case 'rejected':
        return <XCircle className="h-4 w-4" />;
      case 'under_consideration':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <Card className="group hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 bg-white/5 backdrop-blur-sm border-white/10 hover:border-purple-500/30 overflow-hidden relative">
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-blue-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      {/* Glow effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-blue-500/10 opacity-0 group-hover:opacity-50 blur-xl transition-opacity duration-500" />
      
      <CardHeader className="pb-4 relative z-10">
        <div className="flex items-start justify-between">
          <div className="space-y-3 flex-1">
            <CardTitle className="text-xl font-bold text-white group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-purple-400 group-hover:to-cyan-400 group-hover:bg-clip-text transition-all duration-300">
              {proposal.event_name}
            </CardTitle>
            <div className="flex items-center gap-3 text-sm text-purple-200">
              <div className="flex items-center gap-1">
                <Sparkles className="h-4 w-4 text-purple-400" />
                <span className="font-medium">{proposal.event_type}</span>
              </div>
              <span>•</span>
              <span>{formatDistanceToNow(new Date(proposal.created_at))} ago</span>
            </div>
          </div>
          <Badge className={`${getStatusColor(proposal.status)} flex items-center gap-1 px-3 py-1`}>
            {getStatusIcon(proposal.status)}
            {getStatusText(proposal.status)}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-5 relative z-10">
        <div className="p-4 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10">
          <p className="text-white/90 leading-relaxed line-clamp-2">
            {proposal.description}
          </p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
          <div className="flex items-center gap-2 p-3 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 hover:border-purple-500/30 transition-colors">
            <Calendar className="h-4 w-4 text-purple-400" />
            <span className="font-medium text-white">{new Date(proposal.event_date).toLocaleDateString()}</span>
          </div>
          
          <div className="flex items-center gap-2 p-3 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 hover:border-blue-500/30 transition-colors">
            <Clock className="h-4 w-4 text-blue-400" />
            <span className="font-medium text-white">{proposal.start_time}</span>
          </div>
          
          <div className="flex items-center gap-2 p-3 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 hover:border-green-500/30 transition-colors">
            <MapPin className="h-4 w-4 text-green-400" />
            <span className="font-medium text-white truncate">{proposal.venue}</span>
          </div>
          
          <div className="flex items-center gap-2 p-3 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 hover:border-orange-500/30 transition-colors">
            <Users className="h-4 w-4 text-orange-400" />
            <span className="font-medium text-white">{proposal.expected_participants}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2 p-3 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10">
            <User className="h-4 w-4 text-indigo-400" />
            <span className="font-medium text-white">{proposal.organizer_name}</span>
          </div>
          
          <div className="flex items-center gap-2 p-3 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10">
            <Mail className="h-4 w-4 text-pink-400" />
            <span className="font-medium text-white truncate">{proposal.organizer_email}</span>
          </div>
        </div>

        {proposal.budget_estimate && (
          <div className="flex items-center gap-2 p-3 bg-gradient-to-r from-emerald-500/10 to-green-500/10 rounded-lg border border-emerald-500/20">
            <DollarSign className="h-4 w-4 text-emerald-400" />
            <span className="font-medium text-emerald-300">Budget: ₹{proposal.budget_estimate.toLocaleString()}</span>
          </div>
        )}

        {proposal.pdf_document_url && (
          <div className="flex items-center gap-2 p-3 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 rounded-lg border border-blue-500/20">
            <FileText className="h-4 w-4 text-blue-400" />
            <span className="font-medium text-blue-300">PDF Document Available</span>
          </div>
        )}
        
        <div className="flex items-center justify-between pt-4 border-t border-white/10">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onViewDetails(proposal)}
            className="flex items-center gap-2 bg-white/5 border-white/20 text-white hover:bg-white/10 hover:border-purple-400 transition-all duration-300 backdrop-blur-sm"
          >
            <Eye className="h-4 w-4" />
            View Details
          </Button>
          
          {showActions && userRole === 'admin' && (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onStatusUpdate(proposal.id, 'approved', 'Event proposal approved')}
                className="flex items-center gap-2 bg-green-500/10 border-green-500/30 text-green-400 hover:bg-green-500/20 hover:border-green-400 transition-all duration-300"
              >
                <CheckCircle className="h-4 w-4" />
                Approve
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onStatusUpdate(proposal.id, 'under_consideration', 'Marked for further ideation')}
                className="flex items-center gap-2 bg-orange-500/10 border-orange-500/30 text-orange-400 hover:bg-orange-500/20 hover:border-orange-400 transition-all duration-300"
              >
                <Lightbulb className="h-4 w-4" />
                Mark for Ideation
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onStatusUpdate(proposal.id, 'rejected', 'Event proposal rejected')}
                className="flex items-center gap-2 bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20 hover:border-red-400 transition-all duration-300"
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