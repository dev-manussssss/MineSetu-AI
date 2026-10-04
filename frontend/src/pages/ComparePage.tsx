import React, { useState } from 'react';
import {
  GitCompare,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Eye
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const ComparePage: React.FC = () => {
  const {
    documents,
    selectedDocumentId,
    selectDocument,
    setDocumentStatus,
    navigateTo
  } = useApp();

  const [activeTab, setActiveTab] = useState<'queue' | 'compare'>('queue');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [activeDocId, setActiveDocId] = useState<string>(selectedDocumentId || documents[0]?.id || '');
  const [reviewNote, setReviewNote] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Comparison State
  const [docAId, setDocAId] = useState<string>(documents[0]?.id || '');
  const [docBId, setDocBId] = useState<string>(documents[1]?.id || documents[0]?.id || '');

  const docA = documents.find(d => d.id === docAId) || documents[0];
  const docB = documents.find(d => d.id === docBId) || documents[1] || documents[0];

  const activeDoc = documents.find(d => d.id === activeDocId) || documents[0];

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const filteredQueue = documents.filter(doc => {
    if (statusFilter === 'ALL') return true;
    return doc.status === statusFilter;
  });

  const handleAcceptNextStage = (docId: string) => {
    setDocumentStatus(docId, 'approved', reviewNote || 'Accepted for next stage of consolidation.');
    showToast('Record accepted for next stage.');
    setReviewNote('');
  };

  const handleReturnCorrection = (docId: string) => {
    if (!reviewNote.trim()) {
      alert('Please provide a review note explaining the return rationale.');
      return;
    }
    setDocumentStatus(docId, 'rejected', reviewNote);
    showToast('Record returned for correction.');
    setReviewNote('');
  };

  const handleRequestClarification = (docId: string) => {
    if (!reviewNote.trim()) {
      alert('Please specify the clarification query.');
      return;
    }
    setDocumentStatus(docId, 'needs_review', `Clarification requested: ${reviewNote}`);
    showToast('Clarification requested from submitting officer.');
    setReviewNote('');
  };

  return (
    <div>
      {/* Toast Notification */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          backgroundColor: '#0F172A',
          color: '#FFFFFF',
          padding: '12px 20px',
          borderRadius: 'var(--radius-md)',
          boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          zIndex: 100,
          fontSize: '13px'
        }}>
          <CheckCircle2 size={16} style={{ color: '#10B981' }} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)' }}>
              Review Queue & Baseline Variance
            </h1>
            <span className="badge badge-match">Multi-Stage Review</span>
            <span className="badge badge-demo">Sample Data</span>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px' }}>
            Verify submitted returns, track baseline variances, record review directives and accept records for consolidation
          </p>
        </div>
      </div>

      {/* Primary Tab Navigation */}
      <div className="pill-tabs-bar" style={{ marginBottom: '24px' }}>
        <button
          onClick={() => setActiveTab('queue')}
          className={`pill-tab ${activeTab === 'queue' ? 'active' : ''}`}
        >
          Submission Review Queue ({documents.length})
        </button>
        <button
          onClick={() => setActiveTab('compare')}
          className={`pill-tab ${activeTab === 'compare' ? 'active' : ''}`}
        >
          Baseline Variance Comparison
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: SUBMISSION REVIEW QUEUE & DETAIL WORKSPACE                        */}
      {/* ========================================================================= */}
      {activeTab === 'queue' && (
        <div className="split-grid-12-1">
          {/* Left Column: Review Queue Table */}
          <div className="card-base" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>
                Submissions Awaiting Action
              </div>
              <div style={{ display: 'flex', gap: '6px' }}>
                {['ALL', 'needs_review', 'approved'].map(s => (
                  <button
                    key={s}
                    onClick={() => setStatusFilter(s)}
                    className={`pill-tab ${statusFilter === s ? 'active' : ''}`}
                    style={{ fontSize: '11px', padding: '4px 8px' }}
                  >
                    {s === 'ALL' ? 'All' : s.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {filteredQueue.map(doc => {
                const isSelected = activeDoc?.id === doc.id;
                return (
                  <div
                    key={doc.id}
                    onClick={() => setActiveDocId(doc.id)}
                    style={{
                      padding: '14px 18px',
                      borderBottom: '1px solid var(--border-subtle)',
                      backgroundColor: isSelected ? 'var(--accent-light)' : 'transparent',
                      borderLeft: isSelected ? '4px solid var(--accent-primary)' : '4px solid transparent',
                      cursor: 'pointer',
                      transition: 'all var(--transition-fast)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)' }}>
                        {doc.subsidiaryCode} · {doc.collieryName}
                      </span>
                      <span className={`badge ${doc.status === 'approved' ? 'badge-success' : 'badge-warning'}`} style={{ fontSize: '10px' }}>
                        {doc.status.replace('_', ' ')}
                      </span>
                    </div>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {doc.title}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                      Fidelity: {doc.ocrConfidence.toFixed(1)}% · {doc.extractedFields.length} fields
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Review Detail & Directive Composer */}
          {activeDoc ? (
            <div className="card-base" style={{ padding: '24px' }}>
              <div style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: '16px', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span className="badge badge-match">{activeDoc.subsidiaryCode}</span>
                  <span className={`badge ${activeDoc.status === 'approved' ? 'badge-success' : 'badge-warning'}`}>
                    {activeDoc.status.replace('_', ' ')}
                  </span>
                </div>
                <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', margin: '4px 0' }}>
                  {activeDoc.title}
                </h2>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  Colliery: {activeDoc.collieryName} · Filename: {activeDoc.fileName}
                </div>
              </div>

              {/* Parsed Fields Summary */}
              <div style={{ marginBottom: '20px' }}>
                <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
                  Reported Metric Values
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  {activeDoc.extractedFields.map(f => (
                    <div key={f.id} style={{ padding: '8px 10px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg-app)', border: '1px solid var(--border-subtle)' }}>
                      <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block' }}>{f.label}</span>
                      <strong style={{ fontSize: '13px', fontVariantNumeric: 'tabular-nums', fontWeight: 600 }}>{f.verifiedValue || f.extractedValue} {f.unit}</strong>
                    </div>
                  ))}
                </div>
              </div>

              {/* Review Directives & Actions */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                    Review Directive / Explanation Note
                  </label>
                  <textarea
                    rows={3}
                    className="textarea-base"
                    placeholder="Enter review findings, baseline variance remarks, or clarification questions..."
                    value={reviewNote}
                    onChange={(e) => setReviewNote(e.target.value)}
                    style={{ width: '100%', fontSize: '13px', lineHeight: '1.5' }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', borderTop: '1px solid var(--border-subtle)', paddingTop: '12px' }}>
                  <button
                    onClick={() => handleAcceptNextStage(activeDoc.id)}
                    className="btn btn-primary"
                    style={{ fontSize: '12px' }}
                  >
                    <CheckCircle2 size={13} />
                    <span>Accept for Next Stage</span>
                  </button>

                  <button
                    onClick={() => handleRequestClarification(activeDoc.id)}
                    className="btn btn-outline"
                    style={{ fontSize: '12px', color: '#D97706' }}
                  >
                    <AlertCircle size={13} />
                    <span>Request Clarification</span>
                  </button>

                  <button
                    onClick={() => handleReturnCorrection(activeDoc.id)}
                    className="btn btn-outline"
                    style={{ fontSize: '12px', color: '#DC2626' }}
                  >
                    <RotateCcw size={13} />
                    <span>Return for Correction</span>
                  </button>
                </div>

                <div style={{ marginTop: '8px', display: 'flex', justifyContent: 'flex-end' }}>
                  <button
                    onClick={() => {
                      selectDocument(activeDoc.id);
                      navigateTo('/documents/verify');
                    }}
                    className="btn btn-outline"
                    style={{ fontSize: '11px', padding: '4px 8px' }}
                  >
                    <Eye size={12} /> Inspect Source Facsimile in Workbench
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="card-base" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
              Select a submission from the queue to review.
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: BASELINE VARIANCE COMPARISON                                      */}
      {/* ========================================================================= */}
      {activeTab === 'compare' && (
        <div className="card-base" style={{ padding: '24px' }}>
          <div className="compare-selector-grid">
            {/* Document A Selector */}
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '6px' }}>
                Base Return (Doc A)
              </label>
              <select
                value={docAId}
                onChange={(e) => setDocAId(e.target.value)}
                style={{ width: '100%', height: '38px', padding: '0 10px', borderRadius: '6px', border: '1px solid var(--border-medium)', fontSize: '13px' }}
              >
                {documents.map(d => (
                  <option key={d.id} value={d.id}>[{d.subsidiaryCode}] {d.title}</option>
                ))}
              </select>
            </div>

            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              backgroundColor: 'var(--bg-app)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-muted)',
              marginTop: '18px'
            }}>
              <GitCompare size={18} />
            </div>

            {/* Document B Selector */}
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '6px' }}>
                Comparison Baseline (Doc B)
              </label>
              <select
                value={docBId}
                onChange={(e) => setDocBId(e.target.value)}
                style={{ width: '100%', height: '38px', padding: '0 10px', borderRadius: '6px', border: '1px solid var(--border-medium)', fontSize: '13px' }}
              >
                {documents.map(d => (
                  <option key={d.id} value={d.id}>[{d.subsidiaryCode}] {d.title}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Variance Comparison Table */}
          {docA && docB && (
            <div style={{ border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '12px' }}>
                <thead style={{ backgroundColor: 'var(--bg-app)', borderBottom: '1px solid var(--border-medium)' }}>
                  <tr>
                    <th style={{ padding: '10px 14px' }}>Operational Parameter</th>
                    <th style={{ padding: '10px 14px', textAlign: 'right' }}>Doc A ({docA.subsidiaryCode})</th>
                    <th style={{ padding: '10px 14px', textAlign: 'right' }}>Doc B ({docB.subsidiaryCode})</th>
                    <th style={{ padding: '10px 14px' }}>Unit</th>
                    <th style={{ padding: '10px 14px', textAlign: 'right' }}>Variance / Observation</th>
                  </tr>
                </thead>
                <tbody>
                  {docA.extractedFields.map(fieldA => {
                    const fieldB = docB.extractedFields.find(f => f.fieldName === fieldA.fieldName);
                    const valA = parseFloat((fieldA.verifiedValue || fieldA.extractedValue).replace(/,/g, ''));
                    const valB = fieldB ? parseFloat((fieldB.verifiedValue || fieldB.extractedValue).replace(/,/g, '')) : NaN;
                    const delta = !isNaN(valA) && !isNaN(valB) ? valA - valB : null;

                    return (
                      <tr key={fieldA.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                        <td style={{ padding: '12px 14px', fontWeight: 600 }}>{fieldA.label}</td>
                        <td style={{ padding: '12px 14px', textAlign: 'right', fontVariantNumeric: 'tabular-nums', fontWeight: 600 }}>
                          {fieldA.verifiedValue || fieldA.extractedValue}
                        </td>
                        <td style={{ padding: '12px 14px', textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
                          {fieldB ? (fieldB.verifiedValue || fieldB.extractedValue) : 'N/A'}
                        </td>
                        <td style={{ padding: '12px 14px', color: 'var(--text-muted)' }}>{fieldA.unit}</td>
                        <td style={{ padding: '12px 14px', textAlign: 'right' }}>
                          {delta !== null ? (
                            <span style={{
                              fontWeight: 600,
                              color: delta >= 0 ? '#10B981' : '#D97706',
                              fontVariantNumeric: 'tabular-nums'
                            }}>
                              {delta >= 0 ? `+${delta.toLocaleString()}` : delta.toLocaleString()} {fieldA.unit}
                            </span>
                          ) : (
                            <span style={{ color: 'var(--text-muted)' }}>Different metric categories</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
