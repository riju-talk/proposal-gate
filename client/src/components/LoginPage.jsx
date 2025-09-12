import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Loader2, Sparkles } from 'lucide-react';

const LoginPage = ({ onBack }) => {
  const [view, setView] = useState('email'); // 'email' or 'otp'
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');

  const { sendOTP, verifyOTP, isLoading, countdown } = useAuth();
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
    const result = await sendOTP(email);

    if (result.success) {
      toast({ title: 'OTP Sent', description: 'Check your email for the OTP.' });
      setView('otp');
    } else {
      setError(result.error || 'Failed to send OTP');
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    if (otp.length !== 6) {
      setError('Enter valid 6-digit OTP');
      return;
    }

    setError('');
    const result = await verifyOTP(email, otp);

    if (result.success) {
      toast({ title: 'Logged in!', description: 'Welcome back.' });
      // TODO: Proceed to next state
    } else {
      setError(result.error || 'Invalid OTP');
    }
  };

  const handleResendOTP = async () => {
    if (countdown > 0) return;

    const result = await sendOTP(email);
    if (result.success) {
      toast({ title: 'New OTP Sent', description: 'Check your email.' });
    } else {
      setError(result.error || 'Failed to resend OTP');
    }
  };

  const handleBackToEmail = () => {
    setView('email');
    setOtp('');
    setError('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="w-full max-w-md relative z-10">
        <Card className="bg-card/80 backdrop-blur-xl shadow-lg">
          <CardHeader className="text-center space-y-4">
            <CardTitle className="text-2xl font-bold text-foreground">
              <Sparkles className="inline-block h-5 w-5 text-primary" /> Admin Access
            </CardTitle>
            <CardDescription>
              {view === 'email'
                ? 'Enter your authorized email to receive OTP.'
                : `Enter the OTP sent to ${email}`}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {view === 'email' && (
              <form onSubmit={handleSendOTP} className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  {Object.keys(quickEmails).map((role) => (
                    <Button
                      key={role}
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuickLogin(role)}
                    >
                      {role.toUpperCase()}
                    </Button>
                  ))}
                </div>

                <div>
                  <Label>Email</Label>
                  <Input
                    type="email"
                    placeholder="Your authorized email"
                    value={email}
                    onChange={handleEmailChange}
                    disabled={isLoading}
                    required
                  />
                </div>

                {error && <p className="text-red-500">{error}</p>}

                <Button type="submit" disabled={isLoading}>
                  {isLoading ? <Loader2 className="animate-spin" /> : 'Send OTP'}
                </Button>

                <Button variant="ghost" onClick={onBack}>
                  Back to Portal
                </Button>
              </form>
            )}

            {view === 'otp' && (
              <form onSubmit={handleVerifyOTP} className="space-y-4">
                <div>
                  <Label>Email</Label>
                  <Input type="text" value={email} disabled />

                  <Label>OTP</Label>
                  <Input
                    type="text"
                    placeholder="Enter 6-digit OTP"
                    value={otp}
                    onChange={handleOtpChange}
                    maxLength={6}
                    required
                    disabled={isLoading}
                  />
                </div>

                <div className="flex justify-between items-center">
                  <Button type="button" variant="ghost" onClick={handleBackToEmail}>
                    <ArrowLeft /> Change Email
                  </Button>

                  {countdown > 0 ? (
                    <span>Resend in {countdown}s</span>
                  ) : (
                    <Button type="button" variant="link" onClick={handleResendOTP}>
                      Resend OTP
                    </Button>
                  )}
                </div>

                {error && <p className="text-red-500">{error}</p>}

                <Button type="submit" disabled={isLoading || otp.length !== 6}>
                  {isLoading ? <Loader2 className="animate-spin" /> : 'Verify OTP & Login'}
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
