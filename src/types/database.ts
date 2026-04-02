// Auto-generated types for Supabase tables
// TODO: Replace with `npx supabase gen types typescript` output once DB is populated

export type Database = {
  public: {
    Tables: {
      families: {
        Row: {
          id: string;
          family_name: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          family_name: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          family_name?: string;
          updated_at?: string;
        };
      };
      profiles: {
        Row: {
          id: string;
          full_name: string;
          email: string | null;
          phone: string | null;
          whatsapp_opt_in: boolean;
          city: string | null;
          state: string | null;
          country: string;
          role: 'member' | 'admin' | 'super_admin';
          family_id: string | null;
          family_role: 'head' | 'spouse' | 'child' | 'other' | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name: string;
          email?: string | null;
          phone?: string | null;
          whatsapp_opt_in?: boolean;
          city?: string | null;
          state?: string | null;
          country?: string;
          role?: 'member' | 'admin' | 'super_admin';
          family_id?: string | null;
          family_role?: 'head' | 'spouse' | 'child' | 'other' | null;
          avatar_url?: string | null;
        };
        Update: {
          full_name?: string;
          phone?: string | null;
          whatsapp_opt_in?: boolean;
          city?: string | null;
          state?: string | null;
          family_id?: string | null;
          family_role?: 'head' | 'spouse' | 'child' | 'other' | null;
          avatar_url?: string | null;
          updated_at?: string;
        };
      };
      daily_quotes: {
        Row: {
          id: string;
          quote_text: string;
          source: string | null;
          display_date: string | null;
          is_active: boolean;
          author_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          quote_text: string;
          source?: string | null;
          display_date?: string | null;
          is_active?: boolean;
          author_id?: string | null;
        };
        Update: {
          quote_text?: string;
          source?: string | null;
          display_date?: string | null;
          is_active?: boolean;
        };
      };
      site_content: {
        Row: {
          id: string;
          page_key: string;
          title: string;
          body: string;
          meta_description: string | null;
          updated_by: string | null;
          updated_at: string;
        };
        Insert: {
          id?: string;
          page_key: string;
          title: string;
          body: string;
          meta_description?: string | null;
          updated_by?: string | null;
        };
        Update: {
          title?: string;
          body?: string;
          meta_description?: string | null;
          updated_by?: string | null;
          updated_at?: string;
        };
      };
      announcements: {
        Row: {
          id: string;
          title: string;
          body: string;
          body_plain: string;
          category: 'devotion' | 'educare' | 'seva' | 'general';
          is_pinned: boolean;
          author_id: string;
          notify_email: boolean;
          notify_whatsapp: boolean;
          published_at: string | null;
          expires_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          body: string;
          body_plain?: string;
          category?: 'devotion' | 'educare' | 'seva' | 'general';
          is_pinned?: boolean;
          author_id: string;
          notify_email?: boolean;
          notify_whatsapp?: boolean;
          published_at?: string | null;
          expires_at?: string | null;
        };
        Update: {
          title?: string;
          body?: string;
          category?: 'devotion' | 'educare' | 'seva' | 'general';
          is_pinned?: boolean;
          notify_email?: boolean;
          notify_whatsapp?: boolean;
          published_at?: string | null;
          expires_at?: string | null;
          updated_at?: string;
        };
      };
      notification_preferences: {
        Row: {
          user_id: string;
          email_enabled: boolean;
          whatsapp_enabled: boolean;
          devotion: boolean;
          educare: boolean;
          seva: boolean;
          general: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          email_enabled?: boolean;
          whatsapp_enabled?: boolean;
          devotion?: boolean;
          educare?: boolean;
          seva?: boolean;
          general?: boolean;
        };
        Update: {
          email_enabled?: boolean;
          whatsapp_enabled?: boolean;
          devotion?: boolean;
          educare?: boolean;
          seva?: boolean;
          general?: boolean;
          updated_at?: string;
        };
      };
      notification_log: {
        Row: {
          id: string;
          type: 'email' | 'whatsapp';
          recipient_id: string;
          reference_type: string;
          reference_id: string;
          status: 'pending' | 'sent' | 'failed';
          error_message: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          type: 'email' | 'whatsapp';
          recipient_id: string;
          reference_type: string;
          reference_id: string;
          status?: 'pending' | 'sent' | 'failed';
          error_message?: string | null;
        };
        Update: {
          status?: 'pending' | 'sent' | 'failed';
          error_message?: string | null;
        };
      };
      events: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          location: string | null;
          start_time: string;
          end_time: string;
          is_recurring: boolean;
          rrule: string | null;
          recurring_parent_id: string | null;
          occurrence_date: string | null;
          is_cancelled: boolean;
          category: 'devotion' | 'educare' | 'seva' | 'community' | 'special';
          max_attendees: number | null;
          created_by: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          location?: string | null;
          start_time: string;
          end_time: string;
          is_recurring?: boolean;
          rrule?: string | null;
          recurring_parent_id?: string | null;
          occurrence_date?: string | null;
          is_cancelled?: boolean;
          category: 'devotion' | 'educare' | 'seva' | 'community' | 'special';
          max_attendees?: number | null;
          created_by: string;
        };
        Update: {
          title?: string;
          description?: string | null;
          location?: string | null;
          start_time?: string;
          end_time?: string;
          is_recurring?: boolean;
          rrule?: string | null;
          is_cancelled?: boolean;
          max_attendees?: number | null;
          updated_at?: string;
        };
      };
      resources: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          category: 'bhajan' | 'veda' | 'study' | 'newsletter' | 'document';
          file_url: string | null;
          external_url: string | null;
          lyrics: string | null;
          language: string | null;
          tags: string[];
          view_count: number;
          created_by: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          category: 'bhajan' | 'veda' | 'study' | 'newsletter' | 'document';
          file_url?: string | null;
          external_url?: string | null;
          lyrics?: string | null;
          language?: string | null;
          tags?: string[];
          created_by: string;
        };
        Update: {
          title?: string;
          description?: string | null;
          category?: 'bhajan' | 'veda' | 'study' | 'newsletter' | 'document';
          file_url?: string | null;
          external_url?: string | null;
          lyrics?: string | null;
          language?: string | null;
          tags?: string[];
          updated_at?: string;
        };
      };
    };
    Functions: {
      get_daily_quote: {
        Args: Record<string, never>;
        Returns: {
          id: string;
          quote_text: string;
          source: string;
        }[];
      };
      search_resources: {
        Args: { search_query: string };
        Returns: {
          id: string;
          title: string;
          description: string | null;
          category: string;
          rank: number;
        }[];
      };
    };
  };
};

// Convenience type aliases
export type Profile = Database['public']['Tables']['profiles']['Row'];
export type Announcement = Database['public']['Tables']['announcements']['Row'];
export type Event = Database['public']['Tables']['events']['Row'];
export type Resource = Database['public']['Tables']['resources']['Row'];
export type DailyQuote = Database['public']['Tables']['daily_quotes']['Row'];
export type SiteContent = Database['public']['Tables']['site_content']['Row'];
export type NotificationPreferences = Database['public']['Tables']['notification_preferences']['Row'];
export type NotificationLog = Database['public']['Tables']['notification_log']['Row'];
