// Types for our API responses
type ApiResponse<T = any> = 
  | { data: T; error?: never }
  | { data?: never; error: string };

type ApiRequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: any;
  params?: Record<string, string | number | boolean>;
};

// Define types for our data models
type Profile = {
  id: string;
  email: string;
  name: string;
  role: string;
  createdAt: string;
  updatedAt: string;
};

type EventProposal = {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  updatedAt: string;
  createdBy: string;
};

// API client to handle all server communication
class ApiClient {
  private baseUrl: string;

  constructor() {
    // In development, Vite will proxy requests to the server
    this.baseUrl = '/api';
  }

  private async request<T = any>(
    endpoint: string,
    options: ApiRequestOptions = {}
  ): Promise<ApiResponse<T>> {
    const { method = 'GET', headers = {}, body, params } = options;
    
    // Add authorization header if token exists
    const token = localStorage.getItem('auth_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    // Convert params to query string if present
    const queryString = params
      ? '?' + new URLSearchParams(params as Record<string, string>).toString()
      : '';

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}${queryString}`, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
        credentials: 'include',
        body: body ? JSON.stringify(body) : undefined,
      });

      if (!response.ok) {
        let error = 'Request failed';
        try {
          const errorData = await response.json();
          error = errorData.error || error;
        } catch (e) {
          // If we can't parse the error, use the status text
          error = response.statusText || error;
        }
        return { error };
      }

      // For 204 No Content responses, return empty object
      if (response.status === 204) {
        return { data: {} as T };
      }

      const data = await response.json();
      return { data };
    } catch (error) {
      console.error('API request failed:', error);
      return { 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      };
    }
  }

  // ===== Auth Methods =====
  async sendOTP(email: string): Promise<ApiResponse<{ message: string }>> {
    return this.request('/auth/send-otp', {
      method: 'POST',
      body: { email },
    });
  }

  async verifyOTP(email: string, otp: string): Promise<ApiResponse<{ token: string }>> {
    return this.request('/auth/verify-otp', {
      method: 'POST',
      body: { email, otp },
    });
  }

  // ===== Profile Methods =====
  async getProfile(id: string): Promise<ApiResponse<Profile>> {
    return this.request<Profile>(`/profiles/${id}`);
  }

  // ===== Event Methods =====
  async getEventProposals(): Promise<ApiResponse<EventProposal[]>> {
    return this.request<EventProposal[]>('/events');
  }

  async getEventProposal(id: string): Promise<ApiResponse<EventProposal>> {
    return this.request<EventProposal>(`/events/${id}`);
  }

  async createEventProposal(event: Omit<EventProposal, 'id' | 'status' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<EventProposal>> {
    return this.request<EventProposal>('/events', {
      method: 'POST',
      body: event,
    });
  }
}

export const apiClient = new ApiClient();

// Export types for use in components
export type { Profile, EventProposal };
