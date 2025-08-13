import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface EventProposal {
  id: string;
  eventName: string;
  eventType: string;
  eventDescription: string;
  eventDate: string;
  startTime: string;
  duration: string;
  preferredVenue: string;
  expectedAttendees: number;
  estimatedBudget: number;
  primaryOrganizer: string;
  emailAddress: string;
  phoneNumber: string;
  department: string;
  specialRequirements: string;
  marketingPlan: string;
  supportingDocuments?: File;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: Date;
  reviewedAt?: Date;
  reviewedBy?: string;
  reviewComments?: string;
}

// Map database fields to our interface
const mapDatabaseToProposal = (dbRow: any): EventProposal => ({
  id: dbRow.id,
  eventName: dbRow.event_name,
  eventType: dbRow.event_type,
  eventDescription: dbRow.description,
  eventDate: dbRow.event_date,
  startTime: dbRow.start_time,
  duration: `${Math.floor((new Date(`1970-01-01T${dbRow.end_time}:00Z`).getTime() - new Date(`1970-01-01T${dbRow.start_time}:00Z`).getTime()) / (1000 * 60 * 60))} hours`,
  preferredVenue: dbRow.venue,
  expectedAttendees: dbRow.expected_participants,
  estimatedBudget: dbRow.budget_estimate || 0,
  primaryOrganizer: dbRow.organizer_name,
  emailAddress: dbRow.organizer_email,
  phoneNumber: dbRow.organizer_phone || '',
  department: 'Not specified',
  specialRequirements: dbRow.additional_requirements || '',
  marketingPlan: 'Not specified',
  status: dbRow.status === 'pending' ? 'pending' : dbRow.status,
  submittedAt: new Date(dbRow.created_at),
  reviewedAt: dbRow.updated_at !== dbRow.created_at ? new Date(dbRow.updated_at) : undefined,
  reviewedBy: dbRow.status !== 'pending' ? 'admin' : undefined,
  reviewComments: ''
});

export const useEventProposals = () => {
  const [proposals, setProposals] = useState<EventProposal[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProposals = async () => {
      const { data, error } = await supabase
        .from('event_proposals')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching proposals:', error);
        setIsLoading(false);
        return;
      }
      
      const mappedProposals = data.map(mapDatabaseToProposal);
      setProposals(mappedProposals);
      setIsLoading(false);
    };

    fetchProposals();
  }, []);

  const updateProposalStatus = async (id: string, status: 'approved' | 'rejected', comments: string) => {
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
              reviewedAt: new Date(),
              reviewedBy: 'admin',
              reviewComments: comments 
            }
          : proposal
      )
    );

    // Get proposal details for email
    const proposal = proposals.find(p => p.id === id);
    if (proposal) {
      console.log(`Email notification sent to ${proposal.emailAddress}: Event "${proposal.eventName}" has been ${status}.`);
    }
  };

  return {
    proposals,
    isLoading,
    updateProposalStatus
  };
};