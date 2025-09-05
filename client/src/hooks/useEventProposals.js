// client/src/hooks/useEventProposals.js
import { useState, useEffect, useCallback } from "react";
import { apiClient } from "@/lib/api";

export const useEventProposals = (statusFilter, userRole = "public") => {
  const [proposals, setProposals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProposals = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      let response;
      if (userRole === "admin") {
        response = await apiClient.getAdminProposals();
      } else {
        response = await apiClient.getPublicProposals();
      }

      if (response.error) throw new Error(response.error);

      const proposalsData = Array.isArray(response.data)
        ? response.data
        : [];

      // Normalize
      const normalized = proposalsData.map((proposal) => ({
        id: proposal.id,
        event_name: proposal.event_name || proposal.eventName,
        organizer_name: proposal.organizer_name || proposal.organizerName,
        organizer_email: proposal.organizer_email || proposal.organizerEmail,
        organizer_phone: proposal.organizer_phone || proposal.organizerPhone,
        event_type: proposal.event_type || proposal.eventType,
        event_date: proposal.event_date || proposal.eventDate,
        start_time: proposal.start_time || proposal.startTime,
        end_time: proposal.end_time || proposal.endTime,
        venue: proposal.venue,
        expected_participants:
          proposal.expected_participants || proposal.expectedParticipants,
        budget_estimate:
          proposal.budget_estimate || proposal.budgetEstimate,
        description: proposal.description,
        objectives: proposal.objectives,
        additional_requirements:
          proposal.additional_requirements || proposal.additionalRequirements,
        pdf_document_url:
          proposal.pdf_document_url || proposal.pdfDocumentUrl,
        status: proposal.status,
        created_at: proposal.created_at || proposal.createdAt,
        updated_at: proposal.updated_at || proposal.updatedAt,
        approvals: proposal.approvals || [],
      }));

      setProposals(normalized);
    } catch (err) {
      console.error("Error fetching proposals:", err);
      setError(err.message);
      setProposals([]);
    } finally {
      setIsLoading(false);
    }
  }, [userRole]);

  useEffect(() => {
    fetchProposals();
  }, [fetchProposals, statusFilter]);

  const updateProposalStatus = useCallback(
    async (id, status, comments) => {
      try {
        const { data, error } = await apiClient.updateProposalStatus(
          id,
          status,
          comments
        );

        if (error) throw new Error(error);

        // Update state
        setProposals((prev) =>
          prev.map((proposal) =>
            proposal.id === id
              ? {
                  ...proposal,
                  status: data?.eventStatus || status,
                  updated_at: new Date().toISOString(),
                }
              : proposal
          )
        );

        return data;
      } catch (err) {
        console.error("Error updating proposal status:", err);
        throw err;
      }
    },
    []
  );

  return {
    proposals,
    isLoading,
    error,
    updateProposalStatus,
  };
};
