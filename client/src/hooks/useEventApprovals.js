// hooks/useEventApprovals.js
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "./useAuth";
import { apiClient } from "../lib/api";

export const useEventApprovals = (eventId) => {
  const { user } = useAuth();
  const [approvals, setApprovals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // ---- Fetch approvals ----
  const fetchApprovals = useCallback(async (eventId) => {
    try {
      const { data, error } = await apiClient.getEventApprovals(eventId);
      if (error) throw new Error(error);

      setApprovals(data || []);
    } catch (err) {
      console.error("Error fetching approvals:", err);
      setError("Failed to load approval data");
    }
  }, []);

  // ---- Update approval status ----
  const updateApprovalStatus = useCallback(
    async (status, comments = "") => {
      try {
        const { error } = await apiClient.updateEventApprovalByProposalAndAdmin(
          eventId,
          user?.email,
          status,
          comments
        );

        if (error) throw new Error(error);

        // Refresh approvals
        await fetchApprovals(eventId);
        return { success: true };
      } catch (err) {
        console.error("Error updating approval status:", err);
        return {
          success: false,
          error: err instanceof Error ? err.message : "Failed to update approval",
        };
      }
    },
    [eventId, user?.email, fetchApprovals]
  );

  const approveEvent = useCallback(
    (comments = "") => updateApprovalStatus("approved", comments),
    [updateApprovalStatus]
  );

  const rejectEvent = useCallback(
    (comments = "") => updateApprovalStatus("rejected", comments),
    [updateApprovalStatus]
  );

  const canApprove = useCallback(() => {
    if (!user?.email || !eventId) return false;
    const approval = approvals.find((a) => a.admin_email === user.email);
    return approval?.status === "pending";
  }, [user, eventId, approvals]);

  useEffect(() => {
    if (eventId) {
      setIsLoading(true);
      fetchApprovals(eventId).finally(() => setIsLoading(false));
    }
  }, [eventId, fetchApprovals]);

  return {
    approvals,
    isLoading,
    error,
    approveEvent,
    rejectEvent,
    canApprove,
  };
};
