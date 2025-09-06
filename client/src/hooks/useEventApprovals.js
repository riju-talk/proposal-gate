import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';

export const useEventApprovals = (eventId) => {
  const { user } = useAuth();
  const [approvals, setApprovals] = useState([]);
  const [authorizedAdmins, setAuthorizedAdmins] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAdmins = useCallback(async () => {
    try {
      const response = await fetch('/api/admins');
      if (!response.ok) {
        throw new Error('Failed to fetch admins');
      }
      const data = await response.json();
      
      if (!Array.isArray(data)) {
        console.error('Unexpected response format for admins:', data);
        return [];
      }
      
      // Filter out developer role and inactive admins, then sort by approval_order
      const filteredAdmins = data
        .filter((admin) => admin.is_active && admin.role !== 'developer')
        .sort((a, b) => (a.approval_order || 0) - (b.approval_order || 0));
      
      setAuthorizedAdmins(filteredAdmins);
      return filteredAdmins;
    } catch (err) {
      console.error('Error fetching admins:', err);
      setError('Failed to load admin data');
      return [];
    }
  }, []);

  const fetchApprovals = useCallback(async (eventId) => {
    try {
      const response = await fetch(`/api/events/${eventId}/approvals`);
      if (!response.ok) {
        throw new Error(`Failed to fetch approvals: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (!Array.isArray(data)) {
        console.error('Unexpected response format for approvals:', data);
        return;
      }
      
      // Sort approvals by approval_order
      const sortedApprovals = data.sort((a, b) => {
        const orderA = a.approval_order || 0;
        const orderB = b.approval_order || 0;
        return orderA - orderB;
      });
      
      setApprovals(sortedApprovals);
    } catch (err) {
      console.error('Error fetching approvals:', err);
      setError('Failed to load approval data');
    }
  }, []);

  const updateApprovalStatus = useCallback(async (
    eventId, 
    adminEmail, 
    status, 
    comments = ''
  ) => {
    try {
      const token = localStorage.getItem('admin_token');
      
      if (!token) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(`/api/events/${eventId}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          adminEmail,
          status,
          comments,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to update approval status');
      }

      const result = await response.json();
      
      // Refresh approvals after successful update
      await fetchApprovals(eventId);
      return { success: true, result };
    } catch (err) {
      console.error('Error updating approval status:', err);
      return { 
        success: false, 
        error: err instanceof Error ? err.message : 'Failed to update approval status' 
      };
    }
  }, [fetchApprovals]);

  const canApprove = useCallback((adminEmail) => {
    if (!user?.email || !eventId) return false;
    
    // Check if the current user is the admin trying to approve
    if (user.email !== adminEmail) return false;

    // Get the admin's approval record
    const approval = approvals.find(a => a.admin_email === adminEmail);
    
    // Can approve if status is still pending
    return approval?.status === 'pending';
  }, [user, eventId, approvals]);

  useEffect(() => {
    const fetchData = async () => {
      if (!eventId) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        await fetchAdmins();
        await fetchApprovals(eventId);
      } catch (err) {
        console.error('Error in fetchData:', err);
        setError('Failed to load data');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [eventId, fetchAdmins, fetchApprovals]);

  return {
    approvals,
    authorizedAdmins,
    isLoading,
    error,
    updateApprovalStatus,
    canApprove,
  };
};