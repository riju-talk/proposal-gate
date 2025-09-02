import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Club {
  id: string;
  name: string;
  description?: string;
  coordinator_names: string;
  coordinator_emails: string;
  avatar_url: string;
  channel_links?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const useClubs = () => {
  const [clubs, setClubs] = useState<Club[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchClubs = async () => {
      const { data, error } = await supabase
        .from('clubs')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching clubs:', error);
        setIsLoading(false);
        return;
      }
      setClubs((data || []).map(club => ({
        ...club,
        description: club.description || undefined,
        channel_links: club.channel_links || undefined,
        is_active: club.is_active ?? true
      })));
      setIsLoading(false);
    };

    fetchClubs();
  }, []);

  return {
    clubs,
    isLoading
  };
};