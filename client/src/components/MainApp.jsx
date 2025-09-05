import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { LoginPage } from "@/components/LoginPage";
import { AppLayout } from "@/components/AppLayout";
import { Loader2 } from "lucide-react";

export const MainApp = () => {
  const { user, isLoading } = useAuth();
  const [showAdminLogin, setShowAdminLogin] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-6">
          <div className="relative flex justify-center">
            <div className="flex items-center justify-center h-20 w-20 mx-auto bg-primary/10 backdrop-blur-sm rounded-full shadow-lg border border-primary/20">
              <Loader2 className="h-10 w-10 text-primary animate-spin" />
            </div>
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-foreground">Student Council Portal</h1>
            <p className="text-muted-foreground text-lg">Loading your dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show admin login if requested
  if (showAdminLogin && !user) {
    return <LoginPage onBack={() => setShowAdminLogin(false)} />;
  }

  // Determine user role
  const getUserRole = () => {
    if (user) {
      return user.role === 'admin' ? 'admin' : 'coordinator';
    }
    return 'public';
  };

  // Show main app - everyone can access, but with different permissions
  return (
    <div className="min-h-screen bg-background">
      <AppLayout 
        userRole={getUserRole()}
        onRequestAdminLogin={() => setShowAdminLogin(true)} 
      />
    </div>
  );
};

export default MainApp;