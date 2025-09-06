import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { eq, and, desc } from "drizzle-orm";
import { db } from "./db";
import { eventProposals, eventApprovals, authorizedAdmins } from "@shared/schema";
import { sendOTP, verifyOTP } from "./auth";
import { securityMiddleware, otpRateLimit, verifyRateLimit, requireAdmin } from "./middleware";
import { generateJWT } from "./jwt";

export async function registerRoutes(app: Express): Promise<Server> {
  // Apply security middleware
  app.use(securityMiddleware);

  // ==================== AUTHENTICATION ROUTES ====================
  
  // Send OTP for admin login
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

  // Verify OTP and login
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
        res.cookie('auth_token', token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          maxAge: 24 * 60 * 60 * 1000, // 24 hours
          path: '/',
        });
        
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

  // ==================== EVENT ROUTES ====================
  
  // Get all events (public)
  app.get("/api/events", async (req: Request, res: Response) => {
    try {
      const events = await db
        .select({
          id: eventProposals.id,
          eventName: eventProposals.eventName,
          organizerName: eventProposals.organizerName,
          organizerEmail: eventProposals.organizerEmail,
          eventType: eventProposals.eventType,
          eventDate: eventProposals.eventDate,
          startTime: eventProposals.startTime,
          endTime: eventProposals.endTime,
          venue: eventProposals.venue,
          expectedParticipants: eventProposals.expectedParticipants,
          budgetEstimate: eventProposals.budgetEstimate,
          description: eventProposals.description,
          objectives: eventProposals.objectives,
          status: eventProposals.status,
          createdAt: eventProposals.createdAt,
        })
        .from(eventProposals)
        .orderBy(desc(eventProposals.createdAt));

      res.json(events);
    } catch (error) {
      console.error("Get events error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Get event details by ID (public)
  app.get("/api/events/:id", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      const event = await db
        .select()
        .from(eventProposals)
        .where(eq(eventProposals.id, id))
        .limit(1);

      if (!event.length) {
        return res.status(404).json({ error: "Event not found" });
      }

      // Get approval details
      const approvals = await db
        .select({
          adminEmail: eventApprovals.adminEmail,
          status: eventApprovals.status,
          comments: eventApprovals.comments,
          approvedAt: eventApprovals.approvedAt,
        })
        .from(eventApprovals)
        .where(eq(eventApprovals.eventProposalId, id));

      res.json({
        event: event[0],
        approvals: approvals
      });
    } catch (error) {
      console.error("Get event details error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Approve event (protected)
  app.patch("/api/events/approve/:id", requireAdmin, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { comments } = req.body;
      const adminEmail = req.user?.email;

      if (!adminEmail) {
        return res.status(401).json({ error: "Admin authentication required" });
      }

      // Check if event exists
      const event = await db
        .select()
        .from(eventProposals)
        .where(eq(eventProposals.id, id))
        .limit(1);

      if (!event.length) {
        return res.status(404).json({ error: "Event not found" });
      }

      // Update or create approval record for this admin
      const existingApproval = await db
        .select()
        .from(eventApprovals)
        .where(
          and(
            eq(eventApprovals.eventProposalId, id),
            eq(eventApprovals.adminEmail, adminEmail)
          )
        )
        .limit(1);

      if (existingApproval.length) {
        // Update existing approval
        await db
          .update(eventApprovals)
          .set({
            status: 'approved',
            comments,
            approvedAt: new Date()
          })
          .where(eq(eventApprovals.id, existingApproval[0].id));
      } else {
        // Create new approval record
        await db
          .insert(eventApprovals)
          .values({
            eventProposalId: id,
            adminEmail,
            status: 'approved',
            comments,
            approvedAt: new Date()
          });
      }

      // Check if all active admins have approved
      const allAdmins = await db
        .select()
        .from(authorizedAdmins)
        .where(eq(authorizedAdmins.isActive, true));

      const allApprovals = await db
        .select()
        .from(eventApprovals)
        .where(eq(eventApprovals.eventProposalId, id));

      const approvedCount = allApprovals.filter(approval => approval.status === 'approved').length;
      const rejectedCount = allApprovals.filter(approval => approval.status === 'rejected').length;

      let eventStatus = 'pending';
      
      // If any admin rejected, event is rejected
      if (rejectedCount > 0) {
        eventStatus = 'rejected';
      } 
      // If all admins approved, event is approved
      else if (approvedCount === allAdmins.length) {
        eventStatus = 'approved';
      }

      // Update event status
      await db
        .update(eventProposals)
        .set({ status: eventStatus })
        .where(eq(eventProposals.id, id));

      res.json({ 
        success: true, 
        message: "Event approved successfully",
        eventStatus 
      });
    } catch (error) {
      console.error("Approve event error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Reject event (protected)
  app.patch("/api/events/reject/:id", requireAdmin, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { comments } = req.body;
      const adminEmail = req.user?.email;

      if (!adminEmail) {
        return res.status(401).json({ error: "Admin authentication required" });
      }

      // Check if event exists
      const event = await db
        .select()
        .from(eventProposals)
        .where(eq(eventProposals.id, id))
        .limit(1);

      if (!event.length) {
        return res.status(404).json({ error: "Event not found" });
      }

      // Update or create approval record for this admin
      const existingApproval = await db
        .select()
        .from(eventApprovals)
        .where(
          and(
            eq(eventApprovals.eventProposalId, id),
            eq(eventApprovals.adminEmail, adminEmail)
          )
        )
        .limit(1);

      if (existingApproval.length) {
        // Update existing approval
        await db
          .update(eventApprovals)
          .set({
            status: 'rejected',
            comments,
            approvedAt: null
          })
          .where(eq(eventApprovals.id, existingApproval[0].id));
      } else {
        // Create new approval record
        await db
          .insert(eventApprovals)
          .values({
            eventProposalId: id,
            adminEmail,
            status: 'rejected',
            comments,
            approvedAt: null
          });
      }

      // Since any rejection means event is rejected, update event status immediately
      await db
        .update(eventProposals)
        .set({ status: 'rejected' })
        .where(eq(eventProposals.id, id));

      res.json({ 
        success: true, 
        message: "Event rejected successfully",
        eventStatus: 'rejected'
      });
    } catch (error) {
      console.error("Reject event error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Health check endpoint
  app.get("/api/health", (req: Request, res: Response) => {
    res.json({ status: "OK", timestamp: new Date().toISOString() });
  });

  const httpServer = createServer(app);
  return httpServer;
}