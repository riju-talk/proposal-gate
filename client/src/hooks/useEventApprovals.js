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
      
      // Ensure we have the expected data structure
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
      
      // Ensure we have an array of approvals
      if (!Array.isArray(data)) {
        console.error('Unexpected response format for approvals:', data);
        return;
      }
      
      // Sort approvals by approval_order if available
      const sortedApprovals = data.sort((a, b) => {
        const orderA = a.approval_order || (a.authorized_admins?.approval_order) || 0;
        const orderB = b.approval_order || (b.authorized_admins?.approval_order) || 0;
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
      const response = await fetch(`/api/events/${eventId}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          adminEmail,
          status,
          comments,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to update approval status');
      }

      // Refresh approvals after successful update
      await fetchApprovals(eventId);
      return { success: true };
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

    // Get the admin's approval order
    const admin = authorizedAdmins.find(aa => aa.email === adminEmail);
    if (!admin) return false;

    // If it's the first admin, they can always approve
    if (admin.approval_order === 1) return true;

    // For other admins, check if all previous admins have approved
    const previousAdmins = authorizedAdmins.filter(
      a => a.approval_order < admin.approval_order
    );

    return previousAdmins.every(prevAdmin => {
      const approval = approvals.find(a => a.admin_email === prevAdmin.email);
      return approval?.status === 'approved';
    });
  }, [user, eventId, authorizedAdmins, approvals]);

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
       