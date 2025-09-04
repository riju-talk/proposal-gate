import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { eq, and, desc, asc } from "drizzle-orm";
import { db } from "./db";
import { eventProposals, eventApprovals, authorizedAdmins, clubFormationRequests, clubs } from "@shared/schema";
import { sendOTP, verifyOTP } from "./auth";
import { securityMiddleware, otpRateLimit, verifyRateLimit, requireAdmin } from "./middleware";
import { generateJWT } from "./jwt";

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
        
        res.json({ 
          success: true,
          admin: result.admin,
          token: token
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
    res.json({ success: true, message: "Logged out successfully" });
  });

  // ==================== PUBLIC EVENT ROUTES ====================
  
  // Get all events for public view (approved events only)
  app.get("/api/event-proposals/public", async (req: Request, res: Response) => {
    try {
      const events = await db
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
        .from(eventProposals)
        .orderBy(desc(eventProposals.eventDate));

      res.json(events);
      //console.log(events);
    } catch (error) {
      console.error("Get public events error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Get single event details for public view
  app.get("/api/event-proposals/public/:id", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      const [event] = await db
        .select()
        .from(eventProposals)
        .where(and(
          eq(eventProposals.id, id),
          eq(eventProposals.status, 'approved')
        ))
        .limit(1);

      if (!event) {
        return res.status(404).json({ error: "Event not found" });
      }

      res.json(event);
    } catch (error) {
      console.error("Get public event error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // ==================== ADMIN EVENT ROUTES ====================
  
  // Get all events for admin view
  app.get("/api/event-proposals", requireAdmin, async (req: Request, res: Response) => {
    try {
      const events = await db
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
        .from(eventProposals)
        .orderBy(desc(eventProposals.createdAt));

      res.json(events);
    } catch (error) {
      console.error("Get admin events error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Get single event with approval details for admin
  app.get("/api/event-proposals/:id", requireAdmin, async (req: Request, res: Response) => {
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

      // Get approval details
      const approvals = await db
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

      res.json({
        ...event,
        approvals
      });
    } catch (error) {
      console.error("Get admin event error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Get event approvals for specific event
  app.get("/api/events/:id/approvals", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      const approvals = await db
        .select({
          id: eventApprovals.id,
          event_proposal_id: eventApprovals.eventProposalId,
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

      res.json(approvals);
    } catch (error) {
      console.error("Get event approvals error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Update individual admin approval
  app.post("/api/events/:id/approve", requireAdmin, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { adminEmail, status, comments } = req.body;
      const currentAdminEmail = req.user?.email;

      // Verify the admin is trying to update their own approval
      if (adminEmail !== currentAdminEmail) {
        return res.status(403).json({ error: "You can only update your own approval" });
      }

      // Validate status
      if (!['approved', 'rejected'].includes(status)) {
        return res.status(400).json({ error: "Invalid status. Must be 'approved' or 'rejected'" });
      }

      // Update the approval
      const [updatedApproval] = await db
        .update(eventApprovals)
        .set({
          status,
          comments: comments || null,
          approvedAt: status === 'approved' ? new Date() : null,
          updatedAt: new Date(),
        })
        .where(and(
          eq(eventApprovals.eventProposalId, id),
          eq(eventApprovals.adminEmail, adminEmail)
        ))
        .returning();

      if (!updatedApproval) {
        return res.status(404).json({ error: "Approval record not found" });
      }

      // Check if all admins have made their decision
      const allApprovals = await db
        .select()
        .from(eventApprovals)
        .where(eq(eventApprovals.eventProposalId, id));

      const totalAdmins = allApprovals.length;
      const approvedCount = allApprovals.filter(a => a.status === 'approved').length;
      const rejectedCount = allApprovals.filter(a => a.status === 'rejected').length;

      let eventStatus = 'pending';
      
      // If any admin rejects, the event is rejected
      if (rejectedCount > 0) {
        eventStatus = 'rejected';
      }
      // If all admins approve, the event is approved
      else if (approvedCount === totalAdmins) {
        eventStatus = 'approved';
      }
      // Otherwise, it remains pending

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
        message: `Event ${eventStatus === 'approved' ? 'fully approved' : eventStatus}`
      });
    } catch (error) {
      console.error("Update approval error:", error);
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

  // ==================== COORDINATOR ROUTES ====================
  
  // Coordinator view (pending and approved events)
  app.get("/api/event-proposals/coordinator", async (req: Request, res: Response) => {
    try {
      const events = await db
        .select()
        .from(eventProposals)
        .where(eq(eventProposals.status, 'pending'))
        .orderBy(desc(eventProposals.createdAt));

      res.json(events);
    } catch (error) {
      console.error("Get coordinator events error:", error);
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