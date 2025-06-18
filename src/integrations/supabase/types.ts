export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          created_at: string | null
          email: string
          first_name: string
          id: string
          last_name: string
          marketplace: string
          role: Database["public"]["Enums"]["user_role"]
          skills: string[]
          updated_at: string | null
          user_login: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          first_name: string
          id: string
          last_name: string
          marketplace: string
          role?: Database["public"]["Enums"]["user_role"]
          skills?: string[]
          updated_at?: string | null
          user_login?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          first_name?: string
          id?: string
          last_name?: string
          marketplace?: string
          role?: Database["public"]["Enums"]["user_role"]
          skills?: string[]
          updated_at?: string | null
          user_login?: string | null
        }
        Relationships: []
      }
      schedules: {
        Row: {
          created_at: string | null
          id: string
          total_hours: number | null
          updated_at: string | null
          user_id: string
          week_start: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          total_hours?: number | null
          updated_at?: string | null
          user_id: string
          week_start: string
        }
        Update: {
          created_at?: string | null
          id?: string
          total_hours?: number | null
          updated_at?: string | null
          user_id?: string
          week_start?: string
        }
        Relationships: [
          {
            foreignKeyName: "schedules_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      shifts: {
        Row: {
          created_at: string | null
          date: string
          end_time: string
          id: string
          marketplace: string
          schedule_id: string | null
          skills: string[]
          start_time: string
          status: Database["public"]["Enums"]["shift_status"]
          type: Database["public"]["Enums"]["shift_type"]
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          date: string
          end_time: string
          id?: string
          marketplace: string
          schedule_id?: string | null
          skills?: string[]
          start_time: string
          status?: Database["public"]["Enums"]["shift_status"]
          type: Database["public"]["Enums"]["shift_type"]
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          date?: string
          end_time?: string
          id?: string
          marketplace?: string
          schedule_id?: string | null
          skills?: string[]
          start_time?: string
          status?: Database["public"]["Enums"]["shift_status"]
          type?: Database["public"]["Enums"]["shift_type"]
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "shifts_schedule_id_fkey"
            columns: ["schedule_id"]
            isOneToOne: false
            referencedRelation: "schedules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shifts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      swap_chains: {
        Row: {
          approvals: Json
          chain_id: string
          chain_score: number
          created_at: string | null
          execution_order: number[]
          expires_at: string
          id: string
          initiator_user_id: string
          notes: string | null
          participants: Json
          status: Database["public"]["Enums"]["chain_status"]
          swap_steps: Json
          updated_at: string | null
        }
        Insert: {
          approvals?: Json
          chain_id: string
          chain_score?: number
          created_at?: string | null
          execution_order?: number[]
          expires_at?: string
          id?: string
          initiator_user_id: string
          notes?: string | null
          participants?: Json
          status?: Database["public"]["Enums"]["chain_status"]
          swap_steps?: Json
          updated_at?: string | null
        }
        Update: {
          approvals?: Json
          chain_id?: string
          chain_score?: number
          created_at?: string | null
          execution_order?: number[]
          expires_at?: string
          id?: string
          initiator_user_id?: string
          notes?: string | null
          participants?: Json
          status?: Database["public"]["Enums"]["chain_status"]
          swap_steps?: Json
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "swap_chains_initiator_user_id_fkey"
            columns: ["initiator_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      swap_intents: {
        Row: {
          created_at: string | null
          expires_at: string
          id: string
          max_days_out: number
          notes: string | null
          original_shift_id: string
          preferred_marketplaces: string[]
          preferred_time_slots: Database["public"]["Enums"]["time_slot"][]
          priority: number
          skill_flexibility: boolean
          status: Database["public"]["Enums"]["intent_status"]
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          expires_at?: string
          id?: string
          max_days_out?: number
          notes?: string | null
          original_shift_id: string
          preferred_marketplaces?: string[]
          preferred_time_slots?: Database["public"]["Enums"]["time_slot"][]
          priority?: number
          skill_flexibility?: boolean
          status?: Database["public"]["Enums"]["intent_status"]
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          expires_at?: string
          id?: string
          max_days_out?: number
          notes?: string | null
          original_shift_id?: string
          preferred_marketplaces?: string[]
          preferred_time_slots?: Database["public"]["Enums"]["time_slot"][]
          priority?: number
          skill_flexibility?: boolean
          status?: Database["public"]["Enums"]["intent_status"]
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "swap_intents_original_shift_id_fkey"
            columns: ["original_shift_id"]
            isOneToOne: false
            referencedRelation: "shifts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "swap_intents_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      swap_requests: {
        Row: {
          created_at: string | null
          id: string
          message: string | null
          requester_id: string
          requester_shift_id: string
          status: Database["public"]["Enums"]["swap_status"]
          target_shift_id: string | null
          target_user_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          message?: string | null
          requester_id: string
          requester_shift_id: string
          status?: Database["public"]["Enums"]["swap_status"]
          target_shift_id?: string | null
          target_user_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          message?: string | null
          requester_id?: string
          requester_shift_id?: string
          status?: Database["public"]["Enums"]["swap_status"]
          target_shift_id?: string | null
          target_user_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "swap_requests_requester_id_fkey"
            columns: ["requester_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "swap_requests_requester_shift_id_fkey"
            columns: ["requester_shift_id"]
            isOneToOne: false
            referencedRelation: "shifts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "swap_requests_target_shift_id_fkey"
            columns: ["target_shift_id"]
            isOneToOne: false
            referencedRelation: "shifts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "swap_requests_target_user_id_fkey"
            columns: ["target_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_preferences: {
        Row: {
          auto_match_enabled: boolean
          blacklisted_users: string[]
          created_at: string | null
          email_notifications: boolean
          id: string
          max_swaps_per_week: number
          preferred_marketplaces: string[]
          preferred_time_slots: Database["public"]["Enums"]["time_slot"][]
          push_notifications: boolean
          skill_flexibility: boolean
          sms_notifications: boolean
          updated_at: string | null
          user_id: string
        }
        Insert: {
          auto_match_enabled?: boolean
          blacklisted_users?: string[]
          created_at?: string | null
          email_notifications?: boolean
          id?: string
          max_swaps_per_week?: number
          preferred_marketplaces?: string[]
          preferred_time_slots?: Database["public"]["Enums"]["time_slot"][]
          push_notifications?: boolean
          skill_flexibility?: boolean
          sms_notifications?: boolean
          updated_at?: string | null
          user_id: string
        }
        Update: {
          auto_match_enabled?: boolean
          blacklisted_users?: string[]
          created_at?: string | null
          email_notifications?: boolean
          id?: string
          max_swaps_per_week?: number
          preferred_marketplaces?: string[]
          preferred_time_slots?: Database["public"]["Enums"]["time_slot"][]
          push_notifications?: boolean
          skill_flexibility?: boolean
          sms_notifications?: boolean
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_preferences_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      approval_status: "pending" | "approved" | "rejected"
      chain_status:
        | "proposed"
        | "pending"
        | "approved"
        | "executing"
        | "executed"
        | "failed"
        | "expired"
      intent_status: "active" | "matched" | "expired" | "cancelled"
      shift_status: "confirmed" | "pending" | "swap-requested" | "cancelled"
      shift_type: "Day Shift" | "Evening Shift" | "Morning Shift"
      swap_status: "pending" | "accepted" | "rejected" | "cancelled"
      time_slot: "morning" | "day" | "evening" | "any"
      user_role: "Employee" | "Manager" | "WorkFlowManagement" | "Developer"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      approval_status: ["pending", "approved", "rejected"],
      chain_status: [
        "proposed",
        "pending",
        "approved",
        "executing",
        "executed",
        "failed",
        "expired",
      ],
      intent_status: ["active", "matched", "expired", "cancelled"],
      shift_status: ["confirmed", "pending", "swap-requested", "cancelled"],
      shift_type: ["Day Shift", "Evening Shift", "Morning Shift"],
      swap_status: ["pending", "accepted", "rejected", "cancelled"],
      time_slot: ["morning", "day", "evening", "any"],
      user_role: ["Employee", "Manager", "WorkFlowManagement", "Developer"],
    },
  },
} as const
