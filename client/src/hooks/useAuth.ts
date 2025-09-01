import { createContext, useContext, useState, useEffect } from 'react';
import { apiClient } from '@/lib/api';

interface User {
  id: string;
  username: string;
  email: string;
  role?: string;
}

interface AuthContextType {
  user: User | null;
  signInWithEmail: (email: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  isLoading: boolean;
  isAuthenticated: boolean;
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

  useEffect(() => {
    // Check for stored user session
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('currentUser');
      }
    }
  }, []);

  const signInWithEmail = async (email: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setIsLoading(true);
      
      // Check if email is in authorized admins list
      const { data: admins, error: checkError } = await apiClient.getAuthorizedAdmins();

      if (checkError) {
        console.error('Error checking authorized admin:', checkError);
        return { 
          success: false, 
          error: 'Failed to verify authorization' 
        };
      }

      const authorizedAdmin = admins?.find((admin: any) => 
        admin.email.toLowerCase() === email.toLowerCase() && admin.is_active
      );

      if (!authorizedAdmin) {
        return { 
          success: false, 
          error: 'Unauthorized admin - Only authorized personnel can access this system' 
        };
      }

      // For demo purposes, we'll create/login the user directly
      // In production, you might want to send an email verification
      const loginResult = await apiClient.login(email);
      
      if (loginResult.error) {
        // Try to register the user if login fails
        const registerResult = await apiClient.register(
          email, 
          email.split('@')[0], 
          authorizedAdmin.name,
          authorizedAdmin.role
        );
        
        if (registerResult.error) {
          return { 
            success: false, 
            error: registerResult.error 
          };
        }
        
        if (registerResult.data?.profile) {
          setUser(registerResult.data.profile);
          localStorage.setItem('currentUser', JSON.stringify(registerResult.data.profile));
        }
      } else if (loginResult.data?.profile) {
        setUser(loginResult.data.profile);
        localStorage.setItem('currentUser', JSON.stringify(loginResult.data.profile));
      }

      return { success: true };
    } catch (error) {
      console.error('Sign in error:', error);
      return { 
        success: false, 
        error: 'An unexpected error occurred' 
      };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      setUser(null);
      localStorage.removeItem('currentUser');
      window.location.reload();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    user,
    signInWithEmail,
    logout,
    isLoading,
    isAuthenticated: !!user
  };
};
