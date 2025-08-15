import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Mail, Phone, FileText, CheckCircle, AlertCircle } from "lucide-react";
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
    await onStatusUpdate(clubRequest.id, 'under_consideration', 'Marked for further review');
  };

  const handleApprove = async () => {
    await onStatusUpdate(clubRequest.id, 'approved', 'Club formation approved');
  };

  return (
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-xl">{clubRequest.club_name}</CardTitle>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Proposed by {clubRequest.proposed_by_name}</span>
              <span>•</span>
              <span>{formatDistanceToNow(new Date(clubRequest.created_at))} ago</span>
            </div>
          </div>
          <Badge className={`${getStatusColor(clubRequest.status)} font-medium`}>
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
        
        {showActions && clubRequest.status === 'pending' && (
          <div className="flex items-center justify-end gap-2 pt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={handleMarkForConsideration}
              className="flex items-center gap-2"
            >
              <AlertCircle className="h-4 w-4" />
              Mark for Review
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
      </CardContent>
    </Card>
  );
};