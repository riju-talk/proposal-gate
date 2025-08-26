import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface ClubFormationRequest {
  id: string;
  club_name: string;
  club_description: string;
  club_objectives: string;
  proposed_by_name: string;
  proposed_by_email: string;
  proposed_by_phone?: string;
  faculty_advisor?: string;
  initial_members?: string[];
  proposed_activities?: string;
  charter_document_url?: string;
  status: 'pending' | 'approved' | 'rejected' | 'under_consideration';
  created_at: string;
  updated_at: string;
}

export const useClubFormationRequests = (statusFilter?: string) => {
  const [requests, setRequests] = useState<ClubFormationRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRequests = async () => {
      let query = supabase
        .from('club_formation_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (statusFilter && statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      const { data, error } = await query;
      if (error) {
        console.error('Error fetching club requests:', error);
        setIsLoading(false);
        return;
      }
      setRequests((data || []).map(item => ({
        ...item,
        status: item.status as 'pending' | 'approved' | 'rejected' | 'under_consideration'
      })));
      setIsLoading(false);
    };

    fetchRequests();
  }, [statusFilter]);

  const updateRequestStatus = async (id: string, status: 'approved' | 'rejected' | 'under_consideration', comments: string) => {
    const { error } = await supabase
      .from('club_formation_requests')
      .update({ 
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);
    
    if (error) {
      console.error('Error updating request:', error);
      return;
    }

    // Update local state
    setRequests(prev => 
      prev.map(request => 
        request.id === id 
          ? { 
              ...request, 
              status, 
              updated_at: new Date().toISOString()
            }
          : request
      )
    );
  };

  return {
    requests,
    isLoading,
    updateRequestStatus
  };
};