import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Loader2, RefreshCw } from 'lucide-react';
import { StudentCouncilLogo } from '@/components/StudentCouncilLogo';

const OTPPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const { verifyOTP, sendOTP, isLoading, countdown } = useAuth();
  const { toast } = useToast();

  // Get email from navigation state
  const email = location.state?.email;

  useEffect(() => {
    // Redirect to login if no email provided
    if (!email) {
      console.log('❌ No email provided, redirecting to login');
      navigate('/auth/login');
    }
  }, [email, navigate]);

  const handleOtpChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setOtp(value);
    setError('');
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    if (otp.length !== 6) {
      setError('Enter valid 6-digit OTP');
      return;
    }

    console.log('🔐 Verifying OTP for:', email);
    setError('');
    
    const result = await verifyOTP(email, otp);

    if (result.success) {
      console.log('✅ OTP verified successfully, redirecting to home');
      toast({ 
        title: 'Login Successful!', 
        description: 'Welcome back to the admin portal.',
        duration: 3000
      });
      navigate('/');
    } else {
      console.error('❌ OTP verification failed:', result.error);
      setError(result.error || 'Invalid OTP');
    }
  };

  const handleResendOTP = async () => {
    if (countdown > 0) return;

    console.log('🔄 Resending OTP to:', email);
    const result = await sendOTP(email);
    
    if (result.success) {
      toast({ 
        title: 'New OTP Sent', 
        description: 'Check your email for the new OTP.',
        duration: 3000
      });
    } else {
      setError(result.error || 'Failed to resend OTP');
    }
  };

  const handleBackToLogin = () => {
    console.log('🔙 Navigating back to login');
    navigate('/auth/login');
  };

  if (!email) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen auth-grid-pattern text-foreground overflow-hidden">
      {/* Decorative floating elements */}
      <div className="floating-decoration olive" style={{
        width: '100px',
        height: '100px',
        top: '10%',
        left: '5%'
      }} />
      <div className="floating-decoration teal" style={{
        width: '80px',
        height: '80px',
        top: '15%',
        right: '8%'
      }} />
      <div className="floating-decoration gold" style={{
        width: '60px',
        height: '60px',
        bottom: '20%',
        left: '10%'
      }} />
      <div className="floating-decoration teal" style={{
        width: '120px',
        height: '120px',
        bottom: '10%',
        right: '5%'
      }} />
      <div className="floating-decoration olive" style={{
        width: '70px',
        height: '70px',
        top: '50%',
        right: '15%'
      }} />

      {/* Header with Student Council Branding */}
      <header className="nav-header p-6 relative z-10">
        <div className="container-centered flex flex-col lg:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-6">
            <StudentCouncilLogo size="default" showText={true} />
            <div className="hidden md:block">
              <p className="text-muted-foreground text-sm">
                Secure OTP verification for IIIT Delhi Student Council
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* OTP Verification Form */}
      <main className="flex items-center justify-center flex-1 min-h-[80vh] p-4 relative z-10">
        <div className="w-full max-w-md">
          <Card className="auth-card">
            <CardHeader className="text-center space-y-4 pb-6">
              <CardTitle className="text-3xl font-bold text-foreground">
                Verify OTP
              </CardTitle>
              <CardDescription className="text-base">
                Enter the 6-digit OTP sent to <br />
                <span className="font-medium text-foreground/90">{email}</span>
              </CardDescription>
            </CardHeader>

          <CardContent className="space-y-6">
            <form onSubmit={handleVerifyOTP} className="space-y-4">
              {/* OTP Input */}
              <div className="space-y-2">
                <Label htmlFor="otp">One-Time Password</Label>
                <Input
                  id="otp"
                  type="text"
                  placeholder="Enter 6-digit OTP"
                  value={otp}
                  onChange={handleOtpChange}
                  maxLength={6}
                  required
                  disabled={isLoading}
                  className="bg-background/50 border-border text-center text-lg font-mono tracking-widest"
                  autoComplete="one-time-code"
                />
                <p className="text-xs text-muted-foreground text-center">
                  Check your email inbox for the verification code
                </p>
              </div>

              {/* Error Display */}
              {error && (
                <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20">
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              )}

              {/* Resend OTP */}
              <div className="flex justify-between items-center text-sm">
                <Button 
                  type="button" 
                  variant="ghost" 
                  onClick={handleBackToLogin}
                  className="p-0 h-auto text-muted-foreground hover:text-foreground"
                >
                  <ArrowLeft className="h-3 w-3 mr-1" />
                  Change Email
                </Button>

                {countdown > 0 ? (
                  <span className="text-muted-foreground">
                    Resend in {countdown}s
                  </span>
                ) : (
                  <Button 
                    type="button" 
                    variant="ghost" 
                    onClick={handleResendOTP}
                    disabled={isLoading}
                    className="p-0 h-auto text-primary hover:text-primary/80"
                  >
                    <RefreshCw className="h-3 w-3 mr-1" />
                    Resend OTP
                  </Button>
                )}
              </div>

              {/* Verify Button */}
              <Button 
                type="submit" 
                disabled={isLoading || otp.length !== 6}
                className="w-full btn-primary"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  'Verify OTP & Login'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
    </div>
  );
};

export default OTPPage;