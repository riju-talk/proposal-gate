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
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="bg-transparent p-6 rounded-2xl shadow-lg border border-border/20">
              <img src="/student_council.jpg" alt="Logo" className="h-24 w-24" />
            </div>
          </div>
          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-foreground">Student Council IIIT-Delhi</h1>
            <p className="text-muted-foreground text-xl">Admin Portal Access</p>
            <div className="mt-4 p-4 bg-card/50 rounded-lg border border-border/30">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="flex flex-col items-center space-y-1">
                  <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                    <span className="text-primary font-bold text-sm">SC</span>
                  </div>
                  <span className="text-xs text-muted-foreground">Student Council</span>
                </div>
                <div className="flex flex-col items-center space-y-1">
                  <div className="w-8 h-8 bg-secondary/20 rounded-full flex items-center justify-center">
                    <span className="text-secondary-foreground font-bold text-sm">AP</span>
                  </div>
                  <span className="text-xs text-muted-foreground">Approval Portal</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Login Card */}
        <Card className="shadow-lg border border-border/20 bg-card/95 backdrop-blur-sm">
          <CardHeader className="space-y-1 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Mail className="h-5 w-5 text-primary" />
              <CardTitle className="text-2xl font-semibold text-card-foreground">
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
                    className="w-full h-11" 
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                        Sending Magic Link...
                      </div>
                    ) : (
                      "Send Magic Link"
                    )}
                  </Button>
                </form>

                {/* Quick Login Options */}
                <div className="pt-4 border-t border-border">
                  <p className="text-xs text-muted-foreground text-center mb-3">Quick Login:</p>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuickLogin('admin')}
                      disabled={isLoading}
                      className="h-10"
                    >
                      <Mail className="h-4 w-4 mr-2" />
                      Admin
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuickLogin('coordinator')}
                      disabled={isLoading}
                      className="h-10"
                    >
                      <Users className="h-4 w-4 mr-2" />
                      Coordinator
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