import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { LoginPage } from "@/components/LoginPage";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Shield, Sparkles } from "lucide-react";

export const MainApp = () => {
  const { user, isLoading } = useAuth();
  const [showAdminLogin, setShowAdminLogin] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        <div className="text-center space-y-6">
          <div className="relative">
            <div className="animate-spin rounded-full h-20 w-20 border-4 border-purple-300/20 border-t-purple-400 mx-auto"></div>
            <Sparkles className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-8 w-8 text-purple-400 animate-pulse" />
          </div>
          <p className="text-purple-200 text-xl font-medium">Loading Student Council Portal...</p>
        </div>
      </div>
    );
  }

  // Show admin login if requested
  if (showAdminLogin && !user) {
    return <LoginPage onBack={() => setShowAdminLogin(false)} />;
  }

  // Show main app if user is logged in OR if they're just viewing (coordinator/public)
  if (user || !showAdminLogin) {
    return <AppLayout isAdmin={!!user} onRequestAdminLogin={() => setShowAdminLogin(true)} />;
  }

  // This shouldn't happen, but fallback to public view
  return <AppLayout isAdmin={false} onRequestAdminLogin={() => setShowAdminLogin(true)} />;
};