import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

export const AuthContext = createContext(undefined);

export const useAuthProvider = () => {
  const [state, setState] = useState({
    user: null,
    isOTPSent: false,
    lastSentTime: null,
    countdown: 0,
    email: ''
  });
  
  const { user, isOTPSent, lastSentTime, countdown, email } = state;
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  
  // Countdown effect for OTP resend
  useEffect(() => {
    if (!lastSentTime) return;
    
    const now = Date.now();
    const timeLeft = Math.ceil((lastSentTime + 60000 - now) / 1000);
    
    if (timeLeft <= 0) {
      setState(s => ({ ...s, countdown: 0 }));
      return;
    }
    
    setState(s => ({ ...s, countdown: timeLeft }));
    
    const timer = setTimeout(() => {
      setState(s => ({ ...s, countdown: s.countdown - 1 }));
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [lastSentTime, countdown]);
  
  // Check for existing session on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me', {
          credentials: 'include'
        });
        
        if (response.ok) {
          const userData = await response.json();
          setState(s => ({ ...s, user: userData }));
        }
      } catch (err) {
        console.error('Error checking auth:', err);
      }
    };
    
    checkAuth();
  }, []);
  
  const sendOTP = useCallback(async (email) => {
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setState(s => ({
          ...s,
          isOTPSent: true,
          lastSentTime: Date.now(),
          email,
          countdown: 60
        }));
        return { success: true };
      } else {
        return { 
          success: false, 
          error: data.error || 'Failed to send OTP' 
        };
      }
    } catch (error) {
      console.error('Error sending OTP:', error);
      return { 
        success: false, 
        error: 'An error occurred while sending OTP' 
      };
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  const verifyOTP = useCallback(async (email, otp) => {
    setIsLoading(true);
    
    try {
      const actualEmail = email || state.email;
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email: actualEmail, otp }),
      });

      const data = await response.json();
      
      if (response.ok && data.success) {
        const adminUser = {
          email: data.admin.email,
          name: data.admin.name,
          role: data.admin.role
        };
        
        setState(s => ({ ...s, user: adminUser }));
        return { success: true };
      } else {
        return { 
          success: false, 
          error: data.error || 'Invalid OTP' 
        };
      }
    } catch (error) {
      console.error('Error verifying OTP:', error);
      return { 
        success: false, 
        error: 'An error occurred while verifying OTP' 
      };
    } finally {
      setIsLoading(false);
    }
  }, [state.email]);
  
  const logout = useCallback(async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
    
    setState({
      user: null,
      isOTPSent: false,
      lastSentTime: null,
      countdown: 0,
      email: ''
    });
  }, []);
  
  return {
    user,
    isOTPSent,
    isLoading,
    countdown,
    email,
    sendOTP,
    verifyOTP,
    logout
  };
};

export const useAuth = () => {
  return useContext(AuthContext);
};