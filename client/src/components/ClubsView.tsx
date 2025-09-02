import { useState, useMemo, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ClubProposalCard } from "@/components/ClubProposalCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

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

interface ClubsViewProps {
  searchTerm: string;
  statusFilter: string;
  isAdmin: boolean;
  showActions: boolean;
}

export const ClubsView = ({ searchTerm, statusFilter, isAdmin, showActions }: ClubsViewProps) => {
  const [clubRequests, setClubRequests] = useState<ClubFormationRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchClubRequests();
  }, []);

  const fetchClubRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('club_formation_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setClubRequests((data || []).map(item => ({
        ...item,
        proposed_by_phone: item.proposed_by_phone || undefined,
        faculty_advisor: item.faculty_advisor || undefined,
        initial_members: item.initial_members || undefined,
        proposed_activities: item.proposed_activities || undefined,
        charter_document_url: item.charter_document_url || undefined,
        status: item.status || 'pending'
      })));
    } catch (error) {
      console.error('Error fetching club requests:', error);
      toast({
        title: "Error",
        description: "Failed to fetch club formation requests",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateClubStatus = async (id: string, status: 'approved' | 'rejected' | 'under_consideration', comments: string) => {
    try {
      const { error } = await supabase
        .from('club_formation_requests')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;

      setClubRequests(prev => 
        prev.map(request => 
          request.id === id 
            ? { ...request, status, updated_at: new Date().toISOString() }
            : request
        )
      );

      toast({
        title: "Status updated",
        description: `Club formation request ${status} successfully`,
      });
    } catch (error) {
      console.error('Error updating club status:', error);
      toast({
        title: "Error",
        description: "Failed to update club status",
        variant: "destructive",
      });
    }
  };

  const filteredClubRequests = useMemo(() => {
    return clubRequests.filter((request) => {
      const matchesSearch = 
        request.club_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.proposed_by_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.club_description.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === "all" || 
        (statusFilter === "pending" && request.status === "pending") ||
        (statusFilter === "approved" && request.status === "approved") ||
        (statusFilter === "rejected" && request.status === "rejected") ||
        (statusFilter === "under_consideration" && request.status === "under_consideration");
      
      return matchesSearch && matchesStatus;
    });
  }, [clubRequests, searchTerm, statusFilter]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-2/3" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (filteredClubRequests.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <CardTitle className="text-muted-foreground mb-2">No club requests found</CardTitle>
          <CardDescription>
            {searchTerm ? "Try adjusting your search criteria" : "No club requests match the current filters"}
          </CardDescription>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4">
      {filteredClubRequests.map((request) => (
        <ClubProposalCard
          key={request.id}
          clubRequest={request}
          showActions={showActions}
          onStatusUpdate={updateClubStatus}
        />
      ))}
    </div>
  );
};