import { useState, useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EventsView } from "@/components/EventsView";
import { ClubsView } from "@/components/ClubsView";
import { LogOut, Search, Filter, Shield, Sparkles, Users, Calendar, GraduationCap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AppLayoutProps {
  isAdmin: boolean;
  onRequestAdminLogin: () => void;
}

export const AppLayout = ({ isAdmin, onRequestAdminLogin }: AppLayoutProps) => {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("events");
  const [activeStatusTab, setActiveStatusTab] = useState("pending");

  const handleLogout = async () => {
    try {
      await logout();
      toast({
        title: "Logged out successfully",
        description: "You have been logged out of the admin panel.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to logout. Please try again.",
        variant: "destructive",
      });
    }
  };

  const userRole = user?.role;
  const isCoordinator = userRole === 'coordinator';
  const isAdminUser = userRole === 'admin';

  // Filter options based on user role
  const availableStatusFilters = useMemo(() => {
    if (isAdminUser) {
      return [
        { value: "all", label: "All" },
        { value: "pending", label: "Pending" },
        { value: "approved", label: "Approved" },
        { value: "rejected", label: "Rejected" },
        { value: "under_consideration", label: "Under Review" }
      ];
    } else {
      return [
        { value: "all", label: "All" },
        { value: "pending", label: "Pending" },
        { value: "approved", label: "Approved" }
      ];
    }
  }, [isAdminUser]);

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border/50 glass-effect shadow-2xl">
        <div className="container flex h-18 items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-4">
              <div className="relative group">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg overflow-hidden hover-lift animate-smooth">
                  <img src="student_council.jpg" alt="Logo" className="h-12 w-12 rounded-2xl" />
                </div>
                <div className="absolute -inset-0.5 bg-primary/20 rounded-2xl blur opacity-0 group-hover:opacity-50 transition duration-500" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground text-glow">
                  Student Council IIIT-Delhi
                </h1>
                <p className="text-sm text-muted-foreground font-medium">
                  {isAdminUser ? "Admin Portal" : isCoordinator ? "Coordinator View" : "Public Portal"}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Search Bar */}
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-primary h-5 w-5 group-focus-within:text-primary transition-colors" />
              <Input
                placeholder="Search proposals..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 w-72 h-11 glass-effect border-border/50 focus:border-primary/50 hover:border-border transition-all duration-300 rounded-xl"
              />
            </div>

            {/* Filter */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-44 h-11 glass-effect border-border/50 hover:border-border transition-all duration-300 rounded-xl">
                <Filter className="h-5 w-5 mr-2 text-primary" />
                <SelectValue placeholder="Filter" />
              </SelectTrigger>
              <SelectContent className="glass-effect border-border/50 rounded-xl">
                {availableStatusFilters.map((filter) => (
                  <SelectItem key={filter.value} value={filter.value} className="rounded-lg">
                    {filter.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Admin Login / User Info */}
            {user ? (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-3 px-4 py-2 glass-effect rounded-2xl border border-border/30 hover-lift animate-smooth">
                  {isAdminUser ? (
                    <Shield className="h-5 w-5 text-primary" />
                  ) : (
                    <Users className="h-5 w-5 text-accent" />
                  )}
                  <span className="text-sm font-bold text-foreground">
                    {user.username}
                  </span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  className="flex items-center space-x-2 border-border/50 hover:border-destructive/50 hover:bg-destructive/10 hover:text-destructive h-11 px-4 rounded-xl hover-lift animate-smooth"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="font-medium">Logout</span>
                </Button>
              </div>
            ) : (
              <Button
                onClick={onRequestAdminLogin}
                className="button-cool h-11 px-6 rounded-xl shadow-lg hover:shadow-xl font-medium"
              >
                <Shield className="h-5 w-5 mr-2" />
                Admin Login
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="grid w-full grid-cols-2 glass-effect border border-border/30 h-14 rounded-2xl p-2">
            <TabsTrigger 
              value="events" 
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground h-10 rounded-xl font-medium transition-all duration-300 hover-lift"
            >
              <Calendar className="h-5 w-5 mr-2" />
              Event Proposals
            </TabsTrigger>
            <TabsTrigger 
              value="clubs"
              className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground h-10 rounded-xl font-medium transition-all duration-300 hover-lift"
            >
              <Users className="h-5 w-5 mr-2" />
              Club Approvals
            </TabsTrigger>
          </TabsList>

          <TabsContent value="events" className="space-y-6">
            {isAdminUser ? (
              <Tabs value={activeStatusTab} onValueChange={setActiveStatusTab}>
                <TabsList className="grid w-full grid-cols-3 glass-effect border border-border/30 h-12 rounded-xl p-1">
                  <TabsTrigger 
                    value="pending"
                    className="data-[state=active]:bg-warning data-[state=active]:text-warning-foreground h-10 rounded-lg font-medium transition-all duration-300 hover-lift"
                  >
                    Pending Approval
                  </TabsTrigger>
                  <TabsTrigger 
                    value="consideration"
                    className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground h-10 rounded-lg font-medium transition-all duration-300 hover-lift"
                  >
                    Under Review
                  </TabsTrigger>
                  <TabsTrigger 
                    value="past"
                    className="data-[state=active]:bg-success data-[state=active]:text-success-foreground h-10 rounded-lg font-medium transition-all duration-300 hover-lift"
                  >
                    Past Events
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="pending">
                  <EventsView 
                    searchTerm={searchTerm}
                    statusFilter="pending"
                    isAdmin={isAdminUser}
                    showActions={true}
                  />
                </TabsContent>
                
                <TabsContent value="consideration">
                  <EventsView 
                    searchTerm={searchTerm}
                    statusFilter="under_consideration"
                    isAdmin={isAdminUser}
                    showActions={true}
                  />
                </TabsContent>
                
                <TabsContent value="past">
                  <EventsView 
                    searchTerm={searchTerm}
                    statusFilter="approved"
                    isAdmin={isAdminUser}
                    showActions={false}
                  />
                </TabsContent>
              </Tabs>
            ) : (
              <EventsView 
                searchTerm={searchTerm}
                statusFilter={isCoordinator ? statusFilter : "approved"}
                isAdmin={false}
                showActions={false}
              />
            )}
          </TabsContent>

          <TabsContent value="clubs">
            <ClubsView 
              searchTerm={searchTerm}
              statusFilter={statusFilter}
              isAdmin={isAdminUser}
              showActions={isAdminUser}
            />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};