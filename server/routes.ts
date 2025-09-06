// server/routes.ts
import { Express, Request, Response } from "express";
import { handleSendOTP, handleVerifyOTP } from "./services/auth";
import { storage } from "./storage";
import { requireAuth } from "./middleware/auth";

export function registerRoutes(app: Express) {
  // ================= AUTH =================
  app.post("/api/auth/send-otp", handleSendOTP);
  app.post("/api/auth/verify-otp", handleVerifyOTP);

  // ================= EVENTS =================
  app.get("/api/event-proposals", async (_req: Request, res: Response) => {
    try {
      const events = await storage.getEvents();
      res.json(events);
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch events" });
    }
  });

  app.get("/api/event-proposals/:id", async (req: Request, res: Response) => {
    try {
      const event = await storage.getEvent(req.params.id);
      if (!event) return res.status(404).json({ error: "Event not found" });
      res.json(event);
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch event" });
    }
  });

  // ================= APPROVALS =================
  app.get(
    "/api/event-proposals/:id/approvals",
    async (req: Request, res: Response) => {
      try {
        const approvals = await storage.getApprovals(req.params.id);
        res.json(approvals);
      } catch (err) {
        res.status(500).json({ error: "Failed to fetch approvals" });
      }
    }
  );

  app.post(
    "/api/event-proposals/:id/approve",
    requireAuth(["admin"]),
    async (req: Request, res: Response) => {
      try {
        const user = (req as any).user; // from JWT
        await storage.approveEvent(req.params.id, user.email, req.body.comments || "");
        res.json({ success: true, message: "Event approved" });
      } catch (err) {
        res.status(500).json({ error: "Failed to approve event" });
      }
    }
  );

  app.post(
    "/api/event-proposals/:id/reject",
    requireAuth(["admin"]),
    async (req: Request, res: Response) => {
      try {
        const user = (req as any).user;
        await storage.rejectEvent(req.params.id, user.email, req.body.comments || "");
        res.json({ success: true, message: "Event rejected" });
      } catch (err) {
        res.status(500).json({ error: "Failed to reject event" });
      }
    }
  );

  // Optional granular: get approval status of a specific admin
  app.get(
    "/api/event-proposals/:id/approvals/:adminEmail",
    requireAuth(["admin"]),
    async (req: Request, res: Response) => {
      try {
        const approvals = await storage.getApprovals(req.params.id);
        const adminApproval = approvals.find(
          (a: any) => a.admin?.email === req.params.adminEmail
        );
        if (!adminApproval) return res.status(404).json({ error: "Approval not found" });
        res.json(adminApproval);
      } catch (err) {
        res.status(500).json({ error: "Failed to fetch admin approval status" });
      }
    }
  );
}
