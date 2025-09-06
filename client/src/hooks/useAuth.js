import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { apiClient } from "@/lib/api";

// Create the AuthContext
export const AuthContext = createContext(undefined);

// Custom Hook for easier usage
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

// AuthProvider Component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isOTPSent, setIsOTPSent] = useState(false);
  const [lastSentTime, setLastSentTime] = useState(null);
  const [countdown, setCountdown] = useState(0);
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { toast } = useToast();

  // Restore session on mount
  useEffect(() => {
    const restoreSession = async () => {
      const result = await apiClient.getCurrentUser();
      if (result.data) {
        setUser(result.data);
        console.log("✅ Session restored:", result.data);
      } else if (result.error) {
        console.warn("⚠️ No active session:", result.error);
      }
    };
    restoreSession();
  }, []);

  // Countdown logic for OTP resend
  useEffect(() => {
    if (!lastSentTime) return;

    const interval = setInterval(() => {
      const timeLeft = Math.max(
        0,
        Math.ceil((lastSentTime + 60000 - Date.now()) / 1000)
      );
      setCountdown(timeLeft);

      if (timeLeft === 0) {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [lastSentTime]);

  // Send OTP method
  const sendOTP = useCallback(
    async (targetEmail) => {
      setIsLoading(true);
      console.log("📧 Sending OTP to:", targetEmail);

      try {
        const result = await apiClient.sendOTP(targetEmail);

        if (result.data) {
          setIsOTPSent(true);
          setLastSentTime(Date.now());
          setEmail(targetEmail);
          setCountdown(60);
          toast({ 
            title: "OTP sent", 
            description: "Check your email inbox.",
            duration: 3000
          });
          console.log("✅ OTP sent successfully");
          return { success: true };
        } else {
          console.error("❌ OTP send failed:", result.error);
          toast({
            title: "Error",
            description: result.error || "Failed to send OTP",
            variant: "destructive",
            duration: 5000
          });
          return { success: false, error: result.error || "Failed to send OTP" };
        }
      } catch (err) {
        console.error("❌ OTP send error:", err);
        const errorMessage = err.message || "Network error occurred";
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
          duration: 5000
        });
        return { success: false, error: errorMessage };
      } finally {
        setIsLoading(false);
      }
    },
    [toast]
  );

  // Verify OTP method
  const verifyOTP = useCallback(
    async (targetEmail, otp) => {
      setIsLoading(true);
      console.log("🔐 Verifying OTP for:", targetEmail || email);

      try {
        const result = await apiClient.verifyOTP(targetEmail || email, otp);

        if (result.data && result.data.admin) {
          setUser(result.data.admin);
          setIsOTPSent(false);
          setLastSentTime(null);
          setCountdown(0);
          toast({ 
            title: "Logged in", 
            description: `Welcome back, ${result.data.admin.name}!`,
            duration: 3000
          });
          console.log("✅ Login successful:", result.data.admin);
          return { success: true };
        } else {
          console.error("❌ OTP verification failed:", result.error);
          toast({
            title: "Invalid OTP",
            description: result.error || "Please check your code and try again",
            variant: "destructive",
            duration: 5000
          });
          return { success: false, error: result.error || "Invalid OTP" };
        }
      } catch (err) {
        console.error("❌ OTP verification error:", err);
        const errorMessage = err.message || "Verification failed";
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
          duration: 5000
        });
        return { success: false, error: errorMessage };
      } finally {
        setIsLoading(false);
      }
    },
    [email, toast]
  );

  // Logout method
  const logout = useCallback(async () => {
    try {
      await apiClient.logout();
      setUser(null);
      setIsOTPSent(false);
      setLastSentTime(null);
      setCountdown(0);
      setEmail("");
      toast({ 
        title: "Logged out",
        description: "You have been logged out successfully",
        duration: 3000
      });
      console.log("✅ Logout successful");
    } catch (err) {
      console.error("❌ Logout error:", err);
    }
  }, [toast]);

  // Provide Context Values
  const contextValue = {
    user,
    isOTPSent,
    isLoading,
    countdown,
    email,
    sendOTP,
    verifyOTP,
    logout,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;