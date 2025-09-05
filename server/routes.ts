// server/routes.ts
import type { Express } from "express";
import { createServer, type Server } from "http";
import { eq } from "drizzle-orm";
import { db } from "./db";
import { eventProposals, eventApprovals, authorizedAdmins, otpVerifications } from "@shared/schema";
import { handleSendOTP, handleVerifyOTP } from "./services/auth";
import { requireAdmin } from "./middleware/auth";

export async function registerRoutes(app: Express): Promise<Server> {
  // === AUTH ROUTES ===
  app.post("/api/auth/send-otp", handleSendOTP);
  app.post("/api/auth/verify-otp", handleVerifyOTP);

  // === PUBLIC EVENT ROUTES ===
  app.get("/api/events", async (_req, res) => {
    const events = await db.select().from(eventProposals).orderBy(desc(eventProposals.createdAt));
    res.json(events);
  });

  app.get("/api/events/:id", async (req, res) => {
    const { id } = req.params;
    const [event] = await db.select().from(eventProposals).where(eq(eventProposals.id, id)).limit(1);
    if (!event) return res.status(404).json({ error: "Event not found" });
    res.json(event);
  });

  app.get("/api/events/:id/approvals", async (req, res) => {
    const { id } = req.params;
    const approvals = await db
      .select({
        id: eventApprovals.id,
        adminEmail: eventApprovals.adminEmail,
        adminName: authorizedAdmins.name,
        adminRole: authorizedAdmins.role,
        status: eventApprovals.status,
        comments: eventApprovals.comments,
        approvedAt: eventApprovals.approvedAt,
      })
      .from(eventApprovals)
      .leftJoin(authorizedAdmins, eq(eventApprovals.adminEmail, authorizedAdmins.email))
      .where(eq(eventApprovals.eventProposalId, id))
      .orderBy(asc(authorizedAdmins.approvalOrder));
    res.json(approvals);
  });

  // === ADMIN ROUTES ===
  app.patch("/api/events/:id/approve", requireAdmin, async (req, res) => {
    const { id } = req.params;
    const { comments } = req.body;
    const adminEmail = (req as any).user.email;

    const [approval] = await db
      .select()
      .from(eventApprovals)
      .where(eq(eventApprovals.eventProposalId, id), eq(eventApprovals.adminEmail, adminEmail))
      .limit(1);

    if (!approval) return res.status(404).json({ error: "Approval record not found" });

    await db.update(eventApprovals).set({
      status: "approved",
      comments: comments || null,
      approvedAt: new Date(),
    }).where(eq(eventApprovals.eventProposalId, id), eq(eventApprovals.adminEmail, adminEmail));

    res.json({ success: true, message: "Approved" });
  });

  app.patch("/api/events/:id/reject", requireAdmin, async (req, res) => {
    const { id } = req.params;
    const { comments } = req.body;
    const adminEmail = (req as any).user.email;

    const [approval] = await db
      .select()
      .from(eventApprovals)
      .where(eq(eventApprovals.eventProposalId, id), eq(eventApprovals.adminEmail, adminEmail))
      .limit(1);

    if (!approval) return res.status(404).json({ error: "Approval record not found" });

    await db.update(eventApprovals).set({
      status: "rejected",
      comments: comments || null,
      approvedAt: new Date(),
    }).where(eq(eventApprovals.eventProposalId, id), eq(eventApprovals.adminEmail, adminEmail));

    res.json({ success: true, message: "Rejected" });
  });

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "OK" });
  });

  const httpServer = createServer(app);
  return httpServer;
}