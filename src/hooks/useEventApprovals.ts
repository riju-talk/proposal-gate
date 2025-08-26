import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

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
      
      // Fetch authorized admins
      const { data: admins, error: adminsError } = await supabase
        .from('authorized_admins')
        .select('*')
        .eq('is_active', true)
        .order('approval_order', { ascending: true });

      if (adminsError) {
        console.error('Error fetching authorized admins:', adminsError);
        setIsLoading(false);
        return;
      }

      setAuthorizedAdmins(admins || []);

      // Fetch approvals if eventId is provided
      if (eventId) {
        const { data: approvalsData, error: approvalsError } = await supabase
          .from('event_approvals')
          .select(`
            *,
            authorized_admins!inner(name, role, approval_order)
          `)
          .eq('event_proposal_id', eventId)
          .order('authorized_admins.approval_order', { ascending: true });

        if (approvalsError) {
          console.error('Error fetching approvals:', approvalsError);
          setIsLoading(false);
          return;
        }

        const mappedApprovals = approvalsData?.map((approval: any) => ({
          ...approval,
          admin_name: approval.authorized_admins.name,
          admin_role: approval.authorized_admins.role,
          approval_order: approval.authorized_admins.approval_order
        })) || [];

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
    const { error } = await supabase
      .from('event_approvals')
      .update({ 
        status,
        comments,
        approved_at: status === 'approved' ? new Date().toISOString() : null,
        updated_at: new Date().toISOString()
      })
      .eq('event_proposal_id', eventProposalId)
      .eq('admin_email', adminEmail);
    
    if (error) {
      console.error('Error updating approval:', error);
      return { success: false, error: error.message };
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