import { useState, useEffect } from 'react';

export const useEventProposals = (statusFilter, userRole = 'public') => {
  const [proposals, setProposals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProposals = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
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
          throw new Error(`Failed to fetch proposals: ${response.status}`);
        }

        const data = await response.json();
        const proposalsData = Array.isArray(data) ? data : [];
        
        // Normalize the data to ensure consistent field names
        const normalizedProposals = proposalsData.map(proposal => ({
          id: proposal.id,
          event_name: proposal.event_name || proposal.eventName,
          organizer_name: proposal.organizer_name || proposal.organizerName,
          organizer_email: proposal.organizer_email || proposal.organizerEmail,
          organizer_phone: proposal.organizer_phone || proposal.organizerPhone,
          event_type: proposal.event_type || proposal.eventType,
          event_date: proposal.event_date || proposal.eventDate,
          start_time: proposal.start_time || proposal.startTime,
          end_time: proposal.end_time || proposal.endTime,
          venue: proposal.venue,
          expected_participants: proposal.expected_participants || proposal.expectedParticipants,
          budget_estimate: proposal.budget_estimate || proposal.budgetEstimate,
          description: proposal.description,
          objectives: proposal.objectives,
          additional_requirements: proposal.additional_requirements || proposal.additionalRequirements,
          pdf_document_url: proposal.pdf_document_url || proposal.pdfDocumentUrl,
          status: proposal.status,
          created_at: proposal.created_at || proposal.createdAt,
          updated_at: proposal.updated_at || proposal.updatedAt,
          approvals: proposal.approvals || []
        }));
        
        setProposals(normalizedProposals);
      } catch (error) {
        console.error('Error fetching proposals:', error);
        setError(error.message);
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
      
      const response = await fetch(`/api/events/${id}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ 
          adminEmail: user.email,
          status, 
          comments 
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update proposal status');
      }

      const result = await response.json();
      
      // Update local state
      setProposals(prev => 
        prev.map(proposal => 
          proposal.id === id 
            ? { 
                ...proposal, 
                status: result.eventStatus, 
                updated_at: new Date().toISOString()
              }
            : proposal
        )
      );

      return result;
    } catch (error) {
      console.error('Error updating proposal status:', error);
      throw error;
    }
  };

  return {
    proposals,
    isLoading,
    error,
    updateProposalStatus
  };
};