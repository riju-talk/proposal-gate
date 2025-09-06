import { useState, useMemo, useEffect } from "react";
import { ClubProposalCard } from "@/components/ClubProposalCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Users, Search } from "lucide-react";

export const ClubsView = ({ searchTerm, statusFilter, userRole, showActions }) => {
  const [clubRequests, setClubRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const [selectedClub, setSelectedClub] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchClubRequests();
  }, [userRole]);

  const fetchClubRequests = async () => {
    try {
      const headers = {
        'Content-Type': 'application/json',
      };

      // Add auth headers for admin requests
      if (userRole === 'admin') {
        const token = localStorage.getItem('admin_token');
        const adminUser = localStorage.getItem('admin_user');
        
        if (token && adminUser) {
          headers['Authorization'] = `Bearer ${token}`;
        }
      }

      const response = await fetch('/api/club-formation-requests', {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        throw new Error('Failed to fetch club requests');
      }

      const data = await response.json();
      setClubRequests(data);
    } catch (error) {
      console.error('Error fetching club requests:', error);
      toast({
        title: 'Error',
        description: 'Failed to load club requests. Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredClubs = useMemo(() => {
    if (!Array.isArray(clubRequests)) {
      console.error('Club requests is not an array:', clubRequests);
      return [];
    }
    
    return clubRequests.filter((club) => {
      if (!club) return false;
      
      const searchLower = searchTerm.toLowerCase();
      const clubName = club.club_name?.toLowerCase() || '';
      const description = club.club_description?.toLowerCase() || '';
      const proposedBy = club.proposed_by_name?.toLowerCase() || '';
      
      // Filter by search term
      const matchesSearch = 
        clubName.includes(searchLower) ||
        description.includes(searchLower) ||
        proposedBy.includes(searchLower);
      
      // Filter by status
      const matchesStatus = statusFilter === 'all' || club.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [clubRequests, searchTerm, statusFilter]);

  const handleViewDetails = (club) => {
    setSelectedClub(club);
    setIsModalOpen(true);
  };

  const handleStatusUpdate = async (id, status, comments) => {
    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(`/api/club-formation-requests/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ status, comments }),
      });

      if (!response.ok) {
        throw new Error('Failed to update club status');
      }

      // Refresh the list
      await fetchClubRequests();
      setIsModalOpen(false);
      
      toast({
        title: 'Success',
        description: 'Club request status updated successfully',
      });
    } catch (error) {
      console.error('Error updating club status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update club status. Please try again.',
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="flex flex-col space-y-3">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (filteredClubs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="bg-muted rounded-full p-4 mb-4">
          <Users className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-medium mb-1">No club requests found</h3>
        <p className="text-muted-foreground text-sm">
          {searchTerm ? 'Try adjusting your search or filter' : 'No club requests have been submitted yet'}
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {filteredClubs.map((club) => (
        <ClubProposalCard
          key={club.id}
          club={club}
          onViewDetails={() => handleViewDetails(club)}
          showActions={showActions}
        />
      ))}
    </div>
  );
};

export default ClubsView;
