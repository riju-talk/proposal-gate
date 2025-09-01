import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface EventProposal {
  id: string;
  event_name: string;
  event_type: string;
  description: string;
  event_date: string;
  start_time: string;
  end_time: string;
  venue: string;
  expected_participants: number;
  budget_estimate: number;
  organizer_name: string;
  organizer_email: string;
  organizer_phone: string;
  objectives?: string;
  additional_requirements: string;
  pdf_document_url?: string;
  status: 'pending' | 'approved' | 'rejected' | 'under_consideration';
  created_at: string;
  updated_at: string;
}

// Database mapping function - returning raw data
const mapDatabaseToProposal = (dbRow: any): EventProposal => ({
  id: dbRow.id,
  event_name: dbRow.event_name,
  event_type: dbRow.event_type,
  description: dbRow.description,
  event_date: dbRow.event_date,
  start_time: dbRow.start_time,
  end_time: dbRow.end_time,
  venue: dbRow.venue,
  expected_participants: dbRow.expected_participants,
  budget_estimate: dbRow.budget_estimate || 0,
  organizer_name: dbRow.organizer_name,
  organizer_email: dbRow.organizer_email,
  organizer_phone: dbRow.organizer_phone || '',
  objectives: dbRow.objectives || '',
  additional_requirements: dbRow.additional_requirements || '',
  pdf_document_url: dbRow.pdf_document_url,
  status: dbRow.status,
  created_at: dbRow.created_at,
  updated_at: dbRow.updated_at
});

export const useEventProposals = (statusFilter?: string) => {
  const [proposals, setProposals] = useState<EventProposal[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProposals = async () => {
      let query = supabase
        .from('event_proposals')
        .select('*')
        .order('created_at', { ascending: false });

      if (statusFilter && statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      const { data, error } = await query;
      if (error) {
        console.error('Error fetching proposals:', error);
        setIsLoading(false);
        return;
      }
      console.log('Fetched proposals from DB:', data);
      console.log('Applied status filter:', statusFilter);
      const mappedProposals = data.map(mapDatabaseToProposal);
      console.log('Mapped proposals:', mappedProposals);
      setProposals(mappedProposals);
      setIsLoading(false);
    };

    fetchProposals();
  }, [statusFilter]);

  const updateProposalStatus = async (id: string, status: 'approved' | 'rejected' | 'under_consideration', comments: string) => {
    const { error } = await supabase
      .from('event_proposals')
      .update({ 
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);
    
    if (error) {
      console.error('Error updating proposal:', error);
      return;
    }

    // Update local state
    setProposals(prev => 
      prev.map(proposal => 
        proposal.id === id 
          ? { 
              ...proposal, 
              status, 
              updated_at: new Date().toISOString()
            }
          : proposal
      )
    );
  };

  return {
    proposals,
    isLoading,
    updateProposalStatus
  };
};