import axios from "axios";

// Helper to decode JWT token
function decodeToken(token) {
  try {
    if (!token) return null;
    const base64Url = token.split('.')[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(base64));
  } catch (error) {
    console.error("Error decoding token:", error);
    return null;
  }
}

class ApiClient {
  baseUrl = "/api";

  axiosInstance = axios.create({
    baseURL: this.baseUrl,
    withCredentials: true, // send cookies automatically
    headers: {
      "Content-Type": "application/json",
    },
  });

  async request(endpoint, options = {}) {
    try {
      const response = await this.axiosInstance.request({
        url: endpoint,
        method: options.method || "GET",
        data: options.body || undefined,
        headers: options.headers || undefined,
      });

      return { data: response.data };
    } catch (error) {
      const message =
        error.response?.data?.error ||
        error.response?.data?.message ||
        error.message ||
        "Unknown error";

      return { error: message };
    }
  }

  async sendOTP(email) {
    return this.request("/auth/send-otp", {
      method: "POST",
      body: { email },
    });
  }

  async verifyOTP(email, otp) {
    const response = await this.request("/auth/verify-otp", {
      method: "POST",
      body: { email, otp },
    });
    
    if (response.data?.token) {
      this.setAuthToken(response.data.token);
    }
    
    return response;
  }

  // Get current user from server
  async getCurrentUser() {
    try {
      // The browser will automatically send the HTTP-only cookie with this request
      const response = await this.request("/auth/me");
      
      if (response.data?.user) {
        return { data: { user: response.data.user } };
      }
      
      return { error: response.error || "Not authenticated" };
    } catch (error) {
      console.error("Error getting current user:", error);
      return { error: "Failed to get current user" };
    }
  }

  // Set auth token in axios instance
  setAuthToken() {
    // No-op for HTTP-only cookies as the browser handles it
  }

  // Initialize auth - no token handling needed for HTTP-only cookies
  initialize() {
    // No need to set token in headers as it's handled by the browser
    return this;
  }

  async logout() {
    try {
      // Call logout endpoint
      await this.request("/auth/logout", { method: "POST" });
    } catch (error) {
      // Continue even if the server logout fails
      console.warn("Server logout failed:", error);
    } finally {
      // Always clear client-side auth state
      this.setAuthToken(null);
      return { success: true };
    }
  }

  async getEventProposals() {
    return this.request("/events");
  }

  async getEventProposal(id) {
    return this.request(`/events/${id}`);
  }

  async getEventApprovals(eventId) {
    return this.request(`/event-proposals/${eventId}/approvals`);
  }

  async getAdminApprovalStatus(eventId, adminEmail) {
    return this.request(
      `/event-proposals/${eventId}/approvals/${encodeURIComponent(
        adminEmail
      )}`
    );
  }

  async approveEvent(eventId, comments = "") {
    return this.request(`/events/${eventId}/approve`, {
      method: "PATCH",
      body: { comments },
    });
  }

  async rejectEvent(eventId, comments = "") {
    return this.request(`/events/${eventId}/reject`, {
      method: "PATCH",
      body: { comments },
    });
  }
}

export const apiClient = new ApiClient();
