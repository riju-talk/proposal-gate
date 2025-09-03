import { useState, useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EventsView } from "@/components/EventsView";
import { LogOut, Search, Filter, Shield, Users, Calendar, GraduationCap, Sparkles } from "lucide-react";
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
        { value: "all", label: "All" },
        { value: "pending", label: "Pending" },
        { value: "approved", label: "Approved" },
        { value: "rejected", label: "Rejected" }
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
        return { icon: Shield, text: user?.name || 'Admin Panel', color: 'text-cyan-400' };
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
                type="text"
                placeholder="Search events..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-64 bg-white/5 border-white/10 focus:border-cyan-400/50 focus:ring-0 text-white/90 placeholder:text-white/40"
              />
            </div>

            {userRole === 'public' && (
              <Button 
                onClick={onRequestAdminLogin}
                className="bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 text-white border-0 shadow-lg hover:shadow-cyan-500/20 transition-all"
              >
                <Shield className="h-4 w-4 mr-2" />
                Admin Login
              </Button>
            )}

            {user && (
              <Button 
                onClick={handleLogout}
                variant="ghost" 
                className="text-white/70 hover:bg-white/5 hover:text-white"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-8">
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div className="space-y-1">
              <h2 className="text-3xl font-bold text-white">Event Proposals</h2>
              <p className="text-white/70">
                {userRole === 'admin' 
                  ? 'Manage and approve event proposals' 
                  : userRole === 'coordinator'
                  ? 'View pending and approved events'
                  : 'Discover upcoming approved events'}
              </p>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 text-white/50" />
                <Select 
                  value={statusFilter} 
                  onValueChange={setStatusFilter}
                >
                  <SelectTrigger className="w-40 bg-white/5 border-white/10 text-white">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-white/10">
                    {availableStatusFilters.map((filter) => (
                      <SelectItem 
                        key={filter.value} 
                        value={filter.value}
                        className="hover:bg-slate-700/50 focus:bg-slate-700/50 text-white"
                      >
                        {filter.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <EventsView 
            searchTerm={searchTerm} 
            statusFilter={statusFilter}
            userRole={userRole}
          />
        </div>
      </main>
    </div>
  );
};

export default AppLayout;