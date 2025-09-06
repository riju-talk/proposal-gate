import { useQuery } from '@tanstack/react-query';

const API_BASE_URL = '/api';

export function usePublicApprovalStatus(eventId) {
  return useQuery({
    queryKey: ['publicApprovalStatus', eventId],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/event-proposals/${eventId}/approval-status`);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to fetch approval status');
      }
      return response.json();
    },
    enabled: !!eventId,
  });
}
