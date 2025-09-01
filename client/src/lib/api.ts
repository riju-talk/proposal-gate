// API client to replace Supabase calls

interface ApiResponse<T> {
  data?: T;
  error?: string;
}

class ApiClient {
  private baseUrl = '/api';

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        const errorData = await response.json();
        return { error: errorData.error || 'Request failed' };
      }

      const data = await response.json();
      return { data };
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // Authentication methods
  async register(email: string, username: string, fullName?: string, role?: string) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, username, fullName, role }),
    });
  }

  async login(email: string) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  // Profile methods
  async getProfile(id: string) {
    return this.request(`/profiles/${id}`);
  }

  // Event proposal methods
  async getEventProposals() {
    return this.request('/event-proposals');
  }

  async createEventProposal(proposal: any) {
    return this.request('/event-proposals', {
      method: 'POST',
      body: JSON.stringify(proposal),
    });
  }

  async getEventProposal(id: string) {
    return this.request(`/event-proposals/${id}`);
  }

  async updateEventProposalStatus(id: string, status: string) {
    return this.request(`/event-proposals/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  // Event approval methods
  async getEventApprovals(eventId: string) {
    return this.request(`/event-proposals/${eventId}/approvals`);
  }

  async updateEventApproval(id: string, status: string, comments?: string) {
    return this.request(`/event-approvals/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status, comments }),
    });
  }

  // Authorized admin methods
  async getAuthorizedAdmins() {
    return this.request('/authorized-admins');
  }

  // Club methods
  async getClubs() {
    return this.request('/clubs');
  }

  // Club formation request methods
  async getClubFormationRequests() {
    return this.request('/club-formation-requests');
  }

  async createClubFormationRequest(request: any) {
    return this.request('/club-formation-requests', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async updateClubFormationRequestStatus(id: string, status: string) {
    return this.request(`/club-formation-requests/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  async updateEventApprovalByProposalAndAdmin(eventProposalId: string, adminEmail: string, status: string, comments?: string) {
    // Since we don't have individual approval IDs in the client, we'll create a special endpoint
    return this.request(`/event-proposals/${eventProposalId}/approvals/${encodeURIComponent(adminEmail)}`, {
      method: 'PATCH',
      body: JSON.stringify({ status, comments }),
    });
  }

  async createAdminUsers() {
    return this.request('/create-admin-users', {
      method: 'POST',
    });
  }

  async updateEventProposal(id: string, data: any) {
    return this.request(`/event-proposals/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  // Student representative methods
  async getStudentRepresentatives() {
    return this.request('/student-representatives');
  }

  // Important contact methods
  async getImportantContacts() {
    return this.request('/important-contacts');
  }

  // Hostel info methods
  async getHostelInfo() {
    return this.request('/hostel-info');
  }

  // Mess hostel committee methods
  async getMessHostelCommittee() {
    return this.request('/mess-hostel-committee');
  }

}

export const apiClient = new ApiClient();