import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Mail, Shield, Zap, Loader2, Sparkles } from 'lucide-react';

export const LoginPage = ({ onBack }) => {
  const [view, setView] = useState('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  
  const { 
    sendOTP, 
    verifyOTP, 
    isLoading, 
    countdown 
  } = useAuth();
  const { toast } = useToast();

  const handleQuickLogin = (role) => {
    const quickEmails = {
      president: 'president@sc.iiitd.ac.in',
      vp: 'vp@sc.iiitd.ac.in',
      treasurer: 'treasurer@sc.iiitd.ac.in',
      sa_office: 'admin-saoffice@iiitd.ac.in',
      faculty: 'ravi@iiitd.ac.in',
      final: 'smriti@iiitd.ac.in'
    };
    
    if (!quickEmails[role]) {
      setEmail('');
      toast({
        title: 'Unauthorized',
        description: 'Unauthorized admin access',
        variant: 'destructive',
      });
      return;
    }
    
    setEmail(quickEmails[role]);
  };

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    setError('');
  };

  const handleOtpChange = (e) => {
    setOtp(e.target.value.replace(/\D/g, '').slice(0, 6));
    setError('');
  };

  const handleSendOTP = async (e) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setError('Email is required');
      return;
    }

    setError('');
    
    try {
      const result = await sendOTP(email);
      if (result.success) {
        setView('otp');
        toast({
          title: 'OTP Sent',
          description: 'A verification code has been sent to your email.',
        });
      } else {
        setError(result.error || 'Failed to send OTP');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
      console.error('Error sending OTP:', err);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    
    if (!otp || otp.length !== 6) {
      setError('Please enter a valid 6-digit code');
      return;
    }

    setError('');
    
    try {
      const result = await verifyOTP(email, otp);
      if (!result.success) {
        setError(result.error || 'Invalid verification code');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
      console.error('Error verifying OTP:', err);
    }
  };

  const handleBackToEmail = () => {
    setView('email');
    setOtp('');
    setError('');
  };

  const handleResendOTP = async () => {
    if (countdown > 0) return;
    
    try {
      const result = await sendOTP(email);
      if (result.success) {
        toast({
          title: 'New OTP Sent',
          description: 'A new verification code has been sent to your email.',
        });
      } else {
        setError(result.error || 'Failed to resend OTP');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
      console.error('Error resending OTP:', err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse delay-500"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        <Card className="bg-card/80 backdrop-blur-xl border-border/50 shadow-2xl">
          <CardHeader className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-cyan-500 to-purple-500 flex items-center justify-center shadow-lg">
                <Shield className="h-8 w-8 text-white" />
              </div>
            </div>
            <div>
              <CardTitle className="text-2xl font-bold text-foreground flex items-center justify-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Admin Access
              </CardTitle>
              <CardDescription className="text-muted-foreground mt-2">
                {view === 'email' 
                  ? 'Enter your authorized email to receive a verification code'
                  : `Enter the verification code sent to ${email}`}
              </CardDescription>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {view === 'email' ? (
              <form onSubmit={handleSendOTP} className="space-y-6">
                {/* Quick Login Options */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium text-muted-foreground">Quick Access:</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuickLogin('president')}
                      className="text-xs border-border/50 hover:bg-primary/10 hover:border-primary/30"
                    >
                      President
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuickLogin('vp')}
                      className="text-xs border-border/50 hover:bg-primary/10 hover:border-primary/30"
                    >
                      Vice President
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuickLogin('treasurer')}
                      className="text-xs border-border/50 hover:bg-primary/10 hover:border-primary/30"
                    >
                      Treasurer
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuickLogin('sa_office')}
                      className="text-xs border-border/50 hover:bg-primary/10 hover:border-primary/30"
                    >
                      SA Office
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuickLogin('faculty')}
                      className="text-xs border-border/50 hover:bg-primary/10 hover:border-primary/30"
                    >
                      Faculty
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuickLogin('final')}
                      className="text-xs border-border/50 hover:bg-primary/10 hover:border-primary/30"
                    >
                      Final Approver
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-foreground">Authorized Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your authorized email"
                      value={email}
                      onChange={handleEmailChange}
                      required
                      disabled={isLoading}
                      autoFocus
                      className="pl-10 bg-background/50 border-border/50 focus:border-primary/50 focus:ring-1 focus:ring-primary/20"
                    />
                  </div>
                </div>
                
                {error && (
                  <div className="bg-destructive/10 border border-destructive/20 rounded-md p-3">
                    <p className="text-sm text-destructive">{error}</p>
                  </div>
                )}
                
                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white border-0 shadow-lg" 
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Sending OTP...
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 mr-2" />
                      Send Verification Code
                    </>
                  )}
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  onClick={onBack}
                  className="w-full text-muted-foreground hover:text-foreground"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Portal
                </Button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOTP} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="otp" className="text-foreground">Verification Code</Label>
                  <Input
                    id="otp"
                    type="text"
                    inputMode="numeric"
                    pattern="\d{6}"
                    placeholder="Enter 6-digit code"
                    value={otp}
                    onChange={handleOtpChange}
                    required
                    disabled={isLoading}
                    autoFocus
                    className="text-center text-2xl tracking-widest bg-background/50 border-border/50 focus:border-primary/50 focus:ring-1 focus:ring-primary/20"
                  />
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleBackToEmail}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <ArrowLeft className="h-4 w-4 mr-1" />
                    Change Email
                  </Button>
                  
                  <div className="flex items-center space-x-2">
                    <span className="text-muted-foreground">
                      {countdown > 0 ? (
                        `Resend in ${countdown}s`
                      ) : (
                        <Button
                          type="button"
                          variant="link"
                          size="sm"
                          onClick={handleResendOTP}
                          className="p-0 h-auto text-primary hover:text-primary/80"
                        >
                          Resend Code
                        </Button>
                      )}
                    </span>
                  </div>
                </div>
                
                {error && (
                  <div className="bg-destructive/10 border border-destructive/20 rounded-md p-3">
                    <p className="text-sm text-destructive">{error}</p>
                  </div>
                )}
                
                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white border-0 shadow-lg" 
                  disabled={isLoading || otp.length !== 6}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    <>
                      <Shield className="w-4 h-4 mr-2" />
                      Verify & Login
                    </>
                  )}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LoginPage;