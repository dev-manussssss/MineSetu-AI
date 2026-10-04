# System Architecture — MDMS + Mindsetu AI

## 1. High-Level Architecture Overview

MDMS + Mindsetu AI is an assistive intelligence extension layer designed to bridge physical paper/PDF mining reports with structured operational data within the Mine Data Management System (MDMS) ecosystem.

```text
┌────────────────────────────────────────────────────────────────────────┐
│                        FRONTEND CLIENT (React/Vite)                   │
│                                                                        │
│   Landing Page  │  Role Selector  │  Role-Specific Dashboard Shell     │
│   Document Workbench  │  Validation UI  │  Word Cloud  │  AI Query UI  │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ HTTPS (Bearer Auth / Anon Key)
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                       TRUST BOUNDARY: BACKEND / API                    │
│                                                                        │
│  ┌──────────────────────┐  ┌────────────────────┐  ┌────────────────┐ │
│  │ Supabase Auth & RLS  │  │ Edge API Gateway   │  │ Audit Logger   │ │
│  │ (Role JWT & Scopes)  │  │ (Schema Validation)│  │ (Append-Only)  │ │
│  └──────────┬───────────┘  └─────────┬──────────┘  └────────────────┘ │
└─────────────┼────────────────────────┼─────────────────────────────────┘
              │                        │
       PostgreSQL Tables               │ Server-side Secure API Call
              │                        ▼
              │              ┌───────────────────────────────┐
              │              │ AI ORCHESTRATION SERVICE      │
              │              │ - Document OCR / Extraction   │
              │              │ - Grounded Context Assembly   │
              │              │ - Grok / xAI Integration      │
              │              │ - Schema Verification         │
              │              └───────────────┬───────────────┘
              ▼                              │
┌───────────────────────────┐                ▼
│ SUPABASE STORAGE          │    ┌───────────────────────────┐
│ (Immutable PDFs & Scans)  │    │ Grok 2 / xAI LLM Endpoints│
└───────────────────────────┘    └───────────────────────────┘
```

---

## 2. Component Boundaries & Responsibilities

### 2.1 Frontend Client (Presentation Layer)
- **Role**: Pure presentation, optimistic state, user interactions, responsive data visualization.
- **Constraints**: Never stores or transmits private API keys (Grok keys or Supabase service keys). Implements client-side RBAC guards for UX only (hiding/disabling inaccessible routes and actions).
- **Styling**: Token-driven Vanilla CSS respecting the visual reference (`ref1.png`, `ref2.png`).

### 2.2 Backend & Edge Services (Authorization & Enforcement)
- **Role**: Strict enforcement of RBAC rules, data isolation by subsidiary/coalfield, and immutable audit logging.
- **Data Flow**: Accepts client requests, verifies session token, resolves role and data scope, invokes AI or database queries, and formats sanitized responses.

### 2.3 AI Pipeline & Grok Orchestration
- **Role**: Document OCR, structured key-value extraction, topic clustering, and source-grounded question answering.
- **Reliability Principle**: AI outputs are untrusted until passed through automated schema checks and human reviewer approval.
- **Fallback**: Secondary Grok API key failover in case of rate limits or service outage; graceful degradation with synthetic demonstration responses in offline/demo mode.

---

## 3. Data Flow Pipelines

### 3.1 Document Ingestion & Verification Flow
```text
Upload PDF/Image 
  ──> Store in Storage (Immutable) 
  ──> Trigger Extraction Service 
  ──> Parse Key Mining Fields (Coal Production, OB Removal, Dispatches)
  ──> Assign Confidence Scores & Warning Flags 
  ──> Populate Ingestion Review Queue (Status: 'needs review')
  ──> Nodal Officer / Manager edits and approves
  ──> Transition to 'approved' 
  ──> Publish into MDMS Aggregates & RAG Vector Store
```

### 3.2 Source-Grounded AI Query Flow
```text
User Submits Question 
  ──> RBAC Scope Filter (Verify user permissions & subsidiary scope)
  ──> Search Approved Knowledge Base & Documents
  ──> If no relevant sources found: Return "Insufficient source evidence"
  ──> Build Grounded Prompt with Excerpts & Citations
  ──> Grok Generation
  ──> Validate response against retrieved sources
  ──> Return formatted answer with interactive source badges
```

---

## 4. Trust & Failure Boundaries

| Boundary | Inbound Trust | Outbound Verification | Failure Mode |
|---|---|---|---|
| **Client ↔ Backend** | Untrusted input | Server-side schema & role verification | 401 Unauthorized / 403 Forbidden / 422 Invalid Payload |
| **Backend ↔ Grok AI** | Secure payload | Response schema validation & citation check | Fallback to secondary key; return "AI service temporarily unavailable" |
| **OCR ↔ Database** | Untrusted text | Human review gate before status = 'approved' | Flag as 'partially extracted' / 'needs review' |
| **Storage ↔ Public** | Private bucket | Signed URLs only for authorized roles | Access denied |
