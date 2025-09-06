import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { eq, and, desc, asc } from "drizzle-orm";
import { db } from "./db";
import { eventProposals, eventApprovals, authorizedAdmins, clubFormationRequests, clubs } from "@shared/schema";
import { sendOTP, verifyOTP } from "./auth";
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

      // Filter based on user role
      if (!req.user) {
        // Public users - only approved events
        query = query.where(eq(eventProposals.status, 'approved'));
      } else if (req.user.role !== 'admin') {
        // Coordinators - pending and approved events
        query = query.where(eq(eventProposals.status, 'pending'));
      }
      // Admins see all events

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

  // ==================== ADMIN EVENT APPROVAL ROUTES ====================
  
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

  // Mark event for review
  app.patch("/api/events/:id/review", requireAdmin, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { comments } = req.body;
      const currentAdminEmail = req.user?.email;

      // Update the approval to under review
      const [updatedApproval] = await db
        .update(eventApprovals)
        .set({
          status: 'under_review',
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

      res.json({
        success: true,
        approval: updatedApproval,
        message: "Event marked for further review"
      });
    } catch (error) {
      console.error("Mark for review error:", error);
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

  // ==================== CLUB ROUTES ====================
  
  // Get all clubs (public)
  app.get("/api/clubs", async (req: Request, res: Response) => {
    try {
      const clubs = await db
        .select()
        .from(clubs)
        .where(eq(clubs.isActive, true))
        .orderBy(desc(clubs.createdAt));

      res.json(clubs);
    } catch (error) {
      console.error("Get clubs error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Get club formation requests
  app.get("/api/club-formation-requests", optionalAuth, async (req: Request, res: Response) => {
    try {
      let query = db.select().from(clubFormationRequests);

      // Filter based on user role
      if (!req.user) {
        // Public users - only approved clubs
        query = query.where(eq(clubFormationRequests.status, 'approved'));
      }
      // Admins and coordinators see all

      const requests = await query.orderBy(desc(clubFormationRequests.createdAt));
      res.json(requests);
    } catch (error) {
      console.error("Get club requests error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Approve club formation request
  app.patch("/api/club-formation-requests/:id/approve", requireAdmin, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { comments } = req.body;

      const [updatedRequest] = await db
        .update(clubFormationRequests)
        .set({
          status: 'approved',
          updatedAt: new Date(),
        })
        .where(eq(clubFormationRequests.id, id))
        .returning();

      if (!updatedRequest) {
        return res.status(404).json({ error: "Club request not found" });
      }

      res.json({
        success: true,
        request: updatedRequest,
        message: "Club formation request approved"
      });
    } catch (error) {
      console.error("Approve club error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Reject club formation request
  app.patch("/api/club-formation-requests/:id/reject", requireAdmin, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { comments } = req.body;

      const [updatedRequest] = await db
        .update(clubFormationRequests)
        .set({
          status: 'rejected',
          updatedAt: new Date(),
        })
        .where(eq(clubFormationRequests.id, id))
        .returning();

      if (!updatedRequest) {
        return res.status(404).json({ error: "Club request not found" });
      }

      res.json({
        success: true,
        request: updatedRequest,
        message: "Club formation request rejected"
      });
    } catch (error) {
      console.error("Reject club error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Get authorized admins list
  app.get("/api/admins", async (req: Request, res: Response) => {
    try {
      const admins = await db
        .select({
          id: authorizedAdmins.id,
          email: authorizedAdmins.email,
          name: authorizedAdmins.name,
          role: authorizedAdmins.role,
          approval_order: authorizedAdmins.approvalOrder,
          is_active: authorizedAdmins.isActive,
        })
        .from(authorizedAdmins)
        .where(eq(authorizedAdmins.isActive, true))
        .orderBy(asc(authorizedAdmins.approvalOrder));

      res.json(admins);
    } catch (error) {
      console.error("Get admins error:", error);
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