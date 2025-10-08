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
      const result = await apiClient.getEventProposals();

      if (result.error) {
        throw new Error(result.error);
      }

      const proposalsData = result.data;
      console.log("✅ Fetched proposals:", proposalsData.length);
      console.log(proposalsData);
      
      // Normalize field names based on proposal type
      const normalized = Array.isArray(proposalsData) ? proposalsData.map((proposal) => {
        // Common fields for all proposals
        const base = {
          id: proposal.id,
          type: proposal.type,
          status: proposal.status,
          created_at: proposal.created_at || proposal.createdAt,
          updated_at: proposal.updated_at || proposal.updatedAt,
          approvals_summary: proposal.approvals_summary,
        };

        // If it's a club proposal, return club-specific fields
        if (proposal.type === 'club') {
          return {
            ...base,
            club_name: proposal.club_name,
            founders: proposal.founders,
            proposal_link: proposal.proposal_link,
            description: proposal.description,
          };
        }

        // If it's an event proposal, return event-specific fields
        return {
          ...base,
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
          approvals: proposal.approvals || [],
        };
      }) : [];

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
        let result;
        if (status === "approved") {
          result = await apiClient.approveEvent(id, comments);
        } else if (status === "rejected") {
          result = await apiClient.rejectEvent(id, comments);
        } else {
          throw new Error(`Status ${status} is not supported yet`);
        }

        if (result.error) {
          throw new Error(result.error);
        }

        const data = result.data;
        console.log("✅ Proposal status updated successfully");

        // Update local state
        setProposals((prev) =>
          prev.map((proposal) =>
            proposal.id === id
              ? {
                  ...proposal,
                  status: data.eventStatus || status,
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