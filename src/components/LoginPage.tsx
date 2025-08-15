import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { University, Users, Mail, Shield, ArrowLeft } from 'lucide-react';

interface LoginPageProps {
  onBack?: () => void;
}

export const LoginPage = ({ onBack }: LoginPageProps) => {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'email' | 'otp'>('email');
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
      setStep('otp');
      toast({
        title: "OTP sent",
        description: "Check your email for the 6-digit verification code.",
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
    
    if (otp.length !== 6) {
      toast({
        title: "Invalid OTP",
        description: "Please enter the 6-digit code.",
        variant: "destructive",
      });
      return;
    }

    const result = await verifyOTP(email, otp);
    
    if (!result.success) {
      toast({
        title: "Verification failed",
        description: result.error || "Invalid OTP code. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleQuickLogin = async (quickEmail: string) => {
    setEmail(quickEmail);
    const result = await sendOTP(quickEmail);
    
    if (result.success) {
      setStep('otp');
      toast({
        title: "OTP sent",
        description: `6-digit verification code sent to ${quickEmail}`,
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
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>
      
      <div className="w-full max-w-md space-y-8">
        {/* Back button */}
        {onBack && (
          <Button
            variant="ghost"
            onClick={onBack}
            className="text-white/80 hover:text-white hover:bg-white/10 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Portal
          </Button>
        )}
        
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="bg-gradient-to-r from-purple-500 to-blue-500 p-6 rounded-3xl shadow-2xl backdrop-blur-sm border border-white/20">
              <University className="h-16 w-16 text-white drop-shadow-lg" />
            </div>
          </div>
          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-white drop-shadow-lg">Student Council IIIT-Delhi</h1>
            <p className="text-purple-200 text-xl">Admin Portal Access</p>
          </div>
        </div>

        {/* Login Card */}
        <Card className="shadow-2xl border border-white/20 bg-white/10 backdrop-blur-xl">
          <CardHeader className="space-y-1 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              {step === 'email' ? (
                <Mail className="h-5 w-5 text-purple-300" />
              ) : (
                <Shield className="h-5 w-5 text-purple-300" />
              )}
              <CardTitle className="text-2xl font-semibold text-white">
                {step === 'email' ? 'Sign In' : 'Verify Code'}
              </CardTitle>
            </div>
            <CardDescription className="text-base text-purple-200">
              {step === 'email' 
                ? 'Enter your email to receive a 6-digit verification code'
                : 'Enter the 6-digit code sent to your email'
              }
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {step === 'email' ? (
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
                      placeholder="Enter your email or username"
                      required
                      className="h-11 transition-all focus:ring-2 focus:ring-purple-400/50 bg-white/10 border-white/20 text-white placeholder:text-white/60"
                      autoComplete="email"
                    />
                    <p className="text-xs text-purple-300">
                      You can use "admin" or "coordinator" as shortcuts
                    </p>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full h-11 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 transition-all duration-200 transform hover:scale-[1.02] shadow-lg" 
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Sending Code...
                      </div>
                    ) : (
                      "Send Verification Code"
                    )}
                  </Button>
                </form>

                {/* Quick Login Options */}
                <div className="pt-4 border-t border-white/20">
                  <p className="text-xs text-purple-300 text-center mb-3">Quick Login:</p>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuickLogin('admin')}
                      disabled={isLoading}
                      className="h-10 border-white/20 hover:border-white/40 hover:bg-white/10 text-white"
                    >
                      <Shield className="h-4 w-4 mr-2" />
                      Admin
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuickLogin('coordinator')}
                      disabled={isLoading}
                      className="h-10 border-white/20 hover:border-white/40 hover:bg-white/10 text-white"
                    >
                      <Users className="h-4 w-4 mr-2" />
                      Coordinator
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="space-y-4">
                  <div className="text-center">
                    <p className="text-sm text-purple-200 mb-4">
                      Code sent to: <span className="font-medium text-white">{email}</span>
                    </p>
                  </div>

                  <form onSubmit={handleVerifyOTP} className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-center block text-white">
                        Verification Code
                      </Label>
                      <div className="flex justify-center">
                        <InputOTP 
                          maxLength={6} 
                          value={otp} 
                          onChange={(value) => setOtp(value)}
                          className="gap-2"
                        >
                          <InputOTPGroup className="gap-2">
                            <InputOTPSlot index={0} className="w-12 h-12 text-lg border-white/20 focus:border-purple-400 bg-white/10 text-white" />
                            <InputOTPSlot index={1} className="w-12 h-12 text-lg border-white/20 focus:border-purple-400 bg-white/10 text-white" />
                            <InputOTPSlot index={2} className="w-12 h-12 text-lg border-white/20 focus:border-purple-400 bg-white/10 text-white" />
                            <InputOTPSlot index={3} className="w-12 h-12 text-lg border-white/20 focus:border-purple-400 bg-white/10 text-white" />
                            <InputOTPSlot index={4} className="w-12 h-12 text-lg border-white/20 focus:border-purple-400 bg-white/10 text-white" />
                            <InputOTPSlot index={5} className="w-12 h-12 text-lg border-white/20 focus:border-purple-400 bg-white/10 text-white" />
                          </InputOTPGroup>
                        </InputOTP>
                      </div>
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full h-11 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 transition-all duration-200 transform hover:scale-[1.02] shadow-lg" 
                      disabled={isLoading || otp.length !== 6}
                    >
                      {isLoading ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Verifying...
                        </div>
                      ) : (
                        "Verify & Sign In"
                      )}
                    </Button>
                  </form>

                  <div className="flex items-center justify-between pt-4 border-t border-white/20">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setStep('email');
                        setOtp('');
                      }}
                      className="text-purple-300 hover:text-white hover:bg-white/10"
                    >
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Back
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSendOTP({ preventDefault: () => {} } as React.FormEvent)}
                      disabled={isLoading}
                      className="text-purple-300 hover:text-white hover:bg-white/10"
                    >
                      Resend Code
                    </Button>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-sm text-purple-300">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Users className="h-4 w-4" />
            <span>University Academic Affairs</span>
          </div>
          <p>© 2024 University Event Management Portal</p>
        </div>
      </div>
    </div>
  );
};