import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { University, Users, Mail, ArrowLeft } from 'lucide-react';

interface LoginPageProps {
  onBack?: () => void;
}

export const LoginPage = ({ onBack }: LoginPageProps) => {
  const [email, setEmail] = useState('');
  const { signInWithMagicLink, isLoading, isLinkSent } = useAuth();
  const { toast } = useToast();

  const handleSendMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      toast({
        title: "Email required",
        description: "Please enter your email address.",
        variant: "destructive",
      });
      return;
    }

    const result = await signInWithMagicLink(email);
    
    if (result.success) {
      toast({
        title: "Magic link sent",
        description: "Check your email and click the link to sign in.",
      });
    } else {
      toast({
        title: "Failed to send magic link",
        description: result.error || "Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleQuickLogin = async (quickEmail: string) => {
    setEmail(quickEmail);
    const result = await signInWithMagicLink(quickEmail);
    
    if (result.success) {
      toast({
        title: "Magic link sent",
        description: `Check your email and click the link to sign in.`,
      });
    } else {
      toast({
        title: "Failed to send magic link",
        description: result.error || "Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      {/* Subtle background elements */}
      {/* No unwanted backgrounds above card or interfering with back button */}
      
      <div className="w-full max-w-md space-y-8">
        {/* Back button */}
        {onBack && (
          <Button
            variant="ghost"
            type="button"
            onClick={() => onBack()}
            className="absolute left-4 top-4 flex items-center gap-2 z-10 text-muted-foreground hover:text-foreground hover:bg-muted"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Portal
          </Button>
        )}
        
        {/* Header */}
        <div className="text-center space-y-6">
          <div className="flex justify-center">
            <div className="relative group">
              <div className="bg-card/80 p-8 rounded-3xl shadow-2xl border border-border/30 hover-lift animate-smooth">
                <img src="/student_council.jpg" alt="Logo" className="h-28 w-28 rounded-2xl" />
              </div>
              <div className="absolute -inset-0.5 bg-primary/20 rounded-3xl blur opacity-30 group-hover:opacity-50 transition duration-1000 animate-pulse" />
            </div>
          </div>
          <div className="space-y-4">
            <h1 className="text-5xl font-bold text-foreground text-glow">Student Council IIIT-Delhi</h1>
            <p className="text-muted-foreground text-xl font-medium">Admin Portal Access</p>
            <div className="mt-6 p-6 glass-effect rounded-2xl">
              <div className="grid grid-cols-2 gap-6 text-center">
                <div className="flex flex-col items-center space-y-2 group">
                  <div className="w-12 h-12 bg-primary/20 rounded-2xl flex items-center justify-center group-hover:bg-primary/30 transition-colors duration-300 border border-primary/30">
                    <span className="text-primary font-bold text-lg">SC</span>
                  </div>
                  <span className="text-sm text-muted-foreground font-medium">Student Council</span>
                </div>
                <div className="flex flex-col items-center space-y-2 group">
                  <div className="w-12 h-12 bg-accent/20 rounded-2xl flex items-center justify-center group-hover:bg-accent/30 transition-colors duration-300 border border-accent/30">
                    <span className="text-accent font-bold text-lg">AP</span>
                  </div>
                  <span className="text-sm text-muted-foreground font-medium">Approval Portal</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Login Card */}
        <Card className="card-enhanced hover-lift">
          <CardHeader className="space-y-3 text-center">
            <div className="flex items-center justify-center gap-3 mb-2">
              <div className="p-2 bg-primary/10 rounded-xl border border-primary/20">
                <Mail className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-3xl font-bold text-card-foreground">
                {isLinkSent ? 'Check Your Email' : 'Sign In'}
              </CardTitle>
            </div>
            <CardDescription className="text-base text-muted-foreground">
              {isLinkSent 
                ? 'We sent you a magic link. Click it to sign in.'
                : 'Enter your email to receive a magic link'
              }
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {!isLinkSent ? (
              <>
                <form onSubmit={handleSendMagicLink} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium text-card-foreground">
                      Email Address
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email or username"
                      required
                      className="h-11"
                      autoComplete="email"
                    />
                    <p className="text-xs text-muted-foreground">
                      You can use "admin" or "coordinator" as shortcuts
                    </p>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full h-12 button-cool shadow-lg hover:shadow-xl" 
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                        <span className="font-medium">Sending Magic Link...</span>
                      </div>
                    ) : (
                      <span className="font-medium">Send Magic Link</span>
                    )}
                  </Button>
                </form>

                {/* Quick Login Options */}
                <div className="pt-6 border-t border-border/50">
                  <p className="text-sm text-muted-foreground text-center mb-4 font-medium">Quick Login:</p>
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuickLogin('admin')}
                      disabled={isLoading}
                      className="h-12 hover-lift animate-smooth border-primary/30 hover:border-primary/60 hover:bg-primary/10"
                    >
                      <Mail className="h-5 w-5 mr-2" />
                      <span className="font-medium">Admin</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuickLogin('coordinator')}
                      disabled={isLoading}
                      className="h-12 hover-lift animate-smooth border-accent/30 hover:border-accent/60 hover:bg-accent/10"
                    >
                      <Users className="h-5 w-5 mr-2" />
                      <span className="font-medium">Coordinator</span>
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center space-y-4">
                <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                  <Mail className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-card-foreground">Check your email</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    We sent a magic link to <span className="font-medium">{email}</span>
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => handleSendMagicLink({ preventDefault: () => {} } as React.FormEvent)}
                  disabled={isLoading}
                  className="mt-4"
                >
                  Resend Magic Link
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Users className="h-4 w-4" />
            <span>IIIT-Delhi Student Council</span>
          </div>
          <p>© 2025 IIIT-Delhi Student Council</p>
        </div>
      </div>
    </div>
  );
};