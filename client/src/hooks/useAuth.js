// client/src/context/AuthContext.jsx
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { useToast } from "@/hooks/use-toast";
import { apiClient } from "@/lib/api";

export const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isOTPSent, setIsOTPSent] = useState(false);
  const [lastSentTime, setLastSentTime] = useState(null);
  const [countdown, setCountdown] = useState(0);
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Restore session (cookie-based)
  useEffect(() => {
    const restoreSession = async () => {
      const { data, error } = await apiClient.getCurrentUser();
      if (data?.user) setUser(data.user);
      if (error) console.warn("No active session:", error);
    };
    restoreSession();
  }, []);

  // Countdown for OTP resend
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

  const sendOTP = useCallback(
    async (targetEmail) => {
      setIsLoading(true);
      const { data, error } = await apiClient.sendOTP(targetEmail);
      setIsLoading(false);

      if (data) {
        setIsOTPSent(true);
        setLastSentTime(Date.now());
        setEmail(targetEmail);
        setCountdown(60);
        toast({ title: "OTP sent", description: "Check your email inbox." });
        return { success: true };
      }
      return { success: false, error };
    },
    [toast]
  );

  const verifyOTP = useCallback(
    async (targetEmail, otp) => {
      setIsLoading(true);
      const { data, error } = await apiClient.verifyOTP(
        targetEmail || email,
        otp
      );
      setIsLoading(false);

      if (data?.success && data.admin) {
        setUser(data.admin);
        toast({ title: "Logged in", description: "Welcome back!" });
        return { success: true };
      }
      return { success: false, error: error || "Invalid OTP" };
    },
    [email, toast]
  );

  const logout = useCallback(async () => {
    await apiClient.logout();
    setUser(null);
    setIsOTPSent(false);
    setLastSentTime(null);
    setCountdown(0);
    setEmail("");
    toast({ title: "Logged out" });
  }, [toast]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isOTPSent,
        isLoading,
        countdown,
        email,
        sendOTP,
        verifyOTP,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
};
