export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      club_formation_requests: {
        Row: {
          charter_document_url: string | null
          club_description: string
          club_name: string
          club_objectives: string
          created_at: string
          faculty_advisor: string | null
          id: string
          initial_members: string[] | null
          proposed_activities: string | null
          proposed_by_email: string
          proposed_by_name: string
          proposed_by_phone: string | null
          status: string | null
          updated_at: string
        }
        Insert: {
          charter_document_url?: string | null
          club_description: string
          club_name: string
          club_objectives: string
          created_at?: string
          faculty_advisor?: string | null
          id?: string
          initial_members?: string[] | null
          proposed_activities?: string | null
          proposed_by_email: string
          proposed_by_name: string
          proposed_by_phone?: string | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          charter_document_url?: string | null
          club_description?: string
          club_name?: string
          club_objectives?: string
          created_at?: string
          faculty_advisor?: string | null
          id?: string
          initial_members?: string[] | null
          proposed_activities?: string | null
          proposed_by_email?: string
          proposed_by_name?: string
          proposed_by_phone?: string | null
          status?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      clubs: {
        Row: {
          category: string
          channel_link: string | null
          charter_url: string | null
          coordinator_email: string
          coordinator_name: string
          created_at: string
          description: string | null
          formed_date: string | null
          id: string
          instagram_link: string | null
          is_active: boolean | null
          name: string
          updated_at: string
        }
        Insert: {
          category: string
          channel_link?: string | null
          charter_url?: string | null
          coordinator_email: string
          coordinator_name: string
          created_at?: string
          description?: string | null
          formed_date?: string | null
          id?: string
          instagram_link?: string | null
          is_active?: boolean | null
          name: string
          updated_at?: string
        }
        Update: {
          category?: string
          channel_link?: string | null
          charter_url?: string | null
          coordinator_email?: string
          coordinator_name?: string
          created_at?: string
          description?: string | null
          formed_date?: string | null
          id?: string
          instagram_link?: string | null
          is_active?: boolean | null
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      event_proposals: {
        Row: {
          additional_requirements: string | null
          budget_estimate: number | null
          created_at: string
          description: string
          end_time: string
          event_date: string
          event_name: string
          event_type: string
          expected_participants: number
          id: string
          objectives: string | null
          organizer_email: string
          organizer_name: string
          organizer_phone: string | null
          pdf_document_url: string | null
          start_time: string
          status: string | null
          updated_at: string
          venue: string
        }
        Insert: {
          additional_requirements?: string | null
          budget_estimate?: number | null
          created_at?: string
          description: string
          end_time: string
          event_date: string
          event_name: string
          event_type: string
          expected_participants: number
          id?: string
          objectives?: string | null
          organizer_email: string
          organizer_name: string
          organizer_phone?: string | null
          pdf_document_url?: string | null
          start_time: string
          status?: string | null
          updated_at?: string
          venue: string
        }
        Update: {
          additional_requirements?: string | null
          budget_estimate?: number | null
          created_at?: string
          description?: string
          end_time?: string
          event_date?: string
          event_name?: string
          event_type?: string
          expected_participants?: number
          id?: string
          objectives?: string | null
          organizer_email?: string
          organizer_name?: string
          organizer_phone?: string | null
          pdf_document_url?: string | null
          start_time?: string
          status?: string | null
          updated_at?: string
          venue?: string
        }
        Relationships: []
      }
      hostel_info: {
        Row: {
          capacity: number | null
          created_at: string
          emergency_contact: string | null
          facilities: string[] | null
          hostel_name: string
          id: string
          rules: string[] | null
          timings: Json | null
          updated_at: string
          warden_contact: string | null
          warden_name: string | null
        }
        Insert: {
          capacity?: number | null
          created_at?: string
          emergency_contact?: string | null
          facilities?: string[] | null
          hostel_name: string
          id?: string
          rules?: string[] | null
          timings?: Json | null
          updated_at?: string
          warden_contact?: string | null
          warden_name?: string | null
        }
        Update: {
          capacity?: number | null
          created_at?: string
          emergency_contact?: string | null
          facilities?: string[] | null
          hostel_name?: string
          id?: string
          rules?: string[] | null
          timings?: Json | null
          updated_at?: string
          warden_contact?: string | null
          warden_name?: string | null
        }
        Relationships: []
      }
      important_contacts: {
        Row: {
          created_at: string
          department: string | null
          designation: string | null
          display_order: number | null
          email: string | null
          id: string
          is_emergency: boolean | null
          name: string
          phone_number: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          department?: string | null
          designation?: string | null
          display_order?: number | null
          email?: string | null
          id?: string
          is_emergency?: boolean | null
          name: string
          phone_number: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          department?: string | null
          designation?: string | null
          display_order?: number | null
          email?: string | null
          id?: string
          is_emergency?: boolean | null
          name?: string
          phone_number?: string
          updated_at?: string
        }
        Relationships: []
      }
      mess_hostel_committee: {
        Row: {
          created_at: string
          email: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          full_name: string | null
          id: string
          updated_at: string
          username: string
        }
        Insert: {
          created_at?: string
          email: string
          full_name?: string | null
          id?: string
          updated_at?: string
          username: string
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          updated_at?: string
          username?: string
        }
        Relationships: []
      }
      student_representatives: {
        Row: {
          branch: string
          created_at: string
          email: string
          id: string
          name: string
          official_email: string | null
          position: string
          program: string
          updated_at: string
          year: number
        }
        Insert: {
          branch: string
          created_at?: string
          email: string
          id?: string
          name: string
          official_email?: string | null
          position: string
          program: string
          updated_at?: string
          year: number
        }
        Update: {
          branch?: string
          created_at?: string
          email?: string
          id?: string
          name?: string
          official_email?: string | null
          position?: string
          program?: string
          updated_at?: string
          year?: number
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
