import React, { useState } from 'react';
import {
  CheckSquare,
  CheckCircle2,
  XCircle,
  FileText,
  Save,
  ArrowLeft,
  Info
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { can } from '../lib/rbac';
import type { ExtractedField } from '../types';

export const ValidationWorkbenchPage: React.FC = () => {
  const { currentUser, documents, selectedDocumentId, updateExtractedField, setDocumentStatus, navigateTo } = useApp();
  
  // Resolve active document
  const activeDoc = documents.find(d => d.id === selectedDocumentId) || documents[0];
  const [editingFieldId, setEditingFieldId] = useState<string | null>(null);
  const [tempValue, setTempValue] = useState<string>('');
  const [tempNotes, setTempNotes] = useState<string>('');

  if (!activeDoc) {
    return (
      <div className="card-base" style={{ textAlign: 'center', padding: '60px' }}>
        <p style={{ color: 'var(--text-muted)' }}>No document selected for validation.</p>
        <button onClick={() => navigateTo('/documents')} className="btn btn-primary" style={{ marginTop: '16px' }}>
          Go to Document Queue
        </button>
      </div>
    );
  }

  const handleStartEdit = (field: ExtractedField) => {
    setEditingFieldId(field.id);
    setTempValue(field.verifiedValue || field.extractedValue);
    setTempNotes(field.notes || '');
  };

  const handleSaveField = (fieldId: string) => {
    updateExtractedField(activeDoc.id, fieldId, tempValue, tempNotes);
    setEditingFieldId(null);
  };

  const handleApprove = () => {
    if (confirm('Confirm approval of verified data into core MDMS database?')) {
      setDocumentStatus(activeDoc.id, 'approved', 'Verified and approved by nodal authority.');
      navigateTo('/documents');
    }
  };

  const handleReject = () => {
    const reason = prompt('Please specify rejection reason for audit logging:');
    if (reason) {
      setDocumentStatus(activeDoc.id, 'rejected', reason);
      navigateTo('/documents');
    }
  };

  return (
    <div>
      {/* Top Header & Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={() => navigateTo('/documents')}
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="badge" style={{ backgroundColor: '#EEF2F6', color: '#1E293B', fontWeight: 700 }}>
                {activeDoc.subsidiaryCode}
              </span>
              <span className={`badge ${
                activeDoc.status === 'approved' ? 'badge-success' : 'badge-warning'
              }`}>
                {activeDoc.status.replace('_', ' ').toUpperCase()}
              </span>
              <span className="badge badge-match">
                {activeDoc.ocrConfidence}% OCR Fidelity
              </span>
            </div>
            <h1 style={{ fontSize: '20px', fontWeight: 700, marginTop: '4px', color: 'var(--text-primary)' }}>
              {activeDoc.title}
            </h1>
          </div>
        </div>

        {/* Global Reviewer Action Bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {can(currentUser, 'documents.verify') && (
            <button
              onClick={handleReject}
              className="btn btn-outline"
              style={{ color: '#DC2626', borderColor: '#FECACA' }}
            >
              <XCircle size={15} />
              <span>Reject Return</span>
            </button>
          )}

          {can(currentUser, 'documents.approve') && (
            <button
              onClick={handleApprove}
              className="btn btn-primary btn-pill"
              style={{ padding: '8px 22px' }}
            >
              <CheckCircle2 size={16} />
              <span>Approve into MDMS Core</span>
            </button>
          )}
        </div>
      </div>

      {/* Split Layout: Left simulated document preview, Right extracted verification workbench */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.25fr', gap: '24px' }}>
        {/* Left: Scanned Document Inspector (Immutable View) */}
        <div className="card-base" style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 220px)', overflowY: 'auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '12px', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FileText size={16} style={{ color: 'var(--accent-primary)' }} />
              <span style={{ fontSize: '13px', fontWeight: 700 }}>Scanned Physical Source Form</span>
            </div>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              Immutable Raw Document • Page 1 of {activeDoc.pageCount}
            </span>
          </div>

          {/* Document Simulated Facsimile */}
          <div style={{
            flex: 1,
            backgroundColor: '#F8FAFC',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '24px',
            fontFamily: 'var(--font-mono)',
            fontSize: '12px',
            lineHeight: '1.7',
            color: '#334155',
            overflowY: 'auto'
          }}>
            <div style={{ textAlign: 'center', borderBottom: '2px solid #0F172A', paddingBottom: '12px', marginBottom: '16px' }}>
              <div style={{ fontWeight: 800, fontSize: '14px', letterSpacing: '0.04em' }}>
                COAL INDIA LIMITED — {activeDoc.subsidiaryCode}
              </div>
              <div style={{ fontSize: '12px', fontWeight: 600 }}>
                {activeDoc.collieryName.toUpperCase()} — MONTHLY STATUTORY PRODUCTION RETURN
              </div>
              <div style={{ fontSize: '10px', color: '#64748B' }}>
                FORM MDMS-R2 • PERIOD ENDING AUGUST 2026 • SOURCE HASH: #8F9A23E
              </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <strong>1. Operational Summary:</strong>
              <p style={{ marginTop: '4px', fontStyle: 'italic', background: '#FFFFFF', padding: '8px', border: '1px solid #E2E8F0', borderRadius: '4px' }}>
                "{activeDoc.extractedSummary}"
              </p>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <strong>2. Primary Extracted Table:</strong>
              <div style={{ marginTop: '8px', background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '4px', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
                  <thead style={{ background: '#F1F5F9', borderBottom: '1px solid #E2E8F0' }}>
                    <tr>
                      <th style={{ padding: '6px 8px', textAlign: 'left' }}>Item Description</th>
                      <th style={{ padding: '6px 8px', textAlign: 'right' }}>Scanned Figure</th>
                      <th style={{ padding: '6px 8px', textAlign: 'left' }}>Unit</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeDoc.extractedFields.map(f => (
                      <tr key={f.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                        <td style={{ padding: '6px 8px' }}>{f.label}</td>
                        <td style={{ padding: '6px 8px', textAlign: 'right', fontWeight: 700 }}>{f.extractedValue}</td>
                        <td style={{ padding: '6px 8px', color: '#64748B' }}>{f.unit}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div style={{ fontSize: '10px', color: '#94A3B8', marginTop: '24px', borderTop: '1px dashed #CBD5E1', paddingTop: '8px' }}>
              [PHYSICAL SLIP CERTIFICATION: Signed by Colliery Manager on site. Verified via digital optical pipeline.]
            </div>
          </div>
        </div>

        {/* Right: Human-in-the-Loop Extraction Workbench */}
        <div className="card-base" style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 220px)', overflowY: 'auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '12px', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckSquare size={16} style={{ color: 'var(--accent-primary)' }} />
              <span style={{ fontSize: '14px', fontWeight: 700 }}>Extracted Field Verification</span>
            </div>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              {activeDoc.extractedFields.length} parsed data points
            </span>
          </div>

          {/* Verification Notice */}
          <div style={{
            backgroundColor: '#EFF6FF',
            border: '1px solid #BFDBFE',
            borderRadius: 'var(--radius-md)',
            padding: '10px 14px',
            marginBottom: '16px',
            fontSize: '12px',
            color: '#1E40AF',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <Info size={16} style={{ flexShrink: 0 }} />
            <span>
              Review each OCR field before approving. Changes are recorded in immutable audit logs.
            </span>
          </div>

          {/* Fields List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', flex: 1, overflowY: 'auto' }}>
            {activeDoc.extractedFields.map(f => {
              const isFlagged = f.status === 'flagged_error';
              const isVerified = f.status === 'verified' || f.status === 'approved';
              const isEditing = editingFieldId === f.id;

              return (
                <div
                  key={f.id}
                  style={{
                    border: isFlagged ? '1px solid #FECACA' : isVerified ? '1px solid #A7F3D0' : '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    padding: '14px',
                    backgroundColor: isFlagged ? '#FEF2F2' : isVerified ? '#F0FDF4' : 'var(--bg-surface)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {f.label}
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span className={`badge ${
                        f.confidence >= 90 ? 'badge-success' : f.confidence >= 80 ? 'badge-warning' : 'badge-error'
                      }`}>
                        {f.confidence}% OCR
                      </span>
                      <span className="badge" style={{ backgroundColor: '#F1F5F9', fontSize: '10px' }}>
                        Page {f.pageNumber}
                      </span>
                    </div>
                  </div>

                  {isEditing ? (
                    <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <div>
                        <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)' }}>Verified Value ({f.unit})</label>
                        <input
                          type="text"
                          value={tempValue}
                          onChange={(e) => setTempValue(e.target.value)}
                          style={{
                            width: '100%',
                            height: '34px',
                            padding: '0 8px',
                            borderRadius: '6px',
                            border: '1px solid var(--accent-primary)',
                            fontSize: '13px',
                            fontWeight: 700
                          }}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)' }}>Reviewer Notes</label>
                        <input
                          type="text"
                          placeholder="e.g. Corrected handwritten smudged digit"
                          value={tempNotes}
                          onChange={(e) => setTempNotes(e.target.value)}
                          style={{
                            width: '100%',
                            height: '30px',
                            padding: '0 8px',
                            borderRadius: '6px',
                            border: '1px solid var(--border-subtle)',
                            fontSize: '12px'
                          }}
                        />
                      </div>
                      <div style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
                        <button
                          type="button"
                          onClick={() => handleSaveField(f.id)}
                          className="btn btn-primary"
                          style={{ padding: '4px 12px', fontSize: '11px' }}
                        >
                          <Save size={12} /> Save Verified
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingFieldId(null)}
                          className="btn btn-outline"
                          style={{ padding: '4px 10px', fontSize: '11px' }}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginTop: '4px' }}>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                          <span style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)' }}>
                            {f.verifiedValue || f.extractedValue}
                          </span>
                          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{f.unit}</span>
                          {f.verifiedValue && f.verifiedValue !== f.extractedValue && (
                            <span style={{ fontSize: '11px', color: 'var(--text-muted)', textDecoration: 'line-through' }}>
                              OCR: {f.extractedValue}
                            </span>
                          )}
                        </div>

                        {can(currentUser, 'documents.verify') && (
                          <button
                            type="button"
                            onClick={() => handleStartEdit(f)}
                            className="btn btn-outline"
                            style={{ padding: '4px 10px', fontSize: '11px' }}
                          >
                            Edit / Verify
                          </button>
                        )}
                      </div>

                      {f.notes && (
                        <div style={{ fontSize: '11px', color: isFlagged ? '#B91C1C' : '#047857', marginTop: '6px', fontStyle: 'italic' }}>
                          Note: {f.notes}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
