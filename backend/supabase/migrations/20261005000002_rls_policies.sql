-- ============================================================================
-- MineSetu AI — Migration 002: Row-Level Security (RLS) & Multi-Tenant Scoping
-- Canonical Path: backend/supabase/migrations/20261005000002_rls_policies.sql
-- ============================================================================

-- 1. Enable RLS on Sensitive Tables
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE extracted_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE manual_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE manual_record_fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE production_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE information_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE request_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- 2. Revoke Dangerous Operations on Audit Logs (Tamper-Evident Ledger)
REVOKE UPDATE, DELETE ON audit_logs FROM authenticated, anon;

-- 3. Helper Functions for Extracting JWT Claims
CREATE OR REPLACE FUNCTION current_user_role() RETURNS TEXT AS $$
BEGIN
    RETURN COALESCE(
        current_setting('request.jwt.claims', true)::jsonb ->> 'role',
        current_setting('request.jwt.claims', true)::jsonb -> 'app_metadata' ->> 'role',
        'anonymous'
    );
END;
$$ LANGUAGE plpgsql STABLE;

CREATE OR REPLACE FUNCTION current_user_org_id() RETURNS UUID AS $$
BEGIN
    RETURN (
        COALESCE(
            current_setting('request.jwt.claims', true)::jsonb ->> 'organization_id',
            current_setting('request.jwt.claims', true)::jsonb -> 'app_metadata' ->> 'organization_id'
        )
    )::uuid;
EXCEPTION WHEN OTHERS THEN
    RETURN NULL;
END;
$$ LANGUAGE plpgsql STABLE;

-- 4. Documents RLS Policies
CREATE POLICY "documents_select_policy" ON documents
FOR SELECT TO authenticated
USING (
    -- Ministry of Coal and CIL HQ can view all approved documents across any subsidiary
    (current_user_role() IN ('ministry_coal', 'cil_hq') AND status = 'approved')
    OR
    -- CMPDI can view technical returns across all subsidiaries undergoing verification
    (current_user_role() = 'cmpdi')
    OR
    -- Subsidiary / Mine Officers can only view documents belonging to their assigned subsidiary
    (organization_id = current_user_org_id())
    OR
    -- Sys Admin can view all
    (current_user_role() = 'sys_admin')
);

CREATE POLICY "documents_insert_policy" ON documents
FOR INSERT TO authenticated
WITH CHECK (
    -- Only field officers, CMPDI, or sys_admin can upload returns
    current_user_role() IN ('subsidiary_officer', 'cmpdi', 'sys_admin')
    AND organization_id = current_user_org_id()
);

CREATE POLICY "documents_update_policy" ON documents
FOR UPDATE TO authenticated
USING (
    (current_user_role() = 'cmpdi')
    OR (organization_id = current_user_org_id())
    OR (current_user_role() = 'sys_admin')
)
WITH CHECK (
    (current_user_role() = 'cmpdi')
    OR (organization_id = current_user_org_id())
    OR (current_user_role() = 'sys_admin')
);

-- 5. Document Chunks (RAG Search) Scoping Policy
CREATE POLICY "chunks_select_policy" ON document_chunks
FOR SELECT TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM documents d
        WHERE d.id = document_chunks.document_id
          AND (
            (current_user_role() IN ('ministry_coal', 'cil_hq') AND d.status = 'approved')
            OR (current_user_role() = 'cmpdi')
            OR (d.organization_id = current_user_org_id())
            OR (current_user_role() = 'sys_admin')
          )
    )
);

-- 6. Extracted Records Policies
CREATE POLICY "extracted_records_select_policy" ON extracted_records
FOR SELECT TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM documents d
        WHERE d.id = extracted_records.document_id
          AND (
            (current_user_role() IN ('ministry_coal', 'cil_hq') AND d.status = 'approved')
            OR (current_user_role() = 'cmpdi')
            OR (d.organization_id = current_user_org_id())
            OR (current_user_role() = 'sys_admin')
          )
    )
);

CREATE POLICY "extracted_records_update_policy" ON extracted_records
FOR UPDATE TO authenticated
USING (
    -- CMPDI and assigned Subsidiary Officer can correct and verify OCR fields
    current_user_role() IN ('cmpdi', 'subsidiary_officer', 'sys_admin')
);

-- 7. Manual Records Policies
CREATE POLICY "manual_records_select_policy" ON manual_records
FOR SELECT TO authenticated
USING (
    (current_user_role() IN ('ministry_coal', 'cil_hq') AND status = 'accepted')
    OR (current_user_role() = 'cmpdi')
    OR (organization_id = current_user_org_id())
    OR (current_user_role() = 'sys_admin')
);

CREATE POLICY "manual_records_insert_policy" ON manual_records
FOR INSERT TO authenticated
WITH CHECK (
    current_user_role() IN ('subsidiary_officer', 'cmpdi', 'sys_admin')
    AND organization_id = current_user_org_id()
);

-- 8. Production Records (Ground Truth) Policies
CREATE POLICY "production_records_select_policy" ON production_records
FOR SELECT TO authenticated
USING (
    (current_user_role() IN ('ministry_coal', 'cil_hq') AND approval_status = 'approved')
    OR (current_user_role() = 'cmpdi')
    OR (organization_id = current_user_org_id())
    OR (current_user_role() = 'sys_admin')
);

-- 9. Information Requests Policies
CREATE POLICY "requests_select_policy" ON information_requests
FOR SELECT TO authenticated
USING (
    initiator_org_id = current_user_org_id()
    OR target_org_id = current_user_org_id()
    OR current_user_role() IN ('ministry_coal', 'cil_hq', 'sys_admin')
);

CREATE POLICY "requests_insert_policy" ON information_requests
FOR INSERT TO authenticated
WITH CHECK (
    -- Only Ministry or CIL HQ can initiate formal data requests
    current_user_role() IN ('ministry_coal', 'cil_hq', 'sys_admin')
);

-- 10. Audit Logs Policies (Append-Only)
CREATE POLICY "audit_logs_select_policy" ON audit_logs
FOR SELECT TO authenticated
USING (
    -- Only CMPDI auditors, Ministry directors, or Sys Admin can inspect full audit ledger
    current_user_role() IN ('ministry_coal', 'cmpdi', 'sys_admin')
);

CREATE POLICY "audit_logs_insert_policy" ON audit_logs
FOR INSERT TO authenticated
WITH CHECK (true); -- Any authenticated actor can append events

-- 11. Separation-of-Duty Trigger: Anti-Self-Approval
CREATE OR REPLACE FUNCTION enforce_separation_of_duty()
RETURNS TRIGGER AS $$
DECLARE
    doc_uploader UUID;
BEGIN
    IF NEW.status = 'accepted' OR NEW.status = 'approved' THEN
        IF NEW.entity_type = 'document' THEN
            SELECT uploaded_by INTO doc_uploader FROM documents WHERE id = NEW.entity_id;
            IF doc_uploader IS NOT NULL AND doc_uploader = NEW.reviewer_id THEN
                RAISE EXCEPTION 'Separation of duty violation: Reviewer cannot approve their own submitted document.';
            END IF;
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_separation_of_duty ON review_tasks;
CREATE TRIGGER trg_separation_of_duty
BEFORE INSERT OR UPDATE ON review_tasks
FOR EACH ROW
EXECUTE FUNCTION enforce_separation_of_duty();
