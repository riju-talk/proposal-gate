import { Router } from 'express';
import { z } from 'zod';
import { eq, and } from 'drizzle-orm';
import { authenticateUser, authorizeRole, validateRequest, optionalAuth } from '../middleware/auth';
import * as eventService from '../services/event';
import * as emailService from '../services/email';
import * as userService from '../services/user';
import { eventStatuses } from '../services/event';
import { db } from '../db';
import { eventApprovals, profiles } from '@shared/schema';

const router = Router();

// Create a new event
router.post(
  '/',
  authenticateUser,
  validateRequest(
    z.object({
      eventName: z.string().min(1),
      eventType: z.string().min(1),
      description: z.string().min(1),
      eventDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      startTime: z.string().regex(/^\d{2}:\d{2}$/),
      endTime: z.string().regex(/^\d{2}:\d{2}$/),
      venue: z.string().min(1),
      expectedParticipants: z.number().int().positive(),
      budgetEstimate: z.string().optional(),
      objectives: z.string().optional(),
      additionalRequirements: z.string().optional(),
      organizerName: z.string().min(1),
      organizerEmail: z.string().email(),
      organizerPhone: z.string().optional(),
      pdfDocumentUrl: z.string().url().optional(),
    })
  ),
  async (req, res) => {
    try {
      const event = await eventService.createEvent({
        ...req.body,
        createdBy: req.user!.id,
      });
      res.status(201).json(event);
    } catch (error) {
      console.error('Create event error:', error);
      res.status(500).json({ error: 'Failed to create event' });
    }
  }
);

// Get event approvals
router.get('/:eventId/approvals', authenticateUser, async (req, res) => {
  try {
    const { eventId } = req.params;
    
    // Get all approvals for the event
    const approvals = await db
      .select({
        id: eventApprovals.id,
        event_proposal_id: eventApprovals.eventProposalId,
        admin_email: eventApprovals.adminEmail,
        status: eventApprovals.status,
        comments: eventApprovals.comments,
        created_at: eventApprovals.createdAt,
        updated_at: eventApprovals.updatedAt,
        admin_name: profiles.fullName,
        admin_role: profiles.role,
        approval_order: profiles.approvalOrder
      })
      .from(eventApprovals)
      .leftJoin(profiles, eq(eventApprovals.adminEmail, profiles.email))
      .where(eq(eventApprovals.eventProposalId, eventId))
      .orderBy(profiles.approvalOrder);

    res.json(approvals);
  } catch (error) {
    console.error('Error fetching event approvals:', error);
    res.status(500).json({ error: 'Failed to fetch event approvals' });
  }
});

// Update approval status
router.put('/:eventId/approvals/:approvalId', authenticateUser, async (req, res) => {
  try {
    const { eventId, approvalId } = req.params;
    const { status, comments } = req.body;
    const userEmail = req.user?.email;

    if (!status || !['approved', 'rejected', 'pending'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    // Get the approval
    const [approval] = await db
      .select()
      .from(eventApprovals)
      .where(eq(eventApprovals.id, approvalId));

    if (!approval) {
      return res.status(404).json({ error: 'Approval not found' });
    }

    // Verify the user is the admin for this approval
    if (approval.adminEmail !== userEmail) {
      return res.status(403).json({ error: 'Not authorized to update this approval' });
    }

    // Update the approval
    const [updatedApproval] = await db
      .update(eventApprovals)
      .set({
        status,
        comments: comments || null,
        updatedAt: new Date(),
        ...(status === 'approved' && { approvedAt: new Date() })
      })
      .where(eq(eventApprovals.id, approvalId))
      .returning();

    res.json(updatedApproval);
  } catch (error) {
    console.error('Error updating approval:', error);
    res.status(500).json({ error: 'Failed to update approval' });
  }
});

// Get all events with pagination and filtering
router.get('/', authenticateUser, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      search,
      sortBy = 'eventDate',
      sortOrder = 'desc',
      startDate,
      endDate,
    } = req.query;

    const result = await eventService.getEvents({
      page: Number(page),
      limit: Number(limit),
      status: status ? (Array.isArray(status) ? status : [status]) as eventService.EventStatus[] : undefined,
      search: search as string,
      sortBy: sortBy as 'eventDate' | 'createdAt' | 'status',
      sortOrder: sortOrder as 'asc' | 'desc',
      userId: req.user?.role === 'admin' ? undefined : req.user?.id,
      startDate: startDate as string,
      endDate: endDate as string,
    });

    res.json(result);
  } catch (error) {
    console.error('Get events error:', error);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

// Get event approval status (public)
router.get('/:id/approval-status', optionalAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const event = await eventService.getEventById(id);
    
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Return only the approval status and comments (no sensitive data)
    const approvalStatus = {
      status: event.status,
      approvals: event.approvals.map(approval => ({
        adminName: approval.admin.name,
        adminRole: approval.admin.role,
        status: approval.status,
        comments: approval.comments,
        approvedAt: approval.approvedAt
      }))
    };

    res.json(approvalStatus);
  } catch (error) {
    console.error('Error fetching approval status:', error);
    res.status(500).json({ error: 'Failed to fetch approval status' });
  }
});

// Get a single event by ID
router.get('/:id', authenticateUser, async (req, res) => {
  try {
    const event = await eventService.getEventById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Only allow access to the user who created the event or admins
    if (event.createdBy !== req.user!.id && req.user!.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to view this event' });
    }

    res.json(event);
  } catch (error) {
    console.error('Get event error:', error);
    res.status(500).json({ error: 'Failed to fetch event' });
  }
});

// Update an event
router.put(
  '/:id',
  authenticateUser,
  validateRequest(
    z.object({
      eventName: z.string().min(1).optional(),
      eventType: z.string().min(1).optional(),
      description: z.string().min(1).optional(),
      eventDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
      startTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
      endTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
      venue: z.string().min(1).optional(),
      expectedParticipants: z.number().int().positive().optional(),
      budgetEstimate: z.string().optional(),
      objectives: z.string().optional(),
      additionalRequirements: z.string().optional(),
      organizerName: z.string().min(1).optional(),
      organizerEmail: z.string().email().optional(),
      organizerPhone: z.string().optional(),
      pdfDocumentUrl: z.string().url().optional(),
      status: z.enum(eventStatuses as [string, ...string[]]).optional(),
    })
  ),
  async (req, res) => {
    try {
      // Only allow admins to update status
      if (req.body.status && req.user!.role !== 'admin') {
        return res.status(403).json({ error: 'Only admins can update event status' });
      }

      const event = await eventService.updateEvent(
        req.params.id,
        req.body,
        req.user!.id
      );

      // If status was updated, notify the event creator
      if (req.body.status) {
        try {
          await emailService.sendEventStatusUpdateEmail(
            event.organizerEmail,
            event.eventName,
            event.status,
            req.body.comments
          );
        } catch (emailError) {
          console.error('Failed to send status update email:', emailError);
          // Don't fail the request if email sending fails
        }
      }

      res.json(event);
    } catch (error) {
      console.error('Update event error:', error);
      if (error instanceof Error) {
        return res.status(400).json({ error: error.message });
      }
      res.status(500).json({ error: 'Failed to update event' });
    }
  }
);

// Delete an event
router.delete('/:id', authenticateUser, async (req, res) => {
  try {
    await eventService.deleteEvent(req.params.id, req.user!.id);
    res.status(204).send();
  } catch (error) {
    console.error('Delete event error:', error);
    if (error instanceof Error) {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: 'Failed to delete event' });
  }
});

// Submit event for approval
router.post('/:id/submit', authenticateUser, async (req, res) => {
  try {
    const event = await eventService.submitEventForApproval(req.params.id, req.user!.id);
    
    // Notify admins about the new submission
    // This would typically be done in a background job in production
    const admins = await userService.getAdmins();
    await Promise.all(
      admins.map(admin => 
        emailService.sendEventSubmittedEmail(
          admin.email,
          event.eventName,
          `${process.env.ADMIN_URL}/events/${event.id}`
        )
      )
    );

    res.json(event);
  } catch (error) {
    console.error('Submit event error:', error);
    if (error instanceof Error) {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: 'Failed to submit event for approval' });
  }
});

// Approve/Reject event (admin only)
router.post(
  '/:id/approve',
  authenticateUser,
  authorizeRole(['admin']),
  validateRequest(
    z.object({
      approved: z.boolean(),
      comments: z.string().optional(),
    })
  ),
  async (req, res) => {
    try {
      const { approved, comments } = req.body;
      const status = approved ? 'approved' : 'rejected';
      
      const event = await eventService.updateEvent(
        req.params.id,
        { 
          status,
          updatedBy: req.user!.id,
        },
        req.user!.id
      );

      // Notify the event creator about the decision
      await emailService.sendEventStatusUpdateEmail(
        event.organizerEmail,
        event.eventName,
        status,
        comments
      );

      res.json(event);
    } catch (error) {
      console.error('Approve/Reject event error:', error);
      res.status(500).json({ error: 'Failed to process approval' });
    }
  }
);

export default router;
