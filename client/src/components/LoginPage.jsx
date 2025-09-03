import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft } from 'lucide-react';

const LoginPage = ({ onBack }) => {
  const [view, setView] = useState('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  
  const { 
    user, 
    sendOTP, 
    verifyOTP, 
    isLoading, 
    countdown 
  } = useAuth();
  const { toast } = useToast();

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
    window.dispatchEvent(new Event('resetOTP'));
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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Admin Login</CardTitle>
          <CardDescription>
            {view === 'email' 
              ? 'Enter your email to receive a one-time password'
              : `Enter the OTP sent to ${email}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {view === 'email' ? (
            <form onSubmit={handleSendOTP} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={handleEmailChange}
                  required
                  disabled={isLoading}
                  autoFocus
                />
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-gray-200 border-t-gray-400 rounded-full animate-spin mr-2" />
                    Sending...
                  </>
                ) : (
                  'Send OTP'
                )}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOTP} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="otp">Verification Code</Label>
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
                  className="text-center text-2xl tracking-widest"
                />
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleBackToEmail}
                  className="text-muted-foreground"
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
                        className="p-0 h-auto"
                      >
                        Resend OTP
                      </Button>
                    )}
                  </span>
                </div>
              </div>
              
              {error && <p className="text-sm text-red-500">{error}</p>}
              
              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading || otp.length !== 6}
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                    Verifying...
                  </>
                ) : (
                  'Verify OTP'
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
