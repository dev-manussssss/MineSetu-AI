import React from 'react';
import {
  ArrowRight,
  FileCheck,
  Search,
  FileText,
  UploadCloud
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { DisclaimerBanner } from '../components/DisclaimerBanner';
import type { Role } from '../types';

export const LandingPage: React.FC = () => {
  const { navigateTo, switchRole } = useApp();

  const handleLaunchRole = (role: Role) => {
    switchRole(role);
    navigateTo('/dashboard');
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#FFFFFF', color: 'var(--text-primary)', fontFamily: 'var(--font-family)' }}>
      {/* 1. Prototype Disclaimer Banner at very top */}
      <DisclaimerBanner />

      {/* 2. Header / Navigation */}
      <header
        className="landing-header"
        style={{
          borderBottom: '1px solid var(--border-subtle)',
          padding: '14px 32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: '#FFFFFF',
          position: 'sticky',
          top: 0,
          zIndex: 50,
          boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
        }}
      >
        {/* Brand & Wordmark with Authentic Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <img
            src="/minesetu-logo.png"
            alt="MineSetu AI Logo"
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '8px',
              objectFit: 'contain'
            }}
          />
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '18px', fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
                MineSetu <span style={{ color: 'var(--accent-primary)' }}>AI</span>
              </span>
              <span style={{
                fontSize: '10px',
                fontWeight: 600,
                padding: '2px 8px',
                borderRadius: '4px',
                backgroundColor: 'var(--accent-light)',
                color: 'var(--accent-primary)',
                letterSpacing: '0.04em'
              }}>
                PROTOTYPE
              </span>
            </div>
            <div className="landing-brand-subtitle" style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 500 }}>
              AI-Assisted Coal-Sector Reporting Prototype
            </div>
          </div>
        </div>

        {/* Working Anchor Navigation */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div className="landing-nav-links" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <button
              onClick={() => scrollToSection('how-it-works')}
              style={{ background: 'none', border: 'none', fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 500, cursor: 'pointer' }}
            >
              How It Works
            </button>
            <button
              onClick={() => scrollToSection('capabilities')}
              style={{ background: 'none', border: 'none', fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 500, cursor: 'pointer' }}
            >
              Capabilities
            </button>
            <button
              onClick={() => scrollToSection('personas')}
              style={{ background: 'none', border: 'none', fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 500, cursor: 'pointer' }}
            >
              Demo Personas
            </button>
          </div>
          <button
            onClick={() => navigateTo('/login')}
            className="btn btn-primary landing-cta-btn"
            style={{ padding: '8px 16px', fontSize: '13px', fontWeight: 600, borderRadius: 'var(--radius-sm)', display: 'inline-flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap' }}
          >
            <span>Explore Prototype</span>
            <ArrowRight size={14} />
          </button>
        </nav>
      </header>

      {/* 3. Hero Section */}
      <section style={{
        padding: '64px 24px 48px',
        maxWidth: '1140px',
        margin: '0 auto',
        textAlign: 'center'
      }}>
        {/* Prominent Context Tag */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 14px',
          borderRadius: 'var(--radius-full)',
          backgroundColor: 'var(--bg-surface-muted)',
          border: '1px solid var(--border-medium)',
          fontSize: '12px',
          color: 'var(--text-secondary)',
          marginBottom: '24px'
        }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--accent-primary)' }} />
          <span>Standalone Demonstration Environment · Synthetic Coal-Sector Data</span>
        </div>

        {/* Exact Approved Headline */}
        <h1 style={{
          fontSize: '40px',
          fontWeight: 700,
          color: 'var(--text-primary)',
          lineHeight: '1.2',
          letterSpacing: '-0.025em',
          maxWidth: '840px',
          margin: '0 auto 20px'
        }}>
          Making coal-sector reporting simpler and more connected.
        </h1>

        {/* Exact Approved Supporting Copy */}
        <p style={{
          fontSize: '16px',
          lineHeight: '1.6',
          color: 'var(--text-secondary)',
          maxWidth: '760px',
          margin: '0 auto 32px'
        }}>
          Explore how MineSetu AI could help teams process mining documents, enter information manually, verify records, search available information and prepare reports through a structured workflow.
        </p>

        {/* Hero CTAs */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '14px', flexWrap: 'wrap' }}>
          <button
            onClick={() => navigateTo('/login')}
            className="btn btn-primary"
            style={{ padding: '10px 24px', fontSize: '14px', fontWeight: 600, borderRadius: 'var(--radius-sm)', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
          >
            <span>Explore the prototype</span>
            <ArrowRight size={16} />
          </button>

          <button
            onClick={() => scrollToSection('how-it-works')}
            className="btn btn-outline"
            style={{ padding: '10px 22px', fontSize: '14px', fontWeight: 600, borderRadius: 'var(--radius-sm)' }}
          >
            How it works
          </button>
        </div>

        {/* Interactive Facsimile Preview Card */}
        <div style={{
          marginTop: '48px',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-subtle)',
          boxShadow: '0 20px 40px -15px rgba(0,0,0,0.08)',
          backgroundColor: '#FFFFFF',
          overflow: 'hidden',
          textAlign: 'left'
        }}>
          <div style={{
            padding: '12px 20px',
            backgroundColor: 'var(--bg-surface-muted)',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ display: 'flex', gap: '6px' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#EF4444' }} />
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#F59E0B' }} />
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#10B981' }} />
              </div>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)', marginLeft: '8px' }}>
                minesetu-prototype / operational-dashboard.demo
              </span>
            </div>
            <span className="badge badge-neutral">Simulated Interface</span>
          </div>

          <div style={{ padding: '24px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
            <div style={{ padding: '16px', borderRadius: '8px', border: '1px solid var(--border-subtle)', backgroundColor: '#FAFAFA' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>
                1. Dual Ingestion Pipeline
              </div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
                ECL Rajmahal OCP Monthly Return
              </div>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0 }}>
                Scanned PDF ingested with optical extraction alongside structured manual entries.
              </p>
            </div>

            <div style={{ padding: '16px', borderRadius: '8px', border: '1px solid var(--border-subtle)', backgroundColor: '#FAFAFA' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>
                2. Human Verification Step
              </div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#D97706', marginBottom: '4px' }}>
                Side-by-Side Validation
              </div>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0 }}>
                Engineers inspect field-level values against source facsimiles before finalizing.
              </p>
            </div>

            <div style={{ padding: '16px', borderRadius: '8px', border: '1px solid var(--border-subtle)', backgroundColor: '#FAFAFA' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>
                3. Grounded Synthesis
              </div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#10B981', marginBottom: '4px' }}>
                Source-Grounded Answering
              </div>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0 }}>
                Every metric cites verified document title, page, and table coordinates.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. How It Works Section */}
      <section id="how-it-works" style={{
        padding: '64px 24px',
        backgroundColor: 'var(--bg-app)',
        borderTop: '1px solid var(--border-subtle)',
        borderBottom: '1px solid var(--border-subtle)'
      }}>
        <div style={{ maxWidth: '1140px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '44px' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--accent-primary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Four-Stage Structured Workflow
            </span>
            <h2 style={{ fontSize: '28px', fontWeight: 700, color: 'var(--text-primary)', marginTop: '6px', letterSpacing: '-0.02em' }}>
              How MineSetu AI Works
            </h2>
            <p style={{ fontSize: '15px', color: 'var(--text-secondary)', maxWidth: '640px', margin: '8px auto 0' }}>
              A proposed structured workflow designed to preserve human verification and data integrity at every stage.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
            {/* Step 1 */}
            <div className="card-base" style={{ padding: '24px', display: 'flex', flexDirection: 'column', height: '100%' }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                backgroundColor: 'var(--bg-dark)',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '14px',
                marginBottom: '16px'
              }}>
                1
              </div>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
                Add Information
              </h3>
              <p style={{ fontSize: '13px', lineHeight: '1.6', color: 'var(--text-secondary)', flex: 1 }}>
                Upload operational documents (PDF, DOCX, XLSX, scanned returns) or enter records directly through structured manual data entry with units.
              </p>
              <div style={{ marginTop: '16px', fontSize: '11px', color: 'var(--accent-primary)', fontWeight: 600 }}>
                Dual Ingestion Supported
              </div>
            </div>

            {/* Step 2 */}
            <div className="card-base" style={{ padding: '24px', display: 'flex', flexDirection: 'column', height: '100%' }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                backgroundColor: 'var(--bg-dark)',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '14px',
                marginBottom: '16px'
              }}>
                2
              </div>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
                Review Extracted Data
              </h3>
              <p style={{ fontSize: '13px', lineHeight: '1.6', color: 'var(--text-secondary)', flex: 1 }}>
                Inspect extracted fields side-by-side with source facsimiles. Correct ambiguous values and record verification notes before continuing.
              </p>
              <div style={{ marginTop: '16px', fontSize: '11px', color: '#D97706', fontWeight: 600 }}>
                Human-in-the-Loop Validation
              </div>
            </div>

            {/* Step 3 */}
            <div className="card-base" style={{ padding: '24px', display: 'flex', flexDirection: 'column', height: '100%' }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                backgroundColor: 'var(--bg-dark)',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '14px',
                marginBottom: '16px'
              }}>
                3
              </div>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
                Find Information
              </h3>
              <p style={{ fontSize: '13px', lineHeight: '1.6', color: 'var(--text-secondary)', flex: 1 }}>
                Ask questions over records available to your selected demo persona. Receive answers with clickable citations back to verified source returns.
              </p>
              <div style={{ marginTop: '16px', fontSize: '11px', color: '#10B981', fontWeight: 600 }}>
                Source-Grounded Retrieval
              </div>
            </div>

            {/* Step 4 */}
            <div className="card-base" style={{ padding: '24px', display: 'flex', flexDirection: 'column', height: '100%' }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                backgroundColor: 'var(--bg-dark)',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '14px',
                marginBottom: '16px'
              }}>
                4
              </div>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
                Prepare Reports
              </h3>
              <p style={{ fontSize: '13px', lineHeight: '1.6', color: 'var(--text-secondary)', flex: 1 }}>
                Compile verified records into structured draft reports with citations, visible data gap warnings, and multi-format exports.
              </p>
              <div style={{ marginTop: '16px', fontSize: '11px', color: 'var(--accent-primary)', fontWeight: 600 }}>
                PDF, Word (.docx) & Excel (.xlsx)
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Capability Cards */}
      <section id="capabilities" style={{ padding: '64px 24px', maxWidth: '1140px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '44px' }}>
          <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--accent-primary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Prototype Capabilities
          </span>
          <h2 style={{ fontSize: '28px', fontWeight: 700, color: 'var(--text-primary)', marginTop: '6px', letterSpacing: '-0.02em' }}>
            Core Platform Modules
          </h2>
          <p style={{ fontSize: '15px', color: 'var(--text-secondary)', maxWidth: '600px', margin: '8px auto 0' }}>
            Designed for enterprise data density, auditability, and restrained executive interaction.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '24px' }}>
          {/* Capability 1 */}
          <div className="card-base" style={{ padding: '24px' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '10px',
              backgroundColor: 'var(--accent-light)',
              color: 'var(--accent-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '16px'
            }}>
              <UploadCloud size={20} />
            </div>
            <h3 style={{ fontSize: '17px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
              Document Intelligence
            </h3>
            <p style={{ fontSize: '13px', lineHeight: '1.6', color: 'var(--text-secondary)', margin: 0 }}>
              Simulates extraction from structured tabular mining returns, shift logs, and geological reports with field confidence indicators.
            </p>
          </div>

          {/* Capability 2 */}
          <div className="card-base" style={{ padding: '24px' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '10px',
              backgroundColor: '#FEF3C7',
              color: '#D97706',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '16px'
            }}>
              <FileCheck size={20} />
            </div>
            <h3 style={{ fontSize: '17px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
              Human Verification
            </h3>
            <p style={{ fontSize: '13px', lineHeight: '1.6', color: 'var(--text-secondary)', margin: 0 }}>
              Enables field officers and technical authorities to review, correct, and certify parsed figures before records enter the analytics corpus.
            </p>
          </div>

          {/* Capability 3 */}
          <div className="card-base" style={{ padding: '24px' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '10px',
              backgroundColor: '#ECFDF5',
              color: '#10B981',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '16px'
            }}>
              <Search size={20} />
            </div>
            <h3 style={{ fontSize: '17px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
              Intelligent Search
            </h3>
            <p style={{ fontSize: '13px', lineHeight: '1.6', color: 'var(--text-secondary)', margin: 0 }}>
              Ask MineSetu performs grounded retrieval with mandatory citations, anti-hallucination guardrails, and explicit notification of missing data.
            </p>
          </div>

          {/* Capability 4 */}
          <div className="card-base" style={{ padding: '24px' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '10px',
              backgroundColor: '#EFF6FF',
              color: '#2563EB',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '16px'
            }}>
              <FileText size={20} />
            </div>
            <h3 style={{ fontSize: '17px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
              Report Preparation
            </h3>
            <p style={{ fontSize: '13px', lineHeight: '1.6', color: 'var(--text-secondary)', margin: 0 }}>
              Assemble multi-subsidiary figures into structured executive drafts with export controls for PDF, Word (.docx), and Excel (.xlsx).
            </p>
          </div>
        </div>
      </section>

      {/* 6. Proposed Workflow / Demo Personas */}
      <section id="personas" style={{
        padding: '64px 24px',
        backgroundColor: 'var(--bg-app)',
        borderTop: '1px solid var(--border-subtle)',
        borderBottom: '1px solid var(--border-subtle)'
      }}>
        <div style={{ maxWidth: '1140px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '44px' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--accent-primary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Role-Based Demonstration
            </span>
            <h2 style={{ fontSize: '28px', fontWeight: 700, color: 'var(--text-primary)', marginTop: '6px', letterSpacing: '-0.02em' }}>
              Explore Proposed Workspaces
            </h2>
            <p style={{ fontSize: '15px', color: 'var(--text-secondary)', maxWidth: '680px', margin: '8px auto 0' }}>
              These are demo personas used to explore a proposed workflow, not a declaration of verified official system permissions.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px' }}>
            {/* Persona 1: Ministry of Coal */}
            <div className="card-base" style={{ padding: '24px', display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span className="badge badge-neutral">Persona 1</span>
                <span className="badge badge-neutral">Demo</span>
              </div>
              <h3 style={{ fontSize: '17px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>
                Ministry of Coal
              </h3>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.5', flex: 1, marginBottom: '16px' }}>
                Cross-organization visibility, issuing information requests, reviewing subsidiary responses, and preparing executive drafts.
              </p>
              <button
                onClick={() => handleLaunchRole('ministry_coal')}
                className="btn btn-outline"
                style={{ width: '100%', fontSize: '12px', fontWeight: 600, justifyContent: 'center' }}
              >
                Launch Ministry Workspace →
              </button>
            </div>

            {/* Persona 2: CIL Headquarters */}
            <div className="card-base" style={{ padding: '24px', display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span className="badge badge-neutral">Persona 2</span>
                <span className="badge badge-neutral">Demo</span>
              </div>
              <h3 style={{ fontSize: '17px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>
                CIL Headquarters
              </h3>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.5', flex: 1, marginBottom: '16px' }}>
                Subsidiary-level information follow-up, multi-mine consolidation, comparison against baselines, and organization reporting.
              </p>
              <button
                onClick={() => handleLaunchRole('cil_hq')}
                className="btn btn-outline"
                style={{ width: '100%', fontSize: '12px', fontWeight: 600, justifyContent: 'center' }}
              >
                Launch CIL HQ Workspace →
              </button>
            </div>

            {/* Persona 3: CMPDI */}
            <div className="card-base" style={{ padding: '24px', display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span className="badge badge-neutral">Persona 3</span>
                <span className="badge badge-neutral">Demo</span>
              </div>
              <h3 style={{ fontSize: '17px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>
                CMPDI
              </h3>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.5', flex: 1, marginBottom: '16px' }}>
                Technical record review, evidence inspection in validation workbench, discrepancy clarification, and technical reports.
              </p>
              <button
                onClick={() => handleLaunchRole('cmpdi')}
                className="btn btn-outline"
                style={{ width: '100%', fontSize: '12px', fontWeight: 600, justifyContent: 'center' }}
              >
                Launch CMPDI Workspace →
              </button>
            </div>

            {/* Persona 4: Subsidiary / Mine Officer */}
            <div className="card-base" style={{ padding: '24px', display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span className="badge badge-neutral">Persona 4</span>
                <span className="badge badge-neutral">Demo</span>
              </div>
              <h3 style={{ fontSize: '17px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>
                Subsidiary / Mine Officer
              </h3>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.5', flex: 1, marginBottom: '16px' }}>
                Upload colliery documents, enter manual production records, answer requests from headquarters, and correct returned items.
              </p>
              <button
                onClick={() => handleLaunchRole('subsidiary_officer')}
                className="btn btn-outline"
                style={{ width: '100%', fontSize: '12px', fontWeight: 600, justifyContent: 'center' }}
              >
                Launch Subsidiary Workspace →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Footer */}
      <footer style={{
        padding: '40px 32px 32px',
        backgroundColor: '#FFFFFF',
        borderTop: '1px solid var(--border-subtle)',
        fontSize: '12px',
        color: 'var(--text-secondary)'
      }}>
        <div style={{
          maxWidth: '1140px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '20px',
          paddingBottom: '24px',
          borderBottom: '1px solid var(--border-subtle)'
        }}>
          {/* Logo Wordmark */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <img
              src="/minesetu-logo.png"
              alt="MineSetu AI Logo"
              style={{ width: '32px', height: '32px', borderRadius: '6px', objectFit: 'contain' }}
            />
            <div>
              <span style={{ fontWeight: 700, fontSize: '15px', color: 'var(--text-primary)' }}>
                MineSetu AI
              </span>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                AI-assisted reporting and document workflow prototype for the coal sector.
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <button
              onClick={() => scrollToSection('how-it-works')}
              style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '12px' }}
            >
              How It Works
            </button>
            <button
              onClick={() => scrollToSection('capabilities')}
              style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '12px' }}
            >
              Capabilities
            </button>
            <button
              onClick={() => scrollToSection('personas')}
              style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '12px' }}
            >
              Demo Personas
            </button>
            <button
              onClick={() => navigateTo('/login')}
              style={{ background: 'none', border: 'none', color: 'var(--accent-primary)', fontWeight: 600, cursor: 'pointer', fontSize: '12px' }}
            >
              Open Prototype →
            </button>
          </div>
        </div>

        {/* Legal / Prototype Truthfulness Notice */}
        <div style={{ maxWidth: '1140px', margin: '20px auto 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: '11px', lineHeight: '1.6' }}>
          MineSetu AI demonstrates a proposed AI-powered extension to the MDMS reporting workflow. This is a standalone prototype, not the official MDMS portal, and live integration is not currently claimed. All figures and documents shown are synthetic demo records.
        </div>
      </footer>
    </div>
  );
};
