import { and, asc, desc, eq, gte, lte, or, sql } from 'drizzle-orm';
import { db } from '../db';
import { eventApprovals, eventProposals, profiles } from '@shared/schema';
import { z } from 'zod';

export const eventStatuses = [
  'draft',
  'pending',
  'under_review',
  'approved',
  'rejected',
  'cancelled',
] as const;

export type EventStatus = (typeof eventStatuses)[number];

export interface EventProposal {
  id: string;
  eventName: string;
  eventType: string;
  description: string;
  eventDate: string;
  startTime: string;
  endTime: string;
  venue: string;
  expectedParticipants: number;
  budgetEstimate: string | null;
  objectives: string | null;
  additionalRequirements: string | null;
  organizerName: string;
  organizerEmail: string;
  organizerPhone: string | null;
  pdfDocumentUrl: string | null;
  status: EventStatus;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  approvals: Array<{
    id: string;
    adminEmail: string;
    status: 'pending' | 'approved' | 'rejected';
    comments: string | null;
    approvedAt: Date | null;
    admin: {
      name: string;
      email: string;
      role: string;
    };
  }>;
}

export interface CreateEventInput {
  eventName: string;
  eventType: string;
  description: string;
  eventDate: string;
  startTime: string;
  endTime: string;
  venue: string;
  expectedParticipants: number;
  budgetEstimate?: string;
  objectives?: string;
  additionalRequirements?: string;
  organizerName: string;
  organizerEmail: string;
  organizerPhone?: string;
  pdfDocumentUrl?: string;
  createdBy: string;
}

export interface UpdateEventInput extends Partial<CreateEventInput> {
  status?: EventStatus;
}

export interface GetEventsOptions {
  page?: number;
  limit?: number;
  status?: EventStatus[];
  search?: string;
  sortBy?: 'eventDate' | 'createdAt' | 'status';
  sortOrder?: 'asc' | 'desc';
  userId?: string;
  startDate?: string;
  endDate?: string;
}

export interface PaginatedEvents {
  events: EventProposal[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const createEvent = async (input: CreateEventInput): Promise<EventProposal> => {
  const [event] = await db
    .insert(eventProposals)
    .values({
      ...input,
      status: 'draft',
    })
    .returning();

  return getEventById(event.id);
};

export const updateEvent = async (
  eventId: string,
  updates: UpdateEventInput,
  userId: string
): Promise<EventProposal> => {
  // Verify user has permission to update this event
  const [existingEvent] = await db
    .select()
    .from(eventProposals)
    .where(eq(eventProposals.id, eventId))
    .limit(1);

  if (!existingEvent) {
    throw new Error('Event not found');
  }

  // Only allow status changes to specific values
  if (updates.status && !eventStatuses.includes(updates.status as EventStatus)) {
    throw new Error('Invalid status');
  }

  const [updatedEvent] = await db
    .update(eventProposals)
    .set({
      ...updates,
      updatedAt: new Date(),
    })
    .where(eq(eventProposals.id, eventId))
    .returning();

  return getEventById(updatedEvent.id);
};

export const getEventById = async (eventId: string): Promise<EventProposal | null> => {
  const [event] = await db
    .select()
    .from(eventProposals)
    .where(eq(eventProposals.id, eventId))
    .limit(1);

  if (!event) {
    return null;
  }

  const approvals = await db
    .select({
      id: eventApprovals.id,
      adminEmail: eventApprovals.adminEmail,
      status: eventApprovals.status,
      comments: eventApprovals.comments,
      approvedAt: eventApprovals.approvedAt,
      admin: {
        name: profiles.fullName,
        email: profiles.email,
        role: profiles.role,
      },
    })
    .from(eventApprovals)
    .leftJoin(profiles, eq(eventApprovals.adminEmail, profiles.email))
    .where(eq(eventApprovals.eventProposalId, eventId));

  return {
    ...event,
    approvals,
  };
};

export const getEvents = async (options: GetEventsOptions = {}): Promise<PaginatedEvents> => {
  const {
    page = 1,
    limit = 10,
    status,
    search,
    sortBy = 'eventDate',
    sortOrder = 'desc',
    userId,
    startDate,
    endDate,
  } = options;

  const offset = (page - 1) * limit;
  const whereConditions = [];

  if (status && status.length > 0) {
    whereConditions.push(or(...status.map((s) => eq(eventProposals.status, s))));
  }

  if (search) {
    const searchTerm = `%${search}%`;
    whereConditions.push(
      or(
        sql`LOWER(${eventProposals.eventName}) LIKE LOWER(${searchTerm})`,
        sql`LOWER(${eventProposals.description}) LIKE LOWER(${searchTerm})`,
        sql`LOWER(${eventProposals.organizerName}) LIKE LOWER(${searchTerm})`,
        sql`LOWER(${eventProposals.organizerEmail}) LIKE LOWER(${searchTerm})`
      )
    );
  }

  if (userId) {
    whereConditions.push(eq(eventProposals.createdBy, userId));
  }

  if (startDate) {
    whereConditions.push(gte(eventProposals.eventDate, startDate));
  }

  if (endDate) {
    whereConditions.push(lte(eventProposals.eventDate, endDate));
  }

  const whereClause = whereConditions.length > 0 ? and(...whereConditions) : undefined;

  // Get total count for pagination
  const [{ count }] = await db
    .select({ count: sql<number>`count(*)` })
    .from(eventProposals)
    .where(whereClause);

  const total = Number(count);
  const totalPages = Math.ceil(total / limit);

  // Get paginated events
  const events = await db
    .select()
    .from(eventProposals)
    .where(whereClause)
    .orderBy(
      sortOrder === 'asc' 
        ? asc(eventProposals[sortBy as keyof typeof eventProposals] as any)
        : desc(eventProposals[sortBy as keyof typeof eventProposals] as any)
    )
    .limit(limit)
    .offset(offset);

  // Get approvals for each event
  const eventsWithApprovals = await Promise.all(
    events.map(async (event) => {
      const approvals = await db
        .select({
          id: eventApprovals.id,
          adminEmail: eventApprovals.adminEmail,
          status: eventApprovals.status,
          comments: eventApprovals.comments,
          approvedAt: eventApprovals.approvedAt,
          admin: {
            name: profiles.fullName,
            email: profiles.email,
            role: profiles.role,
          },
        })
        .from(eventApprovals)
        .leftJoin(profiles, eq(eventApprovals.adminEmail, profiles.email))
        .where(eq(eventApprovals.eventProposalId, event.id));

      return {
        ...event,
        approvals,
      };
    })
  );

  return {
    events: eventsWithApprovals,
    total,
    page,
    limit,
    totalPages,
  };
};

export const deleteEvent = async (eventId: string, userId: string): Promise<boolean> => {
  // Verify user has permission to delete this event
  const [event] = await db
    .select()
    .from(eventProposals)
    .where(
      and(
        eq(eventProposals.id, eventId),
        eq(eventProposals.createdBy, userId)
      )
    )
    .limit(1);

  if (!event) {
    throw new Error('Event not found or you do not have permission to delete it');
  }

  // Only allow deletion of draft or rejected events
  if (!['draft', 'rejected'].includes(event.status)) {
    throw new Error('Only draft or rejected events can be deleted');
  }

  await db.delete(eventProposals).where(eq(eventProposals.id, eventId));
  return true;
};

export const submitEventForApproval = async (eventId: string, userId: string): Promise<EventProposal> => {
  // Verify user has permission to submit this event
  const [event] = await db
    .select()
    .from(eventProposals)
    .where(
      and(
        eq(eventProposals.id, eventId),
        eq(eventProposals.createdBy, userId)
      )
    )
    .limit(1);

  if (!event) {
    throw new Error('Event not found or you do not have permission to submit it');
  }

  // Only allow submission of draft events
  if (event.status !== 'draft') {
    throw new Error('Only draft events can be submitted for approval');
  }

  // Update status to pending
  const [updatedEvent] = await db
    .update(eventProposals)
    .set({
      status: 'pending',
      updatedAt: new Date(),
    })
    .where(eq(eventProposals.id, eventId))
    .returning();

  // TODO: Notify admins about the new submission
  
  return getEventById(updatedEvent.id);
};
