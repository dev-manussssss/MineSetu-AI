# Security & Threat Model — MDMS + Mindsetu AI

## 1. Non-Negotiable Security Policies

1. **Zero Secret Leakage in Client Code**:
   - `GROK_API_KEY_PRIMARY`, `GROK_API_KEY_FALLBACK`, and `SUPABASE_SERVICE_ROLE_KEY` must NEVER exist in React client bundles or `VITE_*` environment variables.
   - Any API key found in client source will be treated as an immediate high-severity defect.
2. **Server-Side Authorization**:
   - Frontend UI hiding is for user experience only. All mutations and read operations must be verified by Supabase RLS and server-side Edge functions.
3. **Immutable Document Store**:
   - Uploaded PDF and image files stored in Supabase Storage cannot be overwritten or altered. Derived extractions and corrections are stored in separate relational tables.
4. **Append-Only Audit Trail**:
   - Sensitive operations (logins, verification overrides, approvals, document deletion, AI prompt exports) create immutable audit log rows.

---

## 2. Threat Modeling & Protections

| Threat Vector | Potential Impact | Implemented Mitigation |
|---|---|---|
| **Prompt Injection via OCR** | Untrusted document text could manipulate LLM instructions | Strict system prompt isolation with delimiter tags (`<source_content>`), forbidding prompt overrides. |
| **Data Scope Privilege Escalation** | Field Officer accessing other subsidiaries' confidential returns | PostgreSQL RLS checks `auth.jwt() ->> 'subsidiary_code'` on every query. |
| **API Key Exposure on GitHub** | Unauthorized billing or Grok account compromise | Strict `.gitignore`, pre-commit hooks, `.env.example` templates with placeholder keys only. |
| **Hallucinated Operational Statistics** | Inaccurate figures presented to parliamentary committees | Mandatory source citation checks; responses without grounded citations are blocked. |
| **Malicious File Uploads** | Server compromise via executable payload | Strict MIME type validation (`application/pdf`, `image/png`, `image/jpeg`) and 15MB file size limit. |

---

## 3. Prototype Limitations Disclaimer

This codebase is an engineering prototype. While modern security practices (RLS, token authentication, audit logs, secret hygiene) are built into the architecture, production deployment within a Government of India ministry would require full STQC auditing, NIC cloud infrastructure certification, and PKI digital signature integration.
