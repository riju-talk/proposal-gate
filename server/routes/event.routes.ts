import { Router } from 'express';
import { z } from 'zod';
import { authenticateUser, authorizeRole, validateRequest } from '../middleware/auth';
import * as eventService from '../services/event';
import * as emailService from '../services/email';
import { eventStatuses } from '../services/event';

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
