import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { eq, and, desc, asc } from "drizzle-orm";
import { db } from "./db";
import { eventProposals, eventApprovals, authorizedAdmins } from "../shared/schema";
import { sendOTP, verifyOTP, getCurrentUser } from "./auth";
import { securityMiddleware, otpRateLimit, verifyRateLimit, requireAdmin, optionalAuth } from "./middleware";
import { generateJWT, setAuthCookie, clearAuthCookie } from "./jwt";

export async function registerRoutes(app: Express): Promise<Server> {
  // Apply security middleware
  app.use(securityMiddleware);

  // ==================== AUTHENTICATION ROUTES ====================
  
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
        
        // Set HTTP-only cookie
        setAuthCookie(res, token);
        
        res.json({ 
          success: true,
          admin: result.admin
        });
      } else {
        res.status(400).json({ error: result.error });
      }
    } catch (error) {
      console.error("Verify OTP error:", error);
      res.status(500).json({ error: "Internal server error" });
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

  // ==================== PUBLIC EVENT ROUTES ====================
  
  // Get all events for public view (approved events only)
  app.get("/api/events", optionalAuth, async (req: Request, res: Response) => {
    try {
      let query = db
        .select({
          id: eventProposals.id,
          event_name: eventProposals.eventName,
          organizer_name: eventProposals.organizerName,
          organizer_email: eventProposals.organizerEmail,
          organizer_phone: eventProposals.organizerPhone,
          event_type: eventProposals.eventType,
          event_date: eventProposals.eventDate,
          start_time: eventProposals.startTime,
          end_time: eventProposals.endTime,
          venue: eventProposals.venue,
          expected_participants: eventProposals.expectedParticipants,
          budget_estimate: eventProposals.budgetEstimate,
          description: eventProposals.description,
          objectives: eventProposals.objectives,
          additional_requirements: eventProposals.additionalRequirements,
          pdf_document_url: eventProposals.pdfDocumentUrl,
          status: eventProposals.status,
          created_at: eventProposals.createdAt,
          updated_at: eventProposals.updatedAt,
        })
        .from(eventProposals);

      const events = await query.orderBy(desc(eventProposals.createdAt));
      res.json(events);
    } catch (error) {
      console.error("Get events error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Get single event details
  app.get("/api/events/:id", optionalAuth, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      const [event] = await db
        .select()
        .from(eventProposals)
        .where(eq(eventProposals.id, id))
        .limit(1);

      if (!event) {
        return res.status(404).json({ error: "Event not found" });
      }

      // Check access permissions
      if (!req.user && event.status !== 'approved') {
        return res.status(403).json({ error: "Access denied" });
      }

      // Get approval details for admins
      let approvals = [];
      if (req.user?.role === 'admin') {
        approvals = await db
          .select({
            id: eventApprovals.id,
            admin_email: eventApprovals.adminEmail,
            status: eventApprovals.status,
            comments: eventApprovals.comments,
            approved_at: eventApprovals.approvedAt,
            created_at: eventApprovals.createdAt,
            updated_at: eventApprovals.updatedAt,
            admin_name: authorizedAdmins.name,
            admin_role: authorizedAdmins.role,
            approval_order: authorizedAdmins.approvalOrder,
          })
          .from(eventApprovals)
          .leftJoin(authorizedAdmins, eq(eventApprovals.adminEmail, authorizedAdmins.email))
          .where(eq(eventApprovals.eventProposalId, id))
          .orderBy(asc(authorizedAdmins.approvalOrder));
      }

      res.json({
        ...event,
        approvals
      });
    } catch (error) {
      console.error("Get event error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // ================= APPROVALS =================
  app.get("/api/event-proposals/:id/approvals", optionalAuth, 
    async (req: Request, res: Response) => {
      try {
        const { id } = req.params;
        const approvals = await db
          .select({
            admin_email: eventApprovals.adminEmail,
            status: eventApprovals.status,
            comments: eventApprovals.comments,
            approved_at: eventApprovals.approvedAt,
            created_at: eventApprovals.createdAt,
            updated_at: eventApprovals.updatedAt,
            admin_name: authorizedAdmins.name,
            admin_role: authorizedAdmins.role,
            approval_order: authorizedAdmins.approvalOrder,
          })
          .from(eventApprovals)
          .leftJoin(authorizedAdmins, eq(eventApprovals.adminEmail, authorizedAdmins.email))
          .where(eq(eventApprovals.eventProposalId, id))
          .orderBy(asc(authorizedAdmins.approvalOrder));
        
        res.json({ approvals });
      } catch (err) {
        console.error("Get approvals error:", err);
        res.status(500).json({ error: "Failed to fetch approvals" });
      }
    }
  );

  // Approve event
  app.patch("/api/events/:id/approve", requireAdmin, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { comments } = req.body;
      const currentAdminEmail = req.user?.email;

      // Update the approval
      const [updatedApproval] = await db
        .update(eventApprovals)
        .set({
          status: 'approved',
          comments: comments || null,
          approvedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(and(
          eq(eventApprovals.eventProposalId, id),
          eq(eventApprovals.adminEmail, currentAdminEmail)
        ))
        .returning();

      if (!updatedApproval) {
        return res.status(404).json({ error: "Approval record not found" });
      }

      // Check if all admins have approved
      const allApprovals = await db
        .select()
        .from(eventApprovals)
        .leftJoin(authorizedAdmins, eq(eventApprovals.adminEmail, authorizedAdmins.email))
        .where(and(
          eq(eventApprovals.eventProposalId, id),
          eq(authorizedAdmins.isActive, true),
          eq(authorizedAdmins.role, 'developer') // Exclude developer
        ));

      const approvedCount = allApprovals.filter(a => a.event_approvals?.status === 'approved').length;
      const totalAdmins = allApprovals.length;

      let eventStatus = 'pending';
      if (approvedCount === totalAdmins) {
        eventStatus = 'approved';
      }

      // Update event status
      await db
        .update(eventProposals)
        .set({
          status: eventStatus,
          updatedAt: new Date(),
        })
        .where(eq(eventProposals.id, id));

      res.json({
        success: true,
        approval: updatedApproval,
        eventStatus,
        message: `Event ${eventStatus === 'approved' ? 'fully approved' : 'approval recorded'}`
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

      // Update the approval
      const [updatedApproval] = await db
        .update(eventApprovals)
        .set({
          status: 'rejected',
          comments: comments || null,
          updatedAt: new Date(),
        })
        .where(and(
          eq(eventApprovals.eventProposalId, id),
          eq(eventApprovals.adminEmail, currentAdminEmail)
        ))
        .returning();

      if (!updatedApproval) {
        return res.status(404).json({ error: "Approval record not found" });
      }

      // Update event status to rejected
      await db
        .update(eventProposals)
        .set({
          status: 'rejected',
          updatedAt: new Date(),
        })
        .where(eq(eventProposals.id, id));

      res.json({
        success: true,
        approval: updatedApproval,
        eventStatus: 'rejected',
        message: "Event rejected"
      });
    } catch (error) {
      console.error("Reject event error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Health check endpoint
  app.get("/api/health", (req: Request, res: Response) => {
    res.json({ 
      status: "OK", 
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development'
    });
  });

  const httpServer = createServer(app);
  return httpServer;
}