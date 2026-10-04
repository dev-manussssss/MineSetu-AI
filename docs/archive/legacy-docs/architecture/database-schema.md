# Database Architecture & Schema — MDMS + Mindsetu AI

## 1. Storage & Schema Philosophy

- **Engine**: PostgreSQL via Supabase.
- **Data Lineage**: Uploaded documents remain immutable in Supabase Storage (`documents-raw`). Extracted structured rows reference `document_id` and specific page coordinates.
- **Audit Logging**: Append-only audit table records actor, action, timestamp, entity, and diff metadata.
- **Demonstration Flag**: Every synthetic mock record explicitly includes `is_demo: true` and `source_type: 'synthetic'`.

---

## 2. Core Tables & Entity Relationships

### 2.1 `users`
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN (
    'ministry_exec', 'cil_exec', 'cmpdi_nodal', 
    'subsidiary_mgr', 'parliamentary_cell', 'field_officer', 'sys_admin'
  )),
  subsidiary_code TEXT, -- e.g. 'ECL', 'SECL', NULL for CIL/Ministry
  colliery_name TEXT,
  avatar_url TEXT,
  is_demo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### 2.2 `documents`
```sql
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size_bytes BIGINT NOT NULL,
  file_url TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  page_count INT DEFAULT 1,
  subsidiary_code TEXT NOT NULL,
  colliery_name TEXT NOT NULL,
  uploaded_by UUID REFERENCES users(id),
  status TEXT NOT NULL CHECK (status IN (
    'queued', 'processing', 'completed', 'partially_extracted', 'needs_review', 'rejected', 'failed'
  )),
  ocr_confidence NUMERIC(5,2),
  extracted_summary TEXT,
  is_demo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

### 2.3 `extracted_records`
```sql
CREATE TABLE extracted_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
  field_name TEXT NOT NULL, -- e.g. 'coal_production_tonnes', 'ob_removal_m3'
  extracted_value TEXT NOT NULL,
  verified_value TEXT,
  unit TEXT,
  page_number INT DEFAULT 1,
  confidence_score NUMERIC(5,2) NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('auto_extracted', 'verified', 'flagged_error', 'approved')),
  verified_by UUID REFERENCES users(id),
  verification_notes TEXT,
  is_demo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

### 2.4 `parliamentary_queries`
```sql
CREATE TABLE parliamentary_queries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  query_number TEXT NOT NULL, -- e.g. 'LS-STARRED-402'
  house TEXT NOT NULL CHECK (house IN ('Lok Sabha', 'Rajya Sabha')),
  session TEXT NOT NULL, -- e.g. 'Monsoon Session 2026'
  ministry TEXT DEFAULT 'Ministry of Coal',
  question_text TEXT NOT NULL,
  category TEXT NOT NULL,
  ai_draft_response TEXT,
  reviewed_response TEXT,
  approved_response TEXT,
  workflow_status TEXT NOT NULL CHECK (workflow_status IN (
    'intake', 'retrieval_complete', 'ai_draft_ready', 'under_review', 'approved', 'dispatched'
  )),
  grounded_sources JSONB DEFAULT '[]'::jsonb,
  assigned_to UUID REFERENCES users(id),
  approved_by UUID REFERENCES users(id),
  is_demo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

### 2.5 `audit_logs`
```sql
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_user_id UUID REFERENCES users(id),
  actor_name TEXT NOT NULL,
  actor_role TEXT NOT NULL,
  action TEXT NOT NULL, -- e.g. 'documents.upload', 'ocr.verify', 'parliamentary.approve'
  entity_type TEXT NOT NULL, -- e.g. 'document', 'extracted_record', 'query'
  entity_id TEXT NOT NULL,
  result TEXT NOT NULL CHECK (result IN ('success', 'failure', 'denied')),
  metadata JSONB DEFAULT '{}'::jsonb,
  timestamp TIMESTAMPTZ DEFAULT now()
);
```

---

## 3. Row-Level Security (RLS) Policies

1. **Documents Visibility**:
   - `ministry_exec`, `cil_exec`, `cmpdi_nodal`, `parliamentary_cell`: Global SELECT across all subsidiaries.
   - `subsidiary_mgr`: SELECT / INSERT where `subsidiary_code = auth.jwt() ->> 'subsidiary_code'`.
   - `field_officer`: SELECT / INSERT where `colliery_name = auth.jwt() ->> 'colliery_name'`.
2. **Document Modification / Verification**:
   - Only `field_officer`, `subsidiary_mgr`, `cmpdi_nodal` can UPDATE verification fields.
3. **Audit Logs**:
   - Append-only (INSERT allowed for service functions; SELECT restricted to `sys_admin` and `cmpdi_nodal`).
   - DELETE and UPDATE disabled via database triggers.
