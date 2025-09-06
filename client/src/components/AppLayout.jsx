import { useState, useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EventsView } from "@/components/EventsView";
import { ClubsView } from "@/components/ClubsView";
import { LogOut, Search, Filter, Shield, Users, Calendar, GraduationCap, Plus, Home, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export const AppLayout = ({ userRole, onRequestAdminLogin }) => {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("events");

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

  // Filter options based on user role
  const availableStatusFilters = useMemo(() => {
    if (userRole === 'admin') {
      return [
        { value: "all", label: "All Items" },
        { value: "pending", label: "Pending Approval" },
        { value: "approved", label: "Approved" },
        { value: "rejected", label: "Rejected" },
        { value: "under_review", label: "Under Review" }
      ];
    } else {
      return [
        { value: "all", label: "All Items" },
        { value: "approved", label: "Approved Items" }
      ];
    }
  }, [userRole]);

  const getRoleDisplay = () => {
    switch (userRole) {
      case 'admin':
        return { 
          icon: Shield, 
          text: user?.name || 'Admin Panel', 
          subtitle: 'Administrative Access',
          color: 'text-primary' 
        };
      case 'coordinator':
        return { 
          icon: Users, 
          text: 'Coordinator View', 
          subtitle: 'Event Coordination',
          color: 'text-blue-400' 
        };
      default:
        return { 
          icon: GraduationCap, 
          text: 'Public Portal', 
          subtitle: 'Student Events',
          color: 'text-green-400' 
        };
    }
  };

  const roleDisplay = getRoleDisplay();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 right-20 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse"></div>
        <div className="absolute bottom-20 left-20 w-72 h-72 bg-cyan-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse delay-1000"></div>
      </div>

      {/* Professional Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="container-centered">
          <div className="flex h-16 items-center justify-between">
            {/* Logo and Title */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-gradient-to-r from-cyan-500 to-purple-500 shadow-lg">
                  <img src="/student_council.jpg" alt="IIIT Delhi" className="h-8 w-8 rounded-md object-cover" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
                    IIIT Delhi Student Council
                    <Sparkles className="h-4 w-4 text-primary" />
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

            {/* Actions */}
            <div className="flex items-center space-x-4">
              {userRole === 'public' && (
                <Button 
                  onClick={onRequestAdminLogin}
                  className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white border-0 shadow-lg"
                >
                  <Shield className="h-4 w-4 mr-2" />
                  Approve an Event
                </Button>
              )}

              {user && (
                <Button 
                  onClick={handleLogout}
                  variant="ghost" 
                  className="text-muted-foreground hover:text-foreground"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="section-spacing relative z-10">
        <div className="container-centered">
          <div className="space-y-8">
            {/* Section Header */}
            <div className="text-center space-y-4">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                Campus Management
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                {userRole === 'admin' 
                  ? 'Manage and approve event proposals and club formations from students' 
                  : userRole === 'coordinator'
                  ? 'View and coordinate upcoming campus events and activities'
                  : 'Discover exciting events and clubs happening around campus'}
              </p>
            </div>

            {/* Search and Filter Controls */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between max-w-4xl mx-auto">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Search events and clubs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-card/50 backdrop-blur-sm border-border/50 focus:border-primary/50 focus:ring-1 focus:ring-primary/20"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-48 bg-card/50 backdrop-blur-sm border-border/50">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border/50 backdrop-blur-sm">
                    {availableStatusFilters.map((filter) => (
                      <SelectItem 
                        key={filter.value} 
                        value={filter.value}
                        className="hover:bg-muted focus:bg-muted"
                      >
                        {filter.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Main Tabs */}
            <div className="max-w-7xl mx-auto">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
                <div className="flex justify-center">
                  <TabsList className="bg-card/50 backdrop-blur-sm border border-border/50">
                    <TabsTrigger 
                      value="events" 
                      className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500 data-[state=active]:to-purple-500 data-[state=active]:text-white"
                    >
                      <Calendar className="h-4 w-4 mr-2" />
                      Events
                    </TabsTrigger>
                    <TabsTrigger 
                      value="clubs" 
                      className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500 data-[state=active]:to-purple-500 data-[state=active]:text-white"
                    >
                      <Users className="h-4 w-4 mr-2" />
                      Clubs
                    </TabsTrigger>
                  </TabsList>
                </div>

                <TabsContent value="events">
                  <EventsView 
                    searchTerm={searchTerm} 
                    statusFilter={statusFilter}
                    userRole={userRole}
                  />
                </TabsContent>

                <TabsContent value="clubs">
                  <ClubsView 
                    searchTerm={searchTerm} 
                    statusFilter={statusFilter}
                    userRole={userRole}
                  />
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 bg-card/30 backdrop-blur-sm relative z-10">
        <div className="container-centered py-8">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center space-x-2">
              <img src="/student_council.jpg" alt="IIIT Delhi" className="h-8 w-8 rounded-md" />
              <span className="text-lg font-semibold text-foreground">IIIT Delhi Student Council</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2025 IIIT Delhi Student Council. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AppLayout;