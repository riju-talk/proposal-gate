import { createContext, useContext, useState, useEffect } from 'react';

interface User {
  email: string;
  name: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  sendOTP: (email: string) => Promise<{ success: boolean; error?: string }>;
  verifyOTP: (email: string, otp: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  isLoading: boolean;
  isOTPSent: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const useAuthProvider = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isOTPSent, setIsOTPSent] = useState(false);

  // Check for existing session on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('admin_user');
    const savedToken = localStorage.getItem('admin_token');
    
    if (savedUser && savedToken) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error('Error parsing saved user:', error);
        localStorage.removeItem('admin_user');
        localStorage.removeItem('admin_token');
      }
    }
  }, []);

  const sendOTP = async (email: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setIsLoading(true);
      
      // Handle shortcuts
      let actualEmail = email;
      if (email === 'admin') {
        actualEmail = 'admin@university.edu';
      } else if (email === 'coordinator') {
        actualEmail = 'coordinator@university.edu';
      }
      
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: actualEmail }),
      });

      const data = await response.json();
      
      if (response.ok) {
        setIsOTPSent(true);
        return { success: true };
      } else {
        return { success: false, error: data.error || 'Failed to send OTP' };
      }
    } catch (error) {
      console.error('Send OTP error:', error);
      return { success: false, error: 'Network error. Please try again.' };
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOTP = async (email: string, otp: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setIsLoading(true);
      
      // Handle shortcuts
      let actualEmail = email;
      if (email === 'admin') {
        actualEmail = 'admin@university.edu';
      } else if (email === 'coordinator') {
        actualEmail = 'coordinator@university.edu';
      }
      
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: actualEmail, otp }),
      });

      const data = await response.json();
      
      if (response.ok && data.success) {
        const adminUser = {
          email: data.admin.email,
          name: data.admin.name,
          role: data.admin.role
        };
        
        setUser(adminUser);
        setIsOTPSent(false);
        
        // Save session
        localStorage.setItem('admin_user', JSON.stringify(adminUser));
        localStorage.setItem('admin_token', data.token);
        
        return { success: true };
      } else {
        return { success: false, error: data.error || 'Invalid OTP' };
      }
    } catch (error) {
      console.error('Verify OTP error:', error);
      return { success: false, error: 'Network error. Please try again.' };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setIsOTPSent(false);
    localStorage.removeItem('admin_user');
    localStorage.removeItem('admin_token');
  };

  return {
    user,
    sendOTP,
    verifyOTP,
    logout,
    isLoading,
    isOTPSent
  };
};