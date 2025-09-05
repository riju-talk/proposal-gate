// server/storage.ts
import { db } from "./db";
import { eventProposals, eventApprovals, authorizedAdmins } from "@shared/schema";
import { eq } from "drizzle-orm";

export interface IStorage {
  getEvents(): Promise<any[]>;
  getEvent(id: string): Promise<any | null>;
  getApprovals(id: string): Promise<any[]>;
  approveEvent(id: string, adminEmail: string, comments: string): Promise<void>;
  rejectEvent(id: string, adminEmail: string, comments: string): Promise<void>;
}

export class Storage implements IStorage {
  async getEvents() {
    return await db.select().from(eventProposals);
  }

  async getEvent(id: string) {
    const [event] = await db.select().from(eventProposals).where(eq(eventProposals.id, id));
    return event || null;
  }

  async getApprovals(id: string) {
    return await db
      .select()
      .from(eventApprovals)
      .leftJoin(authorizedAdmins, eq(eventApprovals.adminEmail, authorizedAdmins.email))
      .where(eq(eventApprovals.eventProposalId, id));
  }

  async approveEvent(id: string, adminEmail: string, comments: string) {
    await db
      .update(eventApprovals)
      .set({
        status: "approved",
        comments,
        approvedAt: new Date(),
      })
      .where(eq(eventApprovals.eventProposalId, id));
  }

  async rejectEvent(id: string, adminEmail: string, comments: string) {
    await db
      .update(eventApprovals)
      .set({
        status: "rejected",
        comments,
        approvedAt: new Date(),
      })
      .where(eq(eventApprovals.eventProposalId, id));
  }
}

export const storage = new Storage();