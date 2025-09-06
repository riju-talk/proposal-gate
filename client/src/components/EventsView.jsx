import { useState, useMemo } from "react";
import { useEventProposals } from "@/hooks/useEventProposals";
import { EventProposalCard } from "@/components/EventProposalCard";
import { ProposalDetailsModal } from "@/components/ProposalDetailsModal";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Calendar, Search, CheckCircle, Clock, XCircle } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const EventsView = ({ searchTerm, statusFilter, userRole }) => {
  const { proposals, isLoading, updateProposalStatus, error } = useEventProposals(statusFilter, userRole);
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
      const eventName = (proposal.event_name || proposal.eventName || '').toLowerCase();
      const organizerName = (proposal.organizer_name || proposal.organizerName || '').toLowerCase();
      const description = (proposal.description || '').toLowerCase();
      const venue = (proposal.venue || '').toLowerCase();
      
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
          (activeStatusTab === 'approved' && proposal.status === 'approved') ||
          (activeStatusTab === 'rejected' && proposal.status === 'rejected');
        
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
        description: 'Event approval updated successfully',
      });
    } catch (error) {
      console.error('Error updating proposal status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update event approval. Please try again.',
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="professional-card animate-pulse">
            <CardContent className="p-6">
              <div className="space-y-4">
                <Skeleton className="h-6 w-3/4 bg-muted" />
                <Skeleton className="h-4 w-1/2 bg-muted" />
                <Skeleton className="h-4 w-2/3 bg-muted" />
                <div className="grid grid-cols-2 gap-4">
                  <Skeleton className="h-16 bg-muted" />
                  <Skeleton className="h-16 bg-muted" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="bg-destructive/10 rounded-full p-6 mb-6 border border-destructive/20">
          <XCircle className="h-12 w-12 text-destructive" />
        </div>
        <h3 className="text-xl font-semibold mb-2 text-foreground">Error Loading Events</h3>
        <p className="text-muted-foreground max-w-md">{error}</p>
      </div>
    );
  }

  if (filteredProposals.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="bg-muted/50 rounded-full p-6 mb-6 border border-border">
          <Search className="h-12 w-12 text-muted-foreground" />
        </div>
        <h3 className="text-xl font-semibold mb-2 text-foreground">No Events Found</h3>
        <p className="text-muted-foreground max-w-md">
          {searchTerm ? 'Try adjusting your search or filter criteria' : 'No events have been submitted yet'}
        </p>
      </div>
    );
  }

  // Admin view with status tabs
  if (userRole === 'admin') {
    return (
      <>
        <Tabs value={activeStatusTab} onValueChange={setActiveStatusTab} className="space-y-8">
          <div className="flex justify-center">
            <TabsList className="bg-card border border-border">
              <TabsTrigger 
                value="pending" 
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <Clock className="h-4 w-4 mr-2" />
                Pending Approval
              </TabsTrigger>
              <TabsTrigger 
                value="approved" 
                className="data-[state=active]:bg-success data-[state=active]:text-success-foreground"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Approved
              </TabsTrigger>
              <TabsTrigger 
                value="rejected" 
                className="data-[state=active]:bg-destructive data-[state=active]:text-destructive-foreground"
              >
                <XCircle className="h-4 w-4 mr-2" />
                Rejected
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value={activeStatusTab}>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
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
            userRole={userRole}
          />
        )}
      </>
    );
  }

  // Coordinator and public view
  return (
    <>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
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
          userRole={userRole}
        />
      )}
    </>
  );
};

export default EventsView;