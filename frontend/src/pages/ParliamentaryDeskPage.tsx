import React, { useState } from 'react';
import {
  CheckCircle2,
  Sparkles,
  Download,
  Edit3
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { can } from '../lib/rbac';

export const ParliamentaryDeskPage: React.FC = () => {
  const { currentUser, parliamentaryQueries, selectedQueryId, selectParliamentaryQuery, updateQueryResponse, navigateTo, selectDocument } = useApp();
  
  const activeQuery = parliamentaryQueries.find(q => q.id === selectedQueryId) || parliamentaryQueries[0];
  const [draftEditorText, setDraftEditorText] = useState(
    activeQuery?.approvedResponse || activeQuery?.reviewedResponse || activeQuery?.aiDraft || ''
  );
  const [isEditing, setIsEditing] = useState(false);

  // Sync draft text when active query changes
  React.useEffect(() => {
    if (activeQuery) {
      setDraftEditorText(activeQuery.approvedResponse || activeQuery.reviewedResponse || activeQuery.aiDraft || '');
      setIsEditing(false);
    }
  }, [activeQuery?.id]);

  if (!activeQuery) {
    return (
      <div className="card-base" style={{ textAlign: 'center', padding: '60px' }}>
        <p style={{ color: 'var(--text-muted)' }}>No parliamentary queries available.</p>
      </div>
    );
  }

  const handleSaveReviewedDraft = () => {
    updateQueryResponse(activeQuery.id, draftEditorText, 'under_review');
    setIsEditing(false);
  };

  const handleApproveResponse = () => {
    if (!can(currentUser, 'parliamentary.approve')) {
      alert('Access Denied: Only Ministry Executive has authority to approve official Parliamentary responses.');
      return;
    }
    if (confirm('Approve this response for official Parliamentary transmission?')) {
      updateQueryResponse(activeQuery.id, draftEditorText, 'approved');
      setIsEditing(false);
    }
  };

  const handleExportPDF = () => {
    window.print();
  };

  return (
    <div>
      {/* Top Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)' }}>
              Parliamentary Query Desk & Response Cell
            </h1>
            <span className="badge badge-match">Lok Sabha & Rajya Sabha</span>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px' }}>
            Drafting, cross-verification, and ministerial sign-off for statutory legislative questions
          </p>
        </div>

        <button
          onClick={handleExportPDF}
          className="btn btn-outline btn-pill"
          style={{ fontSize: '12px', padding: '8px 16px' }}
        >
          <Download size={14} />
          <span>Export Formatted Brief</span>
        </button>
      </div>

      {/* Main Grid: Left Queries Inbox, Right Dedicated Draft Workbench */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px' }}>
        {/* Left Column: Query Inbox */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', paddingLeft: '4px' }}>
            Incoming Parliamentary Notices ({parliamentaryQueries.length})
          </div>

          {parliamentaryQueries.map(q => {
            const isSelected = q.id === activeQuery.id;
            return (
              <button
                key={q.id}
                onClick={() => selectParliamentaryQuery(q.id)}
                style={{
                  textAlign: 'left',
                  padding: '16px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: isSelected ? 'var(--accent-light)' : '#FFFFFF',
                  border: isSelected ? '2px solid var(--accent-primary)' : '1px solid var(--border-subtle)',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                  transition: 'all var(--transition-fast)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '12px', fontWeight: 800, color: isSelected ? 'var(--accent-primary)' : 'var(--text-primary)' }}>
                    {q.queryNumber}
                  </span>
                  <span className={`badge ${
                    q.workflowStatus === 'approved' ? 'badge-success' :
                    q.workflowStatus === 'under_review' ? 'badge-info' : 'badge-warning'
                  }`}>
                    {q.workflowStatus.replace('_', ' ').toUpperCase()}
                  </span>
                </div>

                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  {q.house} • {q.session}
                </div>

                <p style={{
                  fontSize: '12px',
                  color: 'var(--text-secondary)',
                  lineHeight: '1.4',
                  margin: '4px 0 0',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden'
                }}>
                  {q.questionText}
                </p>
              </button>
            );
          })}
        </div>

        {/* Right Column: Draft Workbench & Source Grounding */}
        <div className="card-base" style={{ padding: '24px' }}>
          {/* Query Header */}
          <div style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: '16px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="badge" style={{ backgroundColor: 'var(--bg-dark)', color: '#FFFFFF', fontWeight: 700 }}>
                  {activeQuery.house}
                </span>
                <span style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)' }}>
                  {activeQuery.queryNumber}
                </span>
                <span className="badge badge-match">{activeQuery.category}</span>
              </div>

              {/* Status Badge */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span className={`badge ${
                  activeQuery.workflowStatus === 'approved' ? 'badge-success' :
                  activeQuery.workflowStatus === 'under_review' ? 'badge-info' : 'badge-warning'
                }`} style={{ fontSize: '12px', padding: '4px 10px' }}>
                  {activeQuery.workflowStatus === 'approved' ? 'OFFICIALLY APPROVED' :
                   activeQuery.workflowStatus === 'under_review' ? 'REVIEWED DRAFT' : 'AI DRAFT READY'}
                </span>
              </div>
            </div>

            {/* Question Text */}
            <div style={{
              backgroundColor: 'var(--bg-app)',
              padding: '14px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
              fontSize: '13px',
              fontWeight: 500,
              lineHeight: '1.6',
              color: 'var(--text-primary)'
            }}>
              "{activeQuery.questionText}"
            </div>
          </div>

          {/* Response Editor / Viewer */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Sparkles size={16} style={{ color: 'var(--accent-primary)' }} />
                <span style={{ fontSize: '13px', fontWeight: 700 }}>
                  Draft Answer Text
                </span>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  (Distinguishing AI Draft vs Approved Response)
                </span>
              </div>

              {!isEditing && activeQuery.workflowStatus !== 'approved' && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="btn btn-outline"
                  style={{ padding: '4px 10px', fontSize: '11px' }}
                >
                  <Edit3 size={12} /> Edit Draft Text
                </button>
              )}
            </div>

            {isEditing ? (
              <div>
                <textarea
                  rows={8}
                  value={draftEditorText}
                  onChange={(e) => setDraftEditorText(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--accent-primary)',
                    fontFamily: 'inherit',
                    fontSize: '13px',
                    lineHeight: '1.6',
                    color: 'var(--text-primary)'
                  }}
                />
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '8px' }}>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="btn btn-outline"
                    style={{ padding: '6px 12px', fontSize: '12px' }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveReviewedDraft}
                    className="btn btn-primary"
                    style={{ padding: '6px 16px', fontSize: '12px' }}
                  >
                    Save as Reviewed Draft
                  </button>
                </div>
              </div>
            ) : (
              <div style={{
                backgroundColor: activeQuery.workflowStatus === 'approved' ? '#F0FDF4' : '#FFFFFF',
                border: activeQuery.workflowStatus === 'approved' ? '1px solid #A7F3D0' : '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '16px',
                fontSize: '13px',
                lineHeight: '1.7',
                color: 'var(--text-primary)',
                whiteSpace: 'pre-line'
              }}>
                {draftEditorText}
              </div>
            )}
          </div>

          {/* Supporting Verified Sources Grounding */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>
              Grounding Citations & Verified Origins
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {activeQuery.groundedSources.map((src, i) => (
                <div key={i} style={{
                  padding: '10px 14px',
                  backgroundColor: 'var(--bg-surface-muted)',
                  borderRadius: 'var(--radius-md)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontSize: '12px'
                }}>
                  <div>
                    <span className="badge" style={{ backgroundColor: '#FFFFFF', marginRight: '8px' }}>{src.subsidiary}</span>
                    <strong style={{ color: 'var(--text-primary)' }}>{src.documentTitle}</strong>
                    <span style={{ color: 'var(--text-muted)', marginLeft: '6px' }}>(Page {src.pageNumber})</span>
                  </div>
                  <button
                    onClick={() => {
                      selectDocument(src.documentId);
                      navigateTo('/documents/verify');
                    }}
                    style={{ background: 'transparent', border: 'none', color: 'var(--accent-primary)', cursor: 'pointer', fontWeight: 600, fontSize: '11px' }}
                  >
                    View Source
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Ministerial Approval Action Bar */}
          <div style={{
            borderTop: '1px solid var(--border-subtle)',
            paddingTop: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px'
          }}>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              Assigned Desk: <strong>{activeQuery.assignedToName}</strong>
              {activeQuery.approvedByName && (
                <span> • Approved by: <strong>{activeQuery.approvedByName}</strong></span>
              )}
            </div>

            {can(currentUser, 'parliamentary.approve') && activeQuery.workflowStatus !== 'approved' && (
              <button
                onClick={handleApproveResponse}
                className="btn btn-primary btn-pill"
                style={{ padding: '8px 22px' }}
              >
                <CheckCircle2 size={16} />
                <span>Executive Sign-Off & Approve</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
