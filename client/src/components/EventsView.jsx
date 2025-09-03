import { useState, useMemo } from "react";
import { useEventProposals } from "@/hooks/useEventProposals";
import { EventProposalCard } from "@/components/EventProposalCard";
import { ProposalDetailsModal } from "@/components/ProposalDetailsModal";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, Search } from "lucide-react";

export const EventsView = ({ searchTerm, statusFilter, userRole, showActions }) => {
  const { proposals, isLoading, updateProposalStatus } = useEventProposals(statusFilter, userRole);
  const [selectedProposal, setSelectedProposal] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filteredProposals = useMemo(() => {
    if (!Array.isArray(proposals)) {
      console.error('Proposals is not an array:', proposals);
      return [];
    }
    
    return proposals.filter((proposal) => {
      if (!proposal) return false;
      
      const searchLower = searchTerm.toLowerCase();
      const eventName = proposal.event_name?.toLowerCase() || '';
      const organizerName = proposal.organizer_name?.toLowerCase() || '';
      const description = proposal.description?.toLowerCase() || '';
      const venue = proposal.venue?.toLowerCase() || '';
      
      return (
        eventName.includes(searchLower) ||
        organizerName.includes(searchLower) ||
        description.includes(searchLower) ||
        venue.includes(searchLower)
      );
    });
  }, [proposals, searchTerm]);

  const handleViewDetails = (proposal) => {
    setSelectedProposal(proposal);
    setIsModalOpen(true);
  };

  const handleStatusUpdate = async (id, status, comments) => {
    try {
      await updateProposalStatus(id, status, comments);
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error updating proposal status:', error);
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

  if (filteredProposals.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="bg-muted rounded-full p-4 mb-4">
          <Search className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-medium mb-1">No events found</h3>
        <p className="text-muted-foreground text-sm">
          {searchTerm ? 'Try adjusting your search or filter' : 'No events have been submitted yet'}
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredProposals.map((proposal) => (
          <EventProposalCard
            key={proposal.id}
            proposal={proposal}
            onViewDetails={() => handleViewDetails(proposal)}
            showActions={showActions}
          />
        ))}
      </div>

      {selectedProposal && (
        <ProposalDetailsModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          proposal={selectedProposal}
          showActions={showActions}
          onStatusUpdate={handleStatusUpdate}
        />
      )}
    </>
  );
};

export default EventsView;
