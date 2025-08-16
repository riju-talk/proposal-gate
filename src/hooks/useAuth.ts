import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Session, User as SupabaseUser } from '@supabase/supabase-js';

interface User {
  id: string;
  username: string;
  email: string;
  role?: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  signInWithMagicLink: (email: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  isLoading: boolean;
  isLinkSent: boolean;
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
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLinkSent, setIsLinkSent] = useState(false);

  useEffect(() => {
    let mounted = true;

    // Set up auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state change:', event, session?.user?.email);
        
        if (!mounted) return;
        
        setSession(session);
        
        if (session?.user) {
          // Defer profile fetching to avoid deadlock
          setTimeout(async () => {
            if (!mounted) return;
            
            try {
              const { data: profile, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('user_id', session.user.id)
                .maybeSingle();
              
              if (error) {
                console.error('Profile fetch error:', error);
                // Create a default user object if profile doesn't exist
                setUser({
                  id: session.user.id,
                  username: session.user.email?.split('@')[0] || 'user',
                  email: session.user.email || '',
                  role: 'user'
                });
              } else if (profile && mounted) {
                setUser({
                  id: profile.user_id,
                  username: profile.username,
                  email: profile.email,
                  role: profile.role
                });
              } else if (mounted) {
                // If no profile found, create a default user object
                setUser({
                  id: session.user.id,
                  username: session.user.email?.split('@')[0] || 'user',
                  email: session.user.email || '',
                  role: 'user'
                });
              }
            } catch (error) {
              console.error('Profile fetch exception:', error);
              // Fallback to basic user info
              setUser({
                id: session.user.id,
                username: session.user.email?.split('@')[0] || 'user',
                email: session.user.email || '',
                role: 'user'
              });
            }
          }, 0);
        } else {
          setUser(null);
        }
        
        if (mounted) {
          setIsLoading(false);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (mounted) {
        setSession(session);
        setIsLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signInWithMagicLink = async (email: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setIsLoading(true);
      
      // Map common usernames to emails for convenience
      const emailMap: { [key: string]: string } = {
        'admin': 'admin@university.edu',
        'coordinator': 'coordinator@university.edu'
      };
      
      const actualEmail = emailMap[email.toLowerCase()] || email;
      
      const { error } = await supabase.auth.signInWithOtp({
        email: actualEmail,
        options: {
          emailRedirectTo: window.location.origin,
          shouldCreateUser: true,
          data: {
            username: email.includes('@') ? email.split('@')[0] : email,
            role: actualEmail === 'admin@university.edu' ? 'admin' : 
                  actualEmail === 'coordinator@university.edu' ? 'coordinator' : 
                  'user'
          }
        }
      });

      if (error) {
        console.error('Magic link send error:', error);
        setIsLinkSent(false);
        return { 
          success: false, 
          error: error.message || 'Failed to send magic link' 
        };
      }

      setIsLinkSent(true);
      return { success: true };
    } catch (error) {
      console.error('Magic link send exception:', error);
      setIsLinkSent(false);
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
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
      setIsLinkSent(false);
      
      // Reload the page to reset the app state
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    user,
    session,
    signInWithMagicLink,
    logout,
    isLoading,
    isLinkSent
  };
};