import React, { useState } from 'react';
import {
  Files,
  UploadCloud,
  Search,
  CheckSquare,
  X
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { can } from '../lib/rbac';
import { MOCK_SUBSIDIARIES } from '../data/mockMiningData';

export const DocumentsPage: React.FC = () => {
  const { currentUser, documents, selectDocument, navigateTo, uploadDocument } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [subsidiaryFilter, setSubsidiaryFilter] = useState<string>(currentUser.subsidiaryCode || 'ALL');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadSubsidiary, setUploadSubsidiary] = useState(currentUser.subsidiaryCode || 'ECL');
  const [uploadColliery, setUploadColliery] = useState(currentUser.collieryName || 'Central Mine');
  const [isUploading, setIsUploading] = useState(false);

  // Scoped documents
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

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadTitle.trim()) return;

    setIsUploading(true);
    try {
      const newId = await uploadDocument({
        title: uploadTitle,
        subsidiaryCode: uploadSubsidiary,
        collieryName: uploadColliery,
        fileName: `${uploadSubsidiary}_${uploadColliery.replace(/\s+/g, '_')}_Return.pdf`,
        fileSize: '2.2 MB',
        pageCount: 3,
        extractedSummary: 'Daily coal production and overburden log extracted from scanned report form.'
      });
      setIsUploadModalOpen(false);
      setUploadTitle('');
      selectDocument(newId);
      navigateTo('/documents/verify');
    } catch (err: any) {
      alert(err.message || 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div>
      {/* Top Action Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)' }}>
            Document Ingestion & Archive
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px' }}>
            Optical character recognition and extraction pipeline across multi-subsidiary returns
          </p>
        </div>

        {can(currentUser, 'documents.upload') && (
          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="btn btn-primary btn-pill"
            style={{ padding: '8px 20px', fontSize: '13px' }}
          >
            <UploadCloud size={16} />
            <span>Upload New Return</span>
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="card-base" style={{ padding: '16px 20px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          {/* Search Input */}
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
              <option value="ALL">All Statuses</option>
              <option value="needs_review">Needs Review</option>
              <option value="partially_extracted">Partially Extracted</option>
              <option value="approved">Approved</option>
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
                cursor: 'pointer'
              }}
            >
              <option value="ALL">All Subsidiaries</option>
              {MOCK_SUBSIDIARIES.map(s => (
                <option key={s.code} value={s.code}>{s.code} - {s.name.split(' ')[0]}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Documents Table */}
      <div className="table-container">
        <table className="table-base">
          <thead>
            <tr>
              <th>Document Title & File</th>
              <th>Subsidiary</th>
              <th>Colliery / Mine</th>
              <th>Status</th>
              <th>OCR Confidence</th>
              <th>Uploaded By</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredDocs.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
                  No documents found matching the selected filter criteria.
                </td>
              </tr>
            ) : (
              filteredDocs.map(doc => {
                const isNeedsReview = doc.status === 'needs_review' || doc.status === 'partially_extracted';
                return (
                  <tr key={doc.id}>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{doc.title}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                        {doc.fileName} • {doc.fileSize} • {doc.pageCount} pages
                      </div>
                    </td>
                    <td>
                      <span className="badge" style={{ backgroundColor: '#F1F5F9', color: '#1E293B', fontWeight: 700 }}>
                        {doc.subsidiaryCode}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: '13px', fontWeight: 500 }}>{doc.collieryName}</span>
                    </td>
                    <td>
                      <span className={`badge ${
                        doc.status === 'approved' ? 'badge-success' :
                        isNeedsReview ? 'badge-warning' : 'badge-info'
                      }`}>
                        {doc.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontWeight: 700, fontSize: '13px' }}>{doc.ocrConfidence}%</span>
                        <div style={{
                          width: '60px',
                          height: '6px',
                          borderRadius: '3px',
                          backgroundColor: '#E2E8F0',
                          overflow: 'hidden'
                        }}>
                          <div style={{
                            width: `${doc.ocrConfidence}%`,
                            height: '100%',
                            backgroundColor: doc.ocrConfidence > 90 ? '#10B981' : doc.ocrConfidence > 80 ? '#F59E0B' : '#EF4444'
                          }} />
                        </div>
                      </div>
                    </td>
                    <td>
                      <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{doc.uploadedBy.split('(')[0]}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{new Date(doc.uploadedAt).toLocaleDateString()}</div>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '6px' }}>
                        <button
                          onClick={() => {
                            selectDocument(doc.id);
                            navigateTo('/documents/verify');
                          }}
                          className="btn btn-outline"
                          style={{ padding: '6px 12px', fontSize: '12px' }}
                          title="Verify Extracted Data"
                        >
                          <CheckSquare size={13} />
                          <span>{can(currentUser, 'documents.verify') ? 'Verify' : 'Inspect'}</span>
                        </button>
                        {can(currentUser, 'documents.approve') && (
                          <button
                            onClick={() => {
                              selectDocument(doc.id);
                              navigateTo('/compare');
                            }}
                            className="btn btn-outline"
                            style={{ padding: '6px 10px', fontSize: '12px' }}
                            title="Compare against baseline"
                          >
                            <span>Compare</span>
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

      {/* Upload Document Modal */}
      {isUploadModalOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          padding: '20px'
        }}>
          <div className="card-base" style={{ maxWidth: '520px', width: '100%', padding: '28px', backgroundColor: '#FFFFFF' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <UploadCloud size={20} style={{ color: 'var(--accent-primary)' }} />
                <h3 style={{ fontSize: '18px', fontWeight: 700 }}>Upload Mining Return</h3>
              </div>
              <button
                onClick={() => setIsUploadModalOpen(false)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                    Document Title / Return Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Kusmunda OCP Daily Coal Despatch Return"
                    value={uploadTitle}
                    onChange={(e) => setUploadTitle(e.target.value)}
                    style={{
                      width: '100%',
                      height: '38px',
                      padding: '0 12px',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-medium)',
                      fontSize: '13px'
                    }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                      Subsidiary
                    </label>
                    <select
                      value={uploadSubsidiary}
                      onChange={(e) => setUploadSubsidiary(e.target.value)}
                      style={{
                        width: '100%',
                        height: '38px',
                        padding: '0 10px',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--border-medium)',
                        fontSize: '13px'
                      }}
                    >
                      {MOCK_SUBSIDIARIES.map(s => (
                        <option key={s.code} value={s.code}>{s.code}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                      Colliery / Mine
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Kusmunda OCP"
                      value={uploadColliery}
                      onChange={(e) => setUploadColliery(e.target.value)}
                      style={{
                        width: '100%',
                        height: '38px',
                        padding: '0 12px',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--border-medium)',
                        fontSize: '13px'
                      }}
                    />
                  </div>
                </div>

                {/* Simulated File Dropzone */}
                <div style={{
                  border: '2px dashed var(--border-medium)',
                  borderRadius: 'var(--radius-md)',
                  padding: '24px 16px',
                  textAlign: 'center',
                  backgroundColor: 'var(--bg-app)'
                }}>
                  <Files size={28} style={{ color: 'var(--text-muted)', margin: '0 auto 8px' }} />
                  <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                    Drag & Drop PDF or Scanned TIFF / JPG
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                    Files are stored immutably and queued for OCR extraction (Max 15MB)
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
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
                  {isUploading ? 'Processing OCR...' : 'Upload & Start OCR'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
