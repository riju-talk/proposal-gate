import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Mail, Shield, Sparkles, Zap } from 'lucide-react';

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
      admin: 'admin@university.edu',
      coordinator: 'coordinator@university.edu'
    };
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-32 -right-32 w-80 h-80 bg-cyan-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-pulse delay-500" />
      </div>

      <Card className="w-full max-w-md relative z-10 bg-white/10 backdrop-blur-xl border-white/20 shadow-2xl">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-cyan-500 to-purple-500 flex items-center justify-center shadow-lg">
              <Shield className="h-8 w-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-white">Admin Login</CardTitle>
          <CardDescription className="text-white/70">
            {view === 'email' 
              ? 'Enter your email to receive a one-time password'
              : `Enter the OTP sent to ${email}`}
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {view === 'email' ? (
            <form onSubmit={handleSendOTP} className="space-y-4">
              {/* Quick Login Buttons */}
              <div className="grid grid-cols-2 gap-2 mb-4">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickLogin('admin')}
                  className="bg-white/5 border-white/20 text-white hover:bg-white/10"
                >
                  <Shield className="h-4 w-4 mr-1" />
                  Admin
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickLogin('coordinator')}
                  className="bg-white/5 border-white/20 text-white hover:bg-white/10"
                >
                  <Users className="h-4 w-4 mr-1" />
                  Coordinator
                </Button>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-white">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/50" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={handleEmailChange}
                    required
                    disabled={isLoading}
                    autoFocus
                    className="pl-10 bg-white/5 border-white/20 text-white placeholder:text-white/50 focus:border-cyan-400/50"
                  />
                </div>
              </div>
              
              {error && (
                <div className="bg-red-500/20 border border-red-500/30 rounded-md p-3">
                  <p className="text-sm text-red-300">{error}</p>
                </div>
              )}
              
              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 text-white border-0 shadow-lg" 
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
                    Send OTP
                  </>
                )}
              </Button>

              <Button
                type="button"
                variant="ghost"
                onClick={onBack}
                className="w-full text-white/70 hover:bg-white/5"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Portal
              </Button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOTP} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="otp" className="text-white">Verification Code</Label>
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
                  className="text-center text-2xl tracking-widest bg-white/5 border-white/20 text-white placeholder:text-white/50 focus:border-cyan-400/50"
                />
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleBackToEmail}
                  className="text-white/70 hover:bg-white/5"
                >
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Change Email
                </Button>
                
                <div className="flex items-center space-x-2">
                  <span className="text-white/70">
                    {countdown > 0 ? (
                      `Resend in ${countdown}s`
                    ) : (
                      <Button
                        type="button"
                        variant="link"
                        size="sm"
                        onClick={handleResendOTP}
                        className="p-0 h-auto text-cyan-400 hover:text-cyan-300"
                      >
                        Resend OTP
                      </Button>
                    )}
                  </span>
                </div>
              </div>
              
              {error && (
                <div className="bg-red-500/20 border border-red-500/30 rounded-md p-3">
                  <p className="text-sm text-red-300">{error}</p>
                </div>
              )}
              
              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 text-white border-0 shadow-lg" 
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
                    Verify OTP
                  </>
                )}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginPage;