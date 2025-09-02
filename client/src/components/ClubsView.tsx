import { useState, useMemo, useEffect } from "react";
import { ClubProposalCard } from "@/components/ClubProposalCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Users, Search } from "lucide-react";

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
  userRole: 'admin' | 'coordinator' | 'public';
  showActions: boolean;
}

export const ClubsView = ({ searchTerm, statusFilter, userRole, showActions }: ClubsViewProps) => {
  const [clubRequests, setClubRequests] = useState<ClubFormationRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchClubRequests();
  }, [userRole]);

  const fetchClubRequests = async () => {
    try {
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };

      // Add auth headers for admin requests
      if (userRole === 'admin') {
        const token = localStorage.getItem('admin_token');
        const adminUser = localStorage.getItem('admin_user');
        
        if (token && adminUser) {
          const user = JSON.parse(adminUser);
          headers['Authorization'] = `Bearer ${token}`;
          headers['x-admin-email'] = user.email;
        }
      }

      const response = await fetch('/api/club-formation-requests', { headers });
      
      if (!response.ok) {
        throw new Error('Failed to fetch club requests');
      }

      const data = await response.json();
      
      // Filter based on user role
      let filteredData = data;
      if (userRole === 'public') {
        filteredData = data.filter((req: ClubFormationRequest) => req.status === 'approved');
      } else if (userRole === 'coordinator') {
        filteredData = data.filter((req: ClubFormationRequest) => 
          req.status === 'pending' || req.status === 'approved'
        );
      }
      
      setClubRequests(filteredData);
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
      const token = localStorage.getItem('admin_token');
      const adminUser = localStorage.getItem('admin_user');
      
      if (!token || !adminUser) {
        throw new Error('Not authenticated');
      }

      const user = JSON.parse(adminUser);
      
      const response = await fetch(`/api/club-formation-requests/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'x-admin-email': user.email,
        },
        body: JSON.stringify({ status, comments }),
      });

      if (!response.ok) {
        throw new Error('Failed to update club status');
      }

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
      
      const matchesStatus = statusFilter === "all" || request.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [clubRequests, searchTerm, statusFilter]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-full border border-orange-500/30">
            <div className="w-4 h-4 border-2 border-orange-400 border-t-transparent rounded-full animate-spin" />
            <span className="text-orange-300 font-medium">Loading clubs...</span>
          </div>
        </div>
        <div className="grid gap-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="bg-white/5 backdrop-blur-sm border-white/10">
              <CardHeader>
                <Skeleton className="h-6 w-3/4 bg-white/10" />
                <Skeleton className="h-4 w-1/2 bg-white/10" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2 bg-white/10" />
                <Skeleton className="h-4 w-2/3 bg-white/10" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (filteredClubRequests.length === 0) {
    return (
      <Card className="bg-white/5 backdrop-blur-sm border-white/10">
        <CardContent className="text-center py-12">
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-full flex items-center justify-center">
              {searchTerm ? <Search className="h-8 w-8 text-orange-400" /> : <Users className="h-8 w-8 text-orange-400" />}
            </div>
            <div>
              <CardTitle className="text-white mb-2">
                {searchTerm ? "No matching clubs found" : "No club requests found"}
              </CardTitle>
              <CardDescription className="text-orange-200">
                {searchTerm 
                  ? "Try adjusting your search criteria or filters" 
                  : "No club requests match the current filters"
                }
              </CardDescription>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-6">
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