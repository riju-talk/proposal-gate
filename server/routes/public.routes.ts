import { Router } from 'express';
import { eq } from 'drizzle-orm';
import { db } from '../db';
import { eventApprovals, eventProposals, authorizedAdmins } from '@shared/schema';

interface ApprovalWithProfile {
  adminName: string | null;
  adminEmail: string | null;
  adminRole: string | null;
  status: 'pending' | 'approved' | 'rejected';
  comments: string | null;
  approvedAt: Date | null;
  updatedAt: Date | null;
}

const router = Router();

// Get public approval status for an event
router.get('/event-proposals/:id/approval-status', async (req, res) => {
  try {
    const eventId = req.params.id;

    // Get the event
    const [event] = await db
      .select()
      .from(eventProposals)
      .where(eq(eventProposals.id, eventId))
      .limit(1);

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Get all approvals for this event with admin details
    const approvals = await db
      .select({
        adminName: authorizedAdmins.name,
        adminEmail: eventApprovals.adminEmail,
        adminRole: authorizedAdmins.role,
        status: eventApprovals.status,
        comments: eventApprovals.comments,
        approvedAt: eventApprovals.updatedAt,
        updatedAt: eventApprovals.updatedAt,
      })
      .from(eventApprovals)
      .leftJoin(authorizedAdmins, eq(eventApprovals.adminEmail, authorizedAdmins.email))
      .where(eq(eventApprovals.eventProposalId, eventId))
      .orderBy(authorizedAdmins.name);

    // Determine overall status
    let status: 'pending' | 'fully_approved' | 'rejected' | 'under_consideration' = 'pending';
    
    if (approvals.some((approval: ApprovalWithProfile) => approval.status === 'rejected')) {
      status = 'rejected';
    } else if (approvals.length > 0 && approvals.every((approval: ApprovalWithProfile) => approval.status === 'approved')) {
      status = 'fully_approved';
    } else if (approvals.length > 0) {
      status = 'under_consideration';
    }

    // Get all required approvers who haven't approved/rejected yet
    const allApprovers = await db
      .select({
        name: authorizedAdmins.name,
        email: authorizedAdmins.email,
        role: authorizedAdmins.role,
      })
      .from(authorizedAdmins)
      .where(eq(authorizedAdmins.isActive, true))
      .orderBy(authorizedAdmins.name);

    // Merge with existing approvals to include pending approvers
    const allApprovals = allApprovers.map((approver: { name: string; email: string; role: string }) => {
      const existingApproval = approvals.find((a: ApprovalWithProfile) => a.adminEmail === approver.email);
      return existingApproval || {
        adminName: approver.name,
        adminEmail: approver.email,
        adminRole: approver.role,
        status: 'pending' as const,
        comments: null,
        approvedAt: null,
        updatedAt: null,
      };
    });

    res.json({
      status,
      lastUpdated: new Date().toISOString(),
      approvals: allApprovals.map((approval: ApprovalWithProfile) => ({
        adminName: approval.adminName || approval.adminEmail || 'Unknown',
        adminEmail: approval.adminEmail || null,
        adminRole: approval.adminRole || 'admin',
        status: approval.status,
        comments: approval.comments,
        approvedAt: approval.updatedAt?.toISOString() || null,
      })),
    });
  } catch (error) {
    console.error('Error fetching public approval status:', error);
    res.status(500).json({ error: 'Failed to fetch approval status' });
  }
});

export default router;
