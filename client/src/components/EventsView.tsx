import { useState, useMemo } from "react";
import { useEventProposals } from "@/hooks/useEventProposals";
import { EventProposalCard } from "@/components/EventProposalCard";
import { ProposalDetailsModal } from "@/components/ProposalDetailsModal";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EventProposal } from "@/hooks/useEventProposals";
import { Calendar, Search } from "lucide-react";

interface EventsViewProps {
  searchTerm: string;
  statusFilter: string;
  userRole: 'admin' | 'coordinator' | 'public';
  showActions: boolean;
}

export const EventsView = ({ searchTerm, statusFilter, userRole, showActions }: EventsViewProps) => {
  const { proposals, isLoading, updateProposalStatus } = useEventProposals(statusFilter, userRole);
  const [selectedProposal, setSelectedProposal] = useState<EventProposal | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filteredProposals = useMemo(() => {
    return proposals.filter((proposal) => {
      const matchesSearch = 
        proposal.event_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        proposal.organizer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        proposal.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        proposal.venue.toLowerCase().includes(searchTerm.toLowerCase());
      
      return matchesSearch;
    });
  }, [proposals, searchTerm]);

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
      <div className="space-y-6">
        <div className="text-center py-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-full border border-purple-500/30">
            <div className="w-4 h-4 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
            <span className="text-purple-300 font-medium">Loading events...</span>
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

  if (filteredProposals.length === 0) {
    return (
      <Card className="bg-white/5 backdrop-blur-sm border-white/10">
        <CardContent className="text-center py-12">
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-full flex items-center justify-center">
              {searchTerm ? <Search className="h-8 w-8 text-purple-400" /> : <Calendar className="h-8 w-8 text-purple-400" />}
            </div>
            <div>
              <CardTitle className="text-white mb-2">
                {searchTerm ? "No matching events found" : "No events found"}
              </CardTitle>
              <CardDescription className="text-purple-200">
                {searchTerm 
                  ? "Try adjusting your search criteria or filters" 
                  : "No events match the current filters"
                }
              </CardDescription>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="grid gap-6">
        {filteredProposals.map((proposal) => (
          <EventProposalCard
            key={proposal.id}
            proposal={proposal}
            onViewDetails={handleViewDetails}
            showActions={showActions}
            onStatusUpdate={handleStatusUpdate}
            userRole={userRole}
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