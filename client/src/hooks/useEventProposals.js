import { useState, useEffect, useCallback } from "react";
import { apiClient } from "@/lib/api";

export const useEventProposals = (statusFilter, userRole = "public") => {
  const [proposals, setProposals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProposals = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    console.log("🔄 Fetching proposals for role:", userRole, "filter:", statusFilter);

    try {
      let response;
      if (userRole === "admin") {
        response = await apiClient.getEventProposals();
      } else {
        response = await apiClient.getEventProposals();
      }

      if (response.error) {
        throw new Error(response.error);
      }

      const proposalsData = Array.isArray(response.data) ? response.data : [];
      console.log("✅ Fetched proposals:", proposalsData.length);

      // Normalize field names to snake_case for consistency
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
        expected_participants: proposal.expected_participants || proposal.expectedParticipants,
        budget_estimate: proposal.budget_estimate || proposal.budgetEstimate,
        description: proposal.description,
        objectives: proposal.objectives,
        additional_requirements: proposal.additional_requirements || proposal.additionalRequirements,
        pdf_document_url: proposal.pdf_document_url || proposal.pdfDocumentUrl,
        status: proposal.status,
        created_at: proposal.created_at || proposal.createdAt,
        updated_at: proposal.updated_at || proposal.updatedAt,
        approvals: proposal.approvals || [],
      }));

      setProposals(normalized);
    } catch (err) {
      console.error("❌ Error fetching proposals:", err);
      setError(err.message);
      setProposals([]);
    } finally {
      setIsLoading(false);
    }
  }, [userRole, statusFilter]);

  useEffect(() => {
    fetchProposals();
  }, [fetchProposals]);

  const updateProposalStatus = useCallback(
    async (id, status, comments) => {
      console.log("🔄 Updating proposal status:", id, status);
      
      try {
        const endpoint = status === "approved" 
          ? `/event-proposals/${id}/approve`
          : `/event-proposals/${id}/reject`;
          
        const { data, error } = await apiClient.request(endpoint, {
          method: "POST",
          body: JSON.stringify({ comments }),
        });

        if (error) {
          throw new Error(error);
        }

        console.log("✅ Proposal status updated successfully");

        // Update local state
        setProposals((prev) =>
          prev.map((proposal) =>
            proposal.id === id
              ? {
                  ...proposal,
                  status: status,
                  updated_at: new Date().toISOString(),
                }
              : proposal
          )
        );

        // Refresh proposals to get latest data
        await fetchProposals();

        return data;
      } catch (err) {
        console.error("❌ Error updating proposal status:", err);
        throw err;
      }
    },
    [fetchProposals]
  );

  return {
    proposals,
    isLoading,
    error,
    updateProposalStatus,
    refetch: fetchProposals,
  };
};