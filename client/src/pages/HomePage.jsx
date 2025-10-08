import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useEventProposals } from "@/hooks/useEventProposals";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ProposalCard } from "@/components/ProposalCard";
import { ProposalDetailsModal } from "@/components/ProposalDetailsModal";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Filter, LogIn, LogOut, XCircle, Users, Building2, Eye } from "lucide-react";
import { StudentCouncilLogo } from "@/components/StudentCouncilLogo";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";

const HomePage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedProposal, setSelectedProposal] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTypeTab, setActiveTypeTab] = useState("all");

  const userRole = user ? (user.role === "admin" ? "admin" : "coordinator") : "public";
  const { proposals, isLoading, updateProposalStatus, error } = useEventProposals(statusFilter, userRole);

  const availableStatusFilters = useMemo(() => [
    { value: "all", label: "All Status" },
    { value: "approved", label: "Approved" },
    { value: "pending", label: "Pending" },
    { value: "rejected", label: "Rejected" }
  ], []);

  const filteredProposals = useMemo(() => {
    if (!Array.isArray(proposals)) return [];

    return proposals.filter((proposal) => {
      const searchLower = searchTerm.toLowerCase();
      const eventName = (proposal.event_name || "").toLowerCase();
      const organizerName = (proposal.organizer_name || "").toLowerCase();
      const description = (proposal.description || "").toLowerCase();
      const status = (proposal.status || "").toLowerCase();

      const matchesSearch =
        eventName.includes(searchLower) ||
        organizerName.includes(searchLower) ||
        description.includes(searchLower);

      // Type filtering for admin view
      if (userRole === "admin") {
        const matchesTypeTab =
          activeTypeTab === "all" ||
          (activeTypeTab === "events" && proposal.type === "event") ||
          (activeTypeTab === "clubs" && proposal.type === "club");
        return matchesSearch && matchesTypeTab;
      }

      // For non-admin users, use status filter
      return matchesSearch && (statusFilter === "all" || status === statusFilter);
    });
  }, [proposals, searchTerm, statusFilter, userRole, activeTypeTab]);

  const handleViewDetails = (proposal) => {
    setSelectedProposal(proposal);
    setIsModalOpen(true);
  };

  const handleStatusUpdate = async (id, status, comments = "") => {
    try {
      await updateProposalStatus(id, status, comments);
      toast({
        title: "Success",
        description: `Proposal ${status} successfully`,
        variant: "default",
        duration: 3000,
      });
      setIsModalOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to update status",
        variant: "destructive",
        duration: 5000,
      });
    }
  };

  const handleLogout = () => {
    logout();
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
      duration: 3000,
    });
  };

  const handleLoginClick = () => navigate("/auth/login");

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <HeaderSkeleton />
        <main className="container mx-auto p-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6 space-y-4">
                  <Skeleton className="h-6 w-3/4 bg-muted" />
                  <Skeleton className="h-4 w-1/2 bg-muted" />
                  <Skeleton className="h-4 w-2/3 bg-muted" />
                  <div className="grid grid-cols-2 gap-4">
                    <Skeleton className="h-16 bg-muted" />
                    <Skeleton className="h-16 bg-muted" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <HeaderSkeleton />
        <main className="flex items-center justify-center min-h-[80vh]">
          <div className="text-center">
            <div className="bg-destructive/10 rounded-full p-6 mb-6 border border-destructive/20 mx-auto w-fit">
              <XCircle className="h-12 w-12 text-destructive" />
            </div>
            <h3 className="text-xl font-semibold text-foreground">Error Loading Events</h3>
            <p className="text-muted-foreground max-w-md">{error}</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Responsive Header */}
      <header className="nav-header p-4 sticky top-0 z-50 bg-gray-900 text-white">
        <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-4">

          <div className="flex items-center gap-4">
            <StudentCouncilLogo size="default" showText={true} />
            <p className="hidden md:block text-sm text-gray-300 max-w-md">
              Empowering voices, fostering innovation, and building an<br />
              extraordinary campus community through collaborative leadership
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4 justify-center">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search events and clubs..."
                className="pl-10 w-64"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {userRole !== "admin" && (
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48">
                  <Filter className="h-4 w-4 mr-2 text-muted-foreground" />
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  {availableStatusFilters.map((filter) => (
                    <SelectItem key={filter.value} value={filter.value}>
                      {filter.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {user ? (
              <>
                <span>Hello, <span className="text-yellow-400 font-medium">{user.name || user.email}</span></span>
                <Button onClick={handleLogout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </>
            ) : (
              <Button onClick={handleLoginClick}>
                <LogIn className="h-4 w-4 mr-2" />
                Admin Login
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto p-6">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Campus Events & Club Proposals</h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Discover all the upcoming events, activities, and club proposals at IIIT Delhi.
          </p>
        </div>

        {userRole === "admin" ? (
          <Tabs value={activeTypeTab} onValueChange={setActiveTypeTab} className="space-y-8">
            <div className="flex justify-center">
              <TabsList className="bg-card border border-border">
                <TabsTrigger value="all" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  <Eye className="h-4 w-4 mr-2" /> All Proposals
                </TabsTrigger>
                <TabsTrigger value="events" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">
                  <Users className="h-4 w-4 mr-2" /> Events Only
                </TabsTrigger>
                <TabsTrigger value="clubs" className="data-[state=active]:bg-purple-500 data-[state=active]:text-white">
                  <Building2 className="h-4 w-4 mr-2" /> Clubs Only
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value={activeTypeTab}>
              {filteredProposals.length === 0 ? (
                <NoProposals searchTerm={searchTerm} typeTab={activeTypeTab} />
              ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {filteredProposals.map((proposal) => (
                    <ProposalCard
                      key={proposal.id}
                      proposal={proposal}
                      onViewDetails={() => handleViewDetails(proposal)}
                      showActions
                      userRole={userRole}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        ) : (
          filteredProposals.length === 0 ? (
            <NoProposals searchTerm={searchTerm} statusTab={null} />
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredProposals.map((proposal) => (
                <ProposalCard
                  key={proposal.id}
                  proposal={proposal}
                  onViewDetails={() => handleViewDetails(proposal)}
                />
              ))}
            </div>
          )
        )}

        {selectedProposal && (
          <ProposalDetailsModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            proposal={selectedProposal}
            showActions={userRole === "admin"}
            onStatusUpdate={handleStatusUpdate}
            userRole={userRole}
            currentUser={user}
          />
        )}
      </main>
    </div>
  );
};

// Reusable Skeleton Header
const HeaderSkeleton = () => (
  <header className="nav-header p-6">
    <div className="container-centered flex flex-col lg:flex-row justify-between items-center gap-6">
      <StudentCouncilLogo size="default" showText={true} />
      <div className="hidden md:block">
        <p className="text-muted-foreground text-sm">
          Loading your dashboard...
        </p>
      </div>
    </div>
  </header>
);

// Reusable NoProposals UI
const NoProposals = ({ searchTerm, typeTab, statusTab }) => (
  <div className="flex flex-col items-center justify-center py-16 text-center">
    <div className="bg-muted/50 rounded-full p-6 mb-6 border border-border">
      <Search className="h-12 w-12 text-muted-foreground" />
    </div>
    <h3 className="text-xl font-semibold mb-2 text-foreground">
      No Proposals Found
    </h3>
    <p className="text-muted-foreground max-w-md">
      {searchTerm
        ? "Try adjusting your search or filter criteria"
        : typeTab
          ? `No ${typeTab === 'events' ? 'event' : typeTab === 'clubs' ? 'club' : ''} proposals found`
          : statusTab
            ? `No ${statusTab} proposals found`
            : "No proposals have been submitted yet"}
    </p>
  </div>
);

export default HomePage;
