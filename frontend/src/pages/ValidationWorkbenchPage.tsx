import React, { useState } from 'react';
import {
  CheckCircle2,
  AlertCircle,
  FileText,
  Save,
  ArrowLeft,
  Edit2,
  RotateCcw
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { can } from '../lib/rbac';
import type { ExtractedField } from '../types';

export const ValidationWorkbenchPage: React.FC = () => {
  const {
    currentUser,
    documents,
    selectedDocumentId,
    updateExtractedField,
    setDocumentStatus,
    navigateTo
  } = useApp();

  // Resolve active document
  const activeDoc = documents.find(d => d.id === selectedDocumentId) || documents[0];
  const [editingFieldId, setEditingFieldId] = useState<string | null>(null);
  const [hoveredFieldId, setHoveredFieldId] = useState<string | null>(null);
  const [tempValue, setTempValue] = useState<string>('');
  const [tempNotes, setTempNotes] = useState<string>('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  if (!activeDoc) {
    return (
      <div className="card-base" style={{ textAlign: 'center', padding: '60px' }}>
        <p style={{ color: 'var(--text-muted)' }}>No document selected for verification.</p>
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
    showToast('Correction saved to local session.');
  };

  const handleAcceptForNextStage = () => {
    setDocumentStatus(activeDoc.id, 'approved', 'Verified and accepted for demonstration analytics corpus.');
    showToast('Document marked as verified and accepted for next stage.');
  };

  const handleRequestClarification = () => {
    const reason = prompt('Specify clarification question or discrepancy for the submitter:');
    if (reason) {
      setDocumentStatus(activeDoc.id, 'needs_review', `Clarification requested: ${reason}`);
      showToast('Document marked for clarification.');
    }
  };

  const handleReturnForCorrection = () => {
    const reason = prompt('Enter return reason for colliery officer:');
    if (reason) {
      setDocumentStatus(activeDoc.id, 'rejected', `Returned for correction: ${reason}`);
      showToast('Document returned for field correction.');
    }
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

      {/* Top Header & Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', minWidth: 0, flex: 1 }}>
          <button
            onClick={() => navigateTo('/documents')}
            className="btn btn-outline"
            style={{ padding: '6px 10px', display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}
          >
            <ArrowLeft size={14} /> Back to Documents
          </button>
          <div style={{ minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span className="badge" style={{ backgroundColor: '#EEF2F6', color: '#1E293B', fontWeight: 700 }}>
                {activeDoc.subsidiaryCode}
              </span>
              <span className={`badge ${
                activeDoc.status === 'approved' ? 'badge-success' : 'badge-warning'
              }`}>
                {activeDoc.status.replace('_', ' ').toUpperCase()}
              </span>
              <span className="badge badge-match">
                {activeDoc.ocrConfidence.toFixed(1)}% OCR Fidelity
              </span>
            </div>
            <h1 style={{ fontSize: '18px', fontWeight: 700, marginTop: '4px', color: 'var(--text-primary)', margin: '4px 0 0', wordBreak: 'break-word' }}>
              {activeDoc.title}
            </h1>
          </div>
        </div>

        {/* Global Reviewer Action Bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <button
            onClick={handleRequestClarification}
            className="btn btn-outline"
            style={{ fontSize: '12px', color: '#D97706', borderColor: '#FDE68A' }}
          >
            <AlertCircle size={14} />
            <span>Mark for Clarification</span>
          </button>

          <button
            onClick={handleReturnForCorrection}
            className="btn btn-outline"
            style={{ fontSize: '12px', color: '#DC2626', borderColor: '#FECACA' }}
          >
            <RotateCcw size={14} />
            <span>Return for Correction</span>
          </button>

          {can(currentUser, 'documents.verify') && (
            <button
              onClick={handleAcceptForNextStage}
              className="btn btn-primary btn-pill"
              style={{ padding: '8px 20px', fontSize: '12px' }}
            >
              <CheckCircle2 size={15} />
              <span>Accept for Next Stage</span>
            </button>
          )}
        </div>
      </div>

      {/* Split Layout: Left simulated document preview, Right extracted verification workbench */}
      <div className="split-grid-workbench">
        {/* Left: Scanned Document Inspector (Immutable View) */}
        <div className="card-base workbench-facsimile" style={{ display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '12px', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FileText size={16} style={{ color: 'var(--accent-primary)' }} />
              <span style={{ fontSize: '13px', fontWeight: 700 }}>Scanned Source Document Facsimile</span>
            </div>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              Page 1 of {activeDoc.pageCount}
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
              <div style={{ fontWeight: 700, fontSize: '14px', letterSpacing: '0.04em' }}>
                COAL INDIA LIMITED — {activeDoc.subsidiaryCode}
              </div>
              <div style={{ fontSize: '12px', fontWeight: 600 }}>
                {activeDoc.collieryName.toUpperCase()} — STATUTORY RETURN
              </div>
              <div style={{ fontSize: '10px', color: '#64748B' }}>
                SAMPLE DOCUMENT • REPORTING PERIOD: AUGUST 2026 • SOURCE HASH: #8F9A23E
              </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <strong>1. Operational Summary:</strong>
              <p style={{ marginTop: '4px', fontStyle: 'italic', background: '#FFFFFF', padding: '8px', border: '1px solid #E2E8F0', borderRadius: '4px' }}>
                "{activeDoc.extractedSummary}"
              </p>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <strong>2. Primary Scanned Figures:</strong>
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
                    {activeDoc.extractedFields.map(f => {
                      const isHighlighted = editingFieldId === f.id || hoveredFieldId === f.id;
                      return (
                        <tr
                          key={f.id}
                          onClick={() => handleStartEdit(f)}
                          onMouseEnter={() => setHoveredFieldId(f.id)}
                          onMouseLeave={() => setHoveredFieldId(null)}
                          style={{
                            borderBottom: '1px solid #F1F5F9',
                            backgroundColor: isHighlighted ? '#FEF3C7' : 'transparent',
                            borderLeft: isHighlighted ? '3px solid #D97706' : '3px solid transparent',
                            cursor: 'pointer',
                            transition: 'all var(--transition-fast)'
                          }}
                        >
                          <td style={{ padding: '6px 8px', fontWeight: isHighlighted ? 700 : 400 }}>{f.label}</td>
                          <td style={{ padding: '6px 8px', textAlign: 'right', fontWeight: 700, color: isHighlighted ? '#92400E' : 'inherit' }}>
                            {f.verifiedValue || f.extractedValue}
                          </td>
                          <td style={{ padding: '6px 8px', color: '#64748B' }}>{f.unit}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div style={{
              fontSize: '11px',
              color: 'var(--text-muted)',
              borderTop: '1px dashed #CBD5E1',
              paddingTop: '8px',
              marginTop: '16px'
            }}>
              Certified physical return copy on file at {activeDoc.collieryName} area office.
            </div>
          </div>
        </div>

        {/* Right: Human Verification & Correction Workbench */}
        <div className="card-base" style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 210px)', overflowY: 'auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '12px', marginBottom: '16px' }}>
            <div>
              <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>
                Field-Level Human Verification
              </span>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block' }}>
                Inspect and correct parsed values before acceptance
              </span>
            </div>
            <span className="badge badge-demo">Interactive Corrections</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1, overflowY: 'auto' }}>
            {activeDoc.extractedFields.map(field => {
              const isEditing = editingFieldId === field.id;
              const isHovered = hoveredFieldId === field.id;
              const hasBeenCorrected = field.verifiedValue && field.verifiedValue !== field.extractedValue;
              const confPercent = field.confidence <= 1 ? field.confidence * 100 : field.confidence;
              const isHighConf = confPercent >= 90;

              return (
                <div
                  key={field.id}
                  onMouseEnter={() => setHoveredFieldId(field.id)}
                  onMouseLeave={() => setHoveredFieldId(null)}
                  style={{
                    padding: '14px',
                    borderRadius: 'var(--radius-md)',
                    border: isEditing
                      ? '2px solid var(--accent-primary)'
                      : isHovered
                      ? '1px solid #D97706'
                      : '1px solid var(--border-subtle)',
                    backgroundColor: isEditing
                      ? 'var(--accent-light)'
                      : isHovered
                      ? '#FFFBEB'
                      : 'var(--bg-app)',
                    transition: 'all var(--transition-fast)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>
                        {field.label}
                      </span>
                      <span style={{
                        fontSize: '10px',
                        padding: '1px 6px',
                        borderRadius: '4px',
                        backgroundColor: isHighConf ? '#ECFDF5' : '#FFFBEB',
                        color: isHighConf ? '#065F46' : '#92400E',
                        fontWeight: 600
                      }}>
                        {confPercent.toFixed(0)}% Confidence
                      </span>
                    </div>

                    {!isEditing && (
                      <button
                        onClick={() => handleStartEdit(field)}
                        className="btn btn-outline"
                        style={{ padding: '3px 8px', fontSize: '11px' }}
                      >
                        <Edit2 size={11} /> Correct Field
                      </button>
                    )}
                  </div>

                  {isEditing ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <input
                          type="text"
                          value={tempValue}
                          onChange={(e) => setTempValue(e.target.value)}
                          style={{
                            flex: 1,
                            height: '34px',
                            padding: '0 10px',
                            borderRadius: 'var(--radius-sm)',
                            border: '1px solid var(--border-medium)',
                            fontSize: '13px',
                            fontVariantNumeric: 'tabular-nums'
                          }}
                        />
                        <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>
                          {field.unit}
                        </span>
                      </div>

                      <input
                        type="text"
                        placeholder="Verification rationale or citation note..."
                        value={tempNotes}
                        onChange={(e) => setTempNotes(e.target.value)}
                        style={{
                          height: '32px',
                          padding: '0 10px',
                          borderRadius: 'var(--radius-sm)',
                          border: '1px solid var(--border-medium)',
                          fontSize: '12px'
                        }}
                      />

                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '4px' }}>
                        <button
                          type="button"
                          onClick={() => setEditingFieldId(null)}
                          className="btn btn-outline"
                          style={{ padding: '3px 8px', fontSize: '11px' }}
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSaveField(field.id)}
                          className="btn btn-primary"
                          style={{ padding: '3px 10px', fontSize: '11px' }}
                        >
                          <Save size={12} /> Save Correction
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px' }}>
                        <span style={{ fontSize: '18px', fontWeight: 600, fontVariantNumeric: 'tabular-nums', color: 'var(--text-primary)' }}>
                          {field.verifiedValue || field.extractedValue}
                        </span>
                        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                          {field.unit}
                        </span>
                        {hasBeenCorrected && (
                          <span style={{ fontSize: '11px', color: '#D97706', fontStyle: 'italic' }}>
                            (Corrected from raw: {field.extractedValue})
                          </span>
                        )}
                      </div>

                      {field.notes && (
                        <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                          <strong>Note:</strong> {field.notes}
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
