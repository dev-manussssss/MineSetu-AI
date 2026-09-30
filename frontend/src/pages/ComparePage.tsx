import React, { useState } from 'react';
import { GitCompare, Info } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const ComparePage: React.FC = () => {
  const { documents, selectedDocumentId } = useApp();
  const [docAId, setDocAId] = useState<string>(selectedDocumentId || documents[0].id);
  const [docBId, setDocBId] = useState<string>(documents[1]?.id || documents[0].id);

  const docA = documents.find(d => d.id === docAId) || documents[0];
  const docB = documents.find(d => d.id === docBId) || documents[1] || documents[0];

  return (
    <div>
      {/* Top Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)' }}>
          Document & Baseline Comparison
        </h1>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px' }}>
          Evaluate numerical deviations, metric deltas, and cross-subsidiary variances with neutral difference tracking
        </p>
      </div>

      {/* Document Selectors Header Card */}
      <div className="card-base" style={{ padding: '20px', marginBottom: '24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '20px', alignItems: 'center' }}>
          {/* Source Document A */}
          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '6px' }}>
              Base Return (Doc A)
            </label>
            <select
              value={docAId}
              onChange={(e) => setDocAId(e.target.value)}
              style={{
                width: '100%',
                height: '40px',
                padding: '0 12px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-medium)',
                backgroundColor: '#FFFFFF',
                fontSize: '13px',
                fontWeight: 600
              }}
            >
              {documents.map(d => (
                <option key={d.id} value={d.id}>[{d.subsidiaryCode}] {d.title}</option>
              ))}
            </select>
          </div>

          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            backgroundColor: 'var(--bg-app)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-muted)'
          }}>
            <GitCompare size={18} />
          </div>

          {/* Comparison Document B */}
          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '6px' }}>
              Target / Comparator (Doc B)
            </label>
            <select
              value={docBId}
              onChange={(e) => setDocBId(e.target.value)}
              style={{
                width: '100%',
                height: '40px',
                padding: '0 12px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-medium)',
                backgroundColor: '#FFFFFF',
                fontSize: '13px',
                fontWeight: 600
              }}
            >
              {documents.map(d => (
                <option key={d.id} value={d.id}>[{d.subsidiaryCode}] {d.title}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Comparison Summary Banner */}
      <div style={{
        backgroundColor: '#EFF6FF',
        border: '1px solid #BFDBFE',
        borderRadius: 'var(--radius-md)',
        padding: '14px 18px',
        marginBottom: '24px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
      }}>
        <Info size={20} style={{ color: 'var(--accent-primary)', flexShrink: 0 }} />
        <div style={{ fontSize: '13px', color: '#1E40AF' }}>
          <strong>Comparison Terminology Standard:</strong> Variances between returns are flagged as <em>Difference detected</em>. They are not categorized as errors until confirmed by human review.
        </div>
      </div>

      {/* Field-by-Field Comparison Table */}
      <div className="table-container">
        <table className="table-base">
          <thead>
            <tr>
              <th>Evaluated Field</th>
              <th>Doc A: {docA.subsidiaryCode} ({docA.collieryName})</th>
              <th>Doc B: {docB.subsidiaryCode} ({docB.collieryName})</th>
              <th>Numerical Delta</th>
              <th>Variance Status</th>
            </tr>
          </thead>
          <tbody>
            {docA.extractedFields.map((fieldA, idx) => {
              const fieldB = docB.extractedFields[idx];
              const valA = parseFloat(fieldA.verifiedValue?.replace(/,/g, '') || fieldA.extractedValue.replace(/,/g, '')) || 0;
              const valB = fieldB ? (parseFloat(fieldB.verifiedValue?.replace(/,/g, '') || fieldB.extractedValue.replace(/,/g, '')) || 0) : 0;
              const delta = valB - valA;
              const hasDiff = Math.abs(delta) > 0.001;

              return (
                <tr key={fieldA.id}>
                  <td>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{fieldA.label}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Unit: {fieldA.unit || 'Metric'}</div>
                  </td>
                  <td>
                    <span style={{ fontWeight: 700, fontSize: '14px' }}>
                      {fieldA.verifiedValue || fieldA.extractedValue} {fieldA.unit}
                    </span>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Page {fieldA.pageNumber}</div>
                  </td>
                  <td>
                    {fieldB ? (
                      <>
                        <span style={{ fontWeight: 700, fontSize: '14px' }}>
                          {fieldB.verifiedValue || fieldB.extractedValue} {fieldB.unit}
                        </span>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Page {fieldB.pageNumber}</div>
                      </>
                    ) : (
                      <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>Field absent in Doc B</span>
                    )}
                  </td>
                  <td>
                    {fieldB ? (
                      <span style={{
                        fontWeight: 700,
                        color: delta > 0 ? '#10B981' : delta < 0 ? '#DC2626' : 'var(--text-muted)'
                      }}>
                        {delta > 0 ? `+${delta.toLocaleString()}` : delta < 0 ? delta.toLocaleString() : '0.00'}
                      </span>
                    ) : (
                      <span style={{ color: 'var(--text-muted)' }}>—</span>
                    )}
                  </td>
                  <td>
                    {hasDiff ? (
                      <span className="badge badge-warning">
                        Difference detected
                      </span>
                    ) : (
                      <span className="badge badge-success">
                        Aligned
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
