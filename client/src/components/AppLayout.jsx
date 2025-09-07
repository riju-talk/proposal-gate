import { useState, useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EventsView } from "@/components/EventsView";
import { Search, Filter, GraduationCap, LogIn, LogOut } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export const AppLayout = ({ userRole, onRequestAdminLogin }) => {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const availableStatusFilters = useMemo(() => [
    { value: "all", label: "All Items" },
    { value: "approved", label: "Approved Items" },
    { value: "rejected", label: "Rejected Items" }
  ], []);

  const handleLogout = () => {
    logout();
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
      status: "success",
    });
  };

  return (
    <div className="min-h-screen bg-[#0F0F1A] text-white">
      {/* Header */}
      <header className="bg-[#1A1A2E] border-b border-[#2D2D42] p-6">
        <div className="container mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="bg-gradient-to-r from-purple-500 to-blue-500 p-3 rounded-full">
              <GraduationCap className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">IIIT Delhi Student Council</h1>
              <p className="text-gray-400">Your voice, our mission. Connecting students, fostering growth.</p>
            </div>
          </div>

          <div className="flex items-center gap-4 flex-wrap justify-center">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search events..."
                className="pl-10 w-64 bg-[#0F0F1A] border-[#2D2D42] text-white placeholder-gray-400 focus-visible:ring-1 focus-visible:ring-purple-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48 bg-[#0F0F1A] border-[#2D2D42] text-white">
                <Filter className="h-4 w-4 mr-2 text-gray-400" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent className="bg-[#1A1A2E] border-[#2D2D42] text-white">
                {availableStatusFilters.map((filter) => (
                  <SelectItem 
                    key={filter.value} 
                    value={filter.value}
                    className="hover:bg-[#2D2D42] focus:bg-[#2D2D42]"
                  >
                    {filter.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {user ? (
              <>
                <span className="text-gray-300">Hello, {user.name || user.email}</span>
                <Button 
                  onClick={handleLogout}
                  className="bg-gradient-to-r from-purple-500 to-blue-500 hover:opacity-90"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </>
            ) : (
              userRole !== "admin" && (
                <Button 
                  onClick={onRequestAdminLogin}
                  className="bg-gradient-to-r from-purple-500 to-blue-500 hover:opacity-90"
                >
                  <LogIn className="h-4 w-4 mr-2" />
                  Admin Login
                </Button>
              )
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

        <EventsView 
          searchTerm={searchTerm} 
          statusFilter={statusFilter}
          userRole={userRole}
        />
      </main>
    </div>
  );
};

export default AppLayout;
