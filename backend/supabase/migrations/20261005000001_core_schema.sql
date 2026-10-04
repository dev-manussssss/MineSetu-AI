-- ============================================================================
-- MineSetu AI — Migration 001: Core Relational & Vector Schema
-- Canonical Path: backend/supabase/migrations/20261005000001_core_schema.sql
-- ============================================================================

-- 1. Enable Required Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "vector";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- 2. Organizations (Ministry, Apex, Operating Subsidiaries, Scientific Institutes)
CREATE TABLE IF NOT EXISTS organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(10) UNIQUE NOT NULL, -- 'MoC', 'CIL', 'ECL', 'SECL', 'BCCL', 'CMPDI'
    name TEXT NOT NULL,
    tier VARCHAR(20) NOT NULL CHECK (tier IN ('ministry', 'apex_hq', 'subsidiary', 'institute')),
    headquarters_location TEXT NOT NULL,
    annual_target_mt NUMERIC(10, 2),
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 3. Mines & Collieries
CREATE TABLE IF NOT EXISTS mines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE RESTRICT,
    code VARCHAR(20) UNIQUE NOT NULL, -- e.g. 'RAJ-OCP-01'
    name TEXT NOT NULL,
    colliery_type VARCHAR(20) NOT NULL CHECK (colliery_type IN ('open_cast', 'underground', 'mixed')),
    area_name TEXT NOT NULL,
    state TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 4. User Profiles (Extends auth.users or standalone for demo/test environments)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_user_id UUID UNIQUE, -- Nullable to allow seeding demo identities before auth.users creation
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE RESTRICT,
    mine_id UUID REFERENCES mines(id) ON DELETE SET NULL,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    role VARCHAR(30) NOT NULL CHECK (role IN ('ministry_coal', 'cil_hq', 'cmpdi', 'subsidiary_officer', 'sys_admin')),
    role_label TEXT NOT NULL,
    designation TEXT NOT NULL,
    is_demo BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 5. Documents & Statutory Returns
CREATE TABLE IF NOT EXISTS documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE RESTRICT,
    mine_id UUID REFERENCES mines(id) ON DELETE SET NULL,
    uploaded_by UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
    title TEXT NOT NULL,
    category VARCHAR(30) NOT NULL CHECK (category IN ('production', 'overburden', 'geological', 'safety', 'despatch', 'statutory')),
    reporting_period VARCHAR(20) NOT NULL, -- e.g. 'August 2026'
    storage_path TEXT NOT NULL, -- e.g. 'ECL/doc-ecl-001.pdf' in documents-raw bucket
    file_name TEXT NOT NULL,
    file_size_bytes BIGINT NOT NULL CHECK (file_size_bytes <= 10485760), -- 10MB limit
    mime_type TEXT NOT NULL,
    sha256_hash VARCHAR(64) NOT NULL,
    page_count INTEGER DEFAULT 1 NOT NULL,
    status VARCHAR(30) DEFAULT 'draft' NOT NULL CHECK (
        status IN ('draft', 'queued', 'processing', 'needs_review', 'verified', 'under_review', 'approved', 'returned_for_correction', 'rejected', 'failed')
    ),
    overall_confidence NUMERIC(5, 2), -- 0.00 to 100.00
    extracted_summary TEXT,
    is_demo BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    CONSTRAINT unique_doc_hash_per_org UNIQUE (organization_id, sha256_hash)
);

-- 6. Document Versions
CREATE TABLE IF NOT EXISTS document_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    version_number INTEGER NOT NULL,
    storage_path TEXT NOT NULL,
    sha256_hash VARCHAR(64) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    CONSTRAINT unique_doc_version UNIQUE (document_id, version_number)
);

-- 7. Document Pages (Facsimiles for Human Verification Workbench)
CREATE TABLE IF NOT EXISTS document_pages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    page_number INTEGER NOT NULL,
    storage_path TEXT NOT NULL, -- PNG in documents-processed bucket
    width_px INTEGER NOT NULL,
    height_px INTEGER NOT NULL,
    ocr_status VARCHAR(20) DEFAULT 'pending' NOT NULL CHECK (ocr_status IN ('pending', 'completed', 'failed')),
    raw_ocr_json JSONB,
    CONSTRAINT unique_doc_page UNIQUE (document_id, page_number)
);

-- 8. Document Chunks & Dense Vector Embeddings (RAG)
CREATE TABLE IF NOT EXISTS document_chunks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    page_number INTEGER NOT NULL,
    chunk_index INTEGER NOT NULL,
    content TEXT NOT NULL,
    token_count INTEGER NOT NULL,
    embedding vector(1536), -- Compatible with OpenAI text-embedding-3-small and Grok
    tsv tsvector GENERATED ALWAYS AS (to_tsvector('english', content)) STORED,
    metadata JSONB NOT NULL,
    is_stale BOOLEAN DEFAULT false NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_chunks_embedding ON document_chunks USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
CREATE INDEX IF NOT EXISTS idx_chunks_tsv ON document_chunks USING gin (tsv);

-- 9. Extracted Records & Field Coordinates
CREATE TABLE IF NOT EXISTS extracted_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    page_number INTEGER NOT NULL,
    field_name VARCHAR(50) NOT NULL, -- e.g. 'raw_coal_production', 'ob_removal'
    field_label TEXT NOT NULL,
    extracted_value TEXT NOT NULL,
    verified_value TEXT,
    unit VARCHAR(20) NOT NULL,
    confidence NUMERIC(5, 2) NOT NULL,
    bounding_box JSONB NOT NULL, -- { ymin, xmin, ymax, xmax }
    status VARCHAR(20) DEFAULT 'auto_extracted' NOT NULL CHECK (status IN ('auto_extracted', 'verified', 'flagged_error')),
    verified_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    verification_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 10. First-Class Manual Structured Records
CREATE TABLE IF NOT EXISTS manual_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE RESTRICT,
    mine_id UUID NOT NULL REFERENCES mines(id) ON DELETE RESTRICT,
    author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
    title TEXT NOT NULL,
    category VARCHAR(30) NOT NULL CHECK (category IN ('production', 'overburden', 'geological', 'safety', 'despatch')),
    reporting_period VARCHAR(20) NOT NULL,
    source_date DATE NOT NULL,
    source_explanation TEXT DEFAULT 'Field slip entry' NOT NULL,
    status VARCHAR(30) DEFAULT 'draft' NOT NULL CHECK (status IN ('draft', 'submitted', 'under_review', 'accepted', 'returned')),
    is_demo BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS manual_record_fields (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    manual_record_id UUID NOT NULL REFERENCES manual_records(id) ON DELETE CASCADE,
    field_name VARCHAR(50) NOT NULL,
    value NUMERIC(14, 3) NOT NULL,
    unit VARCHAR(20) NOT NULL,
    source_note TEXT
);

-- 11. Production Records (Consolidated Ground Truth for Deterministic Math)
CREATE TABLE IF NOT EXISTS production_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE RESTRICT,
    mine_id UUID NOT NULL REFERENCES mines(id) ON DELETE RESTRICT,
    source_type VARCHAR(20) NOT NULL CHECK (source_type IN ('document_extraction', 'manual_entry', 'connector_sync')),
    source_document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
    source_manual_id UUID REFERENCES manual_records(id) ON DELETE CASCADE,
    reporting_period VARCHAR(20) NOT NULL,
    record_date DATE NOT NULL,
    raw_coal_tonnes NUMERIC(12, 2) NOT NULL,
    overburden_m3 NUMERIC(12, 2) NOT NULL,
    despatch_rakes INTEGER,
    ash_percentage NUMERIC(4, 2),
    approval_status VARCHAR(20) DEFAULT 'pending' NOT NULL CHECK (approval_status IN ('pending', 'verified', 'approved')),
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_production_lookup ON production_records(organization_id, mine_id, reporting_period);

-- 12. Information Requests & Responses (Cross-Tier Governance)
CREATE TABLE IF NOT EXISTS information_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_number VARCHAR(30) UNIQUE NOT NULL, -- e.g. 'REQ-2026-MOC-001'
    initiator_id UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
    initiator_org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE RESTRICT,
    target_org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE RESTRICT,
    subject TEXT NOT NULL,
    description TEXT NOT NULL,
    reporting_period VARCHAR(20) NOT NULL,
    requested_fields TEXT[] NOT NULL,
    due_date TIMESTAMPTZ NOT NULL,
    status VARCHAR(30) DEFAULT 'awaiting_response' NOT NULL CHECK (
        status IN ('draft', 'awaiting_response', 'partially_answered', 'submitted', 'clarification_required', 'completed')
    ),
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS request_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id UUID NOT NULL REFERENCES information_requests(id) ON DELETE CASCADE,
    responder_id UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
    response_text TEXT NOT NULL,
    attached_document_ids UUID[] DEFAULT '{}',
    submitted_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS request_clarifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id UUID NOT NULL REFERENCES information_requests(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
    clarification_text TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 13. Review Tasks, Approvals & Discrepancies
CREATE TABLE IF NOT EXISTS review_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_type VARCHAR(30) NOT NULL CHECK (entity_type IN ('document', 'manual_record', 'request_response')),
    entity_id UUID NOT NULL,
    stage VARCHAR(30) NOT NULL CHECK (stage IN ('cmpdi_technical_verification', 'cil_hq_consolidation', 'ministry_review')),
    assigned_role VARCHAR(30) NOT NULL,
    status VARCHAR(30) DEFAULT 'pending' NOT NULL CHECK (status IN ('pending', 'accepted', 'returned_for_correction')),
    reviewer_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    remarks TEXT,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    resolved_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS discrepancies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
    field_name VARCHAR(50) NOT NULL,
    claimed_value TEXT NOT NULL,
    baseline_value TEXT NOT NULL,
    discrepancy_percentage NUMERIC(6, 2),
    flagged_by UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
    notes TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'open' NOT NULL CHECK (status IN ('open', 'resolved', 'dismissed')),
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 14. Durable Queue: Background Processing Jobs
CREATE TABLE IF NOT EXISTS processing_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_type VARCHAR(30) NOT NULL CHECK (job_type IN ('document_ocr', 'topic_modeling', 'report_export', 'portal_scrape')),
    entity_id UUID NOT NULL,
    status VARCHAR(20) DEFAULT 'queued' NOT NULL CHECK (status IN ('queued', 'processing', 'completed', 'failed')),
    attempt_count INTEGER DEFAULT 0 NOT NULL,
    max_attempts INTEGER DEFAULT 3 NOT NULL,
    backoff_seconds INTEGER DEFAULT 30 NOT NULL,
    lease_timeout_seconds INTEGER DEFAULT 300 NOT NULL,
    locked_at TIMESTAMPTZ,
    locked_until TIMESTAMPTZ,
    worker_id TEXT,
    error_message TEXT,
    payload JSONB DEFAULT '{}' NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_jobs_claimable ON processing_jobs(status, locked_until) WHERE status IN ('queued', 'processing');

-- 15. AI Queries & Retrieval Citations
CREATE TABLE IF NOT EXISTS ai_queries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    query_text TEXT NOT NULL,
    role_scope VARCHAR(30) NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('sufficient', 'insufficient', 'conflicting')),
    answer_text TEXT NOT NULL,
    conflict_details TEXT,
    execution_time_ms INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS retrieval_citations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    query_id UUID NOT NULL REFERENCES ai_queries(id) ON DELETE CASCADE,
    document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    page_number INTEGER NOT NULL,
    excerpt TEXT NOT NULL,
    similarity_score NUMERIC(5, 4) NOT NULL
);

-- 16. Report Drafts & Multi-Format Exports
CREATE TABLE IF NOT EXISTS report_drafts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
    title TEXT NOT NULL,
    report_type VARCHAR(30) NOT NULL,
    reporting_period VARCHAR(20) NOT NULL,
    scope_filter JSONB NOT NULL,
    executive_summary TEXT NOT NULL,
    metrics_data JSONB NOT NULL,
    citations JSONB NOT NULL,
    status VARCHAR(20) DEFAULT 'draft' NOT NULL CHECK (status IN ('draft', 'reviewed', 'final')),
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS report_exports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    draft_id UUID NOT NULL REFERENCES report_drafts(id) ON DELETE CASCADE,
    format VARCHAR(10) NOT NULL CHECK (format IN ('pdf', 'docx', 'xlsx')),
    storage_path TEXT NOT NULL,
    file_size_bytes BIGINT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 17. Topic Models & Semantic Clustering
CREATE TABLE IF NOT EXISTS topic_models (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    weight INTEGER NOT NULL,
    frequency INTEGER NOT NULL,
    sentiment VARCHAR(20) NOT NULL CHECK (sentiment IN ('positive', 'neutral', 'urgent')),
    subsidiary_breakdown JSONB NOT NULL,
    sample_excerpts TEXT[] NOT NULL,
    category TEXT,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS topic_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    topic_id UUID NOT NULL REFERENCES topic_models(id) ON DELETE CASCADE,
    document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    relevance_score NUMERIC(5, 4) NOT NULL,
    CONSTRAINT unique_doc_topic UNIQUE (topic_id, document_id)
);

-- 18. External Data Sources & Freshness Tracking
CREATE TABLE IF NOT EXISTS data_sources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(30) UNIQUE NOT NULL,
    name TEXT NOT NULL,
    source_url TEXT NOT NULL,
    classification VARCHAR(30) NOT NULL CHECK (
        classification IN ('public_accessible', 'public_difficult', 'login_restricted', 'api_authorized', 'unverified')
    ),
    check_schedule VARCHAR(30) NOT NULL,
    last_checked_at TIMESTAMPTZ,
    last_changed_at TIMESTAMPTZ,
    source_published_at TIMESTAMPTZ,
    source_effective_date DATE,
    freshness_status VARCHAR(20) DEFAULT 'fresh' NOT NULL CHECK (freshness_status IN ('fresh', 'stale', 'error', 'restricted')),
    error_count INTEGER DEFAULT 0 NOT NULL
);

-- 19. Tamper-Evident Append-Only Audit Trail
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    timestamp TIMESTAMPTZ DEFAULT now() NOT NULL,
    actor_id UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
    actor_email TEXT NOT NULL,
    actor_role TEXT NOT NULL,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id TEXT NOT NULL,
    result VARCHAR(10) NOT NULL CHECK (result IN ('success', 'failure', 'denied')),
    ip_address INET,
    metadata JSONB
);
