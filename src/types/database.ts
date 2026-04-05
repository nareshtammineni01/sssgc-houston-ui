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
          first_name: string | null;
          last_name: string | null;
          full_name: string;
          email: string | null;
          phone: string | null;
          address1: string | null;
          address2: string | null;
          city: string | null;
          state: string | null;
          zip: string | null;
          country: string;
          whatsapp_opt_in: boolean;
          role: 'member' | 'admin' | 'super_admin';
          family_id: string | null;
          family_role: 'head' | 'spouse' | 'child' | 'other' | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          first_name?: string | null;
          last_name?: string | null;
          full_name: string;
          email?: string | null;
          phone?: string | null;
          address1?: string | null;
          address2?: string | null;
          city?: string | null;
          state?: string | null;
          zip?: string | null;
          country?: string;
          whatsapp_opt_in?: boolean;
          role?: 'member' | 'admin' | 'super_admin';
          family_id?: string | null;
          family_role?: 'head' | 'spouse' | 'child' | 'other' | null;
          avatar_url?: string | null;
        };
        Update: {
          first_name?: string | null;
          last_name?: string | null;
          full_name?: string;
          phone?: string | null;
          address1?: string | null;
          address2?: string | null;
          city?: string | null;
          state?: string | null;
          zip?: string | null;
          whatsapp_opt_in?: boolean;
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
          category: 'devotion' | 'educare' | 'seva' | 'festival';
          location: string | null;
          start_time: string;
          end_time: string | null;
          all_day: boolean;
          max_capacity: number | null;
          is_recurring: boolean;
          rrule: string | null;
          recurring_parent_id: string | null;
          occurrence_date: string | null;
          rsvp_deadline: string | null;
          is_cancelled: boolean;
          author_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          category: 'devotion' | 'educare' | 'seva' | 'festival';
          location?: string | null;
          start_time: string;
          end_time?: string | null;
          all_day?: boolean;
          max_capacity?: number | null;
          is_recurring?: boolean;
          rrule?: string | null;
          recurring_parent_id?: string | null;
          occurrence_date?: string | null;
          rsvp_deadline?: string | null;
          is_cancelled?: boolean;
          author_id?: string | null;
        };
        Update: {
          title?: string;
          description?: string | null;
          category?: 'devotion' | 'educare' | 'seva' | 'festival';
          location?: string | null;
          start_time?: string;
          end_time?: string | null;
          all_day?: boolean;
          max_capacity?: number | null;
          is_recurring?: boolean;
          rrule?: string | null;
          rsvp_deadline?: string | null;
          is_cancelled?: boolean;
          updated_at?: string;
        };
      };
      event_signups: {
        Row: {
          id: string;
          event_id: string;
          user_id: string;
          status: 'confirmed' | 'waitlisted' | 'cancelled';
          guest_count: number;
          attended: boolean | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          event_id: string;
          user_id: string;
          status?: 'confirmed' | 'waitlisted' | 'cancelled';
          guest_count?: number;
          attended?: boolean | null;
        };
        Update: {
          status?: 'confirmed' | 'waitlisted' | 'cancelled';
          guest_count?: number;
          attended?: boolean | null;
        };
      };
      educare_enrollments: {
        Row: {
          id: string;
          parent_id: string;
          child_name: string;
          child_age: number;
          age_group: 'group_1_5_9' | 'group_2_10_13' | 'group_3_14_18';
          academic_year: string;
          enrollment_mode: 'in_person' | 'remote';
          status: 'active' | 'inactive' | 'waitlisted';
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          parent_id: string;
          child_name: string;
          child_age: number;
          age_group: 'group_1_5_9' | 'group_2_10_13' | 'group_3_14_18';
          academic_year: string;
          enrollment_mode?: 'in_person' | 'remote';
          status?: 'active' | 'inactive' | 'waitlisted';
          notes?: string | null;
        };
        Update: {
          child_name?: string;
          child_age?: number;
          age_group?: 'group_1_5_9' | 'group_2_10_13' | 'group_3_14_18';
          enrollment_mode?: 'in_person' | 'remote';
          status?: 'active' | 'inactive' | 'waitlisted';
          notes?: string | null;
          updated_at?: string;
        };
      };
      volunteer_signups: {
        Row: {
          id: string;
          user_id: string;
          project_name: string;
          event_id: string | null;
          status: 'signed_up' | 'confirmed' | 'completed' | 'cancelled';
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          project_name: string;
          event_id?: string | null;
          status?: 'signed_up' | 'confirmed' | 'completed' | 'cancelled';
        };
        Update: {
          project_name?: string;
          event_id?: string | null;
          status?: 'signed_up' | 'confirmed' | 'completed' | 'cancelled';
        };
      };
      resources: {
        Row: {
          id: string;
          title: string;
          content: string | null;
          category: 'bhajan' | 'prayer' | 'study_circle' | 'document' | 'bhajan_resource';
          keywords: string[] | null;
          deity: string | null;
          file_url: string | null;
          audio_url: string | null;
          author_id: string | null;
          view_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          content?: string | null;
          category: 'bhajan' | 'prayer' | 'study_circle' | 'document' | 'bhajan_resource';
          keywords?: string[] | null;
          deity?: string | null;
          file_url?: string | null;
          audio_url?: string | null;
          author_id?: string | null;
        };
        Update: {
          title?: string;
          content?: string | null;
          category?: 'bhajan' | 'prayer' | 'study_circle' | 'document' | 'bhajan_resource';
          keywords?: string[] | null;
          deity?: string | null;
          file_url?: string | null;
          audio_url?: string | null;
          updated_at?: string;
        };
      };
      favorites: {
        Row: {
          user_id: string;
          resource_id: string;
          created_at: string;
        };
        Insert: {
          user_id: string;
          resource_id: string;
        };
        Update: Record<string, never>;
      };
      gallery_albums: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          cover_image_url: string | null;
          category: 'devotion' | 'educare' | 'seva' | 'festival' | 'general' | null;
          event_date: string | null;
          is_published: boolean;
          author_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          cover_image_url?: string | null;
          category?: 'devotion' | 'educare' | 'seva' | 'festival' | 'general' | null;
          event_date?: string | null;
          is_published?: boolean;
          author_id?: string | null;
        };
        Update: {
          title?: string;
          description?: string | null;
          cover_image_url?: string | null;
          category?: 'devotion' | 'educare' | 'seva' | 'festival' | 'general' | null;
          event_date?: string | null;
          is_published?: boolean;
          updated_at?: string;
        };
      };
      gallery_photos: {
        Row: {
          id: string;
          album_id: string;
          image_url: string;
          thumbnail_url: string | null;
          caption: string | null;
          sort_order: number;
          uploaded_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          album_id: string;
          image_url: string;
          thumbnail_url?: string | null;
          caption?: string | null;
          sort_order?: number;
          uploaded_by?: string | null;
        };
        Update: {
          image_url?: string;
          thumbnail_url?: string | null;
          caption?: string | null;
          sort_order?: number;
        };
      };
      volunteer_hours: {
        Row: {
          id: string;
          user_id: string;
          project_name: string;
          hours: number;
          service_date: string;
          description: string | null;
          approved_by: string | null;
          approved_at: string | null;
          status: 'pending' | 'approved' | 'rejected';
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          project_name: string;
          hours: number;
          service_date: string;
          description?: string | null;
          status?: 'pending' | 'approved' | 'rejected';
        };
        Update: {
          project_name?: string;
          hours?: number;
          service_date?: string;
          description?: string | null;
          approved_by?: string | null;
          approved_at?: string | null;
          status?: 'pending' | 'approved' | 'rejected';
        };
      };
      member_directory_settings: {
        Row: {
          user_id: string;
          show_in_directory: boolean;
          show_phone: boolean;
          show_email: boolean;
          show_city: boolean;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          show_in_directory?: boolean;
          show_phone?: boolean;
          show_email?: boolean;
          show_city?: boolean;
        };
        Update: {
          show_in_directory?: boolean;
          show_phone?: boolean;
          show_email?: boolean;
          show_city?: boolean;
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
        Returns: Resource[];
      };
      increment_view_count: {
        Args: { resource_id: string };
        Returns: void;
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
export type Favorite = Database['public']['Tables']['favorites']['Row'];
export type EventSignup = Database['public']['Tables']['event_signups']['Row'];
export type EducareEnrollment = Database['public']['Tables']['educare_enrollments']['Row'];
export type VolunteerSignup = Database['public']['Tables']['volunteer_signups']['Row'];
export type GalleryAlbum = Database['public']['Tables']['gallery_albums']['Row'];
export type GalleryPhoto = Database['public']['Tables']['gallery_photos']['Row'];
export type VolunteerHours = Database['public']['Tables']['volunteer_hours']['Row'];
export type MemberDirectorySettings = Database['public']['Tables']['member_directory_settings']['Row'];
