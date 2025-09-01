import { supabase } from '@/integrations/supabase/client';

export const createAdminUsers = async () => {
  try {
    const { data, error } = await supabase.functions.invoke('create-admin-users');
    
    if (error) {
      console.error('Error creating admin users:', error);
      return false;
    }
    
    console.log('Admin users created:', data);
    return true;
  } catch (error) {
    console.error('Error invoking function:', error);
    return false;
  }
};

// Auto-create users on app load
if (typeof window !== 'undefined') {
  createAdminUsers();
}