import { useState, useEffect } from 'react';

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

export const useEventProposals = (statusFilter?: string, userRole: 'admin' | 'coordinator' | 'public' = 'public') => {
  const [proposals, setProposals] = useState<EventProposal[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProposals = async () => {
      try {
        let endpoint = '/api/event-proposals/public'; // Default for public users
        
        if (userRole === 'admin') {
          endpoint = '/api/event-proposals';
        } else if (userRole === 'coordinator') {
          endpoint = '/api/event-proposals/coordinator';
        }

        const headers: HeadersInit = {
          'Content-Type': 'application/json',
        };

        // Add auth headers for admin requests
        if (userRole === 'admin') {
          const token = localStorage.getItem('admin_token');
          const adminUser = localStorage.getItem('admin_user');
          
          if (token && adminUser) {
            const user = JSON.parse(adminUser);
            headers['Authorization'] = `Bearer ${token}`;
            headers['x-admin-email'] = user.email;
          }
        }

        const response = await fetch(endpoint, { headers });
        
        if (!response.ok) {
          throw new Error('Failed to fetch proposals');
        }

        const data = await response.json();
        
        // Apply client-side filtering if needed
        let filteredData = data;
        if (statusFilter && statusFilter !== 'all') {
          filteredData = data.filter((p: EventProposal) => p.status === statusFilter);
        }
        
        setProposals(filteredData);
      } catch (error) {
        console.error('Error fetching proposals:', error);
        setProposals([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProposals();
  }, [statusFilter, userRole]);

  const updateProposalStatus = async (id: string, status: 'approved' | 'rejected' | 'under_consideration', comments: string) => {
    try {
      const token = localStorage.getItem('admin_token');
      const adminUser = localStorage.getItem('admin_user');
      
      if (!token || !adminUser) {
        throw new Error('Not authenticated');
      }

      const user = JSON.parse(adminUser);
      
      const response = await fetch(`/api/event-proposals/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'x-admin-email': user.email,
        },
        body: JSON.stringify({ status, comments }),
      });

      if (!response.ok) {
        throw new Error('Failed to update proposal status');
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
    } catch (error) {
      console.error('Error updating proposal status:', error);
      throw error;
    }
  };

  return {
    proposals,
    isLoading,
    updateProposalStatus
  };
};