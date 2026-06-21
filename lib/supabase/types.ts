export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          full_name: string | null
          country: string | null
          currency: string | null
          city: string | null
          business_name: string | null
          business_type: string | null
          tier: string | null
          billing_cycle: string | null
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          created_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          country?: string | null
          currency?: string | null
          city?: string | null
          business_name?: string | null
          business_type?: string | null
          tier?: string | null
          billing_cycle?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          country?: string | null
          currency?: string | null
          city?: string | null
          business_name?: string | null
          business_type?: string | null
          tier?: string | null
          billing_cycle?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          created_at?: string
        }
      }
      transactions: {
        Row: {
          id: string
          user_id: string
          date: string
          description: string
          amount: number
          currency: string
          amount_gbp: number | null
          category: string | null
          type: string
          is_flagged: boolean
          finn_note: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          date: string
          description: string
          amount: number
          currency?: string
          amount_gbp?: number | null
          category?: string | null
          type: string
          is_flagged?: boolean
          finn_note?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          date?: string
          description?: string
          amount?: number
          currency?: string
          amount_gbp?: number | null
          category?: string | null
          type?: string
          is_flagged?: boolean
          finn_note?: string | null
          created_at?: string
        }
      }
      agent_logs: {
        Row: {
          id: string
          user_id: string
          agent: string
          action: string
          result: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          agent: string
          action: string
          result?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          agent?: string
          action?: string
          result?: string | null
          created_at?: string
        }
      }
      agent_chats: {
        Row: {
          id: string
          user_id: string
          agent: string
          role: string
          content: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          agent: string
          role: string
          content: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          agent?: string
          role?: string
          content?: string
          created_at?: string
        }
      }
      reports: {
        Row: {
          id: string
          user_id: string
          type: string
          period: string
          data: Json
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: string
          period: string
          data?: Json
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: string
          period?: string
          data?: Json
          created_at?: string
        }
      }
      daily_briefs: {
        Row: {
          id: string
          user_id: string
          date: string
          weather: Json
          news: Json
          aria_brief: string | null
          health_score: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          date: string
          weather?: Json
          news?: Json
          aria_brief?: string | null
          health_score?: number
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          date?: string
          weather?: Json
          news?: Json
          aria_brief?: string | null
          health_score?: number
          created_at?: string
        }
      }
    }
  }
}
