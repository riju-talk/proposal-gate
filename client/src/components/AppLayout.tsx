import { useState, useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EventsView } from "@/components/EventsView";
import { ClubsView } from "@/components/ClubsView";
import { LogOut, Search, Filter, Shield, Users, Calendar, GraduationCap, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AppLayoutProps {
  userRole: 'admin' | 'coordinator' | 'public';
  onRequestAdminLogin: () => void;
}

export const AppLayout = ({ userRole, onRequestAdminLogin }: AppLayoutProps) => {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("events");
  const [activeStatusTab, setActiveStatusTab] = useState("pending");

  const handleLogout = async () => {
    try {
      logout();
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

  // Filter options based on user role
  const availableStatusFilters = useMemo(() => {
    if (userRole === 'admin') {
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
  }, [userRole]);

  const getRoleDisplay = () => {
    switch (userRole) {
      case 'admin':
        return { icon: Shield, text: user?.name || 'Admin', color: 'text-cyan-400' };
      case 'coordinator':
        return { icon: Users, text: 'Coordinator View', color: 'text-purple-400' };
      default:
        return { icon: GraduationCap, text: 'Public Portal', color: 'text-green-400' };
    }
  };

  const roleDisplay = getRoleDisplay();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-black/20 backdrop-blur-xl shadow-2xl">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg bg-white/10 backdrop-blur-sm border border-white/20">
                <img src="/student_council.jpg" alt="Logo" className="h-8 w-8 rounded-lg" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                  Student Council IIIT-Delhi
                </h1>
                <div className="flex items-center gap-1">
                  <roleDisplay.icon className={`h-3 w-3 ${roleDisplay.color}`} />
                  <p className={`text-xs font-medium ${roleDisplay.color}`}>
                    {roleDisplay.text}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-cyan-400 h-4 w-4" />
              <Input
                placeholder="Search proposals..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-64 bg-white/5 border-white/20 text-white placeholder:text-white/50 focus:border-cyan-400 backdrop-blur-sm"
              />
            </div>

            {/* Filter */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40 bg-white/5 border-white/20 text-white backdrop-blur-sm">
                <Filter className="h-4 w-4 mr-2 text-purple-400" />
                <SelectValue placeholder="Filter" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-white/20">
                {availableStatusFilters.map((filter) => (
                  <SelectItem key={filter.value} value={filter.value} className="text-white hover:bg-white/10">
                    {filter.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* User Info / Login */}
            {user ? (
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20">
                  <Shield className="h-4 w-4 text-cyan-400" />
                  <span className="text-sm font-medium text-white">
                    {user.name}
                  </span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  className="flex items-center space-x-2 bg-white/5 border-white/20 text-white hover:bg-white/10 hover:border-red-400 transition-all duration-300"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </Button>
              </div>
            ) : (
              <Button
                onClick={onRequestAdminLogin}
                className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
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
          <TabsList className="grid w-full grid-cols-2 bg-white/5 backdrop-blur-sm border border-white/10 p-1">
            <TabsTrigger 
              value="events" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-blue-500 data-[state=active]:text-white text-white/70 transition-all duration-300"
            >
              <Calendar className="h-4 w-4 mr-2" />
              Event Proposals
            </TabsTrigger>
            <TabsTrigger 
              value="clubs"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-red-500 data-[state=active]:text-white text-white/70 transition-all duration-300"
            >
              <Users className="h-4 w-4 mr-2" />
              Club Approvals
            </TabsTrigger>
          </TabsList>

          <TabsContent value="events" className="space-y-6">
            {userRole === 'admin' ? (
              <Tabs value={activeStatusTab} onValueChange={setActiveStatusTab}>
                <TabsList className="grid w-full grid-cols-3 bg-white/5 backdrop-blur-sm border border-white/10 p-1">
                  <TabsTrigger 
                    value="pending"
                    className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-red-500 data-[state=active]:text-white text-white/70 transition-all duration-300"
                  >
                    Pending Approval
                  </TabsTrigger>
                  <TabsTrigger 
                    value="under_consideration"
                    className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-yellow-500 data-[state=active]:to-orange-500 data-[state=active]:text-white text-white/70 transition-all duration-300"
                  >
                    Under Review
                  </TabsTrigger>
                  <TabsTrigger 
                    value="approved"
                    className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-blue-500 data-[state=active]:text-white text-white/70 transition-all duration-300"
                  >
                    Past Events
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="pending">
                  <EventsView 
                    searchTerm={searchTerm}
                    statusFilter="pending"
                    userRole={userRole}
                    showActions={true}
                  />
                </TabsContent>
                
                <TabsContent value="under_consideration">
                  <EventsView 
                    searchTerm={searchTerm}
                    statusFilter="under_consideration"
                    userRole={userRole}
                    showActions={true}
                  />
                </TabsContent>
                
                <TabsContent value="approved">
                  <EventsView 
                    searchTerm={searchTerm}
                    statusFilter="approved"
                    userRole={userRole}
                    showActions={false}
                  />
                </TabsContent>
              </Tabs>
            ) : (
              <EventsView 
                searchTerm={searchTerm}
                statusFilter={statusFilter}
                userRole={userRole}
                showActions={false}
              />
            )}
          </TabsContent>

          <TabsContent value="clubs">
            <ClubsView 
              searchTerm={searchTerm}
              statusFilter={statusFilter}
              userRole={userRole}
              showActions={userRole === 'admin'}
            />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};