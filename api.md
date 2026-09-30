# API Contracts & Services — MDMS + Mindsetu AI

## 1. Authentication & Security Header Standards

All API requests to Supabase Edge Functions or backend routes must supply:
```text
Authorization: Bearer <JWT_USER_TOKEN>
apikey: <SUPABASE_ANON_KEY>
Content-Type: application/json
```

Privileged operations (e.g. executing Grok 2 prompt orchestration or logging audit trails) occur inside secure Edge Functions where `GROK_API_KEY_PRIMARY` and `SUPABASE_SERVICE_ROLE_KEY` reside exclusively in server-side environment secrets.

---

## 2. API Endpoints

### 2.1 Document Ingestion & OCR
- **Endpoint**: `POST /api/documents/ingest`
- **Auth Required**: `documents.upload` (`field_officer`, `cmpdi_nodal`, `subsidiary_mgr`, `sys_admin`)
- **Request Schema**:
  ```json
  {
    "title": "Rajmahal OCP Monthly Production Return - August 2026",
    "subsidiary_code": "ECL",
    "colliery_name": "Rajmahal OCP",
    "file_url": "https://storage.supabase.co/raw/ecl-rajmahal-aug26.pdf",
    "file_name": "ecl-rajmahal-aug26.pdf",
    "mime_type": "application/pdf",
    "file_size_bytes": 1048576
  }
  ```
- **Response Schema**:
  ```json
  {
    "document_id": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
    "status": "queued",
    "ocr_job_id": "ocr_job_892348",
    "created_at": "2026-09-30T10:00:00Z"
  }
  ```

### 2.2 Extraction Verification & Sign-Off
- **Endpoint**: `POST /api/documents/:id/verify`
- **Auth Required**: `documents.verify`
- **Request Schema**:
  ```json
  {
    "records": [
      {
        "record_id": "rec_01",
        "verified_value": "45210.50",
        "status": "verified",
        "notes": "Corrected handwritten zero misread as 8 by OCR"
      }
    ],
    "final_action": "approve" // or "request_correction" | "reject"
  }
  ```
- **Response Schema**:
  ```json
  {
    "document_id": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
    "status": "approved",
    "verified_by": "usr_nodal_cmpdi",
    "approved_at": "2026-09-30T10:15:00Z"
  }
  ```

### 2.3 Grounded AI Query (RAG)
- **Endpoint**: `POST /api/ai/query`
- **Auth Required**: `queries.execute`
- **Request Schema**:
  ```json
  {
    "query": "What was the total coal production and OB removal at Rajmahal OCP in Q2 2026?",
    "filter_subsidiary": "ECL",
    "date_range": {
      "start": "2026-04-01",
      "end": "2026-06-30"
    }
  }
  ```
- **Response Schema**:
  ```json
  {
    "answer": "According to the verified monthly production returns for ECL Rajmahal OCP, total coal production for Q2 2026 was 134,800 tonnes with an overburden removal of 412,000 m³.",
    "confidence": 0.94,
    "grounded_sources": [
      {
        "document_id": "doc_ecl_01",
        "document_title": "Rajmahal OCP Monthly Return - June 2026",
        "page_number": 2,
        "excerpt": "Total Coal Production June: 45,210 T. Cumulative Q2: 134,800 T.",
        "verified_status": "approved"
      }
    ],
    "evidence_status": "sufficient" // or "insufficient" | "conflicting"
  }
  ```

### 2.4 Parliamentary Response Generator
- **Endpoint**: `POST /api/parliamentary/draft`
- **Auth Required**: `parliamentary.draft`
- **Request Schema**:
  ```json
  {
    "query_id": "LS-STARRED-402",
    "question_text": "Will the Minister of Coal be pleased to state the safety inspection compliance rate across SECL underground mines?",
    "target_session": "Monsoon 2026"
  }
  ```
- **Response Schema**:
  ```json
  {
    "query_id": "LS-STARRED-402",
    "draft_status": "ai_draft_ready",
    "ai_draft": "Madam Speaker, during the period Jan-Jun 2026, DGMS and Internal Safety Organizations conducted 142 inspections across SECL underground mines, achieving a 98.4% compliance rate...",
    "grounded_sources": [
      {
        "document_title": "SECL Annual Mine Safety Review 2025-26",
        "page_number": 14,
        "source_type": "DGMS Inspection Return"
      }
    ]
  }
  ```

---

## 3. Error Envelope Format

All failed requests return standardized JSON:
```json
{
  "error": {
    "code": "INSUFFICIENT_PERMISSIONS",
    "message": "User does not have the 'parliamentary.approve' permission.",
    "details": {
      "required_role": "ministry_exec",
      "current_role": "field_officer"
    },
    "timestamp": "2026-09-30T10:05:00Z"
  }
}
```
