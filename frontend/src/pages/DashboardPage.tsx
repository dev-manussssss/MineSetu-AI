import React, { useState } from 'react';
import {
  UploadCloud,
  ArrowUpRight,
  Sparkles,
  Building2,
  ChevronRight,
  Eye
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { can } from '../lib/rbac';
import { MOCK_SUBSIDIARIES } from '../data/mockMiningData';

export const DashboardPage: React.FC = () => {
  const { currentUser, documents, navigateTo, selectDocument } = useApp();
  const [activeTab, setActiveTab] = useState<'overview' | 'queue' | 'subsidiaries' | 'compliance'>('overview');

  // Filter documents scoped to role
  const scopedDocs = documents.filter(doc => {
    if (currentUser.subsidiaryCode && doc.subsidiaryCode !== currentUser.subsidiaryCode) {
      return false;
    }
    return true;
  });

  const pendingVerificationDocs = scopedDocs.filter(d => d.status === 'needs_review' || d.status === 'partially_extracted');
  const approvedDocs = scopedDocs.filter(d => d.status === 'approved');

  return (
    <div>
      {/* Horizontal Pill Tabs Bar (Replicating ref1.png) */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div className="pill-tabs-bar">
          <button
            onClick={() => setActiveTab('overview')}
            className={`pill-tab ${activeTab === 'overview' ? 'active' : ''}`}
          >
            Overview & Metrics
          </button>
          <button
            onClick={() => setActiveTab('queue')}
            className={`pill-tab ${activeTab === 'queue' ? 'active' : ''}`}
          >
            Ingestion Queue ({pendingVerificationDocs.length})
          </button>
          <button
            onClick={() => setActiveTab('subsidiaries')}
            className={`pill-tab ${activeTab === 'subsidiaries' ? 'active' : ''}`}
          >
            Subsidiary Tracking
          </button>
          <button
            onClick={() => setActiveTab('compliance')}
            className={`pill-tab ${activeTab === 'compliance' ? 'active' : ''}`}
          >
            DGMS Compliance
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {can(currentUser, 'documents.upload') && (
            <button
              onClick={() => navigateTo('/documents')}
              className="btn btn-primary btn-pill"
              style={{ fontSize: '13px', padding: '8px 18px' }}
            >
              <UploadCloud size={15} />
              <span>Upload Document</span>
            </button>
          )}
        </div>
      </div>

      {/* 4-Column KPI Metric Cards (Directly Inspired by ref1.png) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '16px',
        marginBottom: '28px'
      }}>
        <div className="metric-box">
          <div className="metric-header">
            <span className="metric-sublabel">Total Ingested Returns</span>
            <span className="badge badge-match">Verified</span>
          </div>
          <div className="metric-value-row">
            <span className="metric-val">{scopedDocs.length}</span>
            <span style={{ fontSize: '12px', color: '#10B981', fontWeight: 600 }}>+4 this week</span>
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
            Digital archive repository
          </div>
        </div>

        <div className="metric-box">
          <div className="metric-header">
            <span className="metric-sublabel">Verification Queue</span>
            <span className="badge badge-warning">Needs Review</span>
          </div>
          <div className="metric-value-row">
            <span className="metric-val">{pendingVerificationDocs.length}</span>
            <span style={{ fontSize: '12px', color: '#F59E0B', fontWeight: 600 }}>Action Required</span>
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
            Physical scan discrepancies
          </div>
        </div>

        <div className="metric-box">
          <div className="metric-header">
            <span className="metric-sublabel">Average OCR Confidence</span>
            <span className="badge badge-success">High Fidelity</span>
          </div>
          <div className="metric-value-row">
            <span className="metric-val">93.4%</span>
            <span style={{ fontSize: '12px', color: '#10B981', fontWeight: 600 }}>+2.1%</span>
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
            Grounded field extraction rate
          </div>
        </div>

        <div className="metric-box">
          <div className="metric-header">
            <span className="metric-sublabel">Approved to MDMS Core</span>
            <span className="badge badge-info">Authoritative</span>
          </div>
          <div className="metric-value-row">
            <span className="metric-val">{approvedDocs.length}</span>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>of {scopedDocs.length} files</span>
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
            Ready for RAG and reporting
          </div>
        </div>
      </div>

      {/* Main Operational Split Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        {/* Left Column: Interactive Queue Cards (matching ref1.png card layout) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h2 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>
              Recent Extraction & Ingestion Returns
            </h2>
            <button
              onClick={() => navigateTo('/documents')}
              style={{ background: 'transparent', border: 'none', color: 'var(--accent-primary)', fontSize: '12px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              <span>View All Documents</span>
              <ChevronRight size={14} />
            </button>
          </div>

          {scopedDocs.slice(0, 3).map(doc => {
            const isNeedsReview = doc.status === 'needs_review' || doc.status === 'partially_extracted';
            return (
              <div key={doc.id} className="card-base" style={{ padding: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span className="badge" style={{ backgroundColor: '#EEF2F6', color: '#1E293B', fontWeight: 700 }}>
                        {doc.subsidiaryCode}
                      </span>
                      <span className={`badge ${isNeedsReview ? 'badge-warning' : 'badge-success'}`}>
                        {doc.status.replace('_', ' ').toUpperCase()}
                      </span>
                      <span className="badge badge-match">
                        {doc.ocrConfidence}% OCR Match
                      </span>
                    </div>
                    <h3 style={{ fontSize: '15px', fontWeight: 700, marginTop: '8px', color: 'var(--text-primary)' }}>
                      {doc.title}
                    </h3>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                      {doc.collieryName} • Uploaded by {doc.uploadedBy} • {new Date(doc.uploadedAt).toLocaleDateString()}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => {
                        selectDocument(doc.id);
                        navigateTo('/documents/verify');
                      }}
                      className="btn btn-outline btn-pill"
                      style={{ padding: '6px 14px', fontSize: '12px' }}
                    >
                      <Eye size={13} />
                      <span>{isNeedsReview ? 'Verify Extraction' : 'Inspect'}</span>
                    </button>
                  </div>
                </div>

                {/* Extracted Fields Summary Box (From ref1.png Q&A style) */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                  gap: '12px',
                  backgroundColor: 'var(--bg-surface-muted)',
                  borderRadius: 'var(--radius-md)',
                  padding: '12px'
                }}>
                  {doc.extractedFields.slice(0, 3).map(f => (
                    <div key={f.id}>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{f.label}</div>
                      <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>
                        {f.verifiedValue || f.extractedValue} <span style={{ fontSize: '11px', fontWeight: 400, color: 'var(--text-muted)' }}>{f.unit}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Column: AI Quick Assistant & Subsidiary Highlights */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* AI Query Prompt Box */}
          <div className="card-base" style={{
            background: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)',
            color: '#FFFFFF',
            border: 'none'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#60A5FA', marginBottom: '8px' }}>
              <Sparkles size={18} />
              <span style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Assistive AI Gateway
              </span>
            </div>
            <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '8px' }}>
              Ask Across Operational Archives
            </h3>
            <p style={{ fontSize: '12px', lineHeight: '1.5', color: '#94A3B8', marginBottom: '16px' }}>
              Query production, OB stripping ratios, and statutory compliance with zero hallucination.
            </p>

            <button
              onClick={() => navigateTo('/query')}
              className="btn btn-pill"
              style={{
                width: '100%',
                backgroundColor: '#2563EB',
                color: '#FFFFFF',
                fontWeight: 600,
                fontSize: '13px'
              }}
            >
              <span>Launch Grounded Query</span>
              <ArrowUpRight size={14} />
            </button>
          </div>

          {/* Subsidiary Performance Quick List */}
          <div className="card-base" style={{ padding: '20px' }}>
            <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span>Subsidiary Pacing (FY 2026)</span>
              <Building2 size={16} style={{ color: 'var(--text-muted)' }} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {MOCK_SUBSIDIARIES.slice(0, 5).map(sub => (
                <div key={sub.code} style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '6px 0',
                  borderBottom: '1px solid var(--border-subtle)',
                  fontSize: '12px'
                }}>
                  <div>
                    <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{sub.code}</span>
                    <span style={{ color: 'var(--text-muted)', marginLeft: '6px' }}>{sub.name.split(' ')[0]}</span>
                  </div>
                  <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>
                    {sub.targetMT > 0 ? `${sub.targetMT} MT Target` : 'Coordination'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
