import React, { useState } from 'react';
import {
  UploadCloud,
  Sparkles,
  ChevronRight,
  Eye,
  FileText,
  MessageSquareText,
  CheckCircle2,
  Plus,
  ArrowRight,
  FileCheck,
  Edit3
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { MOCK_SUBSIDIARIES } from '../data/mockMiningData';

export const DashboardPage: React.FC = () => {
  const {
    currentUser,
    documents,
    requests,
    reports,
    manualRecords,
    navigateTo,
    selectDocument,
    selectRequest,
    selectReport
  } = useApp();

  const [quickQuery, setQuickQuery] = useState('');

  const handleQuickQuerySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (quickQuery.trim()) {
      navigateTo('/ask');
    }
  };

  // Derive counts deterministically
  const openRequests = requests.filter(r => r.status === 'awaiting_response' || r.status === 'partially_answered');
  const submittedResponses = requests.filter(r => r.status === 'submitted');
  const clarificationsRequired = requests.filter(r => r.status === 'clarification_required');
  const draftReports = reports.filter(r => r.draftStatus === 'draft');
  const docsNeedingReview = documents.filter(d => d.status === 'needs_review' || d.status === 'partially_extracted');
  const verifiedDocs = documents.filter(d => d.status === 'approved' || d.status === 'completed');

  // Role detection
  const isMinistry = currentUser.role === 'ministry_coal' || currentUser.role === 'ministry_exec';
  const isCILHQ = currentUser.role === 'cil_hq' || currentUser.role === 'cil_exec';
  const isCMPDI = currentUser.role === 'cmpdi' || currentUser.role === 'cmpdi_nodal';
  const isSubsidiary = currentUser.role === 'subsidiary_officer' || currentUser.role === 'subsidiary_mgr' || currentUser.role === 'field_officer';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* 1. Header with Role Purpose & Disclaimer Badge */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h1 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--text-primary)', letterSpacing: '-0.015em', margin: 0 }}>
              {isMinistry && 'Ministry Executive Workspace'}
              {isCILHQ && 'Coal India Headquarters Management Workspace'}
              {isCMPDI && 'CMPDI Technical Authority Workspace'}
              {isSubsidiary && 'Subsidiary & Colliery Operational Workspace'}
            </h1>
            <span className="badge badge-demo">Sample Data</span>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
            {isMinistry && 'Cross-organisation visibility, ministerial information requests, response review, and draft executive reporting.'}
            {isCILHQ && 'Subsidiary-level information follow-up, production consolidation, baseline comparison, and draft reports.'}
            {isCMPDI && 'Technical record review, evidence inspection, discrepancy identification, and geological draft reports.'}
            {isSubsidiary && 'Add operational records, correct extracted information, answer information requests, and submit returns for review.'}
          </p>
        </div>

        {/* Role Quick Switch Indicator */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 12px',
          borderRadius: 'var(--radius-md)',
          backgroundColor: '#FFFFFF',
          border: '1px solid var(--border-subtle)',
          fontSize: '12px'
        }}>
          <span style={{ color: 'var(--text-muted)' }}>Demo Persona:</span>
          <strong style={{ color: 'var(--text-primary)' }}>{currentUser.name.split(',')[0]}</strong>
          <button
            onClick={() => navigateTo('/login')}
            className="btn btn-outline"
            style={{ padding: '2px 8px', fontSize: '11px', marginLeft: '4px' }}
          >
            Switch
          </button>
        </div>
      </div>

      {/* 2. Prominent "Ask MineSetu" Quick Inquiry Bar (Present on ALL Dashboards) */}
      <div className="card-base" style={{
        padding: '12px 16px',
        backgroundColor: '#FFFFFF',
        border: '1px solid var(--border-subtle)'
      }}>
        <form onSubmit={handleQuickQuerySubmit} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: 'var(--accent-light)',
            color: 'var(--accent-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <Sparkles size={16} />
          </div>
          <input
            type="text"
            value={quickQuery}
            onChange={(e) => setQuickQuery(e.target.value)}
            placeholder="Ask MineSetu anything: 'What was Rajmahal production?', 'Compare SECL vs ECL OB removal', 'Draft FY26 Q2 brief'..."
            style={{
              flex: 1,
              border: 'none',
              outline: 'none',
              fontSize: '13px',
              fontFamily: 'inherit',
              color: 'var(--text-primary)',
              backgroundColor: 'transparent'
            }}
          />
          <button
            type="submit"
            className="btn btn-primary"
            style={{ height: '34px', padding: '0 14px', fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <span>Ask MineSetu</span>
            <ArrowRight size={13} />
          </button>
        </form>
      </div>

      {/* ========================================================================= */}
      {/* PERSONA 1: MINISTRY OF COAL DASHBOARD                                     */}
      {/* ========================================================================= */}
      {isMinistry && (
        <>
          {/* Summary Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
            <div className="metric-box">
              <div className="metric-header">
                <span className="metric-sublabel">Open Requests</span>
                <span className="badge badge-neutral">Active</span>
              </div>
              <div className="metric-value-row">
                <span className="metric-val">{openRequests.length}</span>
                <span className="metric-status-label" style={{ color: 'var(--text-muted)' }}>Awaiting</span>
              </div>
              <div className="metric-caption">Subsidiary returns pending</div>
            </div>

            <div className="metric-box">
              <div className="metric-header">
                <span className="metric-sublabel">Responses For Review</span>
                <span className="badge badge-info">Action Needed</span>
              </div>
              <div className="metric-value-row">
                <span className="metric-val">{submittedResponses.length}</span>
                <span className="metric-status-label" style={{ color: '#10B981', fontWeight: 600 }}>Ready</span>
              </div>
              <div className="metric-caption">Submitted returns awaiting review</div>
            </div>

            <div className="metric-box">
              <div className="metric-header">
                <span className="metric-sublabel">Clarifications Required</span>
                <span className="badge badge-warning">Clarification</span>
              </div>
              <div className="metric-value-row">
                <span className="metric-val">{clarificationsRequired.length}</span>
                <span className="metric-status-label" style={{ color: '#D97706', fontWeight: 600 }}>Follow-up</span>
              </div>
              <div className="metric-caption">Flagged for data discrepancy</div>
            </div>

            <div className="metric-box">
              <div className="metric-header">
                <span className="metric-sublabel">Draft Reports</span>
                <span className="badge badge-neutral">Executive</span>
              </div>
              <div className="metric-value-row">
                <span className="metric-val">{draftReports.length}</span>
                <span className="metric-status-label" style={{ color: 'var(--text-muted)' }}>In progress</span>
              </div>
              <div className="metric-caption">Multi-subsidiary briefings</div>
            </div>
          </div>

          {/* Primary Action Buttons */}
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button
              onClick={() => navigateTo('/requests')}
              className="btn btn-primary"
              style={{ height: '36px', fontSize: '13px', padding: '0 14px' }}
            >
              <Plus size={14} /> Create Information Request
            </button>
            <button
              onClick={() => navigateTo('/review')}
              className="btn btn-outline"
              style={{ height: '36px', fontSize: '13px', padding: '0 14px' }}
            >
              <FileCheck size={14} /> Review Pending Responses ({submittedResponses.length})
            </button>
            <button
              onClick={() => navigateTo('/reports')}
              className="btn btn-outline"
              style={{ height: '36px', fontSize: '13px', padding: '0 14px' }}
            >
              <FileText size={14} /> Prepare Executive Report
            </button>
            <button
              onClick={() => navigateTo('/ask')}
              className="btn btn-outline"
              style={{ height: '36px', fontSize: '13px', padding: '0 14px' }}
            >
              <Sparkles size={14} /> Open Ask MineSetu
            </button>
          </div>

          {/* Split Sections: Requests Awaiting Response & Recent Activity */}
          <div className="split-grid-14-1">
            {/* Left: Requests Table */}
            <div className="card-base" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                  Active Ministerial Information Requests
                </h3>
                <button
                  onClick={() => navigateTo('/requests')}
                  className="btn btn-outline"
                  style={{ padding: '4px 10px', fontSize: '11px' }}
                >
                  View All ({requests.length})
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {requests.slice(0, 3).map(req => (
                  <div
                    key={req.id}
                    onClick={() => {
                      selectRequest(req.id);
                      navigateTo('/requests');
                    }}
                    style={{
                      padding: '12px 14px',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-subtle)',
                      backgroundColor: 'var(--bg-app)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                        <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', fontVariantNumeric: 'tabular-nums' }}>
                          {req.requestNumber}
                        </span>
                        <span className="badge badge-info" style={{ fontSize: '10px' }}>
                          {req.status.replace('_', ' ')}
                        </span>
                      </div>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                        {req.subject}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                        Recipient: {req.recipientOrg} · Period: {req.reportingPeriod}
                      </div>
                    </div>
                    <ChevronRight size={16} style={{ color: 'var(--text-muted)' }} />
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Draft Reports & Activity */}
            <div className="card-base" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                  Draft Reports & Legislative Briefs
                </h3>
                <button
                  onClick={() => navigateTo('/reports')}
                  className="btn btn-outline"
                  style={{ padding: '4px 10px', fontSize: '11px' }}
                >
                  Reports Hub
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {reports.slice(0, 3).map(rep => (
                  <div
                    key={rep.id}
                    onClick={() => {
                      selectReport(rep.id);
                      navigateTo('/reports');
                    }}
                    style={{
                      padding: '12px 14px',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-subtle)',
                      backgroundColor: 'var(--bg-app)',
                      cursor: 'pointer'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                        {rep.title}
                      </span>
                      <span className="badge badge-neutral" style={{ fontSize: '10px' }}>{rep.draftStatus}</span>
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      Period: {rep.reportingPeriod} · {rep.metricsTable.length} Metrics · {rep.sources.length} Sources
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {/* ========================================================================= */}
      {/* PERSONA 2: CIL HEADQUARTERS DASHBOARD                                     */}
      {/* ========================================================================= */}
      {isCILHQ && (
        <>
          {/* Summary Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
            <div className="metric-box">
              <div className="metric-header">
                <span className="metric-sublabel">Subsidiary Submissions</span>
                <span className="badge badge-success">Ingested</span>
              </div>
              <div className="metric-value-row">
                <span className="metric-val">{documents.length}</span>
                <span className="metric-status-label" style={{ color: '#10B981', fontWeight: 600 }}>Active</span>
              </div>
              <div className="metric-caption">Monthly returns collected</div>
            </div>

            <div className="metric-box">
              <div className="metric-header">
                <span className="metric-sublabel">Awaiting HQ Review</span>
                <span className="badge badge-warning">Review</span>
              </div>
              <div className="metric-value-row">
                <span className="metric-val">{docsNeedingReview.length}</span>
                <span className="metric-status-label" style={{ color: '#D97706', fontWeight: 600 }}>Pending</span>
              </div>
              <div className="metric-caption">Requires variance verification</div>
            </div>

            <div className="metric-box">
              <div className="metric-header">
                <span className="metric-sublabel">Open Requests</span>
                <span className="badge badge-info">Follow-up</span>
              </div>
              <div className="metric-value-row">
                <span className="metric-val">{openRequests.length}</span>
                <span className="metric-status-label" style={{ color: 'var(--text-muted)' }}>Dispatched</span>
              </div>
              <div className="metric-caption">To subsidiaries (ECL, SECL, BCCL)</div>
            </div>

            <div className="metric-box">
              <div className="metric-header">
                <span className="metric-sublabel">Consolidated Reports</span>
                <span className="badge badge-neutral">Consolidation</span>
              </div>
              <div className="metric-value-row">
                <span className="metric-val">{reports.length}</span>
                <span className="metric-status-label" style={{ color: '#10B981', fontWeight: 600 }}>Ready</span>
              </div>
              <div className="metric-caption">Corporate production summaries</div>
            </div>
          </div>

          {/* Primary Actions */}
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button
              onClick={() => navigateTo('/requests')}
              className="btn btn-primary"
              style={{ height: '36px', fontSize: '13px', padding: '0 14px' }}
            >
              <Plus size={14} /> Create Subsidiary Request
            </button>
            <button
              onClick={() => navigateTo('/review')}
              className="btn btn-outline"
              style={{ height: '36px', fontSize: '13px', padding: '0 14px' }}
            >
              <FileCheck size={14} /> Review & Compare Returns
            </button>
            <button
              onClick={() => navigateTo('/reports')}
              className="btn btn-outline"
              style={{ height: '36px', fontSize: '13px', padding: '0 14px' }}
            >
              <FileText size={14} /> Prepare Consolidated Report
            </button>
            <button
              onClick={() => navigateTo('/documents')}
              className="btn btn-outline"
              style={{ height: '36px', fontSize: '13px', padding: '0 14px' }}
            >
              <UploadCloud size={14} /> Ingestion Queue
            </button>
          </div>

          {/* Subsidiary Comparison Table */}
          <div className="card-base" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div>
                <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                  Subsidiary Operational Status & Returns Breakdown
                </h3>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  Synthetic benchmark figures for CIL operating subsidiaries
                </span>
              </div>
              <span className="badge badge-demo">Sample Figures</span>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table className="data-table" style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-medium)', fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    <th style={{ padding: '10px 12px' }}>Subsidiary</th>
                    <th style={{ padding: '10px 12px' }}>Headquarters</th>
                    <th style={{ padding: '10px 12px' }}>Returns Submitted</th>
                    <th style={{ padding: '10px 12px' }}>Verification Status</th>
                    <th style={{ padding: '10px 12px' }}>Reported Coal Output</th>
                    <th style={{ padding: '10px 12px', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody style={{ fontSize: '13px' }}>
                  {MOCK_SUBSIDIARIES.map(sub => {
                    const subDocs = documents.filter(d => d.subsidiaryCode === sub.code);
                    return (
                      <tr key={sub.code} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                        <td style={{ padding: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>
                          {sub.name} ({sub.code})
                        </td>
                        <td style={{ padding: '12px', color: 'var(--text-secondary)' }}>
                          {sub.hq}
                        </td>
                        <td style={{ padding: '12px' }}>
                          <span className="badge badge-info">{subDocs.length} Documents</span>
                        </td>
                        <td style={{ padding: '12px' }}>
                          {subDocs.some(d => d.status === 'needs_review') ? (
                            <span className="badge badge-warning">Review Pending</span>
                          ) : (
                            <span className="badge badge-success">Verified</span>
                          )}
                        </td>
                        <td style={{ padding: '12px', fontVariantNumeric: 'tabular-nums', fontWeight: 600 }}>
                          {sub.code === 'ECL' && '45,210 T'}
                          {sub.code === 'SECL' && '524,300 T'}
                          {sub.code === 'BCCL' && '28,400 T'}
                          {sub.code === 'NCL' && '348,000 T'}
                        </td>
                        <td style={{ padding: '12px', textAlign: 'right' }}>
                          <button
                            onClick={() => navigateTo('/review')}
                            className="btn btn-outline"
                            style={{ padding: '3px 8px', fontSize: '11px' }}
                          >
                            Compare Baseline
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* ========================================================================= */}
      {/* PERSONA 3: CMPDI DASHBOARD                                                */}
      {/* ========================================================================= */}
      {isCMPDI && (
        <>
          {/* Summary Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
            <div className="metric-box">
              <div className="metric-header">
                <span className="metric-sublabel">Documents Needing Review</span>
                <span className="badge badge-warning">Action</span>
              </div>
              <div className="metric-value-row">
                <span className="metric-val">{docsNeedingReview.length}</span>
                <span className="metric-status-label" style={{ color: '#D97706', fontWeight: 600 }}>Needs Review</span>
              </div>
              <div className="metric-caption">Optical extraction discrepancies</div>
            </div>

            <div className="metric-box">
              <div className="metric-header">
                <span className="metric-sublabel">Verified & Approved</span>
                <span className="badge badge-success">Verified</span>
              </div>
              <div className="metric-value-row">
                <span className="metric-val">{verifiedDocs.length}</span>
                <span className="metric-status-label" style={{ color: '#10B981', fontWeight: 600 }}>Audited</span>
              </div>
              <div className="metric-caption">Ready for RAG corpus</div>
            </div>

            <div className="metric-box">
              <div className="metric-header">
                <span className="metric-sublabel">Manual Records</span>
                <span className="badge badge-info">Ingestion</span>
              </div>
              <div className="metric-value-row">
                <span className="metric-val">{manualRecords.length}</span>
                <span className="metric-status-label" style={{ color: 'var(--text-muted)' }}>Direct Entry</span>
              </div>
              <div className="metric-caption">Structured field entries</div>
            </div>

            <div className="metric-box">
              <div className="metric-header">
                <span className="metric-sublabel">Technical Reports</span>
                <span className="badge badge-neutral">CMPDI Data</span>
              </div>
              <div className="metric-value-row">
                <span className="metric-val">{reports.length}</span>
                <span className="metric-status-label" style={{ color: 'var(--text-muted)' }}>Drafts</span>
              </div>
              <div className="metric-caption">Geological and mine audits</div>
            </div>
          </div>

          {/* Primary Actions */}
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button
              onClick={() => {
                if (docsNeedingReview[0]) {
                  selectDocument(docsNeedingReview[0].id);
                  navigateTo('/documents/verify');
                } else {
                  navigateTo('/documents');
                }
              }}
              className="btn btn-primary"
              style={{ height: '36px', fontSize: '13px', padding: '0 14px' }}
            >
              <FileCheck size={14} /> Review Extracted Data (Workbench)
            </button>
            <button
              onClick={() => navigateTo('/review')}
              className="btn btn-outline"
              style={{ height: '36px', fontSize: '13px', padding: '0 14px' }}
            >
              <CheckCircle2 size={14} /> Compare Technical Records
            </button>
            <button
              onClick={() => navigateTo('/topics')}
              className="btn btn-outline"
              style={{ height: '36px', fontSize: '13px', padding: '0 14px' }}
            >
              <Sparkles size={14} /> Explore Topics & Word Cloud
            </button>
            <button
              onClick={() => navigateTo('/documents/manual')}
              className="btn btn-outline"
              style={{ fontSize: '13px' }}
            >
              <Edit3 size={15} /> Enter Data Manually
            </button>
          </div>

          {/* Technical Verification Queue Table */}
          <div className="card-base" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div>
                <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                  Technical Verification & Extraction Audit Queue
                </h3>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  Side-by-side facsimile inspection required for parsed records
                </span>
              </div>
              <button
                onClick={() => navigateTo('/documents')}
                className="btn btn-outline"
                style={{ padding: '4px 10px', fontSize: '11px' }}
              >
                View Full Archive
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {documents.slice(0, 4).map(doc => (
                <div
                  key={doc.id}
                  style={{
                    padding: '12px 14px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-subtle)',
                    backgroundColor: 'var(--bg-app)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '12px'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)' }}>
                        {doc.subsidiaryCode} · {doc.collieryName}
                      </span>
                      <span className={`badge ${doc.status === 'needs_review' ? 'badge-warning' : 'badge-success'}`} style={{ fontSize: '10px' }}>
                        {doc.status.replace('_', ' ')}
                      </span>
                    </div>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {doc.title}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                      {doc.extractedFields.length} extracted fields · Average confidence: {doc.ocrConfidence.toFixed(1)}%
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      selectDocument(doc.id);
                      navigateTo('/documents/verify');
                    }}
                    className="btn btn-primary"
                    style={{ padding: '6px 12px', fontSize: '12px' }}
                  >
                    <Eye size={13} /> Open in Workbench
                  </button>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* ========================================================================= */}
      {/* PERSONA 4: SUBSIDIARY / MINE OFFICER DASHBOARD                           */}
      {/* ========================================================================= */}
      {isSubsidiary && (
        <>
          {/* Summary Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
            <div className="metric-box">
              <div className="metric-header">
                <span className="metric-sublabel">Open Requests Assigned</span>
                <span className="badge badge-warning">Action Required</span>
              </div>
              <div className="metric-value-row">
                <span className="metric-val">{openRequests.length}</span>
                <span className="metric-status-label" style={{ color: '#D97706', fontWeight: 600 }}>Pending</span>
              </div>
              <div className="metric-caption">From Ministry & CIL HQ</div>
            </div>

            <div className="metric-box">
              <div className="metric-header">
                <span className="metric-sublabel">Draft Records</span>
                <span className="badge badge-neutral">Drafts</span>
              </div>
              <div className="metric-value-row">
                <span className="metric-val">{manualRecords.filter(m => m.status === 'draft').length}</span>
                <span className="metric-status-label" style={{ color: 'var(--text-muted)' }}>Unsubmitted</span>
              </div>
              <div className="metric-caption">Structured manual entries</div>
            </div>

            <div className="metric-box">
              <div className="metric-header">
                <span className="metric-sublabel">Documents Needing Review</span>
                <span className="badge badge-info">Validation</span>
              </div>
              <div className="metric-value-row">
                <span className="metric-val">{docsNeedingReview.length}</span>
                <span className="metric-status-label" style={{ color: 'var(--text-muted)' }}>Scans</span>
              </div>
              <div className="metric-caption">Colliery returns to verify</div>
            </div>

            <div className="metric-box">
              <div className="metric-header">
                <span className="metric-sublabel">Submitted Records</span>
                <span className="badge badge-success">Transmitted</span>
              </div>
              <div className="metric-value-row">
                <span className="metric-val">{verifiedDocs.length}</span>
                <span className="metric-status-label" style={{ color: '#10B981', fontWeight: 600 }}>Sent</span>
              </div>
              <div className="metric-caption">Awaiting or accepted</div>
            </div>
          </div>

          {/* Primary Actions */}
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button
              onClick={() => navigateTo('/documents')}
              className="btn btn-primary"
              style={{ height: '36px', fontSize: '13px', padding: '0 14px' }}
            >
              <UploadCloud size={14} /> Upload Colliery Document
            </button>
            <button
              onClick={() => navigateTo('/documents/manual')}
              className="btn btn-outline"
              style={{ height: '36px', fontSize: '13px', padding: '0 14px' }}
            >
              <Edit3 size={14} /> Enter Data Manually
            </button>
            <button
              onClick={() => navigateTo('/requests')}
              className="btn btn-outline"
              style={{ height: '36px', fontSize: '13px', padding: '0 14px' }}
            >
              <MessageSquareText size={14} /> View Assigned Requests ({openRequests.length})
            </button>
            <button
              onClick={() => navigateTo('/ask')}
              className="btn btn-outline"
              style={{ height: '36px', fontSize: '13px', padding: '0 14px' }}
            >
              <Sparkles size={14} /> Query Mine Records
            </button>
          </div>

          {/* Assigned Requests & My Submissions Split */}
          <div className="split-grid-12-1">
            {/* Assigned Requests */}
            <div className="card-base" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                  Assigned Information Requests
                </h3>
                <span className="badge badge-warning">Respond Promptly</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {requests.map(req => (
                  <div
                    key={req.id}
                    onClick={() => {
                      selectRequest(req.id);
                      navigateTo('/requests');
                    }}
                    style={{
                      padding: '12px 14px',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-subtle)',
                      backgroundColor: 'var(--bg-app)',
                      cursor: 'pointer'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ fontSize: '11px', fontVariantNumeric: 'tabular-nums', fontWeight: 600, color: 'var(--text-muted)' }}>
                        {req.requestNumber}
                      </span>
                      <span className="badge badge-info" style={{ fontSize: '10px' }}>{req.status}</span>
                    </div>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {req.subject}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                      Due: {req.dueDate} · From: {req.requestingOrg}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* My Submissions Workspace */}
            <div className="card-base" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                  My Submissions & Drafts
                </h3>
                <button
                  onClick={() => navigateTo('/documents/manual')}
                  className="btn btn-outline"
                  style={{ padding: '3px 8px', fontSize: '11px' }}
                >
                  + New Record
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {manualRecords.map(rec => (
                  <div
                    key={rec.id}
                    style={{
                      padding: '12px 14px',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-subtle)',
                      backgroundColor: 'var(--bg-app)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2px' }}>
                      <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                        {rec.title}
                      </span>
                      <span className={`badge ${rec.status === 'accepted' ? 'badge-success' : 'badge-pending'}`} style={{ fontSize: '10px' }}>
                        {rec.status}
                      </span>
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      {rec.category.toUpperCase()} · Period: {rec.reportingPeriod} · {rec.fields.length} Fields
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
