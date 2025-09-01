import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api';

export interface EventApproval {
  id: string;
  event_proposal_id: string;
  admin_email: string;
  approved_at: string | null;
  comments: string | null;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
  admin_name?: string;
  admin_role?: string;
  approval_order?: number;
}

export interface AuthorizedAdmin {
  id: string;
  email: string;
  name: string;
  role: string;
  approval_order: number;
  is_active: boolean;
}

export const useEventApprovals = (eventId?: string) => {
  const [approvals, setApprovals] = useState<EventApproval[]>([]);
  const [authorizedAdmins, setAuthorizedAdmins] = useState<AuthorizedAdmin[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      
      // Fetch authorized admins (exclude developer role)
      const { data: admins, error: adminsError } = await apiClient.getAuthorizedAdmins();

      if (adminsError) {
        console.error('Error fetching authorized admins:', adminsError);
        setIsLoading(false);
        return;
      }

      const filteredAdmins = (admins || []).filter((admin: any) => 
        admin.is_active && admin.role !== 'developer'
      ).sort((a: any, b: any) => a.approval_order - b.approval_order);
      
      setAuthorizedAdmins(filteredAdmins);

      // Fetch approvals if eventId is provided
      if (eventId) {
        const { data: approvalsData, error: approvalsError } = await apiClient.getEventApprovals(eventId);

        if (approvalsError) {
          console.error('Error fetching approvals:', approvalsError);
          setIsLoading(false);
          return;
        }

        // Map admin data to approvals
        const mappedApprovals = (approvalsData || []).map((approval: any) => {
          const admin = filteredAdmins.find((a: any) => a.email === approval.admin_email);
          return {
            ...approval,
            admin_name: admin?.name || approval.admin_email,
            admin_role: admin?.role || 'unknown',
            approval_order: admin?.approval_order || 999
          };
        }).sort((a: any, b: any) => a.approval_order - b.approval_order);

        setApprovals(mappedApprovals);
      }

      setIsLoading(false);
    };

    fetchData();
  }, [eventId]);

  const updateApprovalStatus = async (
    eventProposalId: string, 
    adminEmail: string, 
    status: 'approved' | 'rejected', 
    comments?: string
  ) => {
    const { error } = await apiClient.updateEventApprovalByProposalAndAdmin(
      eventProposalId, 
      adminEmail, 
      status, 
      comments
    );
    
    if (error) {
      console.error('Error updating approval:', error);
      return { success: false, error };
    }

    // Update local state
    setApprovals(prev => 
      prev.map(approval => 
        approval.event_proposal_id === eventProposalId && approval.admin_email === adminEmail
          ? { 
              ...approval, 
              status, 
              comments,
              approved_at: status === 'approved' ? new Date().toISOString() : null,
              updated_at: new Date().toISOString()
            }
          : approval
      )
    );

    return { success: true };
  };

  const canApprove = (adminEmail: string, eventProposalId: string): { canApprove: boolean; reason?: string } => {
    const admin = authorizedAdmins.find(a => a.email === adminEmail);
    if (!admin) return { canApprove: false, reason: 'Not an authorized admin' };

    const eventApprovals = approvals.filter(a => a.event_proposal_id === eventProposalId);
    const adminApproval = eventApprovals.find(a => a.admin_email === adminEmail);
    
    if (adminApproval?.status !== 'pending') {
      return { canApprove: false, reason: 'Already processed' };
    }

    // Special rules for final approver (Smriti ma'am)
    if (admin.role === 'final_approver') {
      const coreMembers = ['president', 'vice_president', 'treasurer', 'sa_office', 'faculty_advisor'];
      const coreApprovals = eventApprovals.filter(a => {
        const approverAdmin = authorizedAdmins.find(aa => aa.email === a.admin_email);
        return approverAdmin && coreMembers.includes(approverAdmin.role);
      });
      
      const allCoreApproved = coreApprovals.every(a => a.status === 'approved');
      if (!allCoreApproved) {
        return { canApprove: false, reason: 'All other members must approve first' };
      }
    }

    // Special rules for SA office
    if (admin.role === 'sa_office') {
      const coreMembers = ['president', 'vice_president', 'treasurer'];
      const coreApprovals = eventApprovals.filter(a => {
        const approverAdmin = authorizedAdmins.find(aa => aa.email === a.admin_email);
        return approverAdmin && coreMembers.includes(approverAdmin.role);
      });
      
      const allCoreApproved = coreApprovals.every(a => a.status === 'approved');
      if (!allCoreApproved) {
        return { canApprove: false, reason: 'Core student council members must approve first' };
      }
    }

    return { canApprove: true };
  };

  return {
    approvals,
    authorizedAdmins,
    isLoading,
    updateApprovalStatus,
    canApprove
  };
};
