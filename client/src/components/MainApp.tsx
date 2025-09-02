import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { LoginPage } from "@/components/LoginPage";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Shield, Sparkles, Users, Calendar, GraduationCap, Loader2 } from "lucide-react";

export const MainApp = () => {
  const { user, isLoading } = useAuth();
  const [showAdminLogin, setShowAdminLogin] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
        {/* Subtle animated background elements, matching login page */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-32 -right-32 w-80 h-80 bg-primary/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-secondary/20 rounded-full blur-3xl animate-pulse delay-1000" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-muted/30 rounded-full blur-3xl animate-pulse delay-500" />
        </div>

        <div className="text-center space-y-6 relative z-10">
          <div className="relative flex justify-center">
            <div className="flex items-center justify-center h-20 w-20 mx-auto bg-card/80 rounded-full shadow-lg border border-border/20">
              <Loader2 className="h-10 w-10 text-primary animate-spin" />
            </div>
            <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-8 w-8 text-primary/70 animate-pulse" />
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-foreground drop-shadow-lg">Student Council Portal</h1>
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

  // Show main app - everyone can access, but with different permissions
  return (
    <div className="min-h-screen bg-background">
      <AppLayout 
        userRole={user ? 'admin' : 'public'}
        onRequestAdminLogin={() => setShowAdminLogin(true)} 
      />
    </div>
  );
};