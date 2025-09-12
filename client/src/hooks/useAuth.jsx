import { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import { useToast } from "@/hooks/use-toast";
import { apiClient } from "@/lib/api";

// Initialize API client with stored token
const initializedApiClient = apiClient.initialize();

// Create Auth Context
export const AuthContext = createContext(undefined);

// Custom Hook to use Auth Context
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
    let isMounted = true;
    
    const restoreSession = async () => {
      try {
        setIsLoading(true);
        console.log("🔄 Attempting to restore session...");
        const { data, error } = await initializedApiClient.getCurrentUser();
        
        if (!isMounted) return;
        
        if (data?.user) {
          console.log("✅ Session restored:", data.user.email);
          setUser(data.user);
        } else {
          console.log("⚠️ No active session:", error);
          setUser(null);
        }
      } catch (error) {
        console.error("Error restoring session:", error);
        if (isMounted) setUser(null);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    
    // Initial session restore
    restoreSession();
    
    // Set up interval to check session periodically
    const intervalId = setInterval(restoreSession, 5 * 60 * 1000); // Check every 5 minutes
    
    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
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

      if (timeLeft === 0) clearInterval(interval);
    }, 1000);

    return () => clearInterval(interval);
  }, [lastSentTime]);

  // Send OTP method
  const sendOTP = useCallback(async (targetEmail) => {
    setIsLoading(true);
    console.log("📧 Sending OTP to:", targetEmail);

    try {
      const { data, error } = await apiClient.sendOTP(targetEmail);

      if (data?.success) {
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
      return { success: false, error: err.message || "Network error occurred" };
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Verify OTP method
  const verifyOTP = useCallback(async (targetEmail, otp) => {
    setIsLoading(true);
    console.log("🔐 Verifying OTP for:", targetEmail || email);

    try {
      const { data, error } = await initializedApiClient.verifyOTP(targetEmail || email, otp);

      if (!data?.success) {
        console.error("❌ OTP verification failed:", error);
        return { success: false, error: error || "Invalid OTP" };
      }

      // The server should have set the HTTP-only cookie
      // Now fetch the current user to get the user data
      const { data: userData } = await initializedApiClient.getCurrentUser();
      
      if (userData?.user) {
        setUser(userData.user);
        setIsOTPSent(false);
        setLastSentTime(null);
        setCountdown(0);
        console.log("✅ Login successful:", userData.user.email);
        return { success: true };
      }
      
      return { success: false, error: "Failed to fetch user data" };
    } catch (err) {
      console.error("❌ OTP verification error:", err);
      return { success: false, error: err.message || "Verification failed" };
    } finally {
      setIsLoading(false);
    }
  }, [email]);

  // Get current user method
  const getCurrentUser = useCallback(async () => {
    const { data, error } = await apiClient.getCurrentUser();
    if (data?.user) {
      setUser(data.user);
      console.log("✅ Current user fetched:", data.user.email);
      return { success: true, user: data.user };
    } else {
      console.log("⚠️ No current user:", error);
      return { success: false, error };
    }
  }, []);

  // Logout method
  const logout = useCallback(async () => {
    console.log("🚪 Logging out user...");
    const { error } = await apiClient.logout();

    if (!error) {
      setUser(null);
      setIsOTPSent(false);
      setLastSentTime(null);
      setCountdown(0);
      setEmail("");
      console.log("✅ Logout successful");
      return { success: true };
    } else {
      console.error("❌ Logout failed:", error);
      return { success: false, error };
    }
  }, []);

  // Provide context values
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
