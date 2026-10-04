# MineSetu AI — API Inventory & REST Endpoint Contracts

> **STATUS**: APPROVED MASTER API SPECIFICATION  
> **LAST UPDATED**: October 2026  
> **TARGET RUNTIME**: Vercel Serverless / Edge Functions (`/api/*`)  
> **CANONICAL LOCATION**: `docs/api-contracts.md`

---

## 1. Actual Repository API Inventory (Audit Baseline)

An audit of the repository code confirms:
- **IMPLEMENTATION STATUS**: **Zero Server Routes Implemented**.
- **Evidence**: `backend/functions/` contains only `.gitkeep`. The frontend codebase (`frontend/src/`) communicates purely with client-side mock data stored in `frontend/src/data/mockMiningData.ts` and managed via React state in `frontend/src/context/AppContext.tsx`.
- **Roadmap Requirement**: The endpoints documented in Section 2 below constitute the **canonical proposed API contract** to be implemented in the subsequent backend implementation phase.

---

## 2. Standard Request & Error Envelope Specification

### 2.1 Standard Authentication & Headers
All requests to `/api/*` must supply:
```http
Authorization: Bearer <USER_SESSION_JWT>
Content-Type: application/json
Accept: application/json
X-Client-Version: 1.0.0
```

### 2.2 Standard Success Envelope
```json
{
  "success": true,
  "data": { ... },
  "metadata": {
    "timestamp": "2026-10-04T12:00:00Z",
    "request_id": "req_8923a1f8"
  }
}
```

### 2.3 Standard Error Envelope
All error responses adhere to the RFC 7807 problem details specification:
```json
{
  "success": false,
  "error": {
    "code": "INSUFFICIENT_PERMISSIONS",
    "message": "User persona does not hold the required permission to perform this mutation.",
    "details": {
      "required_permission": "submissions.review",
      "active_role": "subsidiary_officer"
    },
    "timestamp": "2026-10-04T12:00:00Z",
    "request_id": "req_8923a1f8"
  }
}
```

---

## 3. Comprehensive Endpoint Catalog

### 3.1 Authentication & Session Management

#### `POST /api/auth/demo-session`
- **Status**: **Proposed** (Currently simulated in `AppContext.tsx`).
- **Auth Required**: Public.
- **Description**: Authenticates one of the 4 configured demo personas, returning a scoped demonstration JWT.
- **Request Body**:
  ```json
  {
    "role": "cmpdi", // "ministry_coal" | "cil_hq" | "cmpdi" | "subsidiary_officer"
    "demo_token": "demo-session-token-2026"
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "user": {
        "id": "usr_cmpdi_01",
        "name": "Dr. Ananya Mukherjee",
        "email": "cmpdi.nodal@demo.cmpdi.co.in",
        "role": "cmpdi",
        "role_label": "CMPDI Nodal Expert",
        "organization": "CMPDI Exploration & Mining Data Cell",
        "subsidiary_code": "CMPDI",
        "is_demo": true
      },
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "expires_at": "2026-10-05T12:00:00Z"
    }
  }
  ```

#### `GET /api/auth/me`
- **Status**: **Proposed**.
- **Auth Required**: Valid Bearer Token.
- **Description**: Returns profile and permission array for the currently authenticated persona.

---

### 3.2 Document Ingestion & Management

#### `POST /api/documents/upload`
- **Status**: **Proposed** (Client currently simulates via in-memory array).
- **Auth Required**: `documents.upload` (`subsidiary_officer`, `cmpdi`, `sys_admin`).
- **Description**: Accepts multipart file upload and metadata; stores raw file in immutable object storage.
- **Form Data**:
  - `file`: Binary file (PDF, DOCX, XLSX, image; max 10MB).
  - `category`: String (`"production"` | `"overburden"` | `"geological"` | `"safety"`).
  - `reporting_period`: String (`"August 2026"`).
  - `subsidiary_code`: String (`"ECL"`).
  - `colliery_name`: String (`"Rajmahal OCP"`).
  - `source_date`: String (`"2026-08-31"`).
- **Response (201 Created)**:
  ```json
  {
    "success": true,
    "data": {
      "document_id": "doc-ecl-001",
      "file_name": "ECL_Rajmahal_Monthly_Aug2026.pdf",
      "file_url": "https://storage.internal/documents-raw/doc-ecl-001.pdf",
      "file_size_bytes": 2516582,
      "status": "processing",
      "ocr_job_id": "job-ocr-89124",
      "created_at": "2026-10-04T12:00:00Z"
    }
  }
  ```

#### `GET /api/documents`
- **Status**: **Proposed**.
- **Auth Required**: `documents.view` (Scoped).
- **Query Parameters**:
  - `status`: String (`"all"` | `"needs_review"` | `"ready_to_search"` | `"failed"`).
  - `subsidiary`: String (`"ECL"`, optional).
  - `page`: Integer (default 1).
  - `limit`: Integer (default 20, max 100).
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "items": [
        {
          "id": "doc-ecl-001",
          "title": "Rajmahal OCP Monthly Return - Aug 2026",
          "subsidiary_code": "ECL",
          "colliery_name": "Rajmahal OCP",
          "status": "needs_review",
          "ocr_confidence": 88.5,
          "uploaded_at": "2026-10-04T10:00:00Z"
        }
      ],
      "pagination": { "total": 1, "page": 1, "limit": 20, "pages": 1 }
    }
  }
  ```

---

### 3.3 Extraction Jobs & Validation Workbench

#### `GET /api/documents/:id/extracted-fields`
- **Status**: **Proposed**.
- **Auth Required**: `documents.view`.
- **Description**: Returns OCR extracted key-value fields, bounding boxes, and verification states.

#### `PATCH /api/documents/:id/fields/:field_id`
- **Status**: **Proposed** (Simulated in `AppContext.tsx`).
- **Auth Required**: `documents.verify` (`cmpdi`, `subsidiary_officer`).
- **Request Body**:
  ```json
  {
    "verified_value": "45210",
    "unit": "Tonnes",
    "verification_notes": "Corrected blurry digit 8 to 0 per column subtotal",
    "status": "verified"
  }
  ```
- **Response (200 OK)**: Returns updated field record with timestamp and verifier ID.

#### `POST /api/documents/:id/submit-verification`
- **Status**: **Proposed**.
- **Auth Required**: `documents.verify`.
- **Request Body**:
  ```json
  {
    "final_action": "submit_for_review", // "submit_for_review" | "return_for_correction"
    "remarks": "Verified by CMPDI Technical Desk"
  }
  ```

---

### 3.4 First-Class Manual Structured Records

#### `POST /api/manual-records`
- **Status**: **Proposed**.
- **Auth Required**: `manual.entry` (`subsidiary_officer`, `cmpdi`).
- **Description**: Creates structured tabular records without requiring a file upload.
- **Request Body**:
  ```json
  {
    "category": "production",
    "reporting_period": "August 2026",
    "subsidiary_code": "ECL",
    "colliery_name": "Rajmahal OCP",
    "source_date": "2026-08-31",
    "fields": [
      {
        "field_name": "Raw Coal Production",
        "value": "45210",
        "unit": "Tonnes",
        "source_note": "Colliery weighbridge tally slip #441"
      },
      {
        "field_name": "Overburden Removal",
        "value": "142500",
        "unit": "m³",
        "source_note": "Shovel shift log #12"
      }
    ],
    "action": "submit" // "draft" | "submit"
  }
  ```
- **Response (201 Created)**:
  ```json
  {
    "success": true,
    "data": {
      "record_id": "rec-man-8912",
      "status": "submitted",
      "created_at": "2026-10-04T12:00:00Z"
    }
  }
  ```

---

### 3.5 Cross-Organization Information Requests

#### `POST /api/requests`
- **Status**: **Proposed**.
- **Auth Required**: `requests.create` (`ministry_coal`, `cil_hq`).
- **Request Body**:
  ```json
  {
    "subject": "HEMM Equipment Availability & Despatch Status",
    "target_subsidiary": "ECL",
    "reporting_period": "Q2 FY 2026",
    "requested_data_points": ["Shovel Availability %", "Daily Rail Despatch Rakes"],
    "due_date": "2026-10-15T18:00:00Z"
  }
  ```

#### `POST /api/requests/:id/respond`
- **Status**: **Proposed**.
- **Auth Required**: `requests.respond` (`subsidiary_officer`, `cil_hq`).
- **Request Body**:
  ```json
  {
    "response_text": "Availability maintained at 91.2% with 18 rakes despatched.",
    "attached_document_ids": ["doc-ecl-001"],
    "action": "submit_response"
  }
  ```

---

### 3.6 Grounded AI Query ("Ask MineSetu")

#### `POST /api/ai/query`
- **Status**: **Proposed** (Client currently executes via local semantic engine in `AppContext.tsx`).
- **Auth Required**: `queries.execute` (Scoped by role).
- **Request Body**:
  ```json
  {
    "query": "Compare coal production and OB removal between ECL and SECL in Q2 2026",
    "thinking_mode": false,
    "attached_document_ids": []
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "answer": "During Q2 2026, SECL Gevra Mega Project achieved 524,300 tonnes of coal production with 1,120,000 m³ of overburden removal [Source 1, Page 1]. ECL Rajmahal OCP recorded 45,210 tonnes of production with 142,500 m³ of overburden removal [Source 2, Page 1].",
      "confidence": 0.96,
      "evidence_status": "sufficient", // "sufficient" | "insufficient" | "conflicting"
      "grounded_sources": [
        {
          "document_id": "doc-secl-002",
          "title": "SECL Gevra Shift Summary",
          "subsidiary": "SECL",
          "page_number": 1,
          "excerpt": "Cumulative output exceeds 520,000 MT for the ten-day period..."
        },
        {
          "document_id": "doc-ecl-001",
          "title": "ECL Rajmahal Monthly Return",
          "subsidiary": "ECL",
          "page_number": 1,
          "excerpt": "Daily coal excavation totaled 45,210 tonnes..."
        }
      ],
      "suggested_follow_ups": [
        "What was the shovel-dumper availability at Rajmahal?",
        "Compile this comparative data into a report draft"
      ]
    }
  }
  ```

---

### 3.7 Automated Report Generation & Multi-Format Export

#### `POST /api/reports/generate`
- **Status**: **Proposed**.
- **Auth Required**: `reports.generate`.
- **Request Body**:
  ```json
  {
    "report_type": "quarterly_operational_review",
    "reporting_period": "Q2 FY 2026",
    "scope": "subsidiary_wise",
    "selected_subsidiaries": ["ECL", "SECL", "NCL"],
    "comparison_basis": "yoy_same_quarter",
    "output_formats": ["pdf", "docx", "xlsx"]
  }
  ```

#### `GET /api/reports/:id/export/:format`
- **Status**: **Proposed** (Print-PDF currently working in client).
- **Parameters**: `format` (`"pdf"` | `"docx"` | `"xlsx"`).
- **Response**: Binary file stream with `Content-Disposition: attachment; filename="MineSetu_Report_Q2_2026.docx"`.

---

### 3.8 Topic Intelligence & Word Cloud

#### `GET /api/topics`
- **Status**: **Proposed** (Client currently visualizes static mock clusters).
- **Auth Required**: `topics.analyze`.
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "clusters": [
        {
          "id": "top-01",
          "name": "Monsoon Inundation & Sump Drainage",
          "weight": 85,
          "frequency": 38,
          "urgency": "urgent",
          "subsidiary_breakdown": { "ECL": 24, "SECL": 8, "BCCL": 6 },
          "sample_excerpts": ["Bench sump overflow reported at East Pit..."]
        }
      ]
    }
  }
  ```
