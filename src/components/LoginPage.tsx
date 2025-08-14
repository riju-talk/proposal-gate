import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { University, Users, Mail, Shield, ArrowLeft } from 'lucide-react';

export const LoginPage = () => {
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
        description: `Verification code sent to ${quickEmail}`,
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
    <div className="min-h-screen bg-gradient-to-br from-dashboard-bg via-background to-muted flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="bg-gradient-primary p-4 rounded-2xl shadow-elegant">
              <University className="h-12 w-12 text-white" />
            </div>
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-foreground">Student Council IIIT-Delhi</h1>
            <p className="text-muted-foreground text-lg">Event Approval Portal</p>
          </div>
        </div>

        {/* Login Card */}
        <Card className="shadow-2xl border-0 bg-gradient-card backdrop-blur-sm">
          <CardHeader className="space-y-1 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              {step === 'email' ? (
                <Mail className="h-5 w-5 text-primary" />
              ) : (
                <Shield className="h-5 w-5 text-primary" />
              )}
              <CardTitle className="text-2xl font-semibold">
                {step === 'email' ? 'Sign In' : 'Verify Code'}
              </CardTitle>
            </div>
            <CardDescription className="text-base">
              {step === 'email' 
                ? 'Enter your email to receive a verification code'
                : 'Enter the 6-digit code sent to your email'
              }
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {step === 'email' ? (
              <>
                <form onSubmit={handleSendOTP} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium">
                      Email Address
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email or username"
                      required
                      className="h-11 transition-all focus:ring-2 focus:ring-primary/20"
                      autoComplete="email"
                    />
                    <p className="text-xs text-muted-foreground">
                      You can use "admin" or "coordinator" as shortcuts
                    </p>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full h-11 bg-gradient-primary hover:opacity-90 transition-all duration-200 transform hover:scale-[1.02]" 
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
                <div className="pt-4 border-t border-border/50">
                  <p className="text-xs text-muted-foreground text-center mb-3">Quick Login:</p>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuickLogin('admin')}
                      disabled={isLoading}
                      className="h-10 border-primary/20 hover:border-primary/40 hover:bg-primary/5"
                    >
                      <Shield className="h-4 w-4 mr-2" />
                      Admin
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuickLogin('coordinator')}
                      disabled={isLoading}
                      className="h-10 border-primary/20 hover:border-primary/40 hover:bg-primary/5"
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
                    <p className="text-sm text-muted-foreground mb-4">
                      Code sent to: <span className="font-medium text-foreground">{email}</span>
                    </p>
                  </div>

                  <form onSubmit={handleVerifyOTP} className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-center block">
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
                            <InputOTPSlot index={0} className="w-12 h-12 text-lg border-primary/20 focus:border-primary" />
                            <InputOTPSlot index={1} className="w-12 h-12 text-lg border-primary/20 focus:border-primary" />
                            <InputOTPSlot index={2} className="w-12 h-12 text-lg border-primary/20 focus:border-primary" />
                            <InputOTPSlot index={3} className="w-12 h-12 text-lg border-primary/20 focus:border-primary" />
                            <InputOTPSlot index={4} className="w-12 h-12 text-lg border-primary/20 focus:border-primary" />
                            <InputOTPSlot index={5} className="w-12 h-12 text-lg border-primary/20 focus:border-primary" />
                          </InputOTPGroup>
                        </InputOTP>
                      </div>
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full h-11 bg-gradient-primary hover:opacity-90 transition-all duration-200 transform hover:scale-[1.02]" 
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

                  <div className="flex items-center justify-between pt-4 border-t border-border/50">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setStep('email');
                        setOtp('');
                      }}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Back
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSendOTP({ preventDefault: () => {} } as React.FormEvent)}
                      disabled={isLoading}
                      className="text-primary hover:text-primary/80"
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
        <div className="text-center text-sm text-muted-foreground">
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