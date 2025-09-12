import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { StudentCouncilLogo } from '@/components/StudentCouncilLogo';

const LoginPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const { sendOTP, isLoading } = useAuth();
  const { toast } = useToast();

  const quickEmails = {
    president: 'president@sc.iiitd.ac.in',
    vp: 'vp@sc.iiitd.ac.in',
    treasurer: 'treasurer@sc.iiitd.ac.in',
    sa_office: 'admin-saoffice@iiitd.ac.in',
    faculty: 'ravi@iiitd.ac.in',
    final: 'smriti@iiitd.ac.in',
  };

  const handleQuickLogin = (role) => {
    console.log(`🔐 Quick login selected: ${role}`);
    if (quickEmails[role]) {
      setEmail(quickEmails[role]);
      setError('');
    } else {
      setError('Unauthorized role');
    }
  };

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    setError('');
  };

  const handleSendOTP = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Email is required');
      return;
    }

    console.log('📧 Sending OTP to:', email);
    setError('');
    
    const result = await sendOTP(email);

    if (result.success) {
      console.log('✅ OTP sent successfully, navigating to OTP page');
      toast({ 
        title: 'OTP Sent', 
        description: 'Check your email for the OTP.',
        duration: 3000
      });
      navigate('/auth/otp', { state: { email } });
    } else {
      console.error('❌ OTP send failed:', result.error);
      setError(result.error || 'Failed to send OTP');
    }
  };

  const handleBackToHome = () => {
    console.log('🏠 Navigating back to home');
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header with Student Council Branding */}
      <header className="nav-header p-6">
        <div className="container-centered flex flex-col lg:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-6">
            <StudentCouncilLogo size="default" showText={true} />
            <div className="hidden md:block">
              <p className="text-muted-foreground text-sm">
                Secure access for IIIT Delhi Student Council administrators
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Login Form */}
      <main className="flex items-center justify-center flex-1 min-h-[80vh] p-4">
        <div className="w-full max-w-md">
          <Card className="professional-card">
            <CardHeader className="text-center space-y-4">
              <CardTitle className="text-2xl font-bold text-foreground">
                Admin Login
              </CardTitle>
              <CardDescription>
                Enter your authorized email to receive OTP for secure access.
              </CardDescription>
            </CardHeader>

          <CardContent className="space-y-6">
            <form onSubmit={handleSendOTP} className="space-y-4">
              {/* Quick Login Buttons */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Quick Login Options</Label>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(quickEmails).map(([role, emailAddr]) => (
                    <Button
                      key={role}
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuickLogin(role)}
                      className="text-xs hover:bg-primary/10 hover:border-primary/40"
                    >
                      {role.replace('_', ' ').toUpperCase()}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Email Input */}
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your authorized email"
                  value={email}
                  onChange={handleEmailChange}
                  disabled={isLoading}
                  required
                  className="bg-background/50 border-border"
                />
              </div>

              {/* Error Display */}
              {error && (
                <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20">
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-3">
                <Button 
                  type="submit" 
                  disabled={isLoading || !email.trim()}
                  className="w-full btn-primary"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Sending OTP...
                    </>
                  ) : (
                    'Send OTP'
                  )}
                </Button>

                <Button 
                  type="button"
                  variant="ghost" 
                  onClick={handleBackToHome}
                  className="w-full"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Portal
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
    </div>
  );
};

export default LoginPage;