import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertEventProposalSchema, insertProfileSchema } from "@shared/schema";
import { z } from "zod";
import { sendOTP, verifyOTP } from "./auth";
import { securityMiddleware, otpRateLimit, verifyRateLimit, requireAdmin } from "./middleware";

export async function registerRoutes(app: Express): Promise<Server> {
  // Apply security middleware
  app.use(securityMiddleware);

  // Authentication routes
  app.post("/api/auth/send-otp", otpRateLimit, async (req: Request, res: Response) => {
    try {
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({ error: "Email is required" });
      }

      const result = await sendOTP(email);
      
      if (result.success) {
        res.json({ message: "OTP sent successfully" });
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
      
      if (result.success) {
        // Generate a simple session token (in production, use JWT)
        const sessionToken = Buffer.from(`${email}:${Date.now()}`).toString('base64');
        
        res.json({ 
          success: true,
          admin: result.admin,
          token: sessionToken
        });
      } else {
        res.status(400).json({ error: result.error });
      }
    } catch (error) {
      console.error("Verify OTP error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Public routes (no auth required)
  app.get("/api/event-proposals/public", async (req: Request, res: Response) => {
    try {
      const proposals = await storage.getAllEventProposals();
      // Only return approved proposals for public view
      const publicProposals = proposals.filter(p => p.status === 'approved');
      res.json(publicProposals);
    } catch (error) {
      console.error("Get public event proposals error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/clubs/public", async (req: Request, res: Response) => {
    try {
      const clubs = await storage.getAllClubs();
      // Only return active clubs for public view
      const publicClubs = clubs.filter(c => c.isActive);
      res.json(publicClubs);
    } catch (error) {
      console.error("Get public clubs error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Coordinator routes (limited access, no auth required)
  app.get("/api/event-proposals/coordinator", async (req: Request, res: Response) => {
    try {
      const proposals = await storage.getAllEventProposals();
      // Coordinators can see pending and approved proposals
      const coordinatorProposals = proposals.filter(p => 
        p.status === 'pending' || p.status === 'approved'
      );
      res.json(coordinatorProposals);
    } catch (error) {
      console.error("Get coordinator event proposals error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Admin routes (require authentication)
  app.get("/api/event-proposals", requireAdmin, async (req: Request, res: Response) => {
    try {
      const proposals = await storage.getAllEventProposals();
      res.json(proposals);
    } catch (error) {
      console.error("Get event proposals error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/event-proposals", async (req: Request, res: Response) => {
    try {
      const validatedData = insertEventProposalSchema.parse(req.body);
      const proposal = await storage.createEventProposal(validatedData);
      
      // Create initial approvals for all authorized admins (except developer)
      const admins = await storage.getAllAuthorizedAdmins();
      const activeAdmins = admins.filter(admin => admin.isActive && admin.role !== 'developer');
      
      for (const admin of activeAdmins) {
        await storage.createEventApproval({
          eventProposalId: proposal.id,
          adminEmail: admin.email,
          status: "pending",
          approvedAt: null,
          comments: null,
        });
      }
      
      res.json(proposal);
    } catch (error) {
      console.error("Create event proposal error:", error);
      res.status(400).json({ error: "Invalid data" });
    }
  });

  app.get("/api/event-proposals/:id", async (req: Request, res: Response) => {
    try {
      const proposal = await storage.getEventProposal(req.params.id);
      if (!proposal) {
        return res.status(404).json({ error: "Event proposal not found" });
      }
      res.json(proposal);
    } catch (error) {
      console.error("Get event proposal error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.patch("/api/event-proposals/:id/status", requireAdmin, async (req: Request, res: Response) => {
    try {
      const { status } = req.body;
      const adminEmail = req.user.email;
      
      // Validate status
      if (!['approved', 'rejected', 'under_consideration'].includes(status)) {
        return res.status(400).json({ error: "Invalid status" });
      }

      const proposal = await storage.updateEventProposalStatus(req.params.id, status);
      if (!proposal) {
        return res.status(404).json({ error: "Event proposal not found" });
      }

      // Update the admin's approval record
      const approvals = await storage.getEventApprovals(req.params.id);
      const adminApproval = approvals.find(a => a.adminEmail === adminEmail);
      
      if (adminApproval) {
        await storage.updateEventApproval(adminApproval.id, {
          status,
          approvedAt: status === "approved" ? new Date(new Date().toISOString()) : null,
          comments: req.body.comments || null,
        });
      }

      res.json(proposal);
    } catch (error) {
      console.error("Update event proposal status error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Event approval routes
  app.get("/api/event-proposals/:id/approvals", async (req: Request, res: Response) => {
    try {
      const approvals = await storage.getEventApprovals(req.params.id);
      res.json(approvals);
    } catch (error) {
      console.error("Get event approvals error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.patch("/api/event-approvals/:eventId/:adminEmail", requireAdmin, async (req: Request, res: Response) => {
    try {
      const { status, comments } = req.body;
      const { eventId, adminEmail } = req.params;
      const requestingAdminEmail = req.user.email;
      
      // Ensure admin can only update their own approval
      if (requestingAdminEmail !== decodeURIComponent(adminEmail)) {
        return res.status(403).json({ error: "Can only update your own approval" });
      }
      
      // Validate status
      if (!['approved', 'rejected', 'under_consideration'].includes(status)) {
        return res.status(400).json({ error: "Invalid status" });
      }
      
      const approvals = await storage.getEventApprovals(eventId);
      const approval = approvals.find(a => a.adminEmail === decodeURIComponent(adminEmail));
      
      if (!approval) {
        return res.status(404).json({ error: "Event approval not found" });
      }
      
      const updatedApproval = await storage.updateEventApproval(approval.id, {
        status,
        comments,
        approvedAt: status === "approved" ? new Date(new Date().toISOString()) : null,
      });
      
      res.json(updatedApproval);
    } catch (error) {
      console.error("Update event approval error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Club routes
  app.get("/api/clubs", async (req: Request, res: Response) => {
    try {
      const clubs = await storage.getAllClubs();
      res.json(clubs);
    } catch (error) {
      console.error("Get clubs error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/club-formation-requests", async (req: Request, res: Response) => {
    try {
      const requests = await storage.getAllClubFormationRequests();
      res.json(requests);
    } catch (error) {
      console.error("Get club formation requests error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/club-formation-requests", async (req: Request, res: Response) => {
    try {
      const request = await storage.createClubFormationRequest(req.body);
      res.json(request);
    } catch (error) {
      console.error("Create club formation request error:", error);
      res.status(400).json({ error: "Invalid data" });
    }
  });

  app.patch("/api/club-formation-requests/:id", requireAdmin, async (req: Request, res: Response) => {
    try {
      const { status, comments } = req.body;
      const { id } = req.params;
      
      // Validate status
      if (!['approved', 'rejected', 'under_consideration'].includes(status)) {
        return res.status(400).json({ error: "Invalid status" });
      }
      
      // Update club formation request status
      // Note: You'll need to implement this in storage.ts
      res.json({ success: true, id, status });
    } catch (error) {
      console.error("Update club formation request error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Authorized admin routes
  app.get("/api/authorized-admins", async (req: Request, res: Response) => {
    try {
      const admins = await storage.getAllAuthorizedAdmins();
      // Filter out developer role for public API
      const publicAdmins = admins.filter(admin => admin.role !== 'developer');
      res.json(publicAdmins);
    } catch (error) {
      console.error("Get authorized admins error:", error);
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