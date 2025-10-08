import { pgTable, text, integer, boolean, timestamp, uuid, numeric, bigint, bigserial } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

// OTP Verification Table
export const otpVerifications = pgTable("otp_verifications", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull(),
  otp: text("otp").notNull(),
  used: boolean("used").notNull().default(false),
  expires_at: timestamp("expires_at", { withTimezone: true }).notNull(),
  created_at: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// Event proposals table
export const eventProposals = pgTable("event_proposals", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  event_name: text("event_name").notNull(),
  organizer_email: text("organizer_email").notNull(),
  organizer_phone: text("organizer_phone"),
  event_type: text("event_type").notNull(),
  description: text("description").notNull(),
  pdf_document_url: text("pdf_document_url"),
  status: text("status").default("pending"),
  created_at: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updated_at: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

// Club proposals table
export const clubProposals = pgTable("club_proposals", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  created_at: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  club_name: text("club_name"),
  founders: text("founders"),
  proposal_link: text("proposal_link"),
});

// Authorized admins table
export const authorizedAdmins = pgTable("authorized_admins", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  role: text("role").notNull(),
  approval_order: integer("approval_order").notNull(),
  is_active: boolean("is_active").notNull().default(true),
  created_at: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updated_at: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

// Unified approvals table
export const approvals = pgTable("approvals", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  proposal_id: uuid("proposal_id").notNull(),
  admin_email: text("admin_email").notNull().references(() => authorizedAdmins.email),
  approved_at: timestamp("approved_at", { withTimezone: true }),
  comments: text("comments"),
  status: text("status").notNull().default("pending"),
  created_at: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updated_at: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  type: text("type"), // 'event' or 'club'
});

// Student representatives table
export const studentRepresentatives = pgTable("student_representatives", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  position: text("position").notNull(),
  email: text("email").notNull(),
  official_email: text("official_email"),
  program: text("program").notNull(),
  year: integer("year").notNull(),
  branch: text("branch").notNull(),
  created_at: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updated_at: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  pref_order: bigint("pref_order", { mode: "number" }).default(0),
});

// Additional tables from provided schema (for completeness)
export const clubs = pgTable("clubs", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull().unique(),
  description: text("description"),
  coordinator_names: text("coordinator_names").notNull(),
  coordinator_emails: text("coordinator_emails").notNull(),
  channel_links: text("channel_links"),
  is_active: boolean("is_active").default(true),
  avatar_url: text("avatar_url").notNull().default("\"\""),
  created_at: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updated_at: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  order: bigint("order", { mode: "number" }).default(0),
});

export const closedEvents = pgTable("closed_events", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  reason: text("reason").notNull(),
  created_at: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const hostelInfo = pgTable("hostel_info", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  hostel_name: text("hostel_name").notNull(),
  warden_name: text("warden_name"),
  warden_contact: text("warden_contact"),
  capacity: integer("capacity"),
  emergency_contact: text("emergency_contact"),
  created_at: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updated_at: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const importantContacts = pgTable("important_contacts", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  designation: text("designation"),
  phone_number: text("phone_number").notNull(),
  email: text("email"),
  department: text("department"),
  is_emergency: boolean("is_emergency").default(false),
  display_order: integer("display_order").default(0),
  created_at: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updated_at: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const messHostelCommittee = pgTable("mess_hostel_committee", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  email: text("email").notNull(),
  created_at: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updated_at: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const minutes = pgTable("minutes", {
  // Using bigserial as an approximation to identity
  meeting_id: bigserial("meeting_id", { mode: "number" }).primaryKey(),
  created_at: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  title: text("title"),
  description: text("description"),
  date: timestamp("date"), // storing as timestamp; adapt if DATE is required strictly
  link: text("link"),
});

// Export types
export type EventProposal = typeof eventProposals.$inferSelect;
export type ClubProposal = typeof clubProposals.$inferSelect;
export type AuthorizedAdmin = typeof authorizedAdmins.$inferSelect;
export type Approval = typeof approvals.$inferSelect;
export type StudentRepresentative = typeof studentRepresentatives.$inferSelect;

// Type for approval with admin details
export type ApprovalWithAdmin = Approval & {
  admin_name: string;
  admin_role: string;
  approval_order: number;
};
