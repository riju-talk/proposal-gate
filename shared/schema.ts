import {
  pgTable,
  text,
  integer,
  boolean,
  timestamp,
  uuid,
  numeric,
} from "drizzle-orm/pg-core";
import { z } from "zod";
import { sql } from "drizzle-orm";

// ===================================================
// ✅ 1. Event Proposals Table
// ===================================================
export const eventProposals = pgTable("event_proposals", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  eventName: text("event_name").notNull(),
  eventType: text("event_type").notNull(),
  description: text("description").notNull(),
  eventDate: timestamp("event_date", { mode: "date" }).notNull(), // maps to DATE
  startTime: text("start_time").notNull(), // TIME WITHOUT TIME ZONE → string format (e.g., "14:30")
  endTime: text("end_time").notNull(),
  venue: text("venue").notNull(),
  expectedParticipants: integer("expected_participants").notNull(),
  budgetEstimate: numeric("budget_estimate"), // optional decimal
  objectives: text("objectives"), // optional
  additionalRequirements: text("additional_requirements"),
  organizerName: text("organizer_name").notNull(),
  organizerEmail: text("organizer_email").notNull(),
  organizerPhone: text("organizer_phone"), // optional
  pdfDocumentUrl: text("pdf_document_url"), // optional
  status: text("status")
    .notNull()
    .default("pending")
    .check("status_check", sql`status IN ('pending', 'approved', 'rejected')`),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

// ===================================================
// ✅ 2. Authorized Admins Table
// ===================================================
export const authorizedAdmins = pgTable("authorized_admins", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  role: text("role").notNull().check(
    "role_check",
    sql`role IN ('super_admin', 'admin', 'moderator')`
  ),
  department: text("department"),
  phone: text("phone"),
  approvalOrder: integer("approval_order").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  lastLogin: timestamp("last_login"),
  passwordHash: text("password_hash").notNull(),
  passwordResetToken: text("password_reset_token"),
  passwordResetExpires: timestamp("password_reset_expires"),
  failedLoginAttempts: integer("failed_login_attempts").default(0),
  accountLocked: boolean("account_locked").default(false),
  mfaEnabled: boolean("mfa_enabled").default(false),
  mfaSecret: text("mfa_secret"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

// ===================================================
// ✅ 3. Event Approvals Table
// ===================================================
export const eventApprovals = pgTable("event_approvals", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  eventProposalId: uuid("event_proposal_id")
    .notNull()
    .references(() => eventProposals.id, { onDelete: "cascade" }), // FK to event_proposals.id
  adminEmail: text("admin_email")
    .notNull()
    .references(() => authorizedAdmins.email, { onDelete: "cascade" }), // FK to authorized_admins.email
  approvedAt: timestamp("approved_at", { withTimezone: true }), // nullable
  comments: text("comments"), // optional
  status: text("status")
    .notNull()
    .default("pending")
    .check("status_check", sql`status IN ('pending', 'approved', 'rejected')`),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

// ===================================================
// ✅ 4. OTP-verification table
// ===================================================
export const otpVerifications = pgTable("otp_verifications", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull(),
  otp: text("otp").notNull(),
  used: boolean("used").notNull().default(false),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// ===================================================
// ✅ Zod Schemas for Validation
// ===================================================

export const updateEventApprovalSchema = z.object({
  status: z.enum(["approved", "rejected"], { required_error: "Status must be 'approved' or 'rejected'" }),
  comments: z.string().optional(),
});

// ===================================================
// ✅ TypeScript Types
// ===================================================
export type EventProposal = typeof eventProposals.$inferSelect;
export type AuthorizedAdmin = typeof authorizedAdmins.$inferSelect;
export type EventApproval = typeof eventApprovals.$inferSelect;
export type UpdateEventApproval = z.infer<typeof updateEventApprovalSchema>;
export type OTPVerification = typeof otpVerifications.$inferSelect;