# MineSetu AI — Architecture Decision Records & Decisions Log

> **STATUS**: APPROVED MASTER DECISIONS LOG  
> **LAST UPDATED**: October 2026  
> **CANONICAL LOCATION**: `docs/decisions-log.md`

---

## 1. Decision Status Definitions

To avoid ambiguity, every architectural and product decision is assigned one of the following statuses:
- **APPROVED**: Formally approved product direction or architectural standard. Must be adhered to in code and docs.
- **PROPOSED**: Technically viable proposal under consideration for implementation. Not yet finalized.
- **OPEN**: Architectural question requiring further evaluation or empirical benchmarking before selection.
- **REJECTED**: Evaluated and explicitly rejected design or technical alternative.

---

## 2. Approved Architectural & Product Decisions

### ADR-001: Product Name & Identity — MineSetu AI
- **Status**: **APPROVED**
- **Date**: October 2026
- **Context**: The project explores an AI-assisted reporting workspace for coal-sector reporting workflows associated with MDMS.
- **Decision**: The official product name is **MineSetu AI** (Wordmark: *MineSetu* in dark slate `#0F172A`, *AI* in cobalt blue `#1D4ED8`). The official circular mountain-and-river emblem located at `assets/design references /file_00000000e9e88208ae070777ee045cb1.png` is the approved brand mark.
- **Alternatives Considered**: Generic names such as "MDMS AI Extension", "CoalRAG", or "Coalfield Intelligence Portal".
- **Impact**: Establishes unique, culturally grounded identity ("Setu" = bridge) while respecting MDMS boundaries.

---

### ADR-002: Standalone Prototype Scope & Mandatory Disclaimer
- **Status**: **APPROVED**
- **Date**: October 2026
- **Context**: The product operates in the domain of statutory mining data and government administration. Overclaiming live integration creates legal and institutional liability.
- **Decision**: MineSetu AI is explicitly positioned as a **standalone prototype and concept demonstration**, not the official MDMS portal. Live integration, official government authentication, official approval, or live government data must never be claimed. The mandatory disclaimer banner must remain on public views.
- **Alternatives Considered**: White-labeling as "Official MDMS 2.0" (Rejected due to absolute lack of legal/institutional authorization).
- **Impact**: Protects institutional credibility and sets clear expectations for stakeholders and evaluators.

---

### ADR-003: Four Target Prototype Personas
- **Status**: **APPROVED**
- **Date**: October 2026
- **Context**: The prototype previously explored 7 fragmented roles. A clearer institutional hierarchy was required to model realistic coal-sector workflows.
- **Decision**: Consolidate prototype access into **four target personas**:
  1. **Ministry of Coal** (`ministry_coal`): Strategic national oversight & executive reporting.
  2. **CIL Headquarters** (`cil_hq`): Enterprise multi-subsidiary operational consolidation.
  3. **CMPDI** (`cmpdi`): Technical & geological validation, extraction review, and topic intelligence.
  4. **Subsidiary / Mine Officer** (`subsidiary_officer`): Primary colliery returns, manual data entry, and field corrections.
- **Alternatives Considered**: Retaining 7 fragmented roles or reducing to a single generic admin/user role.
- **Impact**: Provides clean role-based data scoping and intuitive user journeys for demo exploration.

---

### ADR-004: Dual First-Class Ingestion (Manual Entry & Document Upload)
- **Status**: **APPROVED**
- **Date**: October 2026
- **Context**: Colliery offices often face intermittent network connectivity, preventing large PDF uploads, or officers may have physical slip notes that need rapid structured recording without scanning.
- **Decision**: Manual structured data entry is elevated to a **first-class citizen alongside document upload**. The application provides a dedicated manual entry interface with category selection, field rows, unit enforcement, draft saving, and review submission.
- **Alternatives Considered**: Upload-only system (fails in field scenarios lacking scanning hardware).
- **Impact**: Broadens operational usability across remote mining collieries.

---

### ADR-005: Ask MineSetu Prominent on Every Dashboard
- **Status**: **APPROVED**
- **Date**: October 2026
- **Context**: Users across all four personas require rapid access to source-grounded intelligence without navigating away from their primary operational dashboard.
- **Decision**: Position the **"Ask MineSetu"** inquiry bar prominently near the top of every persona dashboard, pre-populated with role-appropriate quick questions and scoped to the persona's authorized data boundary.
- **Alternatives Considered**: Burying AI query inside a separate sub-page.
- **Impact**: Increases assistive AI discoverability and operational efficiency.

---

### ADR-006: Simultaneous Multi-Format Report Compilation (PDF, Word, Excel)
- **Status**: **APPROVED**
- **Date**: October 2026
- **Context**: In statutory reporting, executive leadership requires PDF briefs, administrative drafting teams require editable Word (.docx) documents, and audit teams require Excel (.xlsx) workbooks for cell reconciliation.
- **Decision**: The Automated Report Builder must allow users to select **PDF, Word (.docx), and Excel (.xlsx) simultaneously**, deriving all three formats from the identical underlying validated dataset.
- **Alternatives Considered**: Print-only PDF export or single-format Word export.
- **Impact**: Eliminates manual format conversion by technical officers.

---

### ADR-007: Exclusion of Generative Image Creation in Reporting Workflows
- **Status**: **APPROVED**
- **Date**: October 2026
- **Context**: Generative image models (e.g. DALL-E, Imagen) can hallucinate non-existent mining equipment, unrealistic pit layouts, or misleading graphical artifacts.
- **Decision**: Image generation features are **strictly prohibited** in the statutory reporting and document workflows. Charts and graphs must be generated using deterministic data visualization libraries (SVG, Canvas), not generative diffusion models.
- **Alternatives Considered**: Generating AI conceptual illustrations of open cast pits.
- **Impact**: Upholds strict factual integrity required for statutory mining reviews.

---

### ADR-008: Mandatory Human-in-the-Loop Review & Citations
- **Status**: **APPROVED**
- **Date**: October 2026
- **Context**: Automated OCR models occasionally misread blurry digits, handwriting, or folded paper slips.
- **Decision**: Raw AI extractions must **never** be silently committed into approved databases. They must pass through the Validation Workbench where human officers review, correct, and formally sign off on records. Every AI answer must cite origin documents, page numbers, and tables.
- **Alternatives Considered**: Fully autonomous ingestion without human verification gates.
- **Impact**: Zero unauthorized database contamination; complete lineage tracking.

---

### ADR-009: Vercel Target Deployment
- **Status**: **APPROVED**
- **Date**: October 2026
- **Context**: The prototype requires rapid global delivery, seamless preview deployments for pair programming, and low operational maintenance overhead.
- **Decision**: Host MineSetu AI on **Vercel** utilizing edge caching for frontend static assets and serverless functions for backend route handlers.
- **Alternatives Considered**: Self-hosted Docker container on AWS EC2, Kubernetes cluster.
- **Impact**: Minimal DevOps overhead, high performance, and rapid continuous delivery.

---

### ADR-010: Documentation-First Deliverable & Safe Codebase Preservation
- **Status**: **APPROVED**
- **Date**: October 2026
- **Context**: The existing repository had outdated docs, missing files, and fragmented architectures. Rushing into code edits risks breaking working builds.
- **Decision**: Complete a thorough repository audit and rewrite all project documentation into a single canonical source of truth in `docs/` before initiating large code rewrites. The codebase must remain 100% buildable throughout.
- **Alternatives Considered**: Simultaneous code hacking without updated documentation.
- **Impact**: Flawless handoff to subsequent engineering phases with zero regression risks.

---

### ADR-011: Frontend Framework (React 19 + TypeScript + Vite + Vanilla CSS)
- **Status**: **APPROVED**
- **Date**: October 2026
- **Context**: High-performance, modular Single-Page Application (SPA) requirements with custom design tokens matching exact visual references (`ref1.png`, `ref2.png`).
- **Decision**: Retain **React 19, TypeScript, Vite, and Tokenized Vanilla CSS**. Avoid TailwindCSS unless explicitly requested; use Vanilla CSS for maximum control over institutional design tokens.
- **Alternatives Considered**: Next.js App Router (heavier server requirements for a prototype SPA), TailwindCSS (adds unnecessary abstraction over existing tokens).
- **Impact**: Instant hot reloading (<50ms), sub-second production builds (255ms), and zero runtime CSS overhead.

---

## 3. Open Architectural Choices & Proposals (Pending Backend Implementation)

### ADR-012: Backend Architecture & Serverless Route Strategy
- **Status**: **PROPOSED**
- **Context**: Need to connect the client SPA to real server-side endpoints for file uploads, OCR processing, and AI queries.
- **Proposal**: Implement lightweight Node.js/TypeScript serverless functions under `/api/*` on Vercel, matching the existing TypeScript codebase.
- **Alternatives Considered**: Separate Express / FastAPI microservice; Next.js full migration.

---

### ADR-013: Primary Database Selection
- **Status**: **PROPOSED**
- **Context**: Need durable persistence for multi-tenant organizations, mines, documents, extracted fields, requests, and audit logs.
- **Proposal**: **PostgreSQL** hosted via **Supabase** or **Neon**. Provides robust JSONB storage for dynamic extraction tables and native Row-Level Security (RLS).
- **Alternatives Considered**: SQLite (cannot scale horizontally), MongoDB (lacks relational integrity for statutory audit chains).

---

### ADR-014: Document Object Storage Strategy
- **Status**: **PROPOSED**
- **Context**: Need immutable storage for raw uploaded PDFs, scanned images, and generated Word/Excel exports.
- **Proposal**: Private, S3-compatible cloud object storage (e.g. **Supabase Storage** or **AWS S3**) with pre-signed ephemeral download URLs.
- **Alternatives Considered**: Storing files in PostgreSQL BLOBs (causes database bloat).

---

### ADR-015: Production Authentication Strategy
- **Status**: **OPEN**
- **Context**: Transitioning from prototype demo credentials to enterprise-grade government authentication.
- **Options**:
  - *Option A*: NIC Single Sign-On (MeriPehchan) — standard for official GoI portals.
  - *Option B*: Enterprise OpenID Connect (OIDC) with Coal India Corporate Active Directory.
  - *Option C*: Supabase Auth with custom enterprise SAML integration.
- **Recommendation**: Retain demo role selector during prototype; design auth middleware to be OIDC-compatible.

---

### ADR-016: OCR & Document Extraction Pipeline Engine
- **Status**: **OPEN**
- **Context**: Balancing handwriting recognition accuracy on colliery slips against serverless latency constraints.
- **Options**:
  - *Option A*: **AWS Textract** / **Google Cloud Document AI** (Specialized table extraction models).
  - *Option B*: **Tesseract.js** (Client/serverless open-source OCR, lower accuracy on handwriting).
  - *Option C*: Multimodal LLM vision parsing (e.g. Claude 3.5 Sonnet / GPT-4o vision).
- **Recommendation**: Benchmark AWS Textract vs Multimodal Vision on real colliery sample slips during Phase 2.

---

### ADR-017: LLM Provider & Gateway Strategy
- **Status**: **PROPOSED**
- **Context**: Assistive summarization and source-grounded RAG query response.
- **Proposal**: **xAI Grok 2 API (`grok-2`)** as primary inference engine, with primary/fallback key rotation and offline synthetic semantic fallback for zero-cost demo environments.
- **Alternatives Considered**: OpenAI GPT-4o, Anthropic Claude 3.5 Sonnet, self-hosted Llama 3 on GPU instance.

---

### ADR-018: Vector Database & Semantic Retrieval Index
- **Status**: **OPEN**
- **Context**: Indexing document text chunks for "Ask MineSetu" grounded search.
- **Options**:
  - *Option A*: `pgvector` extension inside the primary PostgreSQL database (eliminates secondary vector DB).
  - *Option B*: Managed Pinecone / Qdrant vector database.
  - *Option C*: Hybrid BM25 full-text search combined with dense vector embeddings.
- **Recommendation**: `pgvector` inside PostgreSQL for architectural simplicity.

---

### ADR-019: Asynchronous Long-Running Task Worker Strategy
- **Status**: **OPEN**
- **Context**: Handling multi-page PDF OCR extraction jobs that exceed Vercel's 10–15s function timeouts.
- **Options**:
  - *Option A*: Serverless background queue via **QStash** or **Inngest**.
  - *Option B*: Standalone Python/Celery worker on AWS ECS / Google Cloud Run.
  - *Option C*: AWS Lambda with custom container runtime.
- **Recommendation**: Evaluate QStash or Inngest first for low-maintenance serverless event dispatching.
