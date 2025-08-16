import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { LoginPage } from "@/components/LoginPage";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Shield, Sparkles, Users, Calendar, GraduationCap } from "lucide-react";

export const MainApp = () => {
  const { user, isLoading } = useAuth();
  const [showAdminLogin, setShowAdminLogin] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl animate-pulse delay-500"></div>
        </div>
        
        <div className="text-center space-y-6 relative z-10">
          <div className="relative">
            <div className="animate-spin rounded-full h-20 w-20 border-4 border-purple-300/20 border-t-purple-400 mx-auto"></div>
            <Sparkles className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-8 w-8 text-purple-400 animate-pulse" />
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-white drop-shadow-lg">Student Council Portal</h1>
            <p className="text-purple-200 text-lg">Loading your dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show admin login if requested
  if (showAdminLogin && !user) {
    return <LoginPage onBack={() => setShowAdminLogin(false)} />;
  }

  // Show main app - everyone can access, but with different permissions
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-blue-900 dark:to-indigo-900">
      {/* Hero Section for Non-Admin Users */}
      {!user && (
        <div className="relative overflow-hidden bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 py-16">
          {/* Animated background elements */}
          <div className="absolute inset-0">
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
          </div>
          
          <div className="container mx-auto px-4 text-center relative z-10">
            <div className="flex justify-center mb-8">
              <div className="bg-gradient-to-r from-purple-500 to-blue-500 p-6 rounded-3xl shadow-2xl backdrop-blur-sm border border-white/20">
                <GraduationCap className="h-16 w-16 text-white drop-shadow-lg" />
              </div>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 drop-shadow-lg">
              Student Council
              <span className="block text-3xl md:text-4xl text-purple-200 mt-2">IIIT-Delhi</span>
            </h1>
            
            <p className="text-xl text-purple-200 mb-8 max-w-2xl mx-auto">
              Discover upcoming events, explore active clubs, and stay connected with campus life
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <div className="flex items-center gap-2 text-purple-200">
                <Calendar className="h-5 w-5" />
                <span>Browse Events</span>
              </div>
              <div className="hidden sm:block w-px h-6 bg-purple-300"></div>
              <div className="flex items-center gap-2 text-purple-200">
                <Users className="h-5 w-5" />
                <span>Explore Clubs</span>
              </div>
              <div className="hidden sm:block w-px h-6 bg-purple-300"></div>
              <Button
                onClick={() => setShowAdminLogin(true)}
                className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white shadow-lg border-0 px-6 py-2"
              >
                <Shield className="h-4 w-4 mr-2" />
                Admin Login
              </Button>
            </div>
          </div>
        </div>
      )}
      
      <AppLayout 
        isAdmin={!!user} 
        onRequestAdminLogin={() => setShowAdminLogin(true)} 
      />
    </div>
  );
};