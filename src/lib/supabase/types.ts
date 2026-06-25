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
      owner: {
        Row: {
          id: string
          email: string
          created_at: string
        }
        Insert: {
          id: string
          email: string
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          created_at?: string
        }
        Relationships: []
      }
      projects: {
        Row: {
          id: string
          owner_id: string
          title: string
          subtitle: string | null
          genre: string | null
          status: 'draft' | 'in_progress' | 'complete' | 'published'
          cover_image: string | null
          target_word_count: number | null
          is_favorite: boolean
          is_archived: boolean
          template: string
          word_count: number
          last_edited_at: string
          created_at: string
        }
        Insert: {
          id?: string
          owner_id: string
          title: string
          subtitle?: string | null
          genre?: string | null
          status?: 'draft' | 'in_progress' | 'complete' | 'published'
          cover_image?: string | null
          target_word_count?: number | null
          is_favorite?: boolean
          is_archived?: boolean
          template?: string
          word_count?: number
          last_edited_at?: string
          created_at?: string
        }
        Update: {
          id?: string
          owner_id?: string
          title?: string
          subtitle?: string | null
          genre?: string | null
          status?: 'draft' | 'in_progress' | 'complete' | 'published'
          cover_image?: string | null
          target_word_count?: number | null
          is_favorite?: boolean
          is_archived?: boolean
          template?: string
          word_count?: number
          last_edited_at?: string
          created_at?: string
        }
        Relationships: []
      }
      project_settings: {
        Row: {
          id: string
          project_id: string
          default_voice: string | null
          ai_model: string
          created_at: string
        }
        Insert: {
          id?: string
          project_id: string
          default_voice?: string | null
          ai_model?: string
          created_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          default_voice?: string | null
          ai_model?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'project_settings_project_id_fkey'
            columns: ['project_id']
            isOneToOne: true
            referencedRelation: 'projects'
            referencedColumns: ['id']
          }
        ]
      }
      chapters: {
        Row: {
          id: string
          project_id: string
          title: string
          order: number
          content: Json | null
          word_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          project_id: string
          title?: string
          order?: number
          content?: Json | null
          word_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          title?: string
          order?: number
          content?: Json | null
          word_count?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'chapters_project_id_fkey'
            columns: ['project_id']
            isOneToOne: false
            referencedRelation: 'projects'
            referencedColumns: ['id']
          }
        ]
      }
      chapter_sections: {
        Row: {
          id: string
          chapter_id: string
          title: string
          order: number
          content: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          chapter_id: string
          title: string
          order?: number
          content?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          chapter_id?: string
          title?: string
          order?: number
          content?: Json | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'chapter_sections_chapter_id_fkey'
            columns: ['chapter_id']
            isOneToOne: false
            referencedRelation: 'chapters'
            referencedColumns: ['id']
          }
        ]
      }
      outlines: {
        Row: {
          id: string
          project_id: string
          title: string
          level: number
          order: number
          parent_id: string | null
          completion_status: 'not_started' | 'in_progress' | 'complete'
          notes: string | null
          linked_chapter_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          project_id: string
          title: string
          level?: number
          order?: number
          parent_id?: string | null
          completion_status?: 'not_started' | 'in_progress' | 'complete'
          notes?: string | null
          linked_chapter_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          title?: string
          level?: number
          order?: number
          parent_id?: string | null
          completion_status?: 'not_started' | 'in_progress' | 'complete'
          notes?: string | null
          linked_chapter_id?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'outlines_project_id_fkey'
            columns: ['project_id']
            isOneToOne: false
            referencedRelation: 'projects'
            referencedColumns: ['id']
          }
        ]
      }
      notes: {
        Row: {
          id: string
          project_id: string
          title: string | null
          content: string | null
          tags: string[]
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          project_id: string
          title?: string | null
          content?: string | null
          tags?: string[]
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          title?: string | null
          content?: string | null
          tags?: string[]
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'notes_project_id_fkey'
            columns: ['project_id']
            isOneToOne: false
            referencedRelation: 'projects'
            referencedColumns: ['id']
          }
        ]
      }
      research: {
        Row: {
          id: string
          project_id: string
          type: 'pdf' | 'image' | 'screenshot' | 'link' | 'quote' | 'note'
          title: string | null
          content: string | null
          url: string | null
          file_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          project_id: string
          type: 'pdf' | 'image' | 'screenshot' | 'link' | 'quote' | 'note'
          title?: string | null
          content?: string | null
          url?: string | null
          file_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          type?: 'pdf' | 'image' | 'screenshot' | 'link' | 'quote' | 'note'
          title?: string | null
          content?: string | null
          url?: string | null
          file_url?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'research_project_id_fkey'
            columns: ['project_id']
            isOneToOne: false
            referencedRelation: 'projects'
            referencedColumns: ['id']
          }
        ]
      }
      writing_guidelines: {
        Row: {
          id: string
          project_id: string
          guidelines: string
          updated_at: string
        }
        Insert: {
          id?: string
          project_id: string
          guidelines?: string
          updated_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          guidelines?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'writing_guidelines_project_id_fkey'
            columns: ['project_id']
            isOneToOne: true
            referencedRelation: 'projects'
            referencedColumns: ['id']
          }
        ]
      }
      timeline: {
        Row: {
          id: string
          project_id: string
          date: string | null
          title: string
          description: string | null
          order: number
          created_at: string
        }
        Insert: {
          id?: string
          project_id: string
          date?: string | null
          title: string
          description?: string | null
          order?: number
          created_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          date?: string | null
          title?: string
          description?: string | null
          order?: number
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'timeline_project_id_fkey'
            columns: ['project_id']
            isOneToOne: false
            referencedRelation: 'projects'
            referencedColumns: ['id']
          }
        ]
      }
      knowledge_base: {
        Row: {
          id: string
          project_id: string
          type: 'person' | 'place' | 'event' | 'organization' | 'argument' | 'quote' | 'theme' | 'other'
          name: string
          description: string | null
          data: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          project_id: string
          type: 'person' | 'place' | 'event' | 'organization' | 'argument' | 'quote' | 'theme' | 'other'
          name: string
          description?: string | null
          data?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          type?: 'person' | 'place' | 'event' | 'organization' | 'argument' | 'quote' | 'theme' | 'other'
          name?: string
          description?: string | null
          data?: Json
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'knowledge_base_project_id_fkey'
            columns: ['project_id']
            isOneToOne: false
            referencedRelation: 'projects'
            referencedColumns: ['id']
          }
        ]
      }
      ai_memory: {
        Row: {
          id: string
          project_id: string
          memory_type: 'outline' | 'summary' | 'voice' | 'rules' | 'characters' | 'timeline' | 'themes' | 'research' | 'accepted_edits' | 'rejected_edits'
          content: string
          updated_at: string
        }
        Insert: {
          id?: string
          project_id: string
          memory_type: 'outline' | 'summary' | 'voice' | 'rules' | 'characters' | 'timeline' | 'themes' | 'research' | 'accepted_edits' | 'rejected_edits'
          content: string
          updated_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          memory_type?: 'outline' | 'summary' | 'voice' | 'rules' | 'characters' | 'timeline' | 'themes' | 'research' | 'accepted_edits' | 'rejected_edits'
          content?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'ai_memory_project_id_fkey'
            columns: ['project_id']
            isOneToOne: false
            referencedRelation: 'projects'
            referencedColumns: ['id']
          }
        ]
      }
      ai_suggestions: {
        Row: {
          id: string
          project_id: string
          chapter_id: string | null
          problem: string
          explanation: string | null
          suggestion: string | null
          status: 'pending' | 'accepted' | 'rejected' | 'ignored'
          created_at: string
        }
        Insert: {
          id?: string
          project_id: string
          chapter_id?: string | null
          problem: string
          explanation?: string | null
          suggestion?: string | null
          status?: 'pending' | 'accepted' | 'rejected' | 'ignored'
          created_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          chapter_id?: string | null
          problem?: string
          explanation?: string | null
          suggestion?: string | null
          status?: 'pending' | 'accepted' | 'rejected' | 'ignored'
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'ai_suggestions_project_id_fkey'
            columns: ['project_id']
            isOneToOne: false
            referencedRelation: 'projects'
            referencedColumns: ['id']
          }
        ]
      }
      generated_sections: {
        Row: {
          id: string
          project_id: string
          outline_id: string | null
          content: string
          status: 'pending' | 'accepted' | 'rejected' | 'edited'
          created_at: string
        }
        Insert: {
          id?: string
          project_id: string
          outline_id?: string | null
          content: string
          status?: 'pending' | 'accepted' | 'rejected' | 'edited'
          created_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          outline_id?: string | null
          content?: string
          status?: 'pending' | 'accepted' | 'rejected' | 'edited'
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'generated_sections_project_id_fkey'
            columns: ['project_id']
            isOneToOne: false
            referencedRelation: 'projects'
            referencedColumns: ['id']
          }
        ]
      }
      versions: {
        Row: {
          id: string
          project_id: string
          chapter_id: string | null
          content: Json
          word_count: number
          label: string | null
          created_at: string
        }
        Insert: {
          id?: string
          project_id: string
          chapter_id?: string | null
          content: Json
          word_count?: number
          label?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          chapter_id?: string | null
          content?: Json
          word_count?: number
          label?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'versions_project_id_fkey'
            columns: ['project_id']
            isOneToOne: false
            referencedRelation: 'projects'
            referencedColumns: ['id']
          }
        ]
      }
      activity_log: {
        Row: {
          id: string
          project_id: string
          action: string
          metadata: Json
          created_at: string
        }
        Insert: {
          id?: string
          project_id: string
          action: string
          metadata?: Json
          created_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          action?: string
          metadata?: Json
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'activity_log_project_id_fkey'
            columns: ['project_id']
            isOneToOne: false
            referencedRelation: 'projects'
            referencedColumns: ['id']
          }
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
  }
}

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type TablesInsert<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type TablesUpdate<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']
