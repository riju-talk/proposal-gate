import { pgTable, text, serial, integer, boolean, timestamp, uuid, varchar, json, numeric, pgSchema } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { sql } from "drizzle-orm";

// Create schema for better organization
const authSchema = pgSchema("auth");

// OTP Verification Table
export const otpVerifications = authSchema.table("otp_verifications", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull(),
  otp: text("otp").notNull(),
  used: boolean("used").notNull().default(false),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// User Sessions Table
export const userSessions = authSchema.table("user_sessions", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid("user_id").notNull().references(() => profiles.id, { onDelete: "cascade" }),
  token: text("token").notNull().unique(),
  userAgent: text("user_agent"),
  ipAddress: text("ip_address"),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Profiles table
export const profiles = pgTable("profiles", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  username: text("username").notNull(),
  fullName: text("full_name"),
  role: text("role").notNull().default("user"),
  isEmailVerified: boolean("is_email_verified").notNull().default(false),
  lastLoginAt: timestamp("last_login_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
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
  status: text("status").notNull().default("pending"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Clubs table
export const clubs = pgTable("clubs", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  avatarUrl: text("avatar_url").default(""),
  coordinatorNames: text("coordinator_names").notNull(),
  coordinatorEmails: text("coordinator_emails").notNull(),
  channelLinks: text("channel_links"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Club formation requests table
export const clubFormationRequests = pgTable("club_formation_requests", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  clubName: text("club_name").notNull(),
  clubDescription: text("club_description").notNull(),
  clubObjectives: text("club_objectives").notNull(),
  proposedByName: text("proposed_by_name").notNull(),
  proposedByEmail: text("proposed_by_email").notNull(),
  proposedByPhone: text("proposed_by_phone"),
  facultyAdvisor: text("faculty_advisor"),
  initialMembers: json("initial_members").$type<string[]>(),
  proposedActivities: text("proposed_activities"),
  charterDocumentUrl: text("charter_document_url"),
  status: text("status").default("pending"),
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

// Important contacts table
export const importantContacts = pgTable("important_contacts", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  phoneNumber: text("phone_number").notNull(),
  email: text("email"),
  designation: text("designation"),
  department: text("department"),
  isEmergency: boolean("is_emergency").default(false),
  displayOrder: integer("display_order"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Hostel info table
export const hostelInfo = pgTable("hostel_info", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  hostelName: text("hostel_name").notNull(),
  wardenName: text("warden_name"),
  wardenContact: text("warden_contact"),
  emergencyContact: text("emergency_contact"),
  capacity: integer("capacity"),
  facilities: json("facilities").$type<string[]>(),
  rules: json("rules").$type<string[]>(),
  timings: json("timings"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Mess hostel committee table
export const messHostelCommittee = pgTable("mess_hostel_committee", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  email: text("email").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Keep the original users table for compatibility
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

// Schemas for validation
export const insertProfileSchema = createInsertSchema(profiles).pick({
  email: true,
  username: true,
  fullName: true,
  role: true,
});

export const insertEventProposalSchema = createInsertSchema(eventProposals).pick({
  eventName: true,
  eventType: true,
  description: true,
  eventDate: true,
  startTime: true,
  endTime: true,
  venue: true,
  expectedParticipants: true,
  budgetEstimate: true,
  objectives: true,
  additionalRequirements: true,
  organizerName: true,
  organizerEmail: true,
  organizerPhone: true,
  pdfDocumentUrl: true,
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

// Export types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Profile = typeof profiles.$inferSelect;
export type InsertProfile = z.infer<typeof insertProfileSchema>;
export type EventProposal = typeof eventProposals.$inferSelect;
export type InsertEventProposal = z.infer<typeof insertEventProposalSchema>;
export type AuthorizedAdmin = typeof authorizedAdmins.$inferSelect;
export type EventApproval = typeof eventApprovals.$inferSelect;
export type Club = typeof clubs.$inferSelect;
export type ClubFormationRequest = typeof clubFormationRequests.$inferSelect;
export type StudentRepresentative = typeof studentRepresentatives.$inferSelect;
export type ImportantContact = typeof importantContacts.$inferSelect;
export type HostelInfo = typeof hostelInfo.$inferSelect;
export type MessHostelCommittee = typeof messHostelCommittee.$inferSelect;
