import {
  pgTable,
  text,
  integer,
  timestamp,
  uuid,
  numeric,
  pgEnum,
  date,
  time,
  boolean,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { z } from "zod";

// ===================================================
// Enums
// ===================================================
export const statusEnum = pgEnum("status_enum", [
  "pending",
  "approved",
  "rejected",
]);

// ===================================================
// 1. Event Proposals Table
// ===================================================
export const eventProposals = pgTable("event_proposals", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  eventName: text("event_name").notNull(),
  organizerName: text("organizer_name").notNull(),
  organizerEmail: text("organizer_email").notNull(),
  organizerPhone: text("organizer_phone"),
  eventType: text("event_type").notNull(),
  eventDate: date("event_date").notNull(), // DATE
  startTime: time("start_time").notNull(), // TIME
  endTime: time("end_time").notNull(),
  venue: text("venue").notNull(),
  expectedParticipants: integer("expected_participants").notNull(),
  budgetEstimate: numeric("budget_estimate"),
  description: text("description").notNull(),
  objectives: text("objectives"),
  additionalRequirements: text("additional_requirements"),
  pdfDocumentUrl: text("pdf_document_url"),
  status: statusEnum("status").notNull().default(sql`'pending'`),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// ===================================================
// 2. Authorized Admins Table
// ===================================================
export const authorizedAdmins = pgTable("authorized_admins", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  role: text("role").notNull(), // plain text in schema
  approvalOrder: integer("approval_order").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// ===================================================
// 3. Event Approvals Table
// ===================================================
export const eventApprovals = pgTable("event_approvals", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  eventProposalId: uuid("event_proposal_id")
    .notNull()
    .references(() => eventProposals.id, { onDelete: "cascade" }),
  adminEmail: text("admin_email")
    .notNull()
    .references(() => authorizedAdmins.email, { onDelete: "cascade" }),
  approvedAt: timestamp("approved_at", { withTimezone: true }),
  comments: text("comments"),
  status: statusEnum("status").notNull().default(sql`'pending'`),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// ===================================================
// 4. OTP Verifications Table
// ===================================================
export const otpVerifications = pgTable("otp_verifications", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull(),
  otp: text("otp").notNull(),
  used: boolean("used").notNull().default(false),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// ===================================================
// TypeScript Types
// ===================================================
export type EventProposal = typeof eventProposals.$inferSelect;
export type NewEventProposal = typeof eventProposals.$inferInsert;

export type AuthorizedAdmin = typeof authorizedAdmins.$inferSelect;
export type NewAuthorizedAdmin = typeof authorizedAdmins.$inferInsert;

export type EventApproval = typeof eventApprovals.$inferSelect;
export type NewEventApproval = typeof eventApprovals.$inferInsert;

export type OTPVerification = typeof otpVerifications.$inferSelect;
export type NewOTPVerification = typeof otpVerifications.$inferInsert;

// ===================================================
// Validation Schemas
// ===================================================
export const eventProposalSchema = z.object({
  eventName: z.string().min(3).max(255),
  organizerName: z.string().min(3).max(255),
  organizerEmail: z.string().email(),
  organizerPhone: z.string().optional(),
  eventType: z.string().min(3).max(100),
  eventDate: z.string().or(z.date()), // DATE
  startTime: z.string(), // TIME
  endTime: z.string(),
  venue: z.string().min(3).max(255),
  expectedParticipants: z.number().int().positive(),
  budgetEstimate: z.number().optional(),
  description: z.string().min(10),
  objectives: z.string().optional(),
  additionalRequirements: z.string().optional(),
  pdfDocumentUrl: z.string().url().optional(),
});

export const adminSchema = z.object({
  email: z.string().email(),
  name: z.string().min(3).max(255),
  role: z.string(),
  approvalOrder: z.number().int().positive(),
  isActive: z.boolean().default(true),
});

export const eventApprovalSchema = z.object({
  adminEmail: z.string().email(),
  eventProposalId: z.string().uuid(),
  status: z.enum(statusEnum.enumValues),
  comments: z.string().optional(),
});

export const otpVerificationSchema = z.object({
  email: z.string().email(),
  otp: z.string().length(6),
  expiresAt: z.date(),
});
