import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { University, Users, Mail, ArrowLeft, Shield, KeyRound, Sparkles } from 'lucide-react';

interface LoginPageProps {
  onBack?: () => void;
}

export const LoginPage = ({ onBack }: LoginPageProps) => {
  const [email, setEmail] = useState('');
  const [otp, setOTP] = useState('');
  const { sendOTP, verifyOTP, isLoading, isOTPSent } = useAuth();
  const { toast } = useToast();

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      toast({
        title: "Email required",
        description: "Please enter your email address.",
        variant: "destructive",
      });
      return;
    }

    const result = await sendOTP(email);
    
    if (result.success) {
      toast({
        title: "OTP sent successfully",
        description: "Check your email for the verification code.",
      });
    } else {
      toast({
        title: "Failed to send OTP",
        description: result.error || "Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!otp.trim()) {
      toast({
        title: "OTP required",
        description: "Please enter the verification code.",
        variant: "destructive",
      });
      return;
    }

    const result = await verifyOTP(email, otp);
    
    if (result.success) {
      toast({
        title: "Login successful",
        description: "Welcome to the admin portal!",
      });
    } else {
      toast({
        title: "Invalid OTP",
        description: result.error || "Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleQuickLogin = async (quickEmail: string) => {
    setEmail(quickEmail);
    const result = await sendOTP(quickEmail);
    
    if (result.success) {
      toast({
        title: "OTP sent successfully",
        description: `Check your email for the verification code.`,
      });
    } else {
      toast({
        title: "Failed to send OTP",
        description: result.error || "Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-32 -right-32 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse delay-500" />
      </div>
      
      <div className="w-full max-w-md space-y-8 relative z-10">
        {/* Back button */}
        {onBack && (
          <Button
            variant="ghost"
            type="button"
            onClick={() => onBack()}
            className="absolute left-4 top-4 flex items-center gap-2 z-10 text-white/70 hover:text-white hover:bg-white/10 backdrop-blur-sm"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Portal
          </Button>
        )}
        
        {/* Header */}
        <div className="text-center space-y-6">
          <div className="flex justify-center">
            <div className="bg-white/10 backdrop-blur-sm p-6 rounded-2xl shadow-2xl border border-white/20">
              <img src="/student_council.jpg" alt="Logo" className="h-24 w-24 rounded-xl" />
            </div>
          </div>
          <div className="space-y-3">
            <h1 className="text-4xl font-bold text-white drop-shadow-lg">
              Student Council IIIT-Delhi
            </h1>
            <p className="text-purple-200 text-xl font-medium">Admin Portal Access</p>
            <div className="flex items-center justify-center gap-4 mt-6">
              <div className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20">
                <Shield className="h-5 w-5 text-cyan-400" />
                <span className="text-white text-sm font-medium">Secure Access</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20">
                <KeyRound className="h-5 w-5 text-purple-400" />
                <span className="text-white text-sm font-medium">OTP Verified</span>
              </div>
            </div>
          </div>
        </div>

        {/* Login Card */}
        <Card className="shadow-2xl border border-white/20 bg-white/10 backdrop-blur-xl">
          <CardHeader className="space-y-1 text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              {!isOTPSent ? (
                <>
                  <Mail className="h-6 w-6 text-cyan-400" />
                  <CardTitle className="text-2xl font-bold text-white">
                    Admin Login
                  </CardTitle>
                </>
              ) : (
                <>
                  <KeyRound className="h-6 w-6 text-purple-400" />
                  <CardTitle className="text-2xl font-bold text-white">
                    Enter Verification Code
                  </CardTitle>
                </>
              )}
            </div>
            <CardDescription className="text-purple-200 text-base">
              {isOTPSent 
                ? 'Enter the 6-digit code sent to your email'
                : 'Enter your email to receive a verification code'
              }
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {!isOTPSent ? (
              <>
                <form onSubmit={handleSendOTP} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium text-white">
                      Email Address
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email or use shortcuts"
                      required
                      className="h-12 bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-cyan-400 focus:ring-cyan-400/20"
                      autoComplete="email"
                    />
                    <p className="text-xs text-purple-200">
                      Quick access: Type "admin" or "coordinator"
                    </p>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full h-12 bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105" 
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Sending Code...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Mail className="h-5 w-5" />
                        Send Verification Code
                      </div>
                    )}
                  </Button>
                </form>

                {/* Quick Login Options */}
                <div className="pt-4 border-t border-white/20">
                  <p className="text-xs text-purple-200 text-center mb-3">Quick Access:</p>
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuickLogin('admin')}
                      disabled={isLoading}
                      className="h-11 bg-white/5 border-white/20 text-white hover:bg-white/10 hover:border-cyan-400 transition-all duration-200"
                    >
                      <Shield className="h-4 w-4 mr-2" />
                      Admin
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuickLogin('coordinator')}
                      disabled={isLoading}
                      className="h-11 bg-white/5 border-white/20 text-white hover:bg-white/10 hover:border-purple-400 transition-all duration-200"
                    >
                      <Users className="h-4 w-4 mr-2" />
                      Coordinator
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <form onSubmit={handleVerifyOTP} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="otp" className="text-sm font-medium text-white">
                      Verification Code
                    </Label>
                    <Input
                      id="otp"
                      type="text"
                      value={otp}
                      onChange={(e) => setOTP(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="Enter 6-digit code"
                      required
                      className="h-12 bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-purple-400 focus:ring-purple-400/20 text-center text-2xl font-mono tracking-widest"
                      maxLength={6}
                      autoComplete="one-time-code"
                    />
                    <p className="text-xs text-purple-200 text-center">
                      Code sent to: <span className="font-medium">{email}</span>
                    </p>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full h-12 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105" 
                    disabled={isLoading || otp.length !== 6}
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Verifying...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <KeyRound className="h-5 w-5" />
                        Verify & Login
                      </div>
                    )}
                  </Button>
                </form>

                <div className="pt-4 border-t border-white/20 text-center">
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setIsOTPSent(false);
                      setOTP('');
                    }}
                    className="text-purple-200 hover:text-white hover:bg-white/10"
                  >
                    ← Back to Email
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => handleSendOTP({ preventDefault: () => {} } as React.FormEvent)}
                    disabled={isLoading}
                    className="ml-4 text-purple-200 hover:text-white hover:bg-white/10"
                  >
                    Resend Code
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-sm text-purple-200">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Sparkles className="h-4 w-4" />
            <span>IIIT-Delhi Student Council</span>
          </div>
          <p>© 2025 IIIT-Delhi Student Council</p>
        </div>
      </div>
    </div>
  );
};