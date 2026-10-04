import React, { useState } from 'react';
import {
  MessageSquareText,
  Plus,
  Search,
  Calendar,
  Building,
  CheckCircle2,
  AlertCircle,
  Clock,
  Send,
  Eye,
  X,
  FileText
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { can } from '../lib/rbac';
import type { InformationRequest } from '../types';

export const RequestsPage: React.FC = () => {
  const {
    currentUser,
    requests,
    selectedRequestId,
    selectRequest,
    createRequest,
    respondToRequest,
    updateRequestStatus,
    documents,
    selectDocument,
    navigateTo
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isRespondModalOpen, setIsRespondModalOpen] = useState(false);
  const [isClarificationModalOpen, setIsClarificationModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Create Request Form State
  const [reqSubject, setReqSubject] = useState('');
  const [reqDescription, setReqDescription] = useState('');
  const [reqRecipientOrg, setReqRecipientOrg] = useState('Eastern Coalfields Limited');
  const [reqPeriod, setReqPeriod] = useState('August 2026');
  const [reqFields, setReqFields] = useState('Raw Coal Production, OB Removal, HEMM Availability');
  const [reqDueDate, setReqDueDate] = useState('2026-10-15');
  const [attachedDocIds, setAttachedDocIds] = useState<string[]>([]);

  // Response Form State
  const [responseText, setResponseText] = useState('');
  const [responseAttachedDocIds, setResponseAttachedDocIds] = useState<string[]>([]);

  // Clarification Form State
  const [clarificationText, setClarificationText] = useState('');

  const activeRequest = requests.find(r => r.id === selectedRequestId) || requests[0];

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const filteredRequests = requests.filter(req => {
    if (statusFilter !== 'ALL' && req.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        req.subject.toLowerCase().includes(q) ||
        req.requestNumber.toLowerCase().includes(q) ||
        req.recipientOrg.toLowerCase().includes(q) ||
        req.requestingOrg.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reqSubject.trim() || !reqDescription.trim()) {
      alert('Please fill in both the Subject and Description.');
      return;
    }

    const newId = createRequest({
      subject: reqSubject,
      description: reqDescription,
      recipientOrg: reqRecipientOrg,
      recipientPersona: `${reqRecipientOrg} Operations Officer`,
      reportingPeriod: reqPeriod,
      requestedFields: reqFields.split(',').map(s => s.trim()).filter(Boolean),
      dueDate: reqDueDate,
      attachedDocumentIds: attachedDocIds
    });

    setIsCreateModalOpen(false);
    setReqSubject('');
    setReqDescription('');
    setAttachedDocIds([]);
    selectRequest(newId);
    showToast(`Request created successfully in demo workspace.`);
  };

  const handleResponseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeRequest || !responseText.trim()) return;

    respondToRequest(activeRequest.id, responseText, responseAttachedDocIds);
    setIsRespondModalOpen(false);
    setResponseText('');
    setResponseAttachedDocIds([]);
    showToast(`Response submitted for review.`);
  };

  const handleClarificationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeRequest || !clarificationText.trim()) return;

    updateRequestStatus(activeRequest.id, 'clarification_required', clarificationText);
    setIsClarificationModalOpen(false);
    setClarificationText('');
    showToast(`Clarification requested and recorded in demonstration timeline.`);
  };

  const getStatusBadge = (status: InformationRequest['status']) => {
    switch (status) {
      case 'completed':
        return <span className="badge badge-success">Completed</span>;
      case 'submitted':
        return <span className="badge badge-info">Submitted</span>;
      case 'clarification_required':
        return <span className="badge badge-warning">Clarification Required</span>;
      case 'awaiting_response':
        return <span className="badge badge-pending">Awaiting Response</span>;
      case 'partially_answered':
        return <span className="badge badge-pending">Partially Answered</span>;
      case 'draft':
      default:
        return <span className="badge badge-neutral">Draft</span>;
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

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)' }}>
              Information Requests
            </h1>
            <span className="badge badge-demo">Sample Data</span>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px' }}>
            Cross-organization information requests, subsidiary submissions, and clarification workflow
          </p>
        </div>

        {can(currentUser, 'requests.create') ? (
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="btn btn-primary btn-pill"
            style={{ padding: '8px 18px', fontSize: '13px' }}
          >
            <Plus size={15} />
            <span>Create Information Request</span>
          </button>
        ) : (
          <button
            disabled
            title="Your current persona is a respondent; only Ministry and Headquarters executives can issue new requests."
            className="btn btn-outline btn-pill"
            style={{ padding: '8px 18px', fontSize: '13px', opacity: 0.6, cursor: 'not-allowed' }}
          >
            <span>Create Request (Restricted to Ministry/CIL)</span>
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="card-base" style={{ padding: '16px 20px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '260px' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Search by subject, request ID, or recipient organization..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                height: '38px',
                padding: '0 12px 0 38px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-subtle)',
                backgroundColor: 'var(--bg-app)',
                fontSize: '13px',
                color: 'var(--text-primary)'
              }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>Status:</span>
            {['ALL', 'awaiting_response', 'submitted', 'clarification_required', 'completed'].map(statusKey => (
              <button
                key={statusKey}
                onClick={() => setStatusFilter(statusKey)}
                className={`pill-tab ${statusFilter === statusKey ? 'active' : ''}`}
                style={{ fontSize: '12px', padding: '5px 12px' }}
              >
                {statusKey === 'ALL' ? 'All' : statusKey.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Split Workspace: Request List & Request Detail */}
      <div className="split-grid-12-1">
        {/* Left Column: Requests List */}
        <div className="card-base" style={{ padding: '0', overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>
              Requests Queue ({filteredRequests.length})
            </div>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              Deterministic local dataset
            </span>
          </div>

          {filteredRequests.length === 0 ? (
            <div style={{ padding: '48px 24px', textAlign: 'center' }}>
              <MessageSquareText size={36} style={{ color: 'var(--text-light)', margin: '0 auto 12px' }} />
              <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
                No requests match this filter
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                Try adjusting the status filter or create a new request.
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {filteredRequests.map(req => {
                const isSelected = activeRequest?.id === req.id;
                return (
                  <div
                    key={req.id}
                    onClick={() => selectRequest(req.id)}
                    style={{
                      padding: '16px 20px',
                      cursor: 'pointer',
                      borderBottom: '1px solid var(--border-subtle)',
                      backgroundColor: isSelected ? 'var(--accent-light)' : 'transparent',
                      borderLeft: isSelected ? '4px solid var(--accent-primary)' : '4px solid transparent',
                      transition: 'all var(--transition-fast)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{ fontSize: '11px', fontWeight: 600, fontVariantNumeric: 'tabular-nums', color: 'var(--text-muted)' }}>
                        {req.requestNumber}
                      </span>
                      {getStatusBadge(req.status)}
                    </div>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                      {req.subject}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '11px', color: 'var(--text-muted)', flexWrap: 'wrap' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Building size={12} /> {req.recipientOrg}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Calendar size={12} /> Period: {req.reportingPeriod}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Clock size={12} /> Due: {req.dueDate}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Request Detail Workspace */}
        {activeRequest ? (
          <div className="card-base" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '16px', gap: '12px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 600, fontVariantNumeric: 'tabular-nums', color: 'var(--text-muted)' }}>
                    {activeRequest.requestNumber}
                  </span>
                  {getStatusBadge(activeRequest.status)}
                </div>
                <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', lineHeight: '1.3' }}>
                  {activeRequest.subject}
                </h2>
              </div>
            </div>

            {/* Scope / Metadata Panel */}
            <div style={{
              padding: '12px 16px',
              backgroundColor: 'var(--bg-surface-muted)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
              marginBottom: '20px',
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '12px',
              fontSize: '12px'
            }}>
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '10px', textTransform: 'uppercase', fontWeight: 600 }}>
                  Requesting Entity
                </span>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                  {activeRequest.requestingOrg} ({activeRequest.requestingPersona})
                </span>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '10px', textTransform: 'uppercase', fontWeight: 600 }}>
                  Recipient
                </span>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                  {activeRequest.recipientOrg}
                </span>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '10px', textTransform: 'uppercase', fontWeight: 600 }}>
                  Reporting Period
                </span>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                  {activeRequest.reportingPeriod}
                </span>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '10px', textTransform: 'uppercase', fontWeight: 600 }}>
                  Target Due Date
                </span>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                  {activeRequest.dueDate}
                </span>
              </div>
            </div>

            {/* Description & Requested Fields */}
            <div style={{ marginBottom: '20px' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '6px' }}>
                Scope & Context Description
              </div>
              <p style={{ fontSize: '13px', lineHeight: '1.6', color: 'var(--text-secondary)' }}>
                {activeRequest.description}
              </p>

              <div style={{ marginTop: '12px' }}>
                <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                  Specific Data Fields Requested:
                </span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {activeRequest.requestedFields.map((field, idx) => (
                    <span
                      key={idx}
                      style={{
                        fontSize: '11px',
                        padding: '3px 8px',
                        borderRadius: '4px',
                        backgroundColor: 'var(--bg-app)',
                        border: '1px solid var(--border-medium)',
                        color: 'var(--text-primary)',
                        fontWeight: 500
                      }}
                    >
                      {field}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Attached Reference Documents (if any) */}
            {activeRequest.attachedDocumentIds && activeRequest.attachedDocumentIds.length > 0 && (
              <div style={{ marginBottom: '20px' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '6px' }}>
                  Attached Reference Documents ({activeRequest.attachedDocumentIds.length})
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {activeRequest.attachedDocumentIds.map(docId => {
                    const doc = documents.find(d => d.id === docId);
                    return (
                      <div
                        key={docId}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '8px 12px',
                          borderRadius: '6px',
                          backgroundColor: 'var(--bg-surface-muted)',
                          border: '1px solid var(--border-subtle)',
                          fontSize: '12px'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <FileText size={14} style={{ color: 'var(--accent-primary)' }} />
                          <span style={{ fontWeight: 600 }}>{doc?.title || docId}</span>
                        </div>
                        {doc && (
                          <button
                            onClick={() => {
                              selectDocument(doc.id);
                              navigateTo('/documents/verify');
                            }}
                            className="btn btn-outline"
                            style={{ padding: '3px 8px', fontSize: '11px' }}
                          >
                            <Eye size={12} /> View In Workbench
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Submitted Response (if present) */}
            {activeRequest.responseText ? (
              <div style={{
                marginBottom: '20px',
                padding: '16px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: '#F8FAFC',
                border: '1px solid #CBD5E1'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <CheckCircle2 size={16} style={{ color: '#10B981' }} />
                    <span style={{ fontSize: '12px', fontWeight: 700, color: '#0F172A' }}>
                      Official Submitted Response
                    </span>
                  </div>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    {activeRequest.lastUpdate}
                  </span>
                </div>
                <p style={{ fontSize: '13px', lineHeight: '1.6', color: '#334155' }}>
                  {activeRequest.responseText}
                </p>
              </div>
            ) : (
              <div style={{
                marginBottom: '20px',
                padding: '16px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--bg-app)',
                border: '1px dashed var(--border-medium)',
                textAlign: 'center'
              }}>
                <Clock size={20} style={{ color: 'var(--text-muted)', margin: '0 auto 6px' }} />
                <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  Awaiting Response from {activeRequest.recipientOrg}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                  The assigned subsidiary nodal officer has not submitted the requested fields yet.
                </div>
              </div>
            )}

            {/* Clarification Notes Thread (if any) */}
            {activeRequest.clarificationNotes && activeRequest.clarificationNotes.length > 0 && (
              <div style={{ marginBottom: '20px' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: '#D97706', textTransform: 'uppercase', marginBottom: '8px' }}>
                  Clarification History & Directives
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {activeRequest.clarificationNotes.map((note, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: '10px 14px',
                        borderRadius: '6px',
                        backgroundColor: '#FFFBEB',
                        border: '1px solid #FDE68A',
                        fontSize: '12px',
                        color: '#92400E',
                        lineHeight: '1.5'
                      }}
                    >
                      <strong>Note #{idx + 1}:</strong> {note}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Contextual Action Bar */}
            <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '16px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {/* Respondent Actions */}
              {activeRequest.status !== 'completed' && (
                <button
                  onClick={() => setIsRespondModalOpen(true)}
                  className="btn btn-primary"
                  style={{ fontSize: '12px' }}
                >
                  <Send size={14} />
                  <span>{activeRequest.responseText ? 'Update Response' : 'Submit Response'}</span>
                </button>
              )}

              {/* Requester Actions (Ministry / CIL HQ) */}
              {can(currentUser, 'submissions.review') && (
                <>
                  <button
                    onClick={() => setIsClarificationModalOpen(true)}
                    className="btn btn-outline"
                    style={{ fontSize: '12px' }}
                  >
                    <AlertCircle size={14} style={{ color: '#D97706' }} />
                    <span>Request Clarification</span>
                  </button>

                  {activeRequest.status === 'submitted' && (
                    <button
                      onClick={() => {
                        updateRequestStatus(activeRequest.id, 'completed', 'Accepted for consolidation');
                        showToast(`Request marked as completed and accepted for report generation.`);
                      }}
                      className="btn btn-outline"
                      style={{ fontSize: '12px', color: '#10B981', borderColor: '#10B981' }}
                    >
                      <CheckCircle2 size={14} />
                      <span>Accept Response for Report</span>
                    </button>
                  )}
                </>
              )}

              <button
                onClick={() => {
                  navigateTo('/ask');
                }}
                className="btn btn-outline"
                style={{ fontSize: '12px' }}
              >
                <span>Inquire in Ask MineSetu</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="card-base" style={{ textAlign: 'center', padding: '60px' }}>
            <p style={{ color: 'var(--text-muted)' }}>Select an information request from the queue to view details.</p>
          </div>
        )}
      </div>

      {/* MODAL: Create Information Request */}
      {isCreateModalOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
          zIndex: 90
        }}>
          <div className="card-base" style={{ maxWidth: '600px', width: '100%', padding: '24px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)' }}>
                Create New Information Request
              </h3>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>
                  Request Subject / Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Urgent Return: Heavy Earth Moving Machinery Utilization"
                  value={reqSubject}
                  onChange={(e) => setReqSubject(e.target.value)}
                  style={{ width: '100%', height: '38px', padding: '0 12px', borderRadius: '6px', border: '1px solid var(--border-medium)', fontSize: '13px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>
                  Description & Operational Context *
                </label>
                <textarea
                  required
                  rows={3}
                  className="textarea-base"
                  placeholder="Detail the operational reason for this request, scope of excavation, and specific parameters needed..."
                  value={reqDescription}
                  onChange={(e) => setReqDescription(e.target.value)}
                  style={{ width: '100%', fontSize: '13px', lineHeight: '1.5' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>
                    Recipient Organization *
                  </label>
                  <select
                    value={reqRecipientOrg}
                    onChange={(e) => setReqRecipientOrg(e.target.value)}
                    style={{ width: '100%', height: '38px', padding: '0 10px', borderRadius: '6px', border: '1px solid var(--border-medium)', fontSize: '13px' }}
                  >
                    <option value="Eastern Coalfields Limited">Eastern Coalfields Limited (ECL)</option>
                    <option value="South Eastern Coalfields Limited">South Eastern Coalfields Limited (SECL)</option>
                    <option value="Northern Coalfields Limited">Northern Coalfields Limited (NCL)</option>
                    <option value="Central Mine Planning & Design Institute">CMPDI</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>
                    Reporting Period *
                  </label>
                  <input
                    type="text"
                    required
                    value={reqPeriod}
                    onChange={(e) => setReqPeriod(e.target.value)}
                    style={{ width: '100%', height: '38px', padding: '0 12px', borderRadius: '6px', border: '1px solid var(--border-medium)', fontSize: '13px' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>
                    Requested Data Fields (Comma-separated)
                  </label>
                  <input
                    type="text"
                    value={reqFields}
                    onChange={(e) => setReqFields(e.target.value)}
                    placeholder="e.g. Coal Production, Rail Despatch"
                    style={{ width: '100%', height: '38px', padding: '0 12px', borderRadius: '6px', border: '1px solid var(--border-medium)', fontSize: '13px' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>
                    Submission Due Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={reqDueDate}
                    onChange={(e) => setReqDueDate(e.target.value)}
                    style={{ width: '100%', height: '38px', padding: '0 12px', borderRadius: '6px', border: '1px solid var(--border-medium)', fontSize: '13px' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>
                  Optional Reference Document Attachments
                </label>
                <div style={{ maxHeight: '120px', overflowY: 'auto', border: '1px solid var(--border-subtle)', borderRadius: '6px', padding: '8px' }}>
                  {documents.slice(0, 5).map(doc => {
                    const isChecked = attachedDocIds.includes(doc.id);
                    return (
                      <label key={doc.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', padding: '4px 0', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            if (e.target.checked) setAttachedDocIds([...attachedDocIds, doc.id]);
                            else setAttachedDocIds(attachedDocIds.filter(id => id !== doc.id));
                          }}
                        />
                        <span>{doc.title} ({doc.subsidiaryCode})</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div style={{
                fontSize: '11px',
                color: 'var(--text-muted)',
                backgroundColor: 'var(--bg-app)',
                padding: '8px 12px',
                borderRadius: '6px'
              }}>
                <strong>Demonstration Note:</strong> Submitting will record this request in local state and simulate dispatch to the recipient organization.
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="btn btn-outline"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                >
                  <Send size={14} /> Send Information Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Submit Response */}
      {isRespondModalOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
          zIndex: 90
        }}>
          <div className="card-base" style={{ maxWidth: '600px', width: '100%', padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)' }}>
                Respond to Request: {activeRequest?.requestNumber}
              </h3>
              <button
                onClick={() => setIsRespondModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleResponseSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>
                  Response Narrative & Verified Data Figures *
                </label>
                <textarea
                  required
                  rows={5}
                  className="textarea-base"
                  placeholder="Provide authoritative figures, colliery breakdown, machinery availability percentages, and operational remarks..."
                  value={responseText}
                  onChange={(e) => setResponseText(e.target.value)}
                  style={{ width: '100%', fontSize: '13px', lineHeight: '1.5' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>
                  Attach Supporting Documents (Evidence)
                </label>
                <div style={{ maxHeight: '120px', overflowY: 'auto', border: '1px solid var(--border-subtle)', borderRadius: '6px', padding: '8px' }}>
                  {documents.map(doc => {
                    const isChecked = responseAttachedDocIds.includes(doc.id);
                    return (
                      <label key={doc.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', padding: '4px 0', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            if (e.target.checked) setResponseAttachedDocIds([...responseAttachedDocIds, doc.id]);
                            else setResponseAttachedDocIds(responseAttachedDocIds.filter(id => id !== doc.id));
                          }}
                        />
                        <span>{doc.title} ({doc.subsidiaryCode})</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
                <button
                  type="button"
                  onClick={() => setIsRespondModalOpen(false)}
                  className="btn btn-outline"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                >
                  <CheckCircle2 size={14} /> Submit Response
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Request Clarification */}
      {isClarificationModalOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
          zIndex: 90
        }}>
          <div className="card-base" style={{ maxWidth: '500px', width: '100%', padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)' }}>
                Request Clarification from Submitter
              </h3>
              <button
                onClick={() => setIsClarificationModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleClarificationSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>
                  Clarification Directive / Question *
                </label>
                <textarea
                  required
                  rows={4}
                  className="textarea-base"
                  placeholder="Specify what figures appear inconsistent, missing colliery names, or unverified claims needing clarification..."
                  value={clarificationText}
                  onChange={(e) => setClarificationText(e.target.value)}
                  style={{ width: '100%', fontSize: '13px', lineHeight: '1.5' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
                <button
                  type="button"
                  onClick={() => setIsClarificationModalOpen(false)}
                  className="btn btn-outline"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ backgroundColor: '#D97706', borderColor: '#D97706' }}
                >
                  <AlertCircle size={14} /> Send Clarification Directive
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
