-- ============================================================================
-- MineSetu AI — Migration 003: Durable Queue Logic & Hybrid Search Functions
-- Canonical Path: backend/supabase/migrations/20261005000003_queue_and_functions.sql
-- ============================================================================

-- 1. Atomic Job Claiming Function (SKIP LOCKED with Leases and Zombie Recovery)
CREATE OR REPLACE FUNCTION claim_processing_job(
    p_worker_id TEXT,
    p_lease_seconds INT DEFAULT NULL,
    p_supported_types TEXT[] DEFAULT ARRAY['document_ocr', 'topic_modeling', 'report_export', 'portal_scrape']
)
RETURNS TABLE (
    id UUID,
    job_type VARCHAR(30),
    entity_id UUID,
    status VARCHAR(20),
    attempt_count INT,
    max_attempts INT,
    payload JSONB,
    locked_until TIMESTAMPTZ
)
LANGUAGE plpgsql AS $$
DECLARE
    v_job_id UUID;
BEGIN
    -- Atomic Claim using FOR UPDATE SKIP LOCKED
    WITH next_candidate AS (
        SELECT pj.id
        FROM processing_jobs pj
        WHERE 
            pj.job_type = ANY(p_supported_types)
            AND (
                -- Case A: Fresh queued job
                (pj.status = 'queued' AND (pj.locked_until IS NULL OR pj.locked_until <= now()))
                OR
                -- Case B: Zombie job recovery (worker crashed or lease timed out, still under retry cap)
                (pj.status = 'processing' AND pj.locked_until < now() AND pj.attempt_count < pj.max_attempts)
            )
        ORDER BY pj.created_at ASC
        FOR UPDATE SKIP LOCKED
        LIMIT 1
    )
    SELECT next_candidate.id INTO v_job_id FROM next_candidate;

    IF v_job_id IS NULL THEN
        RETURN;
    END IF;

    -- Update and acquire lease
    RETURN QUERY
    UPDATE processing_jobs pj
    SET status = 'processing',
        attempt_count = pj.attempt_count + 1,
        worker_id = p_worker_id,
        locked_at = now(),
        locked_until = now() + (COALESCE(p_lease_seconds, pj.lease_timeout_seconds) || ' seconds')::interval,
        started_at = COALESCE(pj.started_at, now())
    WHERE pj.id = v_job_id
    RETURNING 
        pj.id,
        pj.job_type,
        pj.entity_id,
        pj.status,
        pj.attempt_count,
        pj.max_attempts,
        pj.payload,
        pj.locked_until;
END;
$$;

-- 2. Renew Job Lease (Heartbeat for long-running OCR or report compilation)
CREATE OR REPLACE FUNCTION renew_processing_job_lease(
    p_job_id UUID,
    p_worker_id TEXT,
    p_additional_seconds INT DEFAULT 300
)
RETURNS BOOLEAN
LANGUAGE plpgsql AS $$
DECLARE
    v_updated INT;
BEGIN
    UPDATE processing_jobs
    SET locked_until = now() + (p_additional_seconds || ' seconds')::interval
    WHERE id = p_job_id 
      AND worker_id = p_worker_id
      AND status = 'processing';
      
    GET DIAGNOSTICS v_updated = ROW_COUNT;
    RETURN v_updated > 0;
END;
$$;

-- 3. Mark Job as Completed
CREATE OR REPLACE FUNCTION complete_processing_job(
    p_job_id UUID,
    p_worker_id TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql AS $$
DECLARE
    v_updated INT;
BEGIN
    UPDATE processing_jobs
    SET status = 'completed',
        completed_at = now(),
        locked_until = NULL
    WHERE id = p_job_id 
      AND worker_id = p_worker_id
      AND status = 'processing';

    GET DIAGNOSTICS v_updated = ROW_COUNT;
    RETURN v_updated > 0;
END;
$$;

-- 4. Mark Job as Failed with Exponential Backoff
CREATE OR REPLACE FUNCTION fail_processing_job(
    p_job_id UUID,
    p_worker_id TEXT,
    p_error_message TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql AS $$
DECLARE
    v_updated INT;
    v_attempts INT;
    v_max_attempts INT;
    v_backoff INT;
BEGIN
    SELECT attempt_count, max_attempts, backoff_seconds 
    INTO v_attempts, v_max_attempts, v_backoff
    FROM processing_jobs
    WHERE id = p_job_id;

    IF v_attempts >= v_max_attempts THEN
        -- Permanent failure
        UPDATE processing_jobs
        SET status = 'failed',
            error_message = p_error_message,
            locked_until = NULL
        WHERE id = p_job_id;
    ELSE
        -- Return to queue with exponential backoff delay
        UPDATE processing_jobs
        SET status = 'queued',
            error_message = p_error_message,
            locked_until = now() + ((v_backoff * POWER(2, v_attempts - 1)) || ' seconds')::interval
        WHERE id = p_job_id;
    END IF;

    GET DIAGNOSTICS v_updated = ROW_COUNT;
    RETURN v_updated > 0;
END;
$$;

-- 5. Hybrid Retrieval Search Function (pgvector + tsvector)
CREATE OR REPLACE FUNCTION search_document_chunks(
    p_query_text TEXT,
    p_query_embedding vector(1536),
    p_match_count INT DEFAULT 5,
    p_filter_org_id UUID DEFAULT NULL
)
RETURNS TABLE (
    chunk_id UUID,
    document_id UUID,
    page_number INT,
    content TEXT,
    metadata JSONB,
    similarity_score FLOAT,
    keyword_score FLOAT,
    combined_score FLOAT
)
LANGUAGE plpgsql AS $$
BEGIN
    RETURN QUERY
    WITH semantic AS (
        SELECT 
            dc.id, 
            1.0 - (dc.embedding <=> p_query_embedding) AS sim
        FROM document_chunks dc
        JOIN documents d ON d.id = dc.document_id
        WHERE 
            dc.is_stale = false
            AND (p_filter_org_id IS NULL OR d.organization_id = p_filter_org_id)
        ORDER BY dc.embedding <=> p_query_embedding
        LIMIT p_match_count * 2
    ),
    keyword AS (
        SELECT 
            dc.id, 
            ts_rank_cd(dc.tsv, plainto_tsquery('english', p_query_text)) AS rank
        FROM document_chunks dc
        JOIN documents d ON d.id = dc.document_id
        WHERE 
            dc.is_stale = false
            AND dc.tsv @@ plainto_tsquery('english', p_query_text)
            AND (p_filter_org_id IS NULL OR d.organization_id = p_filter_org_id)
        ORDER BY rank DESC
        LIMIT p_match_count * 2
    )
    SELECT 
        dc.id AS chunk_id,
        dc.document_id,
        dc.page_number,
        dc.content,
        dc.metadata,
        COALESCE(s.sim, 0.0)::FLOAT AS similarity_score,
        COALESCE(k.rank, 0.0)::FLOAT AS keyword_score,
        (COALESCE(s.sim, 0.0) * 0.7 + COALESCE(k.rank, 0.0) * 0.3)::FLOAT AS combined_score
    FROM document_chunks dc
    LEFT JOIN semantic s ON dc.id = s.id
    LEFT JOIN keyword k ON dc.id = k.id
    WHERE s.id IS NOT NULL OR k.id IS NOT NULL
    ORDER BY combined_score DESC
    LIMIT p_match_count;
END;
$$;

-- 6. Trigger: Invalidate Derived Chunks When Document Version Changes
CREATE OR REPLACE FUNCTION invalidate_stale_chunks()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE document_chunks
    SET is_stale = true
    WHERE document_id = NEW.document_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_invalidate_chunks ON document_versions;
CREATE TRIGGER trg_invalidate_chunks
AFTER INSERT ON document_versions
FOR EACH ROW
EXECUTE FUNCTION invalidate_stale_chunks();
