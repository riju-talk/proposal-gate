import { useState, useEffect } from 'react';
import { normalizeProposals } from '@/utils/proposalUtils';

export const useEventProposals = (statusFilter, userRole = 'public') => {
  const [proposals, setProposals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProposals = async () => {
      try {
        let endpoint = '/api/event-proposals/public'; // Default for public users

        // Determine endpoint based on user role
        if (userRole === 'admin') {
          endpoint = '/api/event-proposals';
        } else if (userRole === 'coordinator') {
          endpoint = '/api/event-proposals/coordinator';
        }

        const headers = {
          'Content-Type': 'application/json',
        };

        // Add auth headers for admin requests
        if (userRole === 'admin') {
          const token = localStorage.getItem('admin_token');
          if (token) {
            headers['Authorization'] = `Bearer ${token}`;
          }
        }

        const response = await fetch(endpoint, { headers });
        
        if (!response.ok) {
          throw new Error('Failed to fetch proposals');
        }

        const data = await response.json();
        const proposalsData = Array.isArray(data) ? data : (Array.isArray(data.body) ? data.body : []);
        const normalizedProposals = normalizeProposals(proposalsData);
        setProposals(normalizedProposals);
      } catch (error) {
        console.error('Error fetching proposals:', error);
        setProposals([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProposals();
  }, [statusFilter, userRole]);

  const updateProposalStatus = async (id, status, comments) => {
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