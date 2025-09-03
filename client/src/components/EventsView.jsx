import { useState, useMemo } from "react";
import { useEventProposals } from "@/hooks/useEventProposals";
import { EventProposalCard } from "@/components/EventProposalCard";
import { ProposalDetailsModal } from "@/components/ProposalDetailsModal";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Calendar, Search, Sparkles } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const EventsView = ({ searchTerm, statusFilter, userRole }) => {
  const { proposals, isLoading, updateProposalStatus } = useEventProposals(statusFilter, userRole);
  const [selectedProposal, setSelectedProposal] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeStatusTab, setActiveStatusTab] = useState("pending");
  const { toast } = useToast();

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
      
      // Filter by search term
      const matchesSearch = 
        eventName.includes(searchLower) ||
        organizerName.includes(searchLower) ||
        description.includes(searchLower) ||
        venue.includes(searchLower);
      
      // Filter by status for admin tabs
      if (userRole === 'admin') {
        const matchesStatusTab = 
          (activeStatusTab === 'pending' && proposal.status === 'pending') ||
          (activeStatusTab === 'under_consideration' && proposal.status === 'under_consideration') ||
          (activeStatusTab === 'past' && (proposal.status === 'approved' || proposal.status === 'rejected'));
        
        return matchesSearch && matchesStatusTab;
      }
      
      // For coordinator and public, filter by general status
      const matchesStatus = statusFilter === 'all' || proposal.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [proposals, searchTerm, statusFilter, userRole, activeStatusTab]);

  const handleViewDetails = (proposal) => {
    setSelectedProposal(proposal);
    setIsModalOpen(true);
  };

  const handleStatusUpdate = async (id, status, comments) => {
    try {
      await updateProposalStatus(id, status, comments);
      setIsModalOpen(false);
      toast({
        title: 'Success',
        description: 'Event status updated successfully',
      });
    } catch (error) {
      console.error('Error updating proposal status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update event status. Please try again.',
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse bg-white/5 border-white/10">
            <CardContent className="p-6">
              <div className="flex flex-col space-y-3">
                <Skeleton className="h-6 w-3/4 bg-white/10" />
                <Skeleton className="h-4 w-1/2 bg-white/10" />
                <Skeleton className="h-4 w-2/3 bg-white/10" />
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
        <div className="bg-white/5 backdrop-blur-sm rounded-full p-6 mb-4 border border-white/10">
          <Search className="h-12 w-12 text-white/50" />
        </div>
        <h3 className="text-xl font-medium mb-2 text-white">No events found</h3>
        <p className="text-white/70 text-sm max-w-md">
          {searchTerm ? 'Try adjusting your search or filter criteria' : 'No events have been submitted yet'}
        </p>
      </div>
    );
  }

  // Admin view with status tabs
  if (userRole === 'admin') {
    return (
      <>
        <Tabs value={activeStatusTab} onValueChange={setActiveStatusTab} className="space-y-6">
          <TabsList className="bg-white/5 border border-white/10 backdrop-blur-sm">
            <TabsTrigger 
              value="pending" 
              className="data-[state=active]:bg-yellow-500/20 data-[state=active]:text-yellow-400 data-[state=active]:border-yellow-400/30"
            >
              <Calendar className="h-4 w-4 mr-2" />
              Pending Approval
            </TabsTrigger>
            <TabsTrigger 
              value="under_consideration" 
              className="data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-400 data-[state=active]:border-blue-400/30"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Under Review
            </TabsTrigger>
            <TabsTrigger 
              value="past" 
              className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400 data-[state=active]:border-purple-400/30"
            >
              <Calendar className="h-4 w-4 mr-2" />
              Past Events
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeStatusTab}>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredProposals.map((proposal) => (
                <EventProposalCard
                  key={proposal.id}
                  proposal={proposal}
                  onViewDetails={() => handleViewDetails(proposal)}
                  showActions={userRole === 'admin'}
                  userRole={userRole}
                />
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {selectedProposal && (
          <ProposalDetailsModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            proposal={selectedProposal}
            showActions={userRole === 'admin'}
            onStatusUpdate={handleStatusUpdate}
          />
        )}
      </>
    );
  }

  // Coordinator and public view
  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredProposals.map((proposal) => (
          <EventProposalCard
            key={proposal.id}
            proposal={proposal}
            onViewDetails={() => handleViewDetails(proposal)}
            showActions={false}
            userRole={userRole}
          />
        ))}
      </div>

      {selectedProposal && (
        <ProposalDetailsModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          proposal={selectedProposal}
          showActions={false}
          onStatusUpdate={handleStatusUpdate}
        />
      )}
    </>
  );
};

export default EventsView;