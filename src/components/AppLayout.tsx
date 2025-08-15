import { useState, useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EventsView } from "@/components/EventsView";
import { ClubsView } from "@/components/ClubsView";
import { LogOut, Search, Filter, Shield, Sparkles, Users, Calendar } from "lucide-react";
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-blue-900 dark:to-indigo-900">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-slate-900/60 shadow-lg">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl flex items-center justify-center shadow-lg">
                <Sparkles className="text-white h-5 w-5" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
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
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-400 h-4 w-4" />
              <Input
                placeholder="Search proposals..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-64 bg-white/50 dark:bg-slate-800/50 border-purple-200 dark:border-purple-700 focus:border-purple-400 dark:focus:border-purple-500"
              />
            </div>

            {/* Filter */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40 bg-white/50 dark:bg-slate-800/50 border-purple-200 dark:border-purple-700">
                <Filter className="h-4 w-4 mr-2 text-purple-400" />
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
                <div className="flex items-center space-x-2 px-3 py-1 bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/50 dark:to-blue-900/50 rounded-full">
                  {isAdminUser ? (
                    <Shield className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                  ) : (
                    <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  )}
                  <span className="text-sm font-medium text-purple-700 dark:text-purple-300">
                    {user.username}
                  </span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  className="flex items-center space-x-2 border-purple-200 dark:border-purple-700 hover:bg-purple-50 dark:hover:bg-purple-900/50"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </Button>
              </div>
            ) : (
              <Button
                onClick={onRequestAdminLogin}
                className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white shadow-lg"
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
          <TabsList className="grid w-full grid-cols-2 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border border-purple-200 dark:border-purple-700">
            <TabsTrigger 
              value="events" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-blue-500 data-[state=active]:text-white"
            >
              <Calendar className="h-4 w-4 mr-2" />
              Event Proposals
            </TabsTrigger>
            <TabsTrigger 
              value="clubs"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-blue-500 data-[state=active]:text-white"
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