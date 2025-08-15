import { useState, useMemo } from "react";
import { useEventProposals } from "@/hooks/useEventProposals";
import { EventProposalCard } from "@/components/EventProposalCard";
import { ProposalDetailsModal } from "@/components/ProposalDetailsModal";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EventProposal } from "@/hooks/useEventProposals";

interface EventsViewProps {
  searchTerm: string;
  statusFilter: string;
  isAdmin: boolean;
  showActions: boolean;
}

export const EventsView = ({ searchTerm, statusFilter, isAdmin, showActions }: EventsViewProps) => {
  const { proposals, isLoading, updateProposalStatus } = useEventProposals();
  const [selectedProposal, setSelectedProposal] = useState<EventProposal | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filteredProposals = useMemo(() => {
    return proposals.filter((proposal) => {
      const matchesSearch = 
        proposal.event_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        proposal.organizer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        proposal.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === "all" || 
        (statusFilter === "pending" && proposal.status === "pending") ||
        (statusFilter === "approved" && proposal.status === "approved") ||
        (statusFilter === "rejected" && proposal.status === "rejected") ||
        (statusFilter === "under_consideration" && proposal.status === "under_consideration");
      
      return matchesSearch && matchesStatus;
    });
  }, [proposals, searchTerm, statusFilter]);

  const handleViewDetails = (proposal: EventProposal) => {
    setSelectedProposal(proposal);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedProposal(null);
  };

  const handleStatusUpdate = async (id: string, status: 'approved' | 'rejected' | 'under_consideration', comments: string) => {
    await updateProposalStatus(id, status, comments);
  };

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

  if (filteredProposals.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <CardTitle className="text-muted-foreground mb-2">No proposals found</CardTitle>
          <CardDescription>
            {searchTerm ? "Try adjusting your search criteria" : "No proposals match the current filters"}
          </CardDescription>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="grid gap-4">
        {filteredProposals.map((proposal) => (
          <EventProposalCard
            key={proposal.id}
            proposal={proposal}
            onViewDetails={handleViewDetails}
            showActions={showActions}
            onStatusUpdate={handleStatusUpdate}
          />
        ))}
      </div>

      {selectedProposal && (
        <ProposalDetailsModal
          proposal={selectedProposal}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onStatusUpdate={handleStatusUpdate}
          showActions={showActions}
        />
      )}
    </>
  );
};