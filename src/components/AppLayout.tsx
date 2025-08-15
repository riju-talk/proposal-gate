import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EventsView } from "@/components/EventsView";
import { ClubsView } from "@/components/ClubsView";
import { LogOut, Search, Filter } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export const AppLayout = () => {
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

  const isAdmin = user?.role === 'admin';
  const isCoordinator = user?.role === 'coordinator';

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">SC</span>
              </div>
              <h1 className="text-xl font-bold text-foreground">Student Council IIIT-Delhi</h1>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search proposals..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-64"
              />
            </div>

            {/* Filter */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-32">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>

            {/* User Info & Logout */}
            {user && (
              <div className="flex items-center space-x-3">
                <span className="text-sm text-muted-foreground">
                  {user.email} ({user.role})
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  className="flex items-center space-x-2"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="events">Event Proposals</TabsTrigger>
            <TabsTrigger value="clubs">Club Approvals</TabsTrigger>
          </TabsList>

          <TabsContent value="events" className="space-y-6">
            {isAdmin ? (
              <Tabs value={activeStatusTab} onValueChange={setActiveStatusTab}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="pending">Pending Approval</TabsTrigger>
                  <TabsTrigger value="consideration">Under Consideration</TabsTrigger>
                  <TabsTrigger value="past">Past Events</TabsTrigger>
                </TabsList>
                
                <TabsContent value="pending">
                  <EventsView 
                    searchTerm={searchTerm}
                    statusFilter="pending"
                    isAdmin={isAdmin}
                    showActions={true}
                  />
                </TabsContent>
                
                <TabsContent value="consideration">
                  <EventsView 
                    searchTerm={searchTerm}
                    statusFilter="under_consideration"
                    isAdmin={isAdmin}
                    showActions={true}
                  />
                </TabsContent>
                
                <TabsContent value="past">
                  <EventsView 
                    searchTerm={searchTerm}
                    statusFilter="approved"
                    isAdmin={isAdmin}
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
              isAdmin={isAdmin}
              showActions={isAdmin}
            />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};