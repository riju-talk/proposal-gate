import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Mail, Phone, FileText, CheckCircle, AlertCircle, XCircle, Sparkles, Lightbulb } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export const ClubProposalCard = ({ 
  clubRequest, 
  showActions, 
  onViewDetails,
  onStatusUpdate 
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

  const status = clubRequest.status || 'pending';
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
            {formatDistanceToNow(new Date(clubRequest.created_at), { addSuffix: true })}
          </span>
        </div>
      </div>
      
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-bold line-clamp-2">
          {clubRequest.club_name}
        </CardTitle>
        <div className="flex items-center text-sm text-muted-foreground mt-1">
          <Users className="h-4 w-4 mr-1.5" />
          <span>Proposed by {clubRequest.proposed_by_name}</span>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        <div className="text-sm text-muted-foreground line-clamp-3">
          {clubRequest.club_description}
        </div>
        
        <div className="grid grid-cols-2 gap-3 text-sm pt-2">
          <div className="flex items-start">
            <Mail className="h-4 w-4 mt-0.5 mr-1.5 text-muted-foreground flex-shrink-0" />
            <div className="truncate">
              <div className="font-medium">Email</div>
              <div className="text-muted-foreground truncate">
                {clubRequest.proposed_by_email}
              </div>
            </div>
          </div>
          
          {clubRequest.proposed_by_phone && (
            <div className="flex items-start">
              <Phone className="h-4 w-4 mt-0.5 mr-1.5 text-muted-foreground flex-shrink-0" />
              <div>
                <div className="font-medium">Phone</div>
                <div className="text-muted-foreground">
                  {clubRequest.proposed_by_phone}
                </div>
              </div>
            </div>
          )}
          
          {clubRequest.faculty_advisor && (
            <div className="col-span-2 flex items-start">
              <Users className="h-4 w-4 mt-0.5 mr-1.5 text-muted-foreground flex-shrink-0" />
              <div>
                <div className="font-medium">Faculty Advisor</div>
                <div className="text-muted-foreground">
                  {clubRequest.faculty_advisor}
                </div>
              </div>
            </div>
          )}
          
          {clubRequest.initial_members?.length > 0 && (
            <div className="col-span-2 flex items-start">
              <Users className="h-4 w-4 mt-0.5 mr-1.5 text-muted-foreground flex-shrink-0" />
              <div>
                <div className="font-medium">Initial Members</div>
                <div className="text-muted-foreground text-sm">
                  {clubRequest.initial_members.slice(0, 3).join(', ')}
                  {clubRequest.initial_members.length > 3 && ` +${clubRequest.initial_members.length - 3} more`}
                </div>
              </div>
            </div>
          )}
        </div>
        
        <div className="pt-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full"
            onClick={() => onViewDetails(clubRequest)}
          >
            <FileText className="h-4 w-4 mr-2" />
            View Details
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ClubProposalCard;
