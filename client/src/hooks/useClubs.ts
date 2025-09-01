import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api';

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
      const { data, error } = await apiClient.getClubs();

      if (error) {
        console.error('Error fetching clubs:', error);
        setIsLoading(false);
        return;
      }
      setClubs(data || []);
      setIsLoading(false);
    };

    fetchClubs();
  }, []);

  return {
    clubs,
    isLoading
  };
};