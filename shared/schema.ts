import { pgTable, text, integer, boolean, timestamp, uuid, numeric } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

// Create schema for better organization

// OTP Verification Table
export const otpVerifications =pgTable("otp_verifications", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull(),
  otp: text("otp").notNull(),
  used: boolean("used").notNull().default(false),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Event proposals table
export const eventProposals = pgTable("event_proposals", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  eventName: text("event_name").notNull(),
  eventType: text("event_type").notNull(),
  description: text("description").notNull(),
  eventDate: text("event_date").notNull(),
  startTime: text("start_time").notNull(),
  endTime: text("end_time").notNull(),
  venue: text("venue").notNull(),
  expectedParticipants: integer("expected_participants").notNull(),
  budgetEstimate: numeric("budget_estimate"),
  objectives: text("objectives"),
  additionalRequirements: text("additional_requirements"),
  organizerName: text("organizer_name").notNull(),
  organizerEmail: text("organizer_email").notNull(),
  organizerPhone: text("organizer_phone"),
  pdfDocumentUrl: text("pdf_document_url"),
  status: text("status").default("pending"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Authorized admins table
export const authorizedAdmins = pgTable("authorized_admins", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  role: text("role").notNull(),
  approvalOrder: integer("approval_order").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Event approvals table
export const eventApprovals = pgTable("event_approvals", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  eventProposalId: uuid("event_proposal_id").notNull().references(() => eventProposals.id, { onDelete: "cascade" }),
  adminEmail: text("admin_email").notNull().references(() => authorizedAdmins.email),
  approvedAt: timestamp("approved_at"),
  comments: text("comments"),
  status: text("status").notNull().default("pending"), // pending, approved, rejected, under_review
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Student representatives table
export const studentRepresentatives = pgTable("student_representatives", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  email: text("email").notNull(),
  officialEmail: text("official_email"),
  position: text("position").notNull(),
  program: text("program").notNull(),
  branch: text("branch").notNull(),
  year: integer("year").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});




// Export types
export type EventProposal = typeof eventProposals.$inferSelect;
export type AuthorizedAdmin = typeof authorizedAdmins.$inferSelect;
export type EventApproval = typeof eventApprovals.$inferSelect;
export type StudentRepresentative = typeof studentRepresentatives.$inferSelect;
