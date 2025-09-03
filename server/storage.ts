import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { 
  users, 
  profiles,
  eventProposals,
  authorizedAdmins,
  eventApprovals,
  clubs,
  clubFormationRequests,
  studentRepresentatives,
  importantContacts,
  hostelInfo,
  messHostelCommittee,
  type User, 
  type InsertUser,
  type Profile,
  type InsertProfile,
  type EventProposal,
  type InsertEventProposal,
  type AuthorizedAdmin,
  type EventApproval,
  type Club,
  type ClubFormationRequest,
  type StudentRepresentative,
  type ImportantContact,
  type HostelInfo,
  type MessHostelCommittee
} from "@shared/schema";
import { eq } from "drizzle-orm";
import "dotenv/config";

// Database connection
const connectionString = process.env.DATABASE_URL!;
const client = postgres(connectionString);
export const db = drizzle(client);

// Interface for database operations
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Profile operations
  getProfile(id: string): Promise<Profile | undefined>;
  getProfileByEmail(email: string): Promise<Profile | undefined>;
  createProfile(profile: InsertProfile): Promise<Profile>;
  updateProfile(id: string, updates: Partial<Profile>): Promise<Profile | undefined>;
  
  // Event proposal operations
  getAllEventProposals(): Promise<EventProposal[]>;
  getEventProposal(id: string): Promise<EventProposal | undefined>;
  createEventProposal(proposal: InsertEventProposal): Promise<EventProposal>;
  updateEventProposalStatus(id: string, status: string): Promise<EventProposal | undefined>;
  
  // Authorized admin operations
  getAllAuthorizedAdmins(): Promise<AuthorizedAdmin[]>;
  getAuthorizedAdmin(email: string): Promise<AuthorizedAdmin | undefined>;
  
  // Event approval operations
  getEventApprovals(eventProposalId: string): Promise<EventApproval[]>;
  createEventApproval(approval: Omit<EventApproval, 'id' | 'createdAt' | 'updatedAt'>): Promise<EventApproval>;
  updateEventApproval(id: string, updates: Partial<EventApproval>): Promise<EventApproval | undefined>;
  
  // Club operations
  getAllClubs(): Promise<Club[]>;
  getClub(id: string): Promise<Club | undefined>;
  createClub(club: Omit<Club, 'id' | 'createdAt' | 'updatedAt'>): Promise<Club>;
  
  // Club formation request operations
  getAllClubFormationRequests(): Promise<ClubFormationRequest[]>;
  getClubFormationRequest(id: string): Promise<ClubFormationRequest | undefined>;
  createClubFormationRequest(request: Omit<ClubFormationRequest, 'id' | 'createdAt' | 'updatedAt'>): Promise<ClubFormationRequest>;
  updateClubFormationRequestStatus(id: string, status: string): Promise<ClubFormationRequest | undefined>;
  
  // Student representative operations
  getAllStudentRepresentatives(): Promise<StudentRepresentative[]>;
  
  // Important contact operations
  getAllImportantContacts(): Promise<ImportantContact[]>;
  
  // Hostel info operations
  getAllHostelInfo(): Promise<HostelInfo[]>;
  
  // Mess hostel committee operations
  getAllMessHostelCommittee(): Promise<MessHostelCommittee[]>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username));
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await db.insert(users).values(insertUser).returning();
    return result[0];
  }

  // Profile operations
  async getProfile(id: string): Promise<Profile | undefined> {
    const result = await db.select().from(profiles).where(eq(profiles.id, id));
    return result[0];
  }

  async getProfileByEmail(email: string): Promise<Profile | undefined> {
    const result = await db.select().from(profiles).where(eq(profiles.email, email));
    return result[0];
  }

  async createProfile(profile: InsertProfile): Promise<Profile> {
    const result = await db.insert(profiles).values(profile).returning();
    return result[0];
  }

  async updateProfile(id: string, updates: Partial<Profile>): Promise<Profile | undefined> {
    const result = await db.update(profiles).set(updates).where(eq(profiles.id, id)).returning();
    return result[0];
  }

  // Event proposal operations
  async getAllEventProposals(): Promise<EventProposal[]> {
    return await db.select().from(eventProposals);
  }

  async getEventProposal(id: string): Promise<EventProposal | undefined> {
    const result = await db.select().from(eventProposals).where(eq(eventProposals.id, id));
    return result[0];
  }

  async createEventProposal(proposal: InsertEventProposal): Promise<EventProposal> {
    const result = await db.insert(eventProposals).values(proposal).returning();
    return result[0];
  }

  async updateEventProposalStatus(id: string, status: string): Promise<EventProposal | undefined> {
    const result = await db.update(eventProposals).set({ status }).where(eq(eventProposals.id, id)).returning();
    return result[0];
  }

  // Authorized admin operations
  async getAllAuthorizedAdmins(): Promise<AuthorizedAdmin[]> {
    return await db.select().from(authorizedAdmins);
  }

  async getAuthorizedAdmin(email: string): Promise<AuthorizedAdmin | undefined> {
    const result = await db.select().from(authorizedAdmins).where(eq(authorizedAdmins.email, email));
    return result[0];
  }

  // Event approval operations
  async getEventApprovals(eventProposalId: string): Promise<EventApproval[]> {
    return await db.select().from(eventApprovals).where(eq(eventApprovals.eventProposalId, eventProposalId));
  }

  async createEventApproval(approval: Omit<EventApproval, 'id' | 'createdAt' | 'updatedAt'>): Promise<EventApproval> {
    const result = await db.insert(eventApprovals).values(approval).returning();
    return result[0];
  }

  async updateEventApproval(id: string, updates: Partial<EventApproval>): Promise<EventApproval | undefined> {
    const result = await db.update(eventApprovals).set(updates).where(eq(eventApprovals.id, id)).returning();
    return result[0];
  }

  // Club operations
  async getAllClubs(): Promise<Club[]> {
    return await db.select().from(clubs);
  }

  async getClub(id: string): Promise<Club | undefined> {
    const result = await db.select().from(clubs).where(eq(clubs.id, id));
    return result[0];
  }

  async createClub(club: Omit<Club, 'id' | 'createdAt' | 'updatedAt'>): Promise<Club> {
    const result = await db.insert(clubs).values(club).returning();
    return result[0];
  }

  // Club formation request operations
  async getAllClubFormationRequests(): Promise<ClubFormationRequest[]> {
    return await db.select().from(clubFormationRequests);
  }

  async getClubFormationRequest(id: string): Promise<ClubFormationRequest | undefined> {
    const result = await db.select().from(clubFormationRequests).where(eq(clubFormationRequests.id, id));
    return result[0];
  }

  async createClubFormationRequest(request: Omit<ClubFormationRequest, 'id' | 'createdAt' | 'updatedAt'>): Promise<ClubFormationRequest> {
    const result = await db.insert(clubFormationRequests).values(request).returning();
    return result[0];
  }

  async updateClubFormationRequestStatus(id: string, status: string): Promise<ClubFormationRequest | undefined> {
    const result = await db.update(clubFormationRequests).set({ status }).where(eq(clubFormationRequests.id, id)).returning();
    return result[0];
  }

  // Student representative operations
  async getAllStudentRepresentatives(): Promise<StudentRepresentative[]> {
    return await db.select().from(studentRepresentatives);
  }

  // Important contact operations
  async getAllImportantContacts(): Promise<ImportantContact[]> {
    return await db.select().from(importantContacts);
  }

  // Hostel info operations
  async getAllHostelInfo(): Promise<HostelInfo[]> {
    return await db.select().from(hostelInfo);
  }

  // Mess hostel committee operations
  async getAllMessHostelCommittee(): Promise<MessHostelCommittee[]> {
    return await db.select().from(messHostelCommittee);
  }
}

// Use database storage
export const storage = new DatabaseStorage();