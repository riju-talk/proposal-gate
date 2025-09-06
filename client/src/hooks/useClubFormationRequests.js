import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useClubFormationRequests = (statusFilter) => {
  const [requests, setRequests] = useState([]);
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
        proposed_by_phone: item.proposed_by_phone || undefined,
        faculty_advisor: item.faculty_advisor || undefined,
        initial_members: item.initial_members || undefined,
        proposed_activities: item.proposed_activities || undefined,
        charter_document_url: item.charter_document_url || undefined,
        status: item.status
      })));
      setIsLoading(false);
    };

    fetchRequests();
  }, [statusFilter]);

  const updateRequestStatus = async (id, status, comments) => {
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