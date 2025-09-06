// client/src/lib/api.js
class ApiClient {
  baseUrl = "/api";

  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    console.log(`🌐 API Request: ${options.method || 'GET'} ${url}`);
    
    try {
      const response = await fetch(url, {
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
        },
        credentials: "include", // send cookies (JWT)
        ...options,
      });

      console.log(`📡 API Response: ${response.status} ${url}`);

      if (!response.ok) {
        let errorMessage = `Request failed with status ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.message || errorMessage;
        } catch {
          // ignore parsing error, use default message
        }
        console.error(`❌ API Error: ${errorMessage}`);
        return { error: errorMessage };
      }

      const data = await response.json();
      console.log(`✅ API Success: ${url}`, data);
      return { data };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      console.error(`❌ API Network Error: ${errorMessage}`);
      return { error: errorMessage };
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

  async getCurrentUser() {
    return this.request("/auth/me");
  }

  // ================== EVENTS ==================
  async getEventProposals() {
    return this.request("/event-proposals");
  }

  async getEventProposal(id) {
    return this.request(`/event-proposals/${id}`);
  }

  // ================== APPROVALS ==================
  async getEventApprovals(eventId) {
    return this.request(`/event-proposals/${eventId}/approvals`);
  }

  async getAdminApprovalStatus(eventId, adminEmail) {
    return this.request(
      `/event-proposals/${eventId}/approvals/${encodeURIComponent(adminEmail)}`
    );
  }

  async approveEvent(eventId, comments = "") {
    return this.request(`/event-proposals/${eventId}/approve`, {
      method: "POST",
      body: JSON.stringify({ comments }),
    });
  }

  async rejectEvent(eventId, comments = "") {
    return this.request(`/event-proposals/${eventId}/reject`, {
      method: "POST",
      body: JSON.stringify({ comments }),
    });
  }
}

export const apiClient = new ApiClient();