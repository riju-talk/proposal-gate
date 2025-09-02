import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Mail, Phone, FileText, CheckCircle, AlertCircle, XCircle, Sparkles, Lightbulb } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface ClubFormationRequest {
  id: string;
  club_name: string;
  club_description: string;
  club_objectives: string;
  proposed_by_name: string;
  proposed_by_email: string;
  proposed_by_phone?: string;
  faculty_advisor?: string;
  initial_members?: string[];
  proposed_activities?: string;
  charter_document_url?: string;
  status: string;
  created_at: string;
  updated_at: string;
}

interface ClubProposalCardProps {
  clubRequest: ClubFormationRequest;
  showActions: boolean;
  onStatusUpdate: (id: string, status: 'approved' | 'rejected' | 'under_consideration', comments: string) => Promise<void>;
}

export const ClubProposalCard = ({ 
  clubRequest, 
  showActions, 
  onStatusUpdate 
}: ClubProposalCardProps) => {
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
        return <Users className="h-4 w-4" />;
    }
  };

  return (
    <Card className="group hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 bg-white/5 backdrop-blur-sm border-white/10 hover:border-orange-500/30 overflow-hidden relative">
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 via-red-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      {/* Glow effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-red-500/10 opacity-0 group-hover:opacity-50 blur-xl transition-opacity duration-500" />
      
      <CardHeader className="pb-4 relative z-10">
        <div className="flex items-start justify-between">
          <div className="space-y-3 flex-1">
            <CardTitle className="text-xl font-bold text-white group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-orange-400 group-hover:to-red-400 group-hover:bg-clip-text transition-all duration-300">
              {clubRequest.club_name}
            </CardTitle>
            <div className="flex items-center gap-3 text-sm text-orange-200">
              <div className="flex items-center gap-1">
                <Sparkles className="h-4 w-4 text-orange-400" />
                <span className="font-medium">Proposed by {clubRequest.proposed_by_name}</span>
              </div>
              <span>•</span>
              <span>{formatDistanceToNow(new Date(clubRequest.created_at))} ago</span>
            </div>
          </div>
          <Badge className={`${getStatusColor(clubRequest.status)} flex items-center gap-1 px-3 py-1`}>
            {getStatusIcon(clubRequest.status)}
            {getStatusText(clubRequest.status)}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-5 relative z-10">
        <div className="space-y-3">
          <div className="p-4 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10">
            <p className="text-white/90 leading-relaxed line-clamp-2">
              {clubRequest.club_description}
            </p>
          </div>
          <div className="p-3 bg-gradient-to-r from-orange-500/10 to-red-500/10 rounded-lg border border-orange-500/20">
            <p className="text-sm text-orange-200">
              <strong className="text-orange-300">Objectives:</strong> {clubRequest.club_objectives}
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2 p-3 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10">
            <Mail className="h-4 w-4 text-pink-400" />
            <span className="text-white truncate">{clubRequest.proposed_by_email}</span>
          </div>
          
          {clubRequest.proposed_by_phone && (
            <div className="flex items-center gap-2 p-3 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10">
              <Phone className="h-4 w-4 text-green-400" />
              <span className="text-white">{clubRequest.proposed_by_phone}</span>
            </div>
          )}
          
          {clubRequest.faculty_advisor && (
            <div className="flex items-center gap-2 p-3 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10">
              <Users className="h-4 w-4 text-blue-400" />
              <span className="text-white">Advisor: {clubRequest.faculty_advisor}</span>
            </div>
          )}
          
          {clubRequest.initial_members && clubRequest.initial_members.length > 0 && (
            <div className="flex items-center gap-2 p-3 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10">
              <Users className="h-4 w-4 text-purple-400" />
              <span className="text-white">{clubRequest.initial_members.length} initial members</span>
            </div>
          )}
        </div>

        {clubRequest.proposed_activities && (
          <div className="p-3 bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-lg border border-purple-500/20">
            <p className="text-sm text-purple-200">
              <strong className="text-purple-300">Proposed Activities:</strong> {clubRequest.proposed_activities}
            </p>
          </div>
        )}

        {clubRequest.charter_document_url && (
          <div className="flex items-center gap-2 p-3 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 rounded-lg border border-blue-500/20">
            <FileText className="h-4 w-4 text-blue-400" />
            <a 
              href={clubRequest.charter_document_url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-300 hover:text-blue-200 hover:underline font-medium"
            >
              View Charter Document
            </a>
          </div>
        )}
        
        {showActions && (
          <div className="flex items-center justify-end gap-2 pt-4 border-t border-white/10">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onStatusUpdate(clubRequest.id, 'approved', 'Club formation approved')}
              className="flex items-center gap-2 bg-green-500/10 border-green-500/30 text-green-400 hover:bg-green-500/20 hover:border-green-400 transition-all duration-300"
            >
              <CheckCircle className="h-4 w-4" />
              Approve
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onStatusUpdate(clubRequest.id, 'under_consideration', 'Marked for further ideation')}
              className="flex items-center gap-2 bg-orange-500/10 border-orange-500/30 text-orange-400 hover:bg-orange-500/20 hover:border-orange-400 transition-all duration-300"
            >
              <Lightbulb className="h-4 w-4" />
              Mark for Ideation
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onStatusUpdate(clubRequest.id, 'rejected', 'Club formation rejected')}
              className="flex items-center gap-2 bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20 hover:border-red-400 transition-all duration-300"
            >
              <XCircle className="h-4 w-4" />
              Reject
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};