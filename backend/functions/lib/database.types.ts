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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      ai_queries: {
        Row: {
          answer_text: string
          conflict_details: string | null
          created_at: string
          execution_time_ms: number
          id: string
          query_text: string
          role_scope: string
          status: string
          user_id: string
        }
        Insert: {
          answer_text: string
          conflict_details?: string | null
          created_at?: string
          execution_time_ms: number
          id?: string
          query_text: string
          role_scope: string
          status: string
          user_id: string
        }
        Update: {
          answer_text?: string
          conflict_details?: string | null
          created_at?: string
          execution_time_ms?: number
          id?: string
          query_text?: string
          role_scope?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_queries_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          actor_email: string
          actor_id: string
          actor_role: string
          entity_id: string
          entity_type: string
          id: string
          ip_address: unknown
          metadata: Json | null
          result: string
          timestamp: string
        }
        Insert: {
          action: string
          actor_email: string
          actor_id: string
          actor_role: string
          entity_id: string
          entity_type: string
          id?: string
          ip_address?: unknown
          metadata?: Json | null
          result: string
          timestamp?: string
        }
        Update: {
          action?: string
          actor_email?: string
          actor_id?: string
          actor_role?: string
          entity_id?: string
          entity_type?: string
          id?: string
          ip_address?: unknown
          metadata?: Json | null
          result?: string
          timestamp?: string
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      data_sources: {
        Row: {
          check_schedule: string
          classification: string
          code: string
          error_count: number
          freshness_status: string
          id: string
          last_changed_at: string | null
          last_checked_at: string | null
          name: string
          source_effective_date: string | null
          source_published_at: string | null
          source_url: string
        }
        Insert: {
          check_schedule: string
          classification: string
          code: string
          error_count?: number
          freshness_status?: string
          id?: string
          last_changed_at?: string | null
          last_checked_at?: string | null
          name: string
          source_effective_date?: string | null
          source_published_at?: string | null
          source_url: string
        }
        Update: {
          check_schedule?: string
          classification?: string
          code?: string
          error_count?: number
          freshness_status?: string
          id?: string
          last_changed_at?: string | null
          last_checked_at?: string | null
          name?: string
          source_effective_date?: string | null
          source_published_at?: string | null
          source_url?: string
        }
        Relationships: []
      }
      discrepancies: {
        Row: {
          baseline_value: string
          claimed_value: string
          created_at: string
          discrepancy_percentage: number | null
          document_id: string | null
          field_name: string
          flagged_by: string
          id: string
          notes: string
          status: string
        }
        Insert: {
          baseline_value: string
          claimed_value: string
          created_at?: string
          discrepancy_percentage?: number | null
          document_id?: string | null
          field_name: string
          flagged_by: string
          id?: string
          notes: string
          status?: string
        }
        Update: {
          baseline_value?: string
          claimed_value?: string
          created_at?: string
          discrepancy_percentage?: number | null
          document_id?: string | null
          field_name?: string
          flagged_by?: string
          id?: string
          notes?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "discrepancies_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "discrepancies_flagged_by_fkey"
            columns: ["flagged_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      document_chunks: {
        Row: {
          chunk_index: number
          content: string
          created_at: string
          document_id: string
          embedding: string | null
          id: string
          is_stale: boolean
          metadata: Json
          page_number: number
          token_count: number
          tsv: unknown
        }
        Insert: {
          chunk_index: number
          content: string
          created_at?: string
          document_id: string
          embedding?: string | null
          id?: string
          is_stale?: boolean
          metadata: Json
          page_number: number
          token_count: number
          tsv?: unknown
        }
        Update: {
          chunk_index?: number
          content?: string
          created_at?: string
          document_id?: string
          embedding?: string | null
          id?: string
          is_stale?: boolean
          metadata?: Json
          page_number?: number
          token_count?: number
          tsv?: unknown
        }
        Relationships: [
          {
            foreignKeyName: "document_chunks_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
        ]
      }
      document_pages: {
        Row: {
          document_id: string
          height_px: number
          id: string
          ocr_status: string
          page_number: number
          raw_ocr_json: Json | null
          storage_path: string
          width_px: number
        }
        Insert: {
          document_id: string
          height_px: number
          id?: string
          ocr_status?: string
          page_number: number
          raw_ocr_json?: Json | null
          storage_path: string
          width_px: number
        }
        Update: {
          document_id?: string
          height_px?: number
          id?: string
          ocr_status?: string
          page_number?: number
          raw_ocr_json?: Json | null
          storage_path?: string
          width_px?: number
        }
        Relationships: [
          {
            foreignKeyName: "document_pages_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
        ]
      }
      document_versions: {
        Row: {
          created_at: string
          document_id: string
          id: string
          sha256_hash: string
          storage_path: string
          version_number: number
        }
        Insert: {
          created_at?: string
          document_id: string
          id?: string
          sha256_hash: string
          storage_path: string
          version_number: number
        }
        Update: {
          created_at?: string
          document_id?: string
          id?: string
          sha256_hash?: string
          storage_path?: string
          version_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "document_versions_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          category: string
          created_at: string
          extracted_summary: string | null
          file_name: string
          file_size_bytes: number
          id: string
          is_demo: boolean
          mime_type: string
          mine_id: string | null
          organization_id: string
          overall_confidence: number | null
          page_count: number
          reporting_period: string
          sha256_hash: string
          status: string
          storage_path: string
          title: string
          updated_at: string
          uploaded_by: string
        }
        Insert: {
          category: string
          created_at?: string
          extracted_summary?: string | null
          file_name: string
          file_size_bytes: number
          id?: string
          is_demo?: boolean
          mime_type: string
          mine_id?: string | null
          organization_id: string
          overall_confidence?: number | null
          page_count?: number
          reporting_period: string
          sha256_hash: string
          status?: string
          storage_path: string
          title: string
          updated_at?: string
          uploaded_by: string
        }
        Update: {
          category?: string
          created_at?: string
          extracted_summary?: string | null
          file_name?: string
          file_size_bytes?: number
          id?: string
          is_demo?: boolean
          mime_type?: string
          mine_id?: string | null
          organization_id?: string
          overall_confidence?: number | null
          page_count?: number
          reporting_period?: string
          sha256_hash?: string
          status?: string
          storage_path?: string
          title?: string
          updated_at?: string
          uploaded_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "documents_mine_id_fkey"
            columns: ["mine_id"]
            isOneToOne: false
            referencedRelation: "mines"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      extracted_records: {
        Row: {
          bounding_box: Json
          confidence: number
          created_at: string
          document_id: string
          extracted_value: string
          field_label: string
          field_name: string
          id: string
          page_number: number
          status: string
          unit: string
          updated_at: string
          verification_notes: string | null
          verified_by: string | null
          verified_value: string | null
        }
        Insert: {
          bounding_box: Json
          confidence: number
          created_at?: string
          document_id: string
          extracted_value: string
          field_label: string
          field_name: string
          id?: string
          page_number: number
          status?: string
          unit: string
          updated_at?: string
          verification_notes?: string | null
          verified_by?: string | null
          verified_value?: string | null
        }
        Update: {
          bounding_box?: Json
          confidence?: number
          created_at?: string
          document_id?: string
          extracted_value?: string
          field_label?: string
          field_name?: string
          id?: string
          page_number?: number
          status?: string
          unit?: string
          updated_at?: string
          verification_notes?: string | null
          verified_by?: string | null
          verified_value?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "extracted_records_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "extracted_records_verified_by_fkey"
            columns: ["verified_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      information_requests: {
        Row: {
          created_at: string
          description: string
          due_date: string
          id: string
          initiator_id: string
          initiator_org_id: string
          reporting_period: string
          request_number: string
          requested_fields: string[]
          status: string
          subject: string
          target_org_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description: string
          due_date: string
          id?: string
          initiator_id: string
          initiator_org_id: string
          reporting_period: string
          request_number: string
          requested_fields: string[]
          status?: string
          subject: string
          target_org_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          due_date?: string
          id?: string
          initiator_id?: string
          initiator_org_id?: string
          reporting_period?: string
          request_number?: string
          requested_fields?: string[]
          status?: string
          subject?: string
          target_org_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "information_requests_initiator_id_fkey"
            columns: ["initiator_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "information_requests_initiator_org_id_fkey"
            columns: ["initiator_org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "information_requests_target_org_id_fkey"
            columns: ["target_org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      manual_record_fields: {
        Row: {
          field_name: string
          id: string
          manual_record_id: string
          source_note: string | null
          unit: string
          value: number
        }
        Insert: {
          field_name: string
          id?: string
          manual_record_id: string
          source_note?: string | null
          unit: string
          value: number
        }
        Update: {
          field_name?: string
          id?: string
          manual_record_id?: string
          source_note?: string | null
          unit?: string
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "manual_record_fields_manual_record_id_fkey"
            columns: ["manual_record_id"]
            isOneToOne: false
            referencedRelation: "manual_records"
            referencedColumns: ["id"]
          },
        ]
      }
      manual_records: {
        Row: {
          author_id: string
          category: string
          created_at: string
          id: string
          is_demo: boolean
          mine_id: string
          organization_id: string
          reporting_period: string
          source_date: string
          source_explanation: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          author_id: string
          category: string
          created_at?: string
          id?: string
          is_demo?: boolean
          mine_id: string
          organization_id: string
          reporting_period: string
          source_date: string
          source_explanation?: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          author_id?: string
          category?: string
          created_at?: string
          id?: string
          is_demo?: boolean
          mine_id?: string
          organization_id?: string
          reporting_period?: string
          source_date?: string
          source_explanation?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "manual_records_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "manual_records_mine_id_fkey"
            columns: ["mine_id"]
            isOneToOne: false
            referencedRelation: "mines"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "manual_records_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      mines: {
        Row: {
          area_name: string
          code: string
          colliery_type: string
          created_at: string
          id: string
          name: string
          organization_id: string
          state: string
        }
        Insert: {
          area_name: string
          code: string
          colliery_type: string
          created_at?: string
          id?: string
          name: string
          organization_id: string
          state: string
        }
        Update: {
          area_name?: string
          code?: string
          colliery_type?: string
          created_at?: string
          id?: string
          name?: string
          organization_id?: string
          state?: string
        }
        Relationships: [
          {
            foreignKeyName: "mines_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          annual_target_mt: number | null
          code: string
          created_at: string
          headquarters_location: string
          id: string
          name: string
          tier: string
        }
        Insert: {
          annual_target_mt?: number | null
          code: string
          created_at?: string
          headquarters_location: string
          id?: string
          name: string
          tier: string
        }
        Update: {
          annual_target_mt?: number | null
          code?: string
          created_at?: string
          headquarters_location?: string
          id?: string
          name?: string
          tier?: string
        }
        Relationships: []
      }
      processing_jobs: {
        Row: {
          attempt_count: number
          backoff_seconds: number
          completed_at: string | null
          created_at: string
          entity_id: string
          error_message: string | null
          id: string
          job_type: string
          lease_timeout_seconds: number
          locked_at: string | null
          locked_until: string | null
          max_attempts: number
          payload: Json
          started_at: string | null
          status: string
          worker_id: string | null
        }
        Insert: {
          attempt_count?: number
          backoff_seconds?: number
          completed_at?: string | null
          created_at?: string
          entity_id: string
          error_message?: string | null
          id?: string
          job_type: string
          lease_timeout_seconds?: number
          locked_at?: string | null
          locked_until?: string | null
          max_attempts?: number
          payload?: Json
          started_at?: string | null
          status?: string
          worker_id?: string | null
        }
        Update: {
          attempt_count?: number
          backoff_seconds?: number
          completed_at?: string | null
          created_at?: string
          entity_id?: string
          error_message?: string | null
          id?: string
          job_type?: string
          lease_timeout_seconds?: number
          locked_at?: string | null
          locked_until?: string | null
          max_attempts?: number
          payload?: Json
          started_at?: string | null
          status?: string
          worker_id?: string | null
        }
        Relationships: []
      }
      production_records: {
        Row: {
          approval_status: string
          ash_percentage: number | null
          created_at: string
          despatch_rakes: number | null
          id: string
          mine_id: string
          organization_id: string
          overburden_m3: number
          raw_coal_tonnes: number
          record_date: string
          reporting_period: string
          source_document_id: string | null
          source_manual_id: string | null
          source_type: string
        }
        Insert: {
          approval_status?: string
          ash_percentage?: number | null
          created_at?: string
          despatch_rakes?: number | null
          id?: string
          mine_id: string
          organization_id: string
          overburden_m3: number
          raw_coal_tonnes: number
          record_date: string
          reporting_period: string
          source_document_id?: string | null
          source_manual_id?: string | null
          source_type: string
        }
        Update: {
          approval_status?: string
          ash_percentage?: number | null
          created_at?: string
          despatch_rakes?: number | null
          id?: string
          mine_id?: string
          organization_id?: string
          overburden_m3?: number
          raw_coal_tonnes?: number
          record_date?: string
          reporting_period?: string
          source_document_id?: string | null
          source_manual_id?: string | null
          source_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "production_records_mine_id_fkey"
            columns: ["mine_id"]
            isOneToOne: false
            referencedRelation: "mines"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "production_records_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "production_records_source_document_id_fkey"
            columns: ["source_document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "production_records_source_manual_id_fkey"
            columns: ["source_manual_id"]
            isOneToOne: false
            referencedRelation: "manual_records"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          auth_user_id: string | null
          created_at: string
          designation: string
          email: string
          full_name: string
          id: string
          is_demo: boolean
          mine_id: string | null
          organization_id: string
          role: string
          role_label: string
          updated_at: string
        }
        Insert: {
          auth_user_id?: string | null
          created_at?: string
          designation: string
          email: string
          full_name: string
          id?: string
          is_demo?: boolean
          mine_id?: string | null
          organization_id: string
          role: string
          role_label: string
          updated_at?: string
        }
        Update: {
          auth_user_id?: string | null
          created_at?: string
          designation?: string
          email?: string
          full_name?: string
          id?: string
          is_demo?: boolean
          mine_id?: string | null
          organization_id?: string
          role?: string
          role_label?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_mine_id_fkey"
            columns: ["mine_id"]
            isOneToOne: false
            referencedRelation: "mines"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      report_drafts: {
        Row: {
          author_id: string
          citations: Json
          created_at: string
          executive_summary: string
          id: string
          metrics_data: Json
          report_type: string
          reporting_period: string
          scope_filter: Json
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          author_id: string
          citations: Json
          created_at?: string
          executive_summary: string
          id?: string
          metrics_data: Json
          report_type: string
          reporting_period: string
          scope_filter: Json
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          author_id?: string
          citations?: Json
          created_at?: string
          executive_summary?: string
          id?: string
          metrics_data?: Json
          report_type?: string
          reporting_period?: string
          scope_filter?: Json
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "report_drafts_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      report_exports: {
        Row: {
          created_at: string
          draft_id: string
          file_size_bytes: number
          format: string
          id: string
          storage_path: string
        }
        Insert: {
          created_at?: string
          draft_id: string
          file_size_bytes: number
          format: string
          id?: string
          storage_path: string
        }
        Update: {
          created_at?: string
          draft_id?: string
          file_size_bytes?: number
          format?: string
          id?: string
          storage_path?: string
        }
        Relationships: [
          {
            foreignKeyName: "report_exports_draft_id_fkey"
            columns: ["draft_id"]
            isOneToOne: false
            referencedRelation: "report_drafts"
            referencedColumns: ["id"]
          },
        ]
      }
      request_clarifications: {
        Row: {
          author_id: string
          clarification_text: string
          created_at: string
          id: string
          request_id: string
        }
        Insert: {
          author_id: string
          clarification_text: string
          created_at?: string
          id?: string
          request_id: string
        }
        Update: {
          author_id?: string
          clarification_text?: string
          created_at?: string
          id?: string
          request_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "request_clarifications_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "request_clarifications_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "information_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      request_responses: {
        Row: {
          attached_document_ids: string[] | null
          id: string
          request_id: string
          responder_id: string
          response_text: string
          submitted_at: string
        }
        Insert: {
          attached_document_ids?: string[] | null
          id?: string
          request_id: string
          responder_id: string
          response_text: string
          submitted_at?: string
        }
        Update: {
          attached_document_ids?: string[] | null
          id?: string
          request_id?: string
          responder_id?: string
          response_text?: string
          submitted_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "request_responses_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "information_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "request_responses_responder_id_fkey"
            columns: ["responder_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      retrieval_citations: {
        Row: {
          document_id: string
          excerpt: string
          id: string
          page_number: number
          query_id: string
          similarity_score: number
        }
        Insert: {
          document_id: string
          excerpt: string
          id?: string
          page_number: number
          query_id: string
          similarity_score: number
        }
        Update: {
          document_id?: string
          excerpt?: string
          id?: string
          page_number?: number
          query_id?: string
          similarity_score?: number
        }
        Relationships: [
          {
            foreignKeyName: "retrieval_citations_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "retrieval_citations_query_id_fkey"
            columns: ["query_id"]
            isOneToOne: false
            referencedRelation: "ai_queries"
            referencedColumns: ["id"]
          },
        ]
      }
      review_tasks: {
        Row: {
          assigned_role: string
          created_at: string
          entity_id: string
          entity_type: string
          id: string
          remarks: string | null
          resolved_at: string | null
          reviewer_id: string | null
          stage: string
          status: string
        }
        Insert: {
          assigned_role: string
          created_at?: string
          entity_id: string
          entity_type: string
          id?: string
          remarks?: string | null
          resolved_at?: string | null
          reviewer_id?: string | null
          stage: string
          status?: string
        }
        Update: {
          assigned_role?: string
          created_at?: string
          entity_id?: string
          entity_type?: string
          id?: string
          remarks?: string | null
          resolved_at?: string | null
          reviewer_id?: string | null
          stage?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "review_tasks_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      topic_assignments: {
        Row: {
          document_id: string
          id: string
          relevance_score: number
          topic_id: string
        }
        Insert: {
          document_id: string
          id?: string
          relevance_score: number
          topic_id: string
        }
        Update: {
          document_id?: string
          id?: string
          relevance_score?: number
          topic_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "topic_assignments_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "topic_assignments_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "topic_models"
            referencedColumns: ["id"]
          },
        ]
      }
      topic_models: {
        Row: {
          category: string | null
          created_at: string
          frequency: number
          id: string
          name: string
          sample_excerpts: string[]
          sentiment: string
          subsidiary_breakdown: Json
          weight: number
        }
        Insert: {
          category?: string | null
          created_at?: string
          frequency: number
          id?: string
          name: string
          sample_excerpts: string[]
          sentiment: string
          subsidiary_breakdown: Json
          weight: number
        }
        Update: {
          category?: string | null
          created_at?: string
          frequency?: number
          id?: string
          name?: string
          sample_excerpts?: string[]
          sentiment?: string
          subsidiary_breakdown?: Json
          weight?: number
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      claim_processing_job: {
        Args: { p_supported_types?: string[]; p_worker_id: string }
        Returns: {
          attempt_count: number
          entity_id: string
          id: string
          job_type: string
          locked_until: string
          max_attempts: number
          payload: Json
          status: string
        }[]
      }
      complete_processing_job: {
        Args: { p_job_id: string; p_worker_id: string }
        Returns: boolean
      }
      current_user_org_id: { Args: never; Returns: string }
      current_user_role: { Args: never; Returns: string }
      fail_processing_job: {
        Args: { p_error_message: string; p_job_id: string; p_worker_id: string }
        Returns: boolean
      }
      renew_processing_job_lease: {
        Args: {
          p_additional_seconds?: number
          p_job_id: string
          p_worker_id: string
        }
        Returns: boolean
      }
      search_document_chunks: {
        Args: {
          p_filter_org_id?: string
          p_match_count?: number
          p_query_embedding: string
          p_query_text: string
        }
        Returns: {
          chunk_id: string
          combined_score: number
          content: string
          document_id: string
          keyword_score: number
          metadata: Json
          page_number: number
          similarity_score: number
        }[]
      }
      show_limit: { Args: never; Returns: number }
      show_trgm: { Args: { "": string }; Returns: string[] }
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
