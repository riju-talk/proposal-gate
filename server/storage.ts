import { db } from "./db";
import { eventProposals, eventApprovals, authorizedAdmins } from "@shared/schema";
import { eq, and } from "drizzle-orm";

export interface IStorage {
  getEvents(): Promise<any[]>;
  getEvent(id: string): Promise<any | null>;
  getApprovals(id: string): Promise<any[]>;
  approveEvent(id: string, adminEmail: string, comments: string): Promise<void>;
  rejectEvent(id: string, adminEmail: string, comments: string): Promise<void>;
}

export class Storage implements IStorage {
  async getEvents() {
    try {
      return await db.select().from(eventProposals);
    } catch (error) {
      console.error("Error fetching events:", error);
      throw new Error("Failed to fetch events");
    }
  }

  async getEvent(id: string) {
    try {
      const [event] = await db
        .select()
        .from(eventProposals)
        .where(eq(eventProposals.id, id));
      return event || null;
    } catch (error) {
      console.error(`Error fetching event ${id}:`, error);
      throw new Error(`Failed to fetch event: ${id}`);
    }
  }

  async getApprovals(id: string) {
    try {
      return await db
        .select({
          id: eventApprovals.id,
          status: eventApprovals.status,
          comments: eventApprovals.comments,
          approvedAt: eventApprovals.approvedAt,
          admin: {
            id: authorizedAdmins.id,
            name: authorizedAdmins.name,
            email: authorizedAdmins.email,
            role: authorizedAdmins.role,
          },
        })
        .from(eventApprovals)
        .leftJoin(
          authorizedAdmins,
          eq(eventApprovals.adminEmail, authorizedAdmins.email)
        )
        .where(eq(eventApprovals.eventProposalId, id));
    } catch (error) {
      console.error(`Error fetching approvals for event ${id}:`, error);
      throw new Error(`Failed to fetch approvals for event: ${id}`);
    }
  }

  async approveEvent(id: string, adminEmail: string, comments: string) {
    try {
      await db.transaction(async (tx) => {
        const [existingApproval] = await tx
          .select()
          .from(eventApprovals)
          .where(
            and(
              eq(eventApprovals.eventProposalId, id),
              eq(eventApprovals.adminEmail, adminEmail)
            )
          )
          .limit(1);

        if (existingApproval) {
          await tx
            .update(eventApprovals)
            .set({
              status: "approved",
              comments,
              approvedAt: new Date(),
              updatedAt: new Date(),
            })
            .where(
              and(
                eq(eventApprovals.eventProposalId, id),
                eq(eventApprovals.adminEmail, adminEmail)
              )
            );
        } else {
          await tx.insert(eventApprovals).values({
            eventProposalId: id,
            adminEmail,
            status: "approved",
            comments,
            approvedAt: new Date(),
            updatedAt: new Date(),
          });
        }

        await tx
          .update(eventProposals)
          .set({
            status: "approved",
            updatedAt: new Date(),
          })
          .where(eq(eventProposals.id, id));
      });
    } catch (error) {
      console.error(`Error approving event ${id}:`, error);
      throw new Error("Failed to approve event");
    }
  }

  async rejectEvent(id: string, adminEmail: string, comments: string) {
    try {
      await db.transaction(async (tx) => {
        const [existingApproval] = await tx
          .select()
          .from(eventApprovals)
          .where(
            and(
              eq(eventApprovals.eventProposalId, id),
              eq(eventApprovals.adminEmail, adminEmail)
            )
          )
          .limit(1);

        if (existingApproval) {
          await tx
            .update(eventApprovals)
            .set({
              status: "rejected",
              comments,
              approvedAt: new Date(),
              updatedAt: new Date(),
            })
            .where(
              and(
                eq(eventApprovals.eventProposalId, id),
                eq(eventApprovals.adminEmail, adminEmail)
              )
            );
        } else {
          await tx.insert(eventApprovals).values({
            eventProposalId: id,
            adminEmail,
            status: "rejected",
            comments,
            approvedAt: new Date(),
            updatedAt: new Date(),
          });
        }

        await tx
          .update(eventProposals)
          .set({
            status: "rejected",
            updatedAt: new Date(),
          })
          .where(eq(eventProposals.id, id));
      });
    } catch (error) {
      console.error(`Error rejecting event ${id}:`, error);
      throw new Error("Failed to reject event");
    }
  }
}

export const storage = new Storage();
