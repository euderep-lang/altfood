export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      doctor_sections: {
        Row: {
          content: string
          created_at: string
          doctor_id: string
          id: string
          sort_order: number
          title: string
        }
        Insert: {
          content: string
          created_at?: string
          doctor_id: string
          id?: string
          sort_order?: number
          title: string
        }
        Update: {
          content?: string
          created_at?: string
          doctor_id?: string
          id?: string
          sort_order?: number
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "doctor_sections_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["id"]
          },
        ]
      }
      doctors: {
        Row: {
          bio: string | null
          created_at: string
          document_number: string | null
          document_type: string
          email: string
          email_tips: boolean
          email_weekly_summary: boolean
          id: string
          instagram_link: string | null
          logo_url: string | null
          mp_payer_email: string | null
          mp_subscription_id: string | null
          name: string
          onboarding_completed: boolean
          phone: string | null
          primary_color: string
          referral_code: string | null
          referred_by: string | null
          secondary_color: string
          slug: string
          specialty: string
          subscription_end_date: string | null
          subscription_status: string
          theme_layout: string
          trial_ends_at: string
          updated_at: string
          user_id: string
          welcome_message: string | null
          whatsapp_link: string | null
        }
        Insert: {
          bio?: string | null
          created_at?: string
          document_number?: string | null
          document_type?: string
          email: string
          email_tips?: boolean
          email_weekly_summary?: boolean
          id?: string
          instagram_link?: string | null
          logo_url?: string | null
          mp_payer_email?: string | null
          mp_subscription_id?: string | null
          name: string
          onboarding_completed?: boolean
          phone?: string | null
          primary_color?: string
          referral_code?: string | null
          referred_by?: string | null
          secondary_color?: string
          slug: string
          specialty?: string
          subscription_end_date?: string | null
          subscription_status?: string
          theme_layout?: string
          trial_ends_at?: string
          updated_at?: string
          user_id: string
          welcome_message?: string | null
          whatsapp_link?: string | null
        }
        Update: {
          bio?: string | null
          created_at?: string
          document_number?: string | null
          document_type?: string
          email?: string
          email_tips?: boolean
          email_weekly_summary?: boolean
          id?: string
          instagram_link?: string | null
          logo_url?: string | null
          mp_payer_email?: string | null
          mp_subscription_id?: string | null
          name?: string
          onboarding_completed?: boolean
          phone?: string | null
          primary_color?: string
          referral_code?: string | null
          referred_by?: string | null
          secondary_color?: string
          slug?: string
          specialty?: string
          subscription_end_date?: string | null
          subscription_status?: string
          theme_layout?: string
          trial_ends_at?: string
          updated_at?: string
          user_id?: string
          welcome_message?: string | null
          whatsapp_link?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "doctors_referred_by_fkey"
            columns: ["referred_by"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["id"]
          },
        ]
      }
      domain_interests: {
        Row: {
          created_at: string
          doctor_id: string
          id: string
        }
        Insert: {
          created_at?: string
          doctor_id: string
          id?: string
        }
        Update: {
          created_at?: string
          doctor_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "domain_interests_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: true
            referencedRelation: "doctors"
            referencedColumns: ["id"]
          },
        ]
      }
      food_categories: {
        Row: {
          color: string
          icon: string
          id: string
          name: string
          sort_order: number
        }
        Insert: {
          color?: string
          icon?: string
          id?: string
          name: string
          sort_order?: number
        }
        Update: {
          color?: string
          icon?: string
          id?: string
          name?: string
          sort_order?: number
        }
        Relationships: []
      }
      foods: {
        Row: {
          calories: number
          carbohydrates: number
          category_id: string | null
          fat: number
          fiber: number
          id: string
          is_active: boolean
          name: string
          name_short: string
          photo_url: string | null
          preparation: string | null
          protein: number
          source: string
        }
        Insert: {
          calories?: number
          carbohydrates?: number
          category_id?: string | null
          fat?: number
          fiber?: number
          id?: string
          is_active?: boolean
          name: string
          name_short: string
          photo_url?: string | null
          preparation?: string | null
          protein?: number
          source?: string
        }
        Update: {
          calories?: number
          carbohydrates?: number
          category_id?: string | null
          fat?: number
          fiber?: number
          id?: string
          is_active?: boolean
          name?: string
          name_short?: string
          photo_url?: string | null
          preparation?: string | null
          protein?: number
          source?: string
        }
        Relationships: [
          {
            foreignKeyName: "foods_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "food_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      hidden_foods: {
        Row: {
          created_at: string
          doctor_id: string
          food_id: string
          id: string
        }
        Insert: {
          created_at?: string
          doctor_id: string
          food_id: string
          id?: string
        }
        Update: {
          created_at?: string
          doctor_id?: string
          food_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "hidden_foods_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hidden_foods_food_id_fkey"
            columns: ["food_id"]
            isOneToOne: false
            referencedRelation: "foods"
            referencedColumns: ["id"]
          },
        ]
      }
      nps_responses: {
        Row: {
          comment: string | null
          created_at: string
          doctor_id: string
          id: string
          score: number
        }
        Insert: {
          comment?: string | null
          created_at?: string
          doctor_id: string
          id?: string
          score: number
        }
        Update: {
          comment?: string | null
          created_at?: string
          doctor_id?: string
          id?: string
          score?: number
        }
        Relationships: [
          {
            foreignKeyName: "nps_responses_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: true
            referencedRelation: "doctors"
            referencedColumns: ["id"]
          },
        ]
      }
      page_views: {
        Row: {
          doctor_id: string
          id: string
          ip_hash: string | null
          referrer: string | null
          user_agent: string | null
          viewed_at: string
        }
        Insert: {
          doctor_id: string
          id?: string
          ip_hash?: string | null
          referrer?: string | null
          user_agent?: string | null
          viewed_at?: string
        }
        Update: {
          doctor_id?: string
          id?: string
          ip_hash?: string | null
          referrer?: string | null
          user_agent?: string | null
          viewed_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "page_views_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["id"]
          },
        ]
      }
      patient_feedback: {
        Row: {
          created_at: string
          doctor_id: string
          id: string
          is_positive: boolean
        }
        Insert: {
          created_at?: string
          doctor_id: string
          id?: string
          is_positive: boolean
        }
        Update: {
          created_at?: string
          doctor_id?: string
          id?: string
          is_positive?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "patient_feedback_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["id"]
          },
        ]
      }
      rate_limits: {
        Row: {
          action: string
          created_at: string
          id: string
          ip_hash: string
        }
        Insert: {
          action?: string
          created_at?: string
          id?: string
          ip_hash: string
        }
        Update: {
          action?: string
          created_at?: string
          id?: string
          ip_hash?: string
        }
        Relationships: []
      }
      referrals: {
        Row: {
          created_at: string
          id: string
          referred_id: string
          referrer_id: string
          reward_given_at: string | null
          status: string
        }
        Insert: {
          created_at?: string
          id?: string
          referred_id: string
          referrer_id: string
          reward_given_at?: string | null
          status?: string
        }
        Update: {
          created_at?: string
          id?: string
          referred_id?: string
          referrer_id?: string
          reward_given_at?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "referrals_referred_id_fkey"
            columns: ["referred_id"]
            isOneToOne: true
            referencedRelation: "doctors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referrals_referrer_id_fkey"
            columns: ["referrer_id"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["id"]
          },
        ]
      }
      substitution_queries: {
        Row: {
          doctor_id: string
          food_name: string
          id: string
          queried_at: string
          weight_grams: number
        }
        Insert: {
          doctor_id: string
          food_name: string
          id?: string
          queried_at?: string
          weight_grams: number
        }
        Update: {
          doctor_id?: string
          food_name?: string
          id?: string
          queried_at?: string
          weight_grams?: number
        }
        Relationships: [
          {
            foreignKeyName: "substitution_queries_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["id"]
          },
        ]
      }
      support_tickets: {
        Row: {
          admin_reply: string | null
          created_at: string
          doctor_id: string
          id: string
          message: string
          resolved_at: string | null
          status: string
        }
        Insert: {
          admin_reply?: string | null
          created_at?: string
          doctor_id: string
          id?: string
          message: string
          resolved_at?: string | null
          status?: string
        }
        Update: {
          admin_reply?: string | null
          created_at?: string
          doctor_id?: string
          id?: string
          message?: string
          resolved_at?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "support_tickets_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      admin_get_page_views_since: {
        Args: { since_date: string }
        Returns: {
          viewed_at: string
        }[]
      }
      admin_get_support_tickets: {
        Args: never
        Returns: {
          admin_reply: string
          created_at: string
          doctor_email: string
          doctor_id: string
          doctor_name: string
          id: string
          message: string
          resolved_at: string
          status: string
        }[]
      }
      admin_update_ticket_status: {
        Args: { new_status: string; reply?: string; ticket_id: string }
        Returns: undefined
      }
      cleanup_rate_limits: { Args: never; Returns: undefined }
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
