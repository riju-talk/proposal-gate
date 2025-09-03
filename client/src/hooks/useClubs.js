import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useClubs = () => {
  const [clubs, setClubs] = useState([]);
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