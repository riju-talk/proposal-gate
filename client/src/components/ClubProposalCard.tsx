import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Mail, Phone, FileText, CheckCircle, AlertCircle, XCircle, Sparkles } from "lucide-react";
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
    <Card className="group hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 bg-gradient-to-br from-white to-orange-50 dark:from-slate-800 dark:to-orange-900/20 border border-orange-200 dark:border-orange-700 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 to-red-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <CardHeader className="pb-3 relative z-10">
        <div className="flex items-start justify-between">
          <div className="space-y-2 flex-1">
            <CardTitle className="text-xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent group-hover:from-orange-700 group-hover:to-red-700 transition-all duration-300">
              {clubRequest.club_name}
            </CardTitle>
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Sparkles className="h-4 w-4 text-orange-400" />
                <span className="font-medium">Proposed by {clubRequest.proposed_by_name}</span>
              </div>
              <span>•</span>
              <span>{formatDistanceToNow(new Date(clubRequest.created_at))} ago</span>
            </div>
          </div>
          <Badge className={`${getStatusColor(clubRequest.status)} border-0 font-medium shadow-lg`}>
            {getStatusText(clubRequest.status)}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <p className="text-foreground leading-relaxed line-clamp-2">
            {clubRequest.club_description}
          </p>
          <p className="text-sm text-muted-foreground line-clamp-1">
            <strong>Objectives:</strong> {clubRequest.club_objectives}
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-primary" />
            <span>{clubRequest.proposed_by_email}</span>
          </div>
          
          {clubRequest.proposed_by_phone && (
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-primary" />
              <span>{clubRequest.proposed_by_phone}</span>
            </div>
          )}
          
          {clubRequest.faculty_advisor && (
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              <span>Advisor: {clubRequest.faculty_advisor}</span>
            </div>
          )}
          
          {clubRequest.initial_members && clubRequest.initial_members.length > 0 && (
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              <span>{clubRequest.initial_members.length} initial members</span>
            </div>
          )}
        </div>

        {clubRequest.proposed_activities && (
          <div className="pt-2">
            <p className="text-sm text-muted-foreground">
              <strong>Proposed Activities:</strong> {clubRequest.proposed_activities}
            </p>
          </div>
        )}

        {clubRequest.charter_document_url && (
          <div className="flex items-center gap-2 text-sm">
            <FileText className="h-4 w-4 text-primary" />
            <a 
              href={clubRequest.charter_document_url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              View Charter Document
            </a>
          </div>
        )}
        
        {showActions && (
          <div className="flex items-center justify-end gap-2 pt-4 border-t border-orange-200 dark:border-orange-700">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onStatusUpdate(clubRequest.id, 'approved', 'Club formation approved')}
              className="flex items-center gap-2 border-green-200 hover:bg-green-50 hover:border-green-300 text-green-600 hover:text-green-700 transition-all duration-200"
            >
              <CheckCircle className="h-4 w-4" />
              Approve
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onStatusUpdate(clubRequest.id, 'under_consideration', 'Marked for further review')}
              className="flex items-center gap-2 border-orange-200 hover:bg-orange-50 hover:border-orange-300 text-orange-600 hover:text-orange-700 transition-all duration-200"
            >
              <AlertCircle className="h-4 w-4" />
              Under Review
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onStatusUpdate(clubRequest.id, 'rejected', 'Club formation rejected')}
              className="flex items-center gap-2 border-red-200 hover:bg-red-50 hover:border-red-300 text-red-600 hover:text-red-700 transition-all duration-200"
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