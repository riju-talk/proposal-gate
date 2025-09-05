import { useState, useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EventsView } from "@/components/EventsView";
import { LogOut, Filter, Shield, Users, GraduationCap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import SearchInput from "@/components/SearchInput";

export const AppLayout = ({ userRole, onRequestAdminLogin }) => {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const [statusFilter, setStatusFilter] = useState("all");
  const [filteredData, setFilteredData] = useState([]);

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

  const availableStatusFilters = useMemo(() => {
    if (userRole === "admin") {
      return [
        { value: "all", label: "All Events" },
        { value: "pending", label: "Pending Approval" },
        { value: "approved", label: "Approved" },
        { value: "rejected", label: "Rejected" },
      ];
    } else {
      return [
        { value: "all", label: "All Events" },
        { value: "approved", label: "Approved Events" },
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
    <div className="min-h-screen bg-background">
      {/* Professional Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="container-centered">
          <div className="flex h-16 items-center justify-between">
            {/* Logo and Title */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-primary/10 border border-primary/20">
                  <img src="/student_council.jpg" alt="IIIT Delhi" className="h-8 w-8 rounded-md object-cover" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-foreground">
                    IIIT Delhi Student Council
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
                  className="btn-primary"
                >
                  <Shield className="h-4 w-4 mr-2" />
                  Admin Login
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

      {/* Hero Section */}
      <section className="section-spacing bg-gradient-to-br from-background via-background to-primary/5">
        <div className="container-centered text-center">
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="space-y-4">
              <h1 className="text-4xl md:text-6xl font-bold text-foreground">
                IIIT Delhi
              </h1>
              <h2 className="text-3xl md:text-5xl font-bold gradient-text">
                Student Council
              </h2>
            </div>
            
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Your voice, our mission. Connecting students, fostering growth, and 
              building a vibrant campus community at IIIT Delhi.
            </p>
    

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
              <Button className="btn-primary px-8 py-3 text-base" onClick={() => window.location.href = '/about'}>
                <Users className="h-5 w-5 mr-2" />
                Learn About Us
              </Button>
              <Button variant="outline" className="px-8 py-3 text-base border-primary/20 hover:bg-primary/10">
                <Shield className="h-5 w-5 mr-2" onClick={() => window.location.href = '/about'}/>
                Meet Our Team
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="section-spacing">
        <div className="container-centered">
          <div className="space-y-8">
            {/* Section Header */}
            <div className="text-center space-y-4">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                Campus Events
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                {userRole === 'admin' 
                  ? 'Manage and approve event proposals from students and organizations' 
                  : userRole === 'coordinator'
                  ? 'View and coordinate upcoming campus events'
                  : 'Discover exciting events happening around campus'}
              </p>
            </div>

            {/* Search and Filter Controls */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between max-w-4xl mx-auto">
              <SearchInput
                searchKeys={[
                  "event_name",
                  "organizer_name",
                  "description",
                  "venue",
                ]}
                placeholder="Search events..."
                onFilter={setFilteredData}
                className="w-full md:w-96"
              />

              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-48 bg-card border-border">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
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

            {/* Events Grid */}
            <div className="max-w-7xl mx-auto">
              <EventsView
                searchTerm={filteredData}
                statusFilter={statusFilter}
                userRole={userRole}
              />
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card/50 backdrop-blur-sm">
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