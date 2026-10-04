import React, { useState } from 'react';
import {
  UploadCloud,
  Search,
  FileText,
  Plus,
  Trash2,
  Eye,
  CheckCircle2,
  Edit3,
  X
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { can } from '../lib/rbac';
import { MOCK_SUBSIDIARIES } from '../data/mockMiningData';
import type { ManualRecordField } from '../types';

export const DocumentsPage: React.FC = () => {
  const {
    currentUser,
    documents,
    manualRecords,
    addManualRecord,
    selectDocument,
    navigateTo,
    uploadDocument,
    deleteDocument,
    currentRoute
  } = useApp();

  // Active Tab: Archive vs Manual Entry (Defaults to manual if route is /documents/manual)
  const [userSelectedTab, setUserSelectedTab] = useState<'archive' | 'manual' | null>(null);
  const activeTab: 'archive' | 'manual' = userSelectedTab ?? (currentRoute === '/documents/manual' ? 'manual' : 'archive');
  const setActiveTab = (tab: 'archive' | 'manual') => setUserSelectedTab(tab);

  // Document Archive States
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [subsidiaryFilter, setSubsidiaryFilter] = useState<string>(currentUser.subsidiaryCode || 'ALL');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadCategory, setUploadCategory] = useState('Production Return');
  const [uploadPeriod, setUploadPeriod] = useState('August 2026');
  const [uploadSubsidiary, setUploadSubsidiary] = useState(currentUser.subsidiaryCode || 'ECL');
  const [uploadColliery, setUploadColliery] = useState(currentUser.collieryName || 'Central Mine');
  const [uploadTitle, setUploadTitle] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Manual Data Entry States
  const [recordTitle, setRecordTitle] = useState('');
  const [recordCategory, setRecordCategory] = useState<'production' | 'overburden' | 'geological' | 'safety' | 'despatch'>('production');
  const [recordPeriod, setRecordPeriod] = useState('August 2026');
  const [recordSubsidiary, setRecordSubsidiary] = useState(currentUser.subsidiaryCode || 'ECL');
  const [recordColliery, setRecordColliery] = useState(currentUser.collieryName || 'Rajmahal OCP');
  const [sourceDate, setSourceDate] = useState('2026-08-31');
  const [sourceExplanation, setSourceExplanation] = useState('Verified pithead weighbridge and shift log records.');
  const [notes, setNotes] = useState('');
  const [manualFields, setManualFields] = useState<ManualRecordField[]>([
    { id: 'f-1', fieldName: 'Raw Coal Production', value: '45210', unit: 'Tonnes', sourceNote: 'Shift log sheet summary' },
    { id: 'f-2', fieldName: 'Overburden Removal', value: '142500', unit: 'm³', sourceNote: 'Survey office volumetric calculation' },
    { id: 'f-3', fieldName: 'HEMM Fleet Availability', value: '88.5', unit: '%', sourceNote: 'Excavator & dumper daily logbook' }
  ]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Filtered documents
  const filteredDocs = documents.filter(doc => {
    if (subsidiaryFilter !== 'ALL' && doc.subsidiaryCode !== subsidiaryFilter) return false;
    if (statusFilter !== 'ALL' && doc.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        doc.title.toLowerCase().includes(q) ||
        doc.collieryName.toLowerCase().includes(q) ||
        doc.subsidiaryCode.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Handle Drag & Drop / File Select
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 10 * 1024 * 1024) {
        alert('File size exceeds 10 MB limit. Please select a smaller sample document.');
        return;
      }
      setSelectedFile(file);
      if (!uploadTitle) {
        setUploadTitle(file.name.replace(/\.[^/.]+$/, '').replace(/_/g, ' '));
      }
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadTitle.trim()) {
      alert('Please enter a document title.');
      return;
    }

    setIsUploading(true);
    try {
      const newId = await uploadDocument({
        title: uploadTitle,
        subsidiaryCode: uploadSubsidiary,
        collieryName: uploadColliery,
        fileName: selectedFile ? selectedFile.name : `${uploadSubsidiary}_Return.pdf`,
        fileSize: selectedFile ? `${(selectedFile.size / (1024 * 1024)).toFixed(1)} MB` : '1.8 MB',
        pageCount: 3,
        extractedSummary: `Scanned ${uploadCategory} covering ${uploadPeriod} at ${uploadColliery} (${uploadSubsidiary}). Ready for validation.`
      });

      setIsUploadModalOpen(false);
      setSelectedFile(null);
      setUploadTitle('');
      selectDocument(newId);
      showToast(`Document uploaded successfully and queued for extraction review.`);
      navigateTo('/documents/verify');
    } catch (err: any) {
      alert(err.message || 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  // Manual Form Field Handlers
  const handleAddFieldRow = () => {
    setManualFields([
      ...manualFields,
      {
        id: `f-${Date.now()}`,
        fieldName: '',
        value: '',
        unit: 'Tonnes',
        sourceNote: ''
      }
    ]);
  };

  const handleRemoveFieldRow = (id: string) => {
    if (manualFields.length <= 1) {
      alert('A record requires at least one field.');
      return;
    }
    setManualFields(manualFields.filter(f => f.id !== id));
  };

  const handleFieldChange = (id: string, key: keyof ManualRecordField, val: string) => {
    setManualFields(manualFields.map(f => (f.id === id ? { ...f, [key]: val } : f)));
  };

  const handleManualRecordSubmit = (status: 'draft' | 'submitted') => {
    if (!recordTitle.trim()) {
      alert('Please provide a record title.');
      return;
    }

    // Validate fields
    const invalidField = manualFields.find(f => !f.fieldName.trim() || !f.value.trim());
    if (invalidField) {
      alert('Please provide both field name and numeric/text value for each row.');
      return;
    }

    addManualRecord({
      title: recordTitle,
      category: recordCategory,
      reportingPeriod: recordPeriod,
      subsidiaryCode: recordSubsidiary,
      collieryName: recordColliery,
      sourceDate,
      sourceExplanation: sourceExplanation || 'Source not provided',
      status,
      fields: manualFields.map(f => ({
        id: f.id,
        fieldName: f.fieldName,
        value: f.value,
        unit: f.unit,
        sourceNote: f.sourceNote || 'Weighbridge / shift log entry'
      })),
      notes
    });

    showToast(
      status === 'submitted'
        ? `Manual record submitted for technical review.`
        : `Manual record saved as draft.`
    );

    // Reset form
    setRecordTitle('');
    setNotes('');
  };

  const handleDeleteDoc = (id: string, title: string) => {
    if (confirm(`Are you sure you want to remove "${title}" from the demonstration archive?`)) {
      deleteDocument(id);
      showToast('Document removed from local archive.');
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

      {/* Top Action Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)' }}>
              Documents & Dual Ingestion
            </h1>
            <span className="badge badge-demo">Sample Archive</span>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px' }}>
            Add reports, scanned returns, or enter structured figures directly with explicit units and source lineage
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {can(currentUser, 'documents.upload') && (
            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="btn btn-primary btn-pill"
              style={{ padding: '8px 18px', fontSize: '13px' }}
            >
              <UploadCloud size={16} />
              <span>Upload Document</span>
            </button>
          )}
          {can(currentUser, 'manual.entry') && (
            <button
              onClick={() => setActiveTab('manual')}
              className="btn btn-outline btn-pill"
              style={{ padding: '8px 18px', fontSize: '13px' }}
            >
              <Edit3 size={15} />
              <span>Enter Data Manually</span>
            </button>
          )}
        </div>
      </div>

      {/* Primary Tab Navigation */}
      <div className="pill-tabs-bar" style={{ marginBottom: '24px' }}>
        <button
          onClick={() => setActiveTab('archive')}
          className={`pill-tab ${activeTab === 'archive' ? 'active' : ''}`}
        >
          Document Library & Archive ({documents.length})
        </button>
        <button
          onClick={() => setActiveTab('manual')}
          className={`pill-tab ${activeTab === 'manual' ? 'active' : ''}`}
        >
          Manual Data Entry (First-Class)
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: DOCUMENT ARCHIVE & UPLOAD QUEUE                                   */}
      {/* ========================================================================= */}
      {activeTab === 'archive' && (
        <>
          {/* Filter and Search Bar */}
          <div className="card-base" style={{ padding: '16px 20px', marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
              {/* Search */}
              <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
                <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  placeholder="Search by title, colliery, or subsidiary..."
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

              {/* Status Filter */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>Status:</span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  style={{
                    height: '38px',
                    padding: '0 12px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-subtle)',
                    backgroundColor: 'var(--bg-surface)',
                    fontSize: '13px',
                    color: 'var(--text-primary)',
                    cursor: 'pointer'
                  }}
                >
                  <option value="ALL">All Documents</option>
                  <option value="needs_review">Needs Review</option>
                  <option value="partially_extracted">Partially Extracted</option>
                  <option value="approved">Approved & Searchable</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              {/* Subsidiary Filter */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>Subsidiary:</span>
                <select
                  value={subsidiaryFilter}
                  onChange={(e) => setSubsidiaryFilter(e.target.value)}
                  disabled={Boolean(currentUser.subsidiaryCode)}
                  style={{
                    height: '38px',
                    padding: '0 12px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-subtle)',
                    backgroundColor: 'var(--bg-surface)',
                    fontSize: '13px',
                    color: 'var(--text-primary)',
                    cursor: currentUser.subsidiaryCode ? 'not-allowed' : 'pointer'
                  }}
                >
                  <option value="ALL">All Subsidiaries</option>
                  {MOCK_SUBSIDIARIES.map(s => (
                    <option key={s.code} value={s.code}>{s.code} - {s.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Documents Table */}
          <div className="card-base" style={{ padding: 0, overflow: 'hidden' }}>
            <div className="table-responsive">
              <table className="data-table" style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-medium)', fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  <th style={{ padding: '12px 16px' }}>Document / File</th>
                  <th style={{ padding: '12px 16px' }}>Subsidiary / Colliery</th>
                  <th style={{ padding: '12px 16px' }}>Reporting Period</th>
                  <th style={{ padding: '12px 16px' }}>Extraction Confidence</th>
                  <th style={{ padding: '12px 16px' }}>Status</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody style={{ fontSize: '13px' }}>
                {filteredDocs.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ padding: '48px 16px', textAlign: 'center', color: 'var(--text-muted)' }}>
                      No documents found matching the selected filters.
                    </td>
                  </tr>
                ) : (
                  filteredDocs.map(doc => {
                    const isNeedsReview = doc.status === 'needs_review' || doc.status === 'partially_extracted';
                    return (
                      <tr key={doc.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                        <td style={{ padding: '14px 16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{
                              width: '32px',
                              height: '32px',
                              borderRadius: '6px',
                              backgroundColor: 'var(--accent-light)',
                              color: 'var(--accent-primary)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0
                            }}>
                              <FileText size={16} />
                            </div>
                            <div>
                              <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                                {doc.title}
                              </div>
                              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                                {doc.fileName} · {doc.fileSize} · {doc.pageCount} pages
                              </div>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '14px 16px' }}>
                          <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{doc.subsidiaryCode}</span>
                          <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block' }}>{doc.collieryName}</span>
                        </td>
                        <td style={{ padding: '14px 16px', color: 'var(--text-secondary)' }}>
                          August 2026
                        </td>
                        <td style={{ padding: '14px 16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{
                              flex: 1,
                              maxWidth: '80px',
                              height: '6px',
                              borderRadius: '3px',
                              backgroundColor: 'var(--border-subtle)',
                              overflow: 'hidden'
                            }}>
                              <div style={{
                                width: `${doc.ocrConfidence}%`,
                                height: '100%',
                                backgroundColor: doc.ocrConfidence > 90 ? '#10B981' : '#F59E0B'
                              }} />
                            </div>
                            <span style={{ fontSize: '11px', fontVariantNumeric: 'tabular-nums', fontWeight: 600 }}>
                              {doc.ocrConfidence.toFixed(1)}%
                            </span>
                          </div>
                        </td>
                        <td style={{ padding: '14px 16px' }}>
                          <span className={`badge ${isNeedsReview ? 'badge-warning' : 'badge-success'}`}>
                            {doc.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                            <button
                              onClick={() => {
                                selectDocument(doc.id);
                                navigateTo('/documents/verify');
                              }}
                              className="btn btn-outline"
                              style={{ padding: '4px 10px', fontSize: '11px' }}
                            >
                              <Eye size={12} /> Workbench
                            </button>
                            {can(currentUser, 'documents.upload') && (
                              <button
                                onClick={() => handleDeleteDoc(doc.id, doc.title)}
                                className="btn btn-outline"
                                style={{ padding: '4px 8px', fontSize: '11px', color: '#DC2626' }}
                                title="Remove document"
                              >
                                <Trash2 size={12} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
            </div>
          </div>
        </>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: MANUAL DATA ENTRY (FIRST-CLASS INGESTION)                          */}
      {/* ========================================================================= */}
      {activeTab === 'manual' && (
        <div className="split-grid-16-1">
          {/* Left Column: Structured Entry Form */}
          <div className="card-base" style={{ padding: '24px' }}>
            <div style={{ marginBottom: '20px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                Manual Mining Return Entry
              </h2>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                Enter operational figures directly into the verified data stream without requiring a scanned PDF upload.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Record Title */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>
                  Record Title / Return Identification *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rajmahal OCP Pit 3 Coal Extraction Log - Shift B"
                  value={recordTitle}
                  onChange={(e) => setRecordTitle(e.target.value)}
                  style={{ width: '100%', height: '38px', padding: '0 12px', borderRadius: '6px', border: '1px solid var(--border-medium)', fontSize: '13px' }}
                />
              </div>

              {/* Category & Reporting Period */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>
                    Operational Category *
                  </label>
                  <select
                    value={recordCategory}
                    onChange={(e) => setRecordCategory(e.target.value as any)}
                    style={{ width: '100%', height: '38px', padding: '0 10px', borderRadius: '6px', border: '1px solid var(--border-medium)', fontSize: '13px' }}
                  >
                    <option value="production">Coal Production</option>
                    <option value="overburden">Overburden Removal</option>
                    <option value="geological">Geological & Reserve Data</option>
                    <option value="safety">DGMS Safety & Environmental Log</option>
                    <option value="despatch">Coal Despatch & Offtake</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>
                    Reporting Period *
                  </label>
                  <input
                    type="text"
                    required
                    value={recordPeriod}
                    onChange={(e) => setRecordPeriod(e.target.value)}
                    style={{ width: '100%', height: '38px', padding: '0 12px', borderRadius: '6px', border: '1px solid var(--border-medium)', fontSize: '13px' }}
                  />
                </div>
              </div>

              {/* Subsidiary & Mine */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>
                    Subsidiary Scope *
                  </label>
                  <select
                    value={recordSubsidiary}
                    onChange={(e) => setRecordSubsidiary(e.target.value)}
                    style={{ width: '100%', height: '38px', padding: '0 10px', borderRadius: '6px', border: '1px solid var(--border-medium)', fontSize: '13px' }}
                  >
                    {MOCK_SUBSIDIARIES.map(s => (
                      <option key={s.code} value={s.code}>{s.code} - {s.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>
                    Colliery / Project Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={recordColliery}
                    onChange={(e) => setRecordColliery(e.target.value)}
                    style={{ width: '100%', height: '38px', padding: '0 12px', borderRadius: '6px', border: '1px solid var(--border-medium)', fontSize: '13px' }}
                  />
                </div>
              </div>

              {/* Source Date & Explanation */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.6fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>
                    Source Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={sourceDate}
                    onChange={(e) => setSourceDate(e.target.value)}
                    style={{ width: '100%', height: '38px', padding: '0 12px', borderRadius: '6px', border: '1px solid var(--border-medium)', fontSize: '13px' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>
                    Source Description / Reference *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Weighbridge slip #9012, Colliery register vol IV"
                    value={sourceExplanation}
                    onChange={(e) => setSourceExplanation(e.target.value)}
                    style={{ width: '100%', height: '38px', padding: '0 12px', borderRadius: '6px', border: '1px solid var(--border-medium)', fontSize: '13px' }}
                  />
                </div>
              </div>

              {/* Dynamic Field Rows */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)' }}>
                    Field-Level Metrics ({manualFields.length})
                  </label>
                  <button
                    type="button"
                    onClick={handleAddFieldRow}
                    className="btn btn-outline"
                    style={{ padding: '4px 10px', fontSize: '11px' }}
                  >
                    <Plus size={12} /> Add Field
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {manualFields.map((field) => (
                    <div
                      key={field.id}
                      className="manual-field-row"
                      style={{
                        padding: '8px 10px',
                        borderRadius: '6px',
                        backgroundColor: 'var(--bg-app)',
                        border: '1px solid var(--border-subtle)'
                      }}
                    >
                      <input
                        type="text"
                        placeholder="Field Name (e.g. Raw Coal)"
                        value={field.fieldName}
                        onChange={(e) => handleFieldChange(field.id, 'fieldName', e.target.value)}
                        style={{ height: '32px', padding: '0 8px', borderRadius: '4px', border: '1px solid var(--border-medium)', fontSize: '12px' }}
                      />
                      <input
                        type="text"
                        placeholder="Value"
                        value={field.value}
                        onChange={(e) => handleFieldChange(field.id, 'value', e.target.value)}
                        style={{ height: '32px', padding: '0 8px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-medium)', fontSize: '12px', fontVariantNumeric: 'tabular-nums' }}
                      />
                      <select
                        value={field.unit}
                        onChange={(e) => handleFieldChange(field.id, 'unit', e.target.value)}
                        style={{ height: '32px', padding: '0 6px', borderRadius: '4px', border: '1px solid var(--border-medium)', fontSize: '12px' }}
                      >
                        <option value="Tonnes">Tonnes (T)</option>
                        <option value="m³">m³</option>
                        <option value="%">%</option>
                        <option value="Hours">Hours</option>
                        <option value="Rakes">Rakes</option>
                        <option value="₹ Crore">₹ Crore</option>
                      </select>
                      <input
                        type="text"
                        placeholder="Source Reference"
                        value={field.sourceNote || ''}
                        onChange={(e) => handleFieldChange(field.id, 'sourceNote', e.target.value)}
                        style={{ height: '32px', padding: '0 8px', borderRadius: '4px', border: '1px solid var(--border-medium)', fontSize: '12px' }}
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveFieldRow(field.id)}
                        style={{ background: 'none', border: 'none', color: '#DC2626', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        title="Remove row"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Optional Notes */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>
                  Auditor Remarks & Notes (Optional)
                </label>
                <textarea
                  rows={2}
                  className="textarea-base"
                  placeholder="Record any calibration remarks, physical survey discrepancies, or weather impacts..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  style={{ width: '100%', fontSize: '12px', lineHeight: '1.5' }}
                />
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', paddingTop: '12px', borderTop: '1px solid var(--border-subtle)' }}>
                <button
                  type="button"
                  onClick={() => handleManualRecordSubmit('draft')}
                  className="btn btn-outline"
                  style={{ fontSize: '13px' }}
                >
                  Save as Draft
                </button>
                <button
                  type="button"
                  onClick={() => handleManualRecordSubmit('submitted')}
                  className="btn btn-primary"
                  style={{ fontSize: '13px' }}
                >
                  <CheckCircle2 size={15} /> Submit for Technical Review
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Existing Manual Records Ledger */}
          <div className="card-base" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                Existing Manual Entries ({manualRecords.length})
              </h3>
              <span className="badge badge-demo">Local Session</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {manualRecords.map(rec => (
                <div
                  key={rec.id}
                  style={{
                    padding: '12px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-subtle)',
                    backgroundColor: 'var(--bg-app)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {rec.title}
                    </span>
                    <span className={`badge ${rec.status === 'accepted' ? 'badge-success' : 'badge-info'}`} style={{ fontSize: '10px' }}>
                      {rec.status}
                    </span>
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    {rec.subsidiaryCode} · {rec.collieryName} · Period: {rec.reportingPeriod}
                  </div>
                  <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px dashed var(--border-subtle)', fontSize: '11px' }}>
                    <strong>Metrics:</strong> {rec.fields.map(f => `${f.fieldName}: ${f.value} ${f.unit}`).join(', ')}
                  </div>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '4px' }}>
                    Source: {rec.sourceExplanation || 'Source not provided'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Upload New Document */}
      {isUploadModalOpen && (
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
          <div className="card-base" style={{ maxWidth: '580px', width: '100%', padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                  Upload Operational Document
                </h3>
                <span className="badge badge-demo">Simulated OCR</span>
              </div>
              <button
                onClick={() => setIsUploadModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {/* Dropzone Container */}
              <div style={{
                border: '2px dashed var(--border-medium)',
                borderRadius: 'var(--radius-md)',
                padding: '24px',
                textAlign: 'center',
                backgroundColor: 'var(--bg-app)',
                cursor: 'pointer'
              }}>
                <UploadCloud size={36} style={{ color: 'var(--accent-primary)', margin: '0 auto 8px' }} />
                <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {selectedFile ? selectedFile.name : 'Drag files here or browse device'}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Supported formats: PDF, DOCX, XLSX, CSV, scanned PDF (&lt; 10 MB)
                </div>
                <input
                  type="file"
                  accept=".pdf,.docx,.xlsx,.csv,image/*"
                  onChange={handleFileChange}
                  style={{ marginTop: '12px', fontSize: '12px' }}
                />
              </div>

              {/* Title & Category */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>
                    Document Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. ECL Rajmahal OCP Production Return"
                    value={uploadTitle}
                    onChange={(e) => setUploadTitle(e.target.value)}
                    style={{ width: '100%', height: '38px', padding: '0 12px', borderRadius: '6px', border: '1px solid var(--border-medium)', fontSize: '13px' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>
                    Category *
                  </label>
                  <select
                    value={uploadCategory}
                    onChange={(e) => setUploadCategory(e.target.value)}
                    style={{ width: '100%', height: '38px', padding: '0 10px', borderRadius: '6px', border: '1px solid var(--border-medium)', fontSize: '13px' }}
                  >
                    <option value="Production Return">Production Return</option>
                    <option value="Geological Survey">Geological Survey</option>
                    <option value="Washery Audit">Washery Audit</option>
                    <option value="DGMS Safety Log">DGMS Safety Log</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>
                    Reporting Period *
                  </label>
                  <input
                    type="text"
                    required
                    value={uploadPeriod}
                    onChange={(e) => setUploadPeriod(e.target.value)}
                    style={{ width: '100%', height: '38px', padding: '0 12px', borderRadius: '6px', border: '1px solid var(--border-medium)', fontSize: '13px' }}
                  />
                </div>
              </div>

              {/* Subsidiary & Colliery */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>
                    Subsidiary *
                  </label>
                  <select
                    value={uploadSubsidiary}
                    onChange={(e) => setUploadSubsidiary(e.target.value)}
                    style={{ width: '100%', height: '38px', padding: '0 10px', borderRadius: '6px', border: '1px solid var(--border-medium)', fontSize: '13px' }}
                  >
                    {MOCK_SUBSIDIARIES.map(s => (
                      <option key={s.code} value={s.code}>{s.code} - {s.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>
                    Colliery / Mine Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={uploadColliery}
                    onChange={(e) => setUploadColliery(e.target.value)}
                    style={{ width: '100%', height: '38px', padding: '0 12px', borderRadius: '6px', border: '1px solid var(--border-medium)', fontSize: '13px' }}
                  />
                </div>
              </div>

              <div style={{
                fontSize: '11px',
                color: 'var(--text-muted)',
                backgroundColor: 'var(--bg-app)',
                padding: '8px 12px',
                borderRadius: '6px'
              }}>
                <strong>Demonstration Note:</strong> Ingestion triggers simulated optical extraction. The document will immediately appear in the Validation Workbench for human verification.
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '6px' }}>
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  className="btn btn-outline"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUploading}
                  className="btn btn-primary"
                >
                  {isUploading ? 'Processing Extraction...' : 'Upload & Queue for Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
