import { useEventProposals } from "@/hooks/useEventProposals";

export const normalizeProposal = (data) => {
  // Create a new object with all the data
  const proposal = { ...data };

  // Add helper methods
  proposal.getEventName = () => data.eventName || data.event_name || 'Untitled Event';
  proposal.getEventType = () => data.eventType || data.event_type || 'event';
  proposal.getEventDate = () => data.eventDate || data.event_date || '';
  proposal.getStartTime = () => data.startTime || data.start_time || '';
  proposal.getEndTime = () => data.endTime || data.end_time || '';
  proposal.getOrganizerName = () => data.organizerName || data.organizer_name || '';
  proposal.getOrganizerEmail = () => data.organizerEmail || data.organizer_email || '';
  proposal.getCreatedAt = () => {
    const dateStr = data.createdAt || data.created_at;
    return dateStr ? new Date(dateStr) : new Date();
  };

  return proposal;
};

export const normalizeProposals = (data) => {
  if (!Array.isArray(data)) return [];
  return data.map(proposal => normalizeProposal(proposal));
};
