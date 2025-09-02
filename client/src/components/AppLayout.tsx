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
      {/* Header - no mysterious devil/element above here! */}
      <header className="sticky top-0 z-50 w-full border-b bg-background backdrop-blur-xl shadow-lg">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg">
                <img src="student_council.jpg" alt="Logo" className="h-10 w-10" />
              </div>
              <div>
              <h1 className="text-xl font-bold text-primary">
                Student Council IIIT-Delhi
              </h1>
                <p className="text-xs text-muted-foreground">
                  {isAdminUser ? "Admin Portal" : isCoordinator ? "Coordinator View" : "Public Portal"}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary h-4 w-4" />
              <Input
                placeholder="Search proposals..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-64 bg-card border-border focus:border-primary"
              />
            </div>

            {/* Filter */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40 bg-card border-border">
                <Filter className="h-4 w-4 mr-2 text-primary" />
                <SelectValue placeholder="Filter" />
              </SelectTrigger>
              <SelectContent>
                {availableStatusFilters.map((filter) => (
                  <SelectItem key={filter.value} value={filter.value}>
                    {filter.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Admin Login / User Info */}
            {user ? (
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2 px-3 py-1 bg-primary/10 rounded-full">
                  {isAdminUser ? (
                    <Shield className="h-4 w-4 text-primary" />
                  ) : (
                    <Users className="h-4 w-4 text-accent" />
                  )}
                  <span className="text-sm font-medium text-primary">
                    {user.username}
                  </span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  className="flex items-center space-x-2 border-border hover:bg-primary/20"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </Button>
              </div>
            ) : (
              <Button
                onClick={onRequestAdminLogin}
                className="bg-primary hover:bg-primary/80 text-primary-foreground shadow-lg"
              >
                <Shield className="h-4 w-4 mr-2" />
                Admin Login
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="grid w-full grid-cols-2 bg-card backdrop-blur-sm border border-border">
            <TabsTrigger 
              value="events" 
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <Calendar className="h-4 w-4 mr-2" />
              Event Proposals
            </TabsTrigger>
            <TabsTrigger 
              value="clubs"
              className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground"
            >
              <Users className="h-4 w-4 mr-2" />
              Club Approvals
            </TabsTrigger>
          </TabsList>

          <TabsContent value="events" className="space-y-6">
            {isAdminUser ? (
              <Tabs value={activeStatusTab} onValueChange={setActiveStatusTab}>
                <TabsList className="grid w-full grid-cols-3 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm">
                  <TabsTrigger 
                    value="pending"
                    className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-400 data-[state=active]:to-red-400 data-[state=active]:text-white"
                  >
                    Pending Approval
                  </TabsTrigger>
                  <TabsTrigger 
                    value="consideration"
                    className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-yellow-400 data-[state=active]:to-orange-400 data-[state=active]:text-white"
                  >
                    Under Review
                  </TabsTrigger>
                  <TabsTrigger 
                    value="past"
                    className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-400 data-[state=active]:to-blue-400 data-[state=active]:text-white"
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
                statusFilter={isCoordinator ? statusFilter : "all"}
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