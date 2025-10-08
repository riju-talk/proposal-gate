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
  user = null;

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
    
    // Cookie is set server-side; cache user locally if provided
    if (response.data?.admin) {
      this.user = response.data.admin;
    }
    
    return response;
  }

  // Get current user from server
  async getCurrentUser() {
    try {
      // The browser will automatically send the HTTP-only cookie with this request
      const response = await this.request("/auth/me");
      
      if (response.data?.user) {
        this.user = response.data.user;
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
      this.user = null;
      return { success: true };
    }
  }

  async getEventProposals() {
    const response = await this.request("/events");
    if (response.error) return response;

    // The API returns a mixed array of events and clubs
    // Normalize the data to handle both types consistently
    const proposals = Array.isArray(response.data) ? response.data.map(proposal => {
      // Handle club proposals that don't have event-specific fields
      if (proposal.type === 'club') {
        return {
          id: proposal.id,
          event_name: proposal.club_name || "Untitled Club",
          organizer_name: Array.isArray(proposal.founders) ? proposal.founders.join(", ") : "Unknown",
          event_date: null,
          start_time: null,
          end_time: null,
          venue: null,
          expected_participants: null,
          description: `Club proposal for ${proposal.club_name}`,
          status: proposal.status || 'pending',
          created_at: proposal.created_at,
          updated_at: proposal.updated_at,
          type: 'club',
          club_name: proposal.club_name,
          founders: proposal.founders,
          proposal_link: proposal.proposal_link,
          // Add approval summary for consistent UI
          approvals_summary: proposal.approvals_summary
        };
      }

      // Handle event proposals
      return {
        id: proposal.id,
        event_name: proposal.event_name,
        organizer_name: proposal.organizer_name || "Unknown",
        organizer_email: proposal.organizer_email,
        organizer_phone: proposal.organizer_phone,
        event_type: proposal.event_type,
        event_date: proposal.event_date,
        start_time: proposal.start_time,
        end_time: proposal.end_time,
        venue: proposal.venue,
        expected_participants: proposal.expected_participants,
        description: proposal.description,
        pdf_document_url: proposal.pdf_document_url,
        budget_estimate: proposal.budget_estimate,
        status: proposal.status || 'pending',
        created_at: proposal.created_at,
        updated_at: proposal.updated_at,
        type: 'event',
        // Add approval summary for consistent UI
        approvals_summary: proposal.approvals_summary
      };
    }) : [];

    return { data: proposals };
  }

  async getEventProposal(id) {
    const response = await this.request(`/events/${id}`);
    if (response.error) return response;

    const proposal = response.data;

    // Normalize the data structure to handle both events and clubs consistently
    if (proposal.type === 'club') {
      return {
        data: {
          id: proposal.id,
          event_name: proposal.club_name || "Untitled Club",
          organizer_name: Array.isArray(proposal.founders) ? proposal.founders.join(", ") : "Unknown",
          event_date: null,
          start_time: null,
          end_time: null,
          venue: null,
          expected_participants: null,
          description: `Club proposal for ${proposal.club_name}`,
          status: proposal.status || 'pending',
          created_at: proposal.created_at,
          updated_at: proposal.updated_at,
          type: 'club',
          club_name: proposal.club_name,
          founders: proposal.founders,
          proposal_link: proposal.proposal_link,
          approvals_summary: proposal.approvals_summary
        }
      };
    }

    // Handle event proposals
    return {
      data: {
        id: proposal.id,
        event_name: proposal.event_name,
        organizer_name: proposal.organizer_name || "Unknown",
        organizer_email: proposal.organizer_email,
        organizer_phone: proposal.organizer_phone,
        event_type: proposal.event_type,
        event_date: proposal.event_date,
        start_time: proposal.start_time,
        end_time: proposal.end_time,
        venue: proposal.venue,
        expected_participants: proposal.expected_participants,
        description: proposal.description,
        pdf_document_url: proposal.pdf_document_url,
        budget_estimate: proposal.budget_estimate,
        status: proposal.status || 'pending',
        created_at: proposal.created_at,
        updated_at: proposal.updated_at,
        type: 'event',
        approvals_summary: proposal.approvals_summary
      }
    };
  }

  // Get all approvals for a specific proposal
  async getApprovals(proposalId) {
    const res = await this.request(`/approvals/proposal/${proposalId}`);
    if (res.error) return res;
    // Server returns an array directly. Normalize to { approvals: [...] } and coerce defaults.
    const list = Array.isArray(res.data) ? res.data : res.data?.approvals;
    if (!Array.isArray(list)) return { error: 'Invalid approvals response' };
    const approvals = list.map((a) => ({
      ...a,
      // status can be null if no approval row yet; treat as pending for UI logic
      status: a.status || 'pending',
    }));
    return { data: { approvals } };
  }

  // Get all approvals for the current admin
  async getMyApprovals(type, status) {
    const query = new URLSearchParams();
    if (type) query.append('type', type);
    if (status) query.append('status', status);

    const queryString = query.toString();
    const res = await this.request(`/approvals/me${queryString ? `?${queryString}` : ''}`);
    if (res.error) return res;
    const list = Array.isArray(res.data) ? res.data : res.data?.approvals;
    if (!Array.isArray(list)) return { error: 'Invalid approvals response' };
    const approvals = list.map((a) => ({
      ...a,
      status: a.status || 'pending',
    }));
    return { data: { approvals } };
  }

  async approveProposal(approvalId, comments = '') {
    return this.request(`/approvals/${approvalId}/approve`, {
      method: 'PATCH',
      body: { comments },
    });
  }

  // Reject a proposal
  async rejectProposal(approvalId, comments = '') {
    return this.request(`/approvals/${approvalId}/reject`, {
      method: 'PATCH',
      body: { comments },
    });
  }

  // Backward compatibility
  async getEventApprovals(eventId) {
    return this.getApprovals(eventId);
  }

  async approveEvent(eventId, comments = '') {
    // For backward compatibility, we'll try to find the approval ID
    const { data: approvals } = await this.getApprovals(eventId);
    const userApproval = approvals?.find(a => a.admin_email === this.user?.email);
    
    if (userApproval) {
      return this.approveProposal(userApproval.id, comments);
    }
    
    return { error: 'No pending approval found for this user' };
  }

  async rejectEvent(eventId, comments = '') {
    // For backward compatibility, we'll try to find the approval ID
    const { data: approvals } = await this.getApprovals(eventId);
    const userApproval = approvals?.find(a => a.admin_email === this.user?.email);
    
    if (userApproval) {
      return this.rejectProposal(userApproval.id, comments);
    }
    
    return { error: 'No pending approval found for this user' };
  }
}

export const apiClient = new ApiClient();
