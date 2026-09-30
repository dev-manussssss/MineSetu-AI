import React from 'react';
import {
  Layers,
  ArrowRight,
  Shield,
  FileCheck,
  Cloud,
  MessageSquareText,
  FileText,
  Lock,
  GitBranch,
  AlertTriangle,
  Database,
  Eye,
  CheckCircle2,
  Users
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { DisclaimerBanner } from '../components/DisclaimerBanner';

export const LandingPage: React.FC = () => {
  const { navigateTo } = useApp();

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#FFFFFF', color: 'var(--text-primary)' }}>
      {/* Top Banner */}
      <DisclaimerBanner />

      {/* 1. Header */}
      <header style={{
        borderBottom: '1px solid var(--border-subtle)',
        padding: '16px 40px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#FFFFFF',
        position: 'sticky',
        top: 0,
        zIndex: 50
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            backgroundColor: 'var(--bg-dark)',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Layers size={22} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '18px', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
                MDMS + Mindsetu AI
              </span>
              <span className="badge badge-demo">PROTOTYPE</span>
            </div>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              Intelligent Mining Data Management Layer Concept
            </span>
          </div>
        </div>

        <nav style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <a href="#modules" style={{ fontSize: '13px', color: 'var(--text-secondary)', textDecoration: 'none', fontWeight: 500 }}>
            SIH Modules
          </a>
          <a href="#workflow" style={{ fontSize: '13px', color: 'var(--text-secondary)', textDecoration: 'none', fontWeight: 500 }}>
            Workflow Pipeline
          </a>
          <a href="#rbac" style={{ fontSize: '13px', color: 'var(--text-secondary)', textDecoration: 'none', fontWeight: 500 }}>
            Role Access
          </a>
          <a href="#architecture" style={{ fontSize: '13px', color: 'var(--text-secondary)', textDecoration: 'none', fontWeight: 500 }}>
            Architecture
          </a>
          <button
            onClick={() => navigateTo('/login')}
            className="btn btn-primary btn-pill"
            style={{ padding: '8px 20px', fontSize: '13px', fontWeight: 600 }}
          >
            <span>Enter AI-Enhanced MDMS</span>
            <ArrowRight size={14} />
          </button>
        </nav>
      </header>

      {/* 2. Hero Section */}
      <section style={{
        padding: '72px 24px 60px',
        maxWidth: '1100px',
        margin: '0 auto',
        textAlign: 'center'
      }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 16px',
          borderRadius: 'var(--radius-full)',
          backgroundColor: 'var(--bg-surface-muted)',
          border: '1px solid var(--border-subtle)',
          fontSize: '12px',
          fontWeight: 600,
          color: 'var(--text-secondary)',
          marginBottom: '24px'
        }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10B981' }} />
          Smart India Hackathon (SIH) Prototype Demonstration
        </div>

        <h1 style={{
          fontSize: '48px',
          lineHeight: '1.15',
          fontWeight: 800,
          letterSpacing: '-0.03em',
          color: '#0F172A',
          marginBottom: '20px'
        }}>
          Intelligent Document Intelligence & <br />
          <span style={{ color: 'var(--accent-primary)' }}>Source-Grounded Querying</span> for MDMS
        </h1>

        <p style={{
          fontSize: '18px',
          lineHeight: '1.6',
          color: 'var(--text-secondary)',
          maxWidth: '780px',
          margin: '0 auto 36px'
        }}>
          An AI-enabled extension layer bridging scanned physical coal returns, statutory logs, and multi-subsidiary records with automated extraction, human-in-the-loop validation, and grounded parliamentary reporting.
        </p>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <button
            onClick={() => navigateTo('/login')}
            className="btn btn-primary btn-pill"
            style={{ padding: '12px 28px', fontSize: '15px', fontWeight: 600 }}
          >
            <span>Enter AI-Enhanced MDMS</span>
            <ArrowRight size={16} />
          </button>
          <a
            href="#architecture"
            className="btn btn-outline btn-pill"
            style={{ padding: '12px 24px', fontSize: '15px', fontWeight: 500 }}
          >
            <span>View Architecture</span>
          </a>
        </div>
      </section>

      {/* 3. Problem Statement & 4. AI Layer Section */}
      <section style={{ backgroundColor: 'var(--bg-app)', padding: '60px 24px', borderTop: '1px solid var(--border-subtle)', borderBottom: '1px solid var(--border-subtle)' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--accent-primary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              The Operational Need
            </span>
            <h2 style={{ fontSize: '28px', fontWeight: 700, marginTop: '6px' }}>
              Bridging Paper-Heavy Ingestion with Reliable Intelligence
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
            <div className="card-base">
              <div style={{ color: '#DC2626', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertTriangle size={20} />
                <h3 style={{ fontSize: '16px', fontWeight: 700 }}>Legacy Challenge</h3>
              </div>
              <p style={{ fontSize: '14px', lineHeight: '1.5', color: 'var(--text-secondary)' }}>
                Field returns, shift tallies, and colliery reports often arrive as non-standard PDFs or physical scans across 8 operating subsidiaries. Manual data entry introduces transcription errors, delayed aggregation, and slow response cycles for statutory queries.
              </p>
            </div>

            <div className="card-base" style={{ borderLeft: '3px solid var(--accent-primary)' }}>
              <div style={{ color: 'var(--accent-primary)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Shield size={20} />
                <h3 style={{ fontSize: '16px', fontWeight: 700 }}>The AI Extension Layer</h3>
              </div>
              <p style={{ fontSize: '14px', lineHeight: '1.5', color: 'var(--text-secondary)' }}>
                Mindsetu AI introduces high-precision OCR extraction, confidence scoring, and side-by-side human validation before data enters MDMS databases. Outputs remain strictly assistive and traceable to source documents.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Three Core SIH Modules */}
      <section id="modules" style={{ padding: '72px 24px', maxWidth: '1100px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--accent-primary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Core Problem Statement
          </span>
          <h2 style={{ fontSize: '30px', fontWeight: 700, marginTop: '6px' }}>
            Three Mandated AI Modules
          </h2>
          <p style={{ fontSize: '15px', color: 'var(--text-secondary)', marginTop: '8px' }}>
            Designed to integrate directly into executive and technical decision workflows.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
          {/* Module 1 */}
          <div className="card-base" style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              backgroundColor: 'var(--accent-light)',
              color: 'var(--accent-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '16px'
            }}>
              <FileText size={22} />
            </div>
            <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Module 1</div>
            <h3 style={{ fontSize: '18px', fontWeight: 700, margin: '6px 0 10px' }}>
              Automated Report Generation
            </h3>
            <p style={{ fontSize: '13px', lineHeight: '1.6', color: 'var(--text-secondary)', flex: 1 }}>
              Compiles multi-subsidiary operational returns, production statistics, and safety compliance records into formatted executive summaries with embedded source references and download options.
            </p>
            <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--accent-primary)', fontWeight: 600 }}>
              <CheckCircle2 size={14} /> Structured data export with lineage
            </div>
          </div>

          {/* Module 2 */}
          <div className="card-base" style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              backgroundColor: 'var(--pill-purple-bg)',
              color: 'var(--pill-purple-text)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '16px'
            }}>
              <Cloud size={22} />
            </div>
            <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Module 2</div>
            <h3 style={{ fontSize: '18px', fontWeight: 700, margin: '6px 0 10px' }}>
              Topic Identification & Word Cloud
            </h3>
            <p style={{ fontSize: '13px', lineHeight: '1.6', color: 'var(--text-secondary)', flex: 1 }}>
              Extracts key themes, recurring bottlenecks, and emergent concerns from unstructured daily remarks, accident investigation notes, and colliery inspection logs across all coalfields.
            </p>
            <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--pill-purple-text)', fontWeight: 600 }}>
              <CheckCircle2 size={14} /> Interactive SVG word cloud & clusters
            </div>
          </div>

          {/* Module 3 */}
          <div className="card-base" style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              backgroundColor: 'var(--success-bg)',
              color: 'var(--success-solid)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '16px'
            }}>
              <MessageSquareText size={22} />
            </div>
            <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Module 3</div>
            <h3 style={{ fontSize: '18px', fontWeight: 700, margin: '6px 0 10px' }}>
              AI-Based Query & Response
            </h3>
            <p style={{ fontSize: '13px', lineHeight: '1.6', color: 'var(--text-secondary)', flex: 1 }}>
              Source-grounded RAG engine capable of answering technical questions, parliamentary inquiries, and production cross-comparisons with mandatory citations and anti-hallucination guardrails.
            </p>
            <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--success-text)', fontWeight: 600 }}>
              <CheckCircle2 size={14} /> Zero unsupported claims; full page traceability
            </div>
          </div>
        </div>
      </section>

      {/* 6. Workflow Visual */}
      <section id="workflow" style={{ backgroundColor: 'var(--bg-app)', padding: '64px 24px', borderTop: '1px solid var(--border-subtle)', borderBottom: '1px solid var(--border-subtle)' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--accent-primary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Traceable Pipeline
            </span>
            <h2 style={{ fontSize: '28px', fontWeight: 700, marginTop: '6px' }}>
              From Raw Scans to Approved Intelligence
            </h2>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '8px',
            overflowX: 'auto',
            padding: '16px 0'
          }}>
            {[
              { step: '01', title: 'Upload & Hash', desc: 'Immutable PDF in storage', icon: <FileCheck size={18} /> },
              { step: '02', title: 'OCR Extraction', desc: 'Key-value & tables parsed', icon: <Database size={18} /> },
              { step: '03', title: 'Confidence Scoring', desc: 'Highlight low confidence', icon: <AlertTriangle size={18} /> },
              { step: '04', title: 'Human Review', desc: 'Officer validation & edit', icon: <Eye size={18} /> },
              { step: '05', title: 'MDMS Approved', desc: 'Published to core store', icon: <CheckCircle2 size={18} /> },
              { step: '06', title: 'RAG & Reports', desc: 'Source-grounded query', icon: <MessageSquareText size={18} /> },
            ].map((st) => (
              <div key={st.step} style={{
                flex: 1,
                minWidth: '150px',
                backgroundColor: '#FFFFFF',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-lg)',
                padding: '16px',
                textAlign: 'left'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--accent-primary)' }}>{st.step}</span>
                  <span style={{ color: 'var(--text-muted)' }}>{st.icon}</span>
                </div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>{st.title}</div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>{st.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. RBAC Matrix Overview */}
      <section id="rbac" style={{ padding: '64px 24px', maxWidth: '1100px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--accent-primary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Authority & Governance
          </span>
          <h2 style={{ fontSize: '28px', fontWeight: 700, marginTop: '6px' }}>
            7 Tailored Prototype Personas
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '6px' }}>
            Every role receives an isolated data scope, tailored sidebar navigation, and strict permissions.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
          {[
            { role: 'Ministry Executive', scope: 'National Macro View', desc: 'Strategic analytics, parliamentary Q&A approval' },
            { role: 'CIL Executive', scope: 'Enterprise CIL Scope', desc: 'Subsidiary benchmarking, production tracking' },
            { role: 'CMPDI Nodal Expert', scope: 'Technical Repository', desc: 'Ingestion queue, OCR verification, reports' },
            { role: 'Subsidiary Manager', scope: 'Single Subsidiary', desc: 'Mine validation, area approvals, local reports' },
            { role: 'Parliamentary Desk', scope: 'Lok / Rajya Sabha', desc: 'Grounded draft generation, citation auditing' },
            { role: 'Field Data Officer', scope: 'Single Colliery', desc: 'Daily log uploads, OCR error correction' },
            { role: 'System Admin', scope: 'Global Infrastructure', desc: 'User RBAC, system health, audit log viewer' },
          ].map((r, i) => (
            <div key={i} style={{
              backgroundColor: '#FFFFFF',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '16px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                <Users size={14} style={{ color: 'var(--accent-primary)' }} />
                <span style={{ fontSize: '13px', fontWeight: 700 }}>{r.role}</span>
              </div>
              <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)' }}>{r.scope}</div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '6px' }}>{r.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* 8. Architecture & Security Section */}
      <section id="architecture" style={{ backgroundColor: 'var(--bg-dark)', color: '#FFFFFF', padding: '64px 24px' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#60A5FA', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Security & Trust Boundaries
            </span>
            <h2 style={{ fontSize: '28px', fontWeight: 700, marginTop: '6px' }}>
              Zero Secret Leakage & Server-Side Grounding
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
            <div style={{ backgroundColor: 'var(--bg-dark-surface)', borderRadius: 'var(--radius-lg)', padding: '24px', border: '1px solid rgba(255,255,255,0.1)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#60A5FA', marginBottom: '12px' }}>
                <Lock size={20} />
                <span style={{ fontSize: '16px', fontWeight: 700 }}>Client Security Isolation</span>
              </div>
              <p style={{ fontSize: '13px', lineHeight: '1.6', color: '#CBD5E1' }}>
                Grok / xAI API keys and Supabase service-role credentials reside strictly within serverless Edge Functions. No private secret is ever bundled into client-side JavaScript.
              </p>
            </div>

            <div style={{ backgroundColor: 'var(--bg-dark-surface)', borderRadius: 'var(--radius-lg)', padding: '24px', border: '1px solid rgba(255,255,255,0.1)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#34D399', marginBottom: '12px' }}>
                <GitBranch size={20} />
                <span style={{ fontSize: '16px', fontWeight: 700 }}>Immutable Source Lineage</span>
              </div>
              <p style={{ fontSize: '13px', lineHeight: '1.6', color: '#CBD5E1' }}>
                Original scanned files remain immutable in secure storage. All extractions, manual overrides, and approvals are stored in relational audit logs with before/after diffs.
              </p>
            </div>
          </div>

          <div style={{ textAlign: 'center', marginTop: '40px' }}>
            <button
              onClick={() => navigateTo('/login')}
              className="btn btn-primary btn-pill"
              style={{ padding: '12px 32px', fontSize: '15px', fontWeight: 600 }}
            >
              <span>Launch Demo Environment</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </section>

      {/* 9. Institutional Disclaimer & Footer */}
      <footer style={{ borderTop: '1px solid var(--border-subtle)', padding: '36px 24px', textAlign: 'center', fontSize: '12px', color: 'var(--text-muted)', backgroundColor: '#FFFFFF' }}>
        <p style={{ maxWidth: '800px', margin: '0 auto 12px', lineHeight: '1.6' }}>
          <strong>Prototype Disclaimer:</strong> This application is a technical demonstration developed to showcase assistive AI capabilities within mining data management workflows. It is not an official system of the Government of India, Ministry of Coal, CMPDI, CIL, or NIC. All records displayed are synthetic demo data.
        </p>
        <p>© 2026 MDMS + Mindsetu AI Architecture Prototype. Built for SIH Demonstration.</p>
      </footer>
    </div>
  );
};
