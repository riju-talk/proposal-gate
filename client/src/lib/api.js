// client/src/lib/api.js
class ApiClient {
  baseUrl = "/api";

  async request(endpoint, options = {}) {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
        },
        credentials: "include", // send cookies (JWT)
        ...options,
      });

      if (!response.ok) {
        let errorMessage = "Request failed";
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch {
          // ignore parsing error
        }
        return { error: errorMessage };
      }

      const data = await response.json();
      return { data };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  // ================== AUTH ==================
  async sendOTP(email) {
    return this.request("/auth/send-otp", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  }

  async verifyOTP(email, otp) {
    return this.request("/auth/verify-otp", {
      method: "POST",
      body: JSON.stringify({ email, otp }),
    });
  }

  async logout() {
    return this.request("/auth/logout", { method: "POST" });
  }

  // ================== EVENTS ==================
  async getPublicEventProposals() {
    return this.request("/event-proposals/public");
  }

  async getAdminEventProposals() {
    return this.request("/event-proposals/admin");
  }

  async getEventProposal(id) {
    return this.request(`/event-proposals/${id}`);
  }

  // ================== APPROVALS ==================
  async getEventApprovals(eventId) {
    return this.request(`/events/${eventId}/approvals`);
  }

  async getAdminApprovalStatus(eventId, adminEmail) {
    return this.request(
      `/events/${eventId}/approvals/${encodeURIComponent(adminEmail)}`
    );
  }

  async approveEvent(eventId, comments = "") {
    return this.request(`/events/${eventId}/approve`, {
      method: "POST",
      body: JSON.stringify({ status: "approved", comments }),
    });
  }

  async rejectEvent(eventId, comments = "") {
    return this.request(`/events/${eventId}/approve`, {
      method: "POST",
      body: JSON.stringify({ status: "rejected", comments }),
    });
  }
}

export const apiClient = new ApiClient();
