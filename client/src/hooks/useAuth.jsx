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
      try {
        console.log("🔄 Attempting to restore session...");
        const { data, error } = await apiClient.getCurrentUser();
        if (data?.user) {
          setUser(data.user);
          console.log("✅ Session restored:", data.user.email);
        } else if (error) {
          console.log("⚠️ No active session:", error);
        }
      } catch (err) {
        console.error("❌ Session restore error:", err);
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
        const { data, error } = await apiClient.sendOTP(targetEmail);

        if (data && data.success) {
          setIsOTPSent(true);
          setLastSentTime(Date.now());
          setEmail(targetEmail);
          setCountdown(60);
          console.log("✅ OTP sent successfully");
          return { success: true };
        } else {
          console.error("❌ OTP send failed:", error);
          return { success: false, error: error || "Failed to send OTP" };
        }
      } catch (err) {
        console.error("❌ OTP send error:", err);
        const errorMessage = err.message || "Network error occurred";
        return { success: false, error: errorMessage };
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // Verify OTP method
  const verifyOTP = useCallback(
    async (targetEmail, otp) => {
      setIsLoading(true);
      console.log("🔐 Verifying OTP for:", targetEmail || email);

      try {
        const { data, error } = await apiClient.verifyOTP(
          targetEmail || email,
          otp
        );

        if (data?.success && data.admin) {
          setUser(data.admin);
          setIsOTPSent(false);
          setLastSentTime(null);
          setCountdown(0);
          console.log("✅ Login successful:", data.admin.email);
          return { success: true };
        } else {
          console.error("❌ OTP verification failed:", error);
          return { success: false, error: error || "Invalid OTP" };
        }
      } catch (err) {
        console.error("❌ OTP verification error:", err);
        const errorMessage = err.message || "Verification failed";
        return { success: false, error: errorMessage };
      } finally {
        setIsLoading(false);
      }
    },
    [email]
  );

  // Get current user method
  const getCurrentUser = useCallback(async () => {
    try {
      console.log("🔄 Fetching current user...");
      const { data, error } = await apiClient.getCurrentUser();
      if (data?.user) {
        setUser(data.user);
        console.log("✅ Current user fetched:", data.user.email);
        return { success: true, user: data.user };
      } else {
        console.log("⚠️ No current user:", error);
        return { success: false, error: error || "No user found" };
      }
    } catch (err) {
      console.error("❌ Get current user error:", err);
      return { success: false, error: err.message || "Failed to get user" };
    }
  }, []);

  // Logout method
  const logout = useCallback(async () => {
    try {
      console.log("🚪 Logging out user...");
      await apiClient.logout();
      setUser(null);
      setIsOTPSent(false);
      setLastSentTime(null);
      setCountdown(0);
      setEmail("");
      console.log("✅ Logout successful");
    } catch (err) {
      console.error("❌ Logout error:", err);
    }
  }, []);

  // Provide Context Values
  const contextValue = {
    user,
    isOTPSent,
    isLoading,
    countdown,
    email,
    sendOTP,
    verifyOTP,
    getCurrentUser,
    logout,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;