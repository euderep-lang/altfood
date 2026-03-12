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
          secondary_color: string
          slug: string
          specialty: string
          subscription_end_date: string | null
          subscription_status: string
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
          secondary_color?: string
          slug: string
          specialty?: string
          subscription_end_date?: string | null
          subscription_status?: string
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
          secondary_color?: string
          slug?: string
          specialty?: string
          subscription_end_date?: string | null
          subscription_status?: string
          trial_ends_at?: string
          updated_at?: string
          user_id?: string
          welcome_message?: string | null
          whatsapp_link?: string | null
        }
        Relationships: []
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
