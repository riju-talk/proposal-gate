import axios from "axios";

// Helper to parse cookies
function parseCookies() {
  return document.cookie.split(";").reduce((acc, cookieStr) => {
    const separatorIndex = cookieStr.indexOf("=");
    if (separatorIndex === -1) return acc;

    const key = cookieStr.slice(0, separatorIndex).trim();
    const value = cookieStr.slice(separatorIndex + 1).trim();

    acc[key] = decodeURIComponent(value);
    return acc;
  }, {});
}

// Helper to delete a cookie
function deleteCookie(name) {
  document.cookie = `${name}=; Max-Age=0; path=/;`;
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
    return this.request("/auth/verify-otp", {
      method: "POST",
      body: { email, otp },
    });
  }

  // Instead of calling /auth/me, parse cookies directly
  async getCurrentUser() {
    try {
      const cookies = parseCookies();
      const token = cookies["auth_token"]; // Adjust key based on backend

      if (!token) {
        return { error: "No auth token found in cookies" };
      }

      const payloadBase64 = token.split(".")[1];
      const payloadJson = atob(payloadBase64);
      const payload = JSON.parse(payloadJson);

      return { data: { user: payload } };
    } catch (error) {
      return { error: "Failed to parse auth token" };
    }
  }

  async logout() {
    try {
      // Call logout endpoint
      await this.request("/auth/logout", { method: "POST" });

      // Delete auth_token cookie locally
      deleteCookie("auth_token");

      return { success: true };
    } catch (error) {
      return { error: "Logout failed" };
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
