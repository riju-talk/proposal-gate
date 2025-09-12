import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useEventProposals } from "@/hooks/useEventProposals";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EventProposalCard } from "@/components/EventProposalCard";
import { ProposalDetailsModal } from "@/components/ProposalDetailsModal";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Filter, LogIn, LogOut, CheckCircle, Clock, XCircle } from "lucide-react";
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
  const [activeStatusTab, setActiveStatusTab] = useState("pending");

  // Determine user role
  const getUserRole = () => {
    if (user) {
      return user.role === 'admin' ? 'admin' : 'coordinator';
    }
    return 'public';
  };

  const userRole = getUserRole();
  const { proposals, isLoading, updateProposalStatus, error } = useEventProposals(statusFilter, userRole);

  const availableStatusFilters = useMemo(() => [
    { value: "all", label: "All Events" },
    { value: "approved", label: "Approved Events" },
    { value: "pending", label: "Pending Events" },
    { value: "rejected", label: "Rejected Events" }
  ], []);

  const filteredProposals = useMemo(() => {
    if (!Array.isArray(proposals)) {
      console.error("🔴 Proposals is not an array:", proposals);
      return [];
    }

    return proposals.filter((proposal) => {
      if (!proposal) return false;

      const searchLower = searchTerm.toLowerCase();
      const eventName = (proposal.event_name || "").toLowerCase();
      const organizerName = (proposal.organizer_name || "").toLowerCase();
      const description = (proposal.description || "").toLowerCase();
      const venue = (proposal.venue || "").toLowerCase();

      const matchesSearch =
        eventName.includes(searchLower) ||
        organizerName.includes(searchLower) ||
        description.includes(searchLower) ||
        venue.includes(searchLower);

      const status = (proposal.status || "").toLowerCase();

      if (userRole === "admin") {
        const matchesStatusTab =
          (activeStatusTab === "pending" && status === "pending") ||
          (activeStatusTab === "approved" && status === "approved") ||
          (activeStatusTab === "rejected" && status === "rejected");
        return matchesSearch && matchesStatusTab;
      }

      const matchesStatus =
        statusFilter === "all" || status === statusFilter.toLowerCase();

      return matchesSearch && matchesStatus;
    });
  }, [proposals, searchTerm, statusFilter, userRole, activeStatusTab]);

  const handleViewDetails = (proposal) => {
    console.log("🔍 Viewing proposal details:", proposal.id);
    setSelectedProposal(proposal);
    setIsModalOpen(true);
  };

  const handleStatusUpdate = async (id, status, comments = "") => {
    try {
      console.log("🔄 Updating proposal status:", id, status);
      await updateProposalStatus(id, status, comments);
      toast({
        title: "Success",
        description: `Event ${status} successfully`,
        variant: "default",
        duration: 3000,
      });
      setIsModalOpen(false);
    } catch (error) {
      console.error("❌ Error updating status:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update status",
        variant: "destructive",
        duration: 5000,
      });
    }
  };

  const handleLogout = () => {
    console.log("🚪 Logging out user");
    logout();
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
      duration: 3000,
    });
  };

  const handleLoginClick = () => {
    console.log("🔐 Navigating to login");
    navigate("/auth/login");
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <header className="nav-header p-6">
          <div className="container-centered flex flex-col lg:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-6">
              <StudentCouncilLogo size="default" showText={true} />
              <div className="hidden md:block">
                <p className="text-muted-foreground text-sm">
                  Loading your dashboard...
                </p>
              </div>
            </div>
          </div>
        </header>
        <main className="container mx-auto p-6">
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
        </main>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <header className="nav-header p-6">
          <div className="container-centered flex flex-col lg:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-6">
              <StudentCouncilLogo size="default" showText={true} />
              <div className="hidden md:block">
                <p className="text-muted-foreground text-sm">
                  Empowering voices, fostering innovation, and building an<br />
                  extraordinary campus community through collaborative leadership
                </p>
              </div>
            </div>
          </div>
        </header>
        <main className="flex items-center justify-center flex-1 min-h-[80vh]">
          <div className="text-center">
            <div className="bg-destructive/10 rounded-full p-6 mb-6 border border-destructive/20 mx-auto w-fit">
              <XCircle className="h-12 w-12 text-destructive" />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-foreground">
              Error Loading Events
            </h3>
            <p className="text-muted-foreground max-w-md">{error}</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="nav-header p-6 sticky top-0 z-50">
        <div className="container-centered flex flex-col lg:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-6">
            <StudentCouncilLogo size="default" showText={true} />
            <div className="hidden md:block">
              <p className="text-muted-foreground text-sm">
                Empowering voices, fostering innovation, and building an<br />
                extraordinary campus community through collaborative leadership
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 flex-wrap justify-center">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search events..."
                className="input-styled pl-10 w-64"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {userRole !== "admin" && (
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48 input-styled">
                  <Filter className="h-4 w-4 mr-2 text-muted-foreground" />
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  {availableStatusFilters.map((filter) => (
                    <SelectItem 
                      key={filter.value} 
                      value={filter.value}
                      className="hover:bg-accent focus:bg-accent"
                    >
                      {filter.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {user ? (
              <>
                <span className="text-muted-foreground">Hello, <span className="text-primary font-medium">{user.name || user.email}</span></span>
                <Button 
                  onClick={handleLogout}
                  className="btn-primary"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </>
            ) : (
              <Button 
                onClick={handleLoginClick}
                className="btn-primary"
              >
                <LogIn className="h-4 w-4 mr-2" />
                Admin Login
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto p-6">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Campus Events & Activities</h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Discover all the upcoming events, activities, and opportunities at IIIT Delhi. 
            From technical workshops to cultural festivals, find everything happening on campus.
          </p>
        </div>

        {/* Admin view with tabs */}
        {userRole === "admin" ? (
          <>
            <Tabs
              value={activeStatusTab}
              onValueChange={setActiveStatusTab}
              className="space-y-8"
            >
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
                {filteredProposals.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="bg-muted/50 rounded-full p-6 mb-6 border border-border">
                      <Search className="h-12 w-12 text-muted-foreground" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2 text-foreground">
                      No Events Found
                    </h3>
                    <p className="text-muted-foreground max-w-md">
                      {searchTerm
                        ? "Try adjusting your search criteria"
                        : `No ${activeStatusTab} events found`}
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {filteredProposals.map((proposal) => (
                      <EventProposalCard
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
          </>
        ) : (
          // Public/Coordinator view
          <>
            {filteredProposals.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="bg-muted/50 rounded-full p-6 mb-6 border border-border">
                  <Search className="h-12 w-12 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-foreground">
                  No Events Found
                </h3>
                <p className="text-muted-foreground max-w-md">
                  {searchTerm
                    ? "Try adjusting your search or filter criteria"
                    : "No events have been submitted yet"}
                </p>
              </div>
            ) : (
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
            )}
          </>
        )}

        {/* Proposal Details Modal */}
        {selectedProposal && (
          <ProposalDetailsModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            proposal={selectedProposal}
            showActions={userRole === "admin"}
            onStatusUpdate={handleStatusUpdate}
            userRole={userRole}
          />
        )}
      </main>
    </div>
  );
};

export default HomePage;