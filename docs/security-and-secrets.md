# MineSetu AI — Security, Privacy & Secret Management

> **STATUS**: APPROVED MASTER SECURITY SPECIFICATION  
> **LAST UPDATED**: October 2026  
> **APPLICATION SCOPE**: Secret Isolation, Multi-Tenant Scoping & Trust Boundaries  
> **CANONICAL LOCATION**: `docs/security-and-secrets.md`

---

## 1. Environment Variable Architecture & Secret Isolation

MineSetu AI enforces a strict boundary between public browser assets and privileged backend credentials:

```text
┌────────────────────────────────────────────────────────────────────────┐
│                        PUBLIC BROWSER ENVIRONMENT                      │
│                                                                        │
│  Client-Safe Variables (Prefix: VITE_)                                 │
│  - VITE_APP_ENV=development                                            │
│  - VITE_APP_DEMO_MODE=true                                             │
│  - VITE_SUPABASE_URL=https://<project-ref>.supabase.co                 │
│  - VITE_SUPABASE_ANON_KEY=eyJhbGciOi... (Public Key, Restricted RLS)   │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    │ STRICT BOUNDARY (NO SECRETS IN BROWSER)
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                   PRIVILEGED SERVER-SIDE ENVIRONMENT                   │
│                    (Vercel Serverless / Edge Secrets)                  │
│                                                                        │
│  Server-Only Privileged Variables (NEVER prefixed with VITE_)          │
│  - GROK_API_KEY_PRIMARY=xai-...                                        │
│  - GROK_API_KEY_FALLBACK=xai-...                                       │
│  - SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi... (Bypasses RLS)             │
│  - OBJECT_STORAGE_SECRET_KEY=...                                       │
└────────────────────────────────────────────────────────────────────────┘
```

### 1.1 Non-Negotiable Rules
1. **Zero Client Secrets**: Grok/xAI API keys, OpenAI keys, Anthropic keys, Supabase `service_role` keys, and AWS access secrets must **never** appear in frontend code, client bundles, or `VITE_*` environment variables.
2. **No Credentials in Git**: `.env`, `.env.local`, and `.env.production` files are strictly excluded via `.gitignore`. Only `.env.example` containing descriptive placeholder strings is committed.
3. **Automated Secret Scanning**: Pre-commit hooks and CI pipelines must scan for accidentally committed high-entropy API tokens.

---

## 2. Demo Authentication vs Production Security

### 2.1 Current Prototype Demo Authentication
- The `/login` portal provides instant demo authentication across 4 personas (`ministry_coal`, `cil_hq`, `cmpdi`, `subsidiary_officer`).
- **Epistemic Classification**: **MOCKED IN PROTOTYPE**.
- **Security Reality**: The current client-side login verifies pre-configured strings in `AppContext.tsx` and simulates session persistence via `localStorage`. It does **not** provide cryptographic identity guarantees, password salting, multi-factor authentication (MFA), or session revocation.
- **Watermarking**: The UI must maintain the persistent badge: *"Demo access only · No public registration"* and watermarked demo credentials.

### 2.2 Production Authentication Roadmap (Future Phase)
When graduating to an authorized enterprise pilot, the demo authenticator will be replaced with:
- **NIC Single Sign-On (SSO) / MeriPehchan**: Official Government of India citizen and employee identity provider.
- **Enterprise OpenID Connect (OIDC)**: Direct integration with Coal India Corporate Active Directory / Azure AD.
- **Time-Based One-Time Password (TOTP)**: Mandatory 2FA for users holding verification or statutory approval privileges.

---

## 3. Backend Authorization & Multi-Tenant Scoping

### 3.1 Least-Privilege Role-Based Access Control (RBAC)
- Client-side checks (`can(currentUser, permission)`) are purely decorative UX helpers to prevent user confusion.
- **Server Enforcement**: All backend API endpoints must inspect the incoming Bearer JWT, resolve the caller's verified persona, and enforce `can(user, permission)` prior to reading or mutating records.

### 3.2 Subsidiary-Level Data Isolation (Preventing IDOR)
- In the Indian coal sector, subsidiaries (e.g. Western Coalfields vs Mahanadi Coalfields) operate distinct commercial, environmental, and labor mandates.
- **Insecure Direct Object Reference (IDOR) Prevention**:
  - A field officer from ECL cannot view or modify SECL draft documents simply by knowing or guessing the document UUID (`/api/documents/doc-secl-002`).
  - Database Row-Level Security (RLS) policies enforce scoping at the database engine level:
    ```sql
    -- PostgreSQL Row Level Security Example
    CREATE POLICY subsidiary_isolation_policy ON documents
      FOR ALL
      USING (
        auth.jwt() ->> 'role' IN ('ministry_coal', 'cil_hq', 'cmpdi')
        OR
        subsidiary_code = auth.jwt() ->> 'subsidiary_code'
      );
    ```

---

## 4. Secure Document Handling & File Ingestion

### 4.1 File Upload Validation
Every uploaded document must pass multiple defensive gates before storage or parsing:
1. **Client-Side Pre-Validation**: Verifies file extension (`.pdf`, `.docx`, `.xlsx`, `.csv`, `.png`, `.jpg`) and rejects payloads exceeding 10MB.
2. **Server-Side MIME & Magic Byte Sniffing**: Server inspects initial file bytes (e.g. `%PDF-` for PDF, `PK\x03\x04` for DOCX/XLSX) to prevent malicious executable spoofing.
3. **Malware & Virus Scanning**: In production, uploaded files are quarantined until scanned by an antivirus daemon (e.g. ClamAV / AWS GuardDuty).
4. **Filename Sanitization**: Uploaded filenames are stripped of path-traversal characters (`../`), control characters, and non-ASCII glyphs.

### 4.2 Storage Isolation & Ephemeral Access
- Documents reside in private, non-public object storage buckets.
- Files are addressed via immutable SHA-256 content hashes, preventing unauthorized file replacement.
- The web frontend accesses documents solely through **short-lived signed URLs** (e.g. 15-minute expiration) generated on-demand by authorized backend functions.

---

## 5. Sensitive Data & External LLM Boundaries

### 5.1 Third-Party Model Privacy
- Statutory mining data and production numbers must **never** be used by external AI providers to train foundational models.
- When calling third-party APIs (e.g. xAI Grok 2), MineSetu AI must utilize enterprise zero-data-retention (ZDR) endpoints.

### 5.2 Personally Identifiable Information (PII) Redaction
- Mining returns frequently include names, phone numbers, and signatures of colliery weighbridge clerks or shift supervisors.
- Ingestion pipelines apply regex-based redaction to mask personal phone numbers and national ID numbers before feeding text chunks into LLM prompt contexts.

---

## 6. Auditability, Retention & Error Handling

### 6.1 Tamper-Evident Audit Logging
- Every security-relevant event (login, persona switch, document upload, verification edit, permission rejection, data export) generates an immutable entry in `audit_events`.
- Database triggers disable `UPDATE` and `DELETE` queries on the audit table.
- **Log Hygiene**: Audit entries record actor, action, timestamp, entity ID, and status result. Raw passwords, authentication tokens, and full document text bodies are **never** logged.

### 6.2 Secure Error Handling & Information Leakage
- Production error responses return generic, safe messages (e.g. *"Internal server error during document processing. Request ID: req_9823"*).
- Internal database schema details, file system paths, stack traces, and environment variable names must **never** be exposed in API error payloads.

### 6.3 API Rate Limiting
- AI inference endpoints (`/api/ai/query`, `/api/reports/generate`) are throttled per user and per IP address (e.g. max 10 requests per minute) to prevent denial-of-service and budget exhaustion.
