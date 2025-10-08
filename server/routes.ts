import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { eq, and, desc, asc, inArray } from "drizzle-orm";
import { db } from "./db";
import {
  eventProposals,
  clubProposals,
  authorizedAdmins,
  approvals,
} from "../shared/schema";

import { sendOTP, verifyOTP, getCurrentUser } from "./auth";
import { 
  securityMiddleware, 
  otpRateLimit, 
  verifyRateLimit, 
  requireAdmin, 
  optionalAuth 
} from "./middleware";
import { generateJWT, setAuthCookie, clearAuthCookie } from "./jwt";

export async function registerRoutes(app: Express): Promise<Server> {
  // Apply security middleware
  app.use(securityMiddleware);

  // ==================== AUTHENTICATION ROUTES ====================
  
  // Send OTP to email
  app.post("/api/auth/send-otp", otpRateLimit, async (req: Request, res: Response) => {
    try {
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({ error: "Email is required" });
      }

      const result = await sendOTP(email);
      
      if (result.success) {
        res.json({ success: true, message: "OTP sent successfully" });
      } else {
        res.status(400).json({ error: result.error });
      }
    } catch (error) {
      console.error("Send OTP error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/auth/verify-otp", verifyRateLimit, async (req: Request, res: Response) => {
    try {
      const { email, otp } = req.body;
      
      if (!email || !otp) {
        return res.status(400).json({ error: "Email and OTP are required" });
      }

      const result = await verifyOTP(email, otp);
      
      if (result.success && result.admin) {
        const token = generateJWT(result.admin);
        
        setAuthCookie(res, token);
        
        return res.json({ 
          success: true,
          admin: result.admin
        });
      } else {
        return res.status(400).json({ error: result.error || 'Invalid OTP' });
      }
    } catch (error) {
      console.error("Verify OTP error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/auth/logout", (req: Request, res: Response) => {
    clearAuthCookie(res);
    res.json({ success: true, message: "Logged out successfully" });
  });

  // Get current authenticated user
  app.get("/api/auth/me", optionalAuth, async (req: Request, res: Response) => {
    try {
      // Get email from the authenticated user (set by the optionalAuth middleware)
      const userEmail = (req as any).user?.email;
      
      if (!userEmail) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const result = await getCurrentUser(userEmail);
      
      if (result.success) {
        res.json({ user: result.user });
      } else {
        res.status(404).json({ error: result.error || "User not found" });
      }
    } catch (error) {
      console.error("Get current user error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // ==================== PROPOSALS LISTING (COMBINED) ====================
  // Public endpoint to fetch all proposals with a type label (event/club)
  app.get("/api/events", async (_req: Request, res: Response) => {
    try {
      const [events, clubs] = await Promise.all([
        db.select().from(eventProposals).orderBy(desc(eventProposals.created_at)),
        db.select().from(clubProposals).orderBy(desc(clubProposals.created_at)),
      ]);

      const eventIds = events.map((e: any) => e.id);
      const clubIds = clubs.map((c: any) => c.id);

      const [eventApprovalsAll, clubApprovalsAll, admins] = await Promise.all([
        eventIds.length
          ? db.select().from(approvals).where(and(inArray(approvals.proposal_id, eventIds), eq(approvals.type, 'event')))
          : Promise.resolve([] as any[]),
        clubIds.length
          ? db.select().from(approvals).where(and(inArray(approvals.proposal_id, clubIds), eq(approvals.type, 'club')))
          : Promise.resolve([] as any[]),
        db.select().from(authorizedAdmins).where(eq(authorizedAdmins.is_active, true)),
      ]);

      const totalAdmins = admins.length;

      const enrich = (items: any[], type: 'event' | 'club', approvalsArr: any[]) => {
        return items.map((it: any) => {
          const appr = approvalsArr.filter(a => a.proposal_id === it.id);
          const approvedCount = appr.filter(a => a.status === 'approved').length;
          return {
            ...it,
            type,
            approvals_summary: {
              approved: approvedCount,
              total: totalAdmins,
              complete: approvedCount === totalAdmins,
            },
          };
        });
      };

      const result = [
        ...enrich(events, 'event', eventApprovalsAll),
        ...enrich(clubs, 'club', clubApprovalsAll),
      ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      res.json(result);
    } catch (error) {
      console.error("Get proposals error:", error);
      res.status(500).json({ error: "Failed to fetch proposals" });
    }
  });

  // ==================== EVENT PROPOSAL ROUTES ====================
  // Get all proposals (admin only)
  app.get("/api/proposals", requireAdmin, async (_req: Request, res: Response) => {
    try {
      const proposals = await db
        .select()
        .from(eventProposals)
        .orderBy(desc(eventProposals.created_at));
      
      res.json(proposals);
    } catch (error) {
      console.error("Get event proposals error:", error);
      res.status(500).json({ error: "Failed to fetch event proposals" });
    }
  });

  // Get proposal by ID
  app.get("/api/proposals/:id", optionalAuth, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const [proposal] = await db
        .select()
        .from(eventProposals)
        .where(eq(eventProposals.id, id));

      if (!proposal) {
        return res.status(404).json({ error: "Event proposal not found" });
      }

      // Only show non-approved proposals to admins
      if (proposal.status !== 'approved' && !req.user) {
        return res.status(403).json({ error: "Access denied" });
      }

      res.json(proposal);
    } catch (error) {
      console.error("Get event proposal error:", error);
      res.status(500).json({ error: "Failed to fetch event proposal" });
    }
  });
  
  
  // Create or update an approval (by proposal and admin)
  app.get("/api/health", (_req: Request, res: Response) => {
    res.json({ 
      status: "OK", 
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development'
    });
  });

  // ================= APPROVALS =================
  // Get all approvals for a proposal (public) -
  app.get("/api/approvals/proposal/:id", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      const allApprovals = await db
        .select({
          id: approvals.id,
          admin_email: authorizedAdmins.email,
          admin_name: authorizedAdmins.name,
          role: authorizedAdmins.role,
          status: approvals.status,
          comments: approvals.comments,
          approved_at: approvals.approved_at,
          created_at: approvals.created_at,
          updated_at: approvals.updated_at,
          approval_order: authorizedAdmins.approval_order
        })
        .from(authorizedAdmins)
        .leftJoin(
          approvals,
          and(
            eq(approvals.admin_email, authorizedAdmins.email),
          )
        )
        .where(
          and(
            eq(authorizedAdmins.is_active, true),
            eq(approvals.proposal_id, id)
          )
        )
        .orderBy(asc(authorizedAdmins.approval_order));

      res.json(allApprovals);
    } catch (error) {
      console.error("Error fetching approvals:", error);
      res.status(500).json({ error: "Failed to fetch approvals" });
    }
  });

  // Approve by approval ID
  app.patch("/api/approvals/:id/approve", requireAdmin, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { comments } = req.body;
      const adminEmail = req.user?.email;

      const [approvalRow] = await db.select().from(approvals).where(eq(approvals.id, id));
      if (!approvalRow) return res.status(404).json({ error: 'Approval not found' });
      if (approvalRow.admin_email !== adminEmail) return res.status(403).json({ error: 'Cannot modify another admin\'s approval' });

      const [updated] = await db
        .update(approvals)
        .set({ status: 'approved', comments: comments || null, approved_at: new Date(), updated_at: new Date() })
        .where(eq(approvals.id, id))
        .returning();

      res.json(updated);
    } catch (error) {
      console.error("Error approving:", error);
      res.status(500).json({ error: "Failed to approve" });
    }
  });

  // Reject by approval ID
  app.patch("/api/approvals/:id/reject", requireAdmin, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { comments } = req.body;
      const adminEmail = req.user?.email;

      const [approvalRow] = await db.select().from(approvals).where(eq(approvals.id, id));
      if (!approvalRow) return res.status(404).json({ error: 'Approval not found' });
      if (approvalRow.admin_email !== adminEmail) return res.status(403).json({ error: 'Cannot modify another admin\'s approval' });

      const [updated] = await db
        .update(approvals)
        .set({ status: 'rejected', comments: comments || null, approved_at: null, updated_at: new Date() })
        .where(eq(approvals.id, id))
        .returning();

      res.json(updated);
    } catch (error) {
      console.error("Error rejecting:", error);
      res.status(500).json({ error: "Failed to reject" });
    }
  });

  // Legacy: Approve event by event ID (kept for compatibility)
  app.patch("/api/events/:id/approve", requireAdmin, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { comments } = req.body;
      const currentAdminEmail = req.user?.email;

      // Get the admin's approval record
      const [adminApproval] = await db
        .select()
        .from(approvals)
        .where(and(
          eq(approvals.proposal_id, id),
          eq(approvals.admin_email, currentAdminEmail),
          eq(approvals.type, 'event')
        ));

      if (!adminApproval) {
        return res.status(404).json({ error: "Approval record not found for this admin" });
      }

      // Update the approval
      const [updatedApproval] = await db
        .update(approvals)
        .set({
          status: 'approved',
          comments: comments || null,
          updated_at: new Date(),
          approved_at: new Date()
        })
        .where(and(
          eq(approvals.id, adminApproval.id)
        ))
        .returning();

      // Update the proposal status based on all approvals
      await updateProposalStatus(id, 'event');

      // Get the updated proposal
      const [proposal] = await db
        .select()
        .from(eventProposals)
        .where(eq(eventProposals.id, id));

      res.json({
        success: true,
        approval: updatedApproval,
        eventStatus: proposal?.status || 'pending',
        message: `Event ${proposal?.status === 'approved' ? 'fully approved' : 'approval recorded'}`
      });
    } catch (error) {
      console.error("Approve event error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Reject event
  app.patch("/api/events/:id/reject", requireAdmin, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { comments } = req.body;
      const currentAdminEmail = req.user?.email;

      // Get the admin's approval record
      const [adminApproval] = await db
        .select()
        .from(approvals)
        .where(and(
          eq(approvals.proposal_id, id),
          eq(approvals.admin_email, currentAdminEmail),
          eq(approvals.type, 'event')
        ));

      if (!adminApproval) {
        return res.status(404).json({ error: "Approval record not found for this admin" });
      }

      // Update the approval
      const [updatedApproval] = await db
        .update(approvals)
        .set({
          status: 'rejected',
          comments: comments || null,
          updated_at: new Date(),
          approved_at: null
        })
        .where(and(
          eq(approvals.id, adminApproval.id)
        ))
        .returning();

      // Update the proposal status to rejected
      await updateProposalStatus(id, 'event', 'rejected');

      res.json({
        success: true,
        approval: updatedApproval,
        eventStatus: 'rejected',
        message: "Event rejected"
      });
    } catch (error) {
      console.error("Reject error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Helper function to update proposal status based on approvals
  async function updateProposalStatus(proposalId: string, type: string, forceStatus?: string): Promise<void> {
    if (forceStatus) {
      // If forceStatus is provided (e.g., when rejecting), update immediately for events only
      if (type === 'event') {
        await db
          .update(eventProposals)
          .set({
            status: forceStatus,
            updated_at: new Date(),
          })
          .where(eq(eventProposals.id, proposalId));
      }
      return;
    }

    // Check if all admins have approved
    const allApprovals = await db
      .select()
      .from(approvals)
      .leftJoin(authorizedAdmins, eq(approvals.admin_email, authorizedAdmins.email))
      .where(and(
        eq(approvals.proposal_id, proposalId),
        eq(approvals.type, type),
        eq(authorizedAdmins.is_active, true)
      ));

    // If any admin has rejected, reject the proposal
    const hasRejected = allApprovals.some((a: any) => a.approvals?.status === 'rejected');
    if (hasRejected) {
      if (type === 'event') {
        await db
          .update(eventProposals)
          .set({
            status: 'rejected',
            updated_at: new Date(),
          })
          .where(eq(eventProposals.id, proposalId));
      }
      return;
    }

    const approvedCount = allApprovals.filter((a: any) => a.approvals?.status === 'approved').length;
    const totalAdmins = allApprovals.length;

    let status = 'pending';
    if (approvedCount === totalAdmins) {
      status = 'approved';
    }

    // Update event table; club proposals don't have a status column in schema
    if (type === 'event') {
      await db
        .update(eventProposals)
        .set({
          status,
          updated_at: new Date(),
        })
        .where(eq(eventProposals.id, proposalId));
    }
  }
  // Health check endpoint

  const httpServer = createServer(app);
  return httpServer;
}