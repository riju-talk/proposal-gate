import { useState, useEffect, useCallback } from "react";
import { useAuth } from "./useAuth";
import { apiClient } from "../lib/api";

export const useEventApprovals = (eventId) => {
  const { user } = useAuth();
  const [approvals, setApprovals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // ---- Fetch approvals ----
  const fetchApprovals = useCallback(async () => {
    if (!eventId) {
      setApprovals([]);
      setIsLoading(false);
      return;
    }

    console.log("🔄 Fetching approvals for event:", eventId);
    
    try {
      const { data, error } = await apiClient.getEventApprovals(eventId);
      if (error) {
        throw new Error(error);
      }

      console.log("✅ Fetched approvals:", data?.length || 0);
      setApprovals(data || []);
      setError(null);
    } catch (err) {
      console.error("❌ Error fetching approvals:", err);
      setError("Failed to load approval data");
      setApprovals([]);
    } finally {
      setIsLoading(false);
    }
  }, [eventId]);

  // ---- Update approval status ----
  const updateApprovalStatus = useCallback(
    async (status, comments = "") => {
      if (!eventId || !user?.email) {
        throw new Error("Missing event ID or user email");
      }

      console.log("🔄 Updating approval status:", status, "for admin:", user.email);

      try {
        const endpoint = status === "approved" 
          ? `/event-proposals/${eventId}/approve`
          : `/event-proposals/${eventId}/reject`;

        const { data, error } = await apiClient.request(endpoint, {
          method: "POST",
          body: JSON.stringify({ comments }),
        });

        if (error) {
          throw new Error(error);
        }

        console.log("✅ Approval status updated successfully");

        // Refresh approvals after update
        await fetchApprovals();
        return { success: true };
      } catch (err) {
        console.error("❌ Error updating approval status:", err);
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
    fetchApprovals();
  }, [fetchApprovals]);

  return {
    approvals,
    isLoading,
    error,
    approveEvent,
    rejectEvent,
    canApprove,
    refetch: fetchApprovals,
  };
};