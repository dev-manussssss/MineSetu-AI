import React, { useState } from 'react';
import {
  Printer,
  CheckCircle2,
  FileText,
  Plus,
  BookOpen,
  Edit2,
  X,
  FileSpreadsheet
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { MOCK_SUBSIDIARIES } from '../data/mockMiningData';

export const ReportsPage: React.FC = () => {
  const {
    currentUser,
    reports,
    selectedReportId,
    selectReport,
    createReportDraft,
    updateReportDraftText,
    documents
  } = useApp();

  const [activeTab, setActiveTab] = useState<'list' | 'builder' | 'preview'>('preview');
  const [isBuilderModalOpen, setIsBuilderModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Active Report Resolution
  const activeReport = reports.find(r => r.id === selectedReportId) || reports[0];

  // Report Builder Form State
  const [newTitle, setNewTitle] = useState('');
  const [newPeriod, setNewPeriod] = useState('July - September 2026');
  const [newScope, setNewScope] = useState<'national' | 'subsidiary' | 'colliery'>('national');
  const [selectedSubsidiary, setSelectedSubsidiary] = useState(currentUser.subsidiaryCode || 'ALL');
  const [selectedSources, setSelectedSources] = useState<string[]>(documents.slice(0, 3).map(d => d.id));
  const [exportFormats, setExportFormats] = useState<{ pdf: boolean; docx: boolean; xlsx: boolean }>({
    pdf: true,
    docx: true,
    xlsx: true
  });
  const [isGenerating, setIsGenerating] = useState(false);

  // Editing state for preview
  const [isEditingSummary, setIsEditingSummary] = useState(false);
  const [summaryEditText, setSummaryEditText] = useState(activeReport?.executiveSummary || '');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleCreateDraft = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      alert('Please enter a report title.');
      return;
    }

    setIsGenerating(true);
    setTimeout(() => {
      const newId = createReportDraft({
        title: newTitle,
        reportType: 'Executive Operational Brief',
        reportingPeriod: newPeriod,
        scope: newScope,
        selectedSubsidiaries: selectedSubsidiary === 'ALL' ? ['ECL', 'SECL', 'BCCL'] : [selectedSubsidiary],
        comparisonBasis: 'Baseline Comparison FY26',
        executiveSummary: `Consolidated operational assessment covering ${newPeriod}. Cross-subsidiary returns reflect stable mechanical utilization, with key production contributions audited across ${selectedSources.length} verified documents.`,
        sources: selectedSources.map(docId => {
          const doc = documents.find(d => d.id === docId);
          return doc ? `${doc.title} (Page 1)` : docId;
        }),
        draftStatus: 'draft',
        outputFormats: ['pdf', 'docx', 'xlsx']
      });

      setIsGenerating(false);
      setIsBuilderModalOpen(false);
      selectReport(newId);
      setActiveTab('preview');
      showToast('Draft report compiled and ready for preview.');
    }, 450);
  };

  const handleSaveSummary = () => {
    if (activeReport) {
      updateReportDraftText(activeReport.id, summaryEditText);
      setIsEditingSummary(false);
      showToast('Executive summary updated.');
    }
  };

  // REAL EXPORT FUNCTIONALITY: Generates actual files in the browser
  const exportPDF = () => {
    window.print();
    showToast('Print / PDF export dialog opened.');
  };

  const exportDocx = () => {
    if (!activeReport) return;
    const content = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head><title>${activeReport.title}</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; }
        h1 { color: #0F172A; }
        h2 { color: #1E293B; border-bottom: 1px solid #CBD5E1; padding-bottom: 4px; }
        .meta { color: #64748B; font-size: 12px; margin-bottom: 20px; }
        table { width: 100%; border-collapse: collapse; margin-top: 14px; }
        th, td { border: 1px solid #CBD5E1; padding: 8px 10px; font-size: 12px; }
        th { background: #F1F5F9; }
      </style>
      </head>
      <body>
        <h1>${activeReport.title}</h1>
        <div class="meta">
          <strong>Period:</strong> ${activeReport.reportingPeriod} | 
          <strong>Status:</strong> ${activeReport.draftStatus.toUpperCase()} (Draft) |
          <strong>Author:</strong> ${activeReport.author} |
          <strong>Date:</strong> ${new Date(activeReport.generatedAt).toLocaleDateString()}
        </div>
        <h2>1. Executive Summary</h2>
        <p>${activeReport.executiveSummary}</p>
        <h2>2. Operational Data Returns</h2>
        <table>
          <thead>
            <tr>
              <th>Subsidiary</th>
              <th>Colliery / Mine</th>
              <th>Raw Coal (Tonnes)</th>
              <th>OB Stripping (m³)</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${activeReport.metricsTable.map(m => `
              <tr>
                <td>${m.subsidiary}</td>
                <td>${m.mine}</td>
                <td>${m.coalTonnes}</td>
                <td>${m.obM3}</td>
                <td>${m.status}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        <h2>3. Supporting Citations</h2>
        <ul>
          ${activeReport.sources.map(s => `<li>${s}</li>`).join('')}
        </ul>
      </body>
      </html>
    `;
    const blob = new Blob([content], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `MineSetu_${activeReport.title.replace(/\s+/g, '_')}.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast('Word document (.doc) generated and downloaded.');
  };

  const exportExcel = () => {
    if (!activeReport) return;
    const rows = [
      ['MineSetu AI - Operational Report Export'],
      ['Report Title', activeReport.title],
      ['Reporting Period', activeReport.reportingPeriod],
      ['Author', activeReport.author],
      ['Generated At', activeReport.generatedAt],
      [''],
      ['Subsidiary', 'Colliery/Mine', 'Raw Coal (Tonnes)', 'Overburden (m³)', 'Status', 'Fidelity'],
      ...activeReport.metricsTable.map(m => [
        m.subsidiary,
        m.mine,
        m.coalTonnes,
        m.obM3,
        m.status,
        m.confidence
      ]),
      [''],
      ['Sources Cited:'],
      ...activeReport.sources.map(s => [s])
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map(e => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `MineSetu_${activeReport.title.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Excel/CSV spreadsheet generated and downloaded.');
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
              Reports & Executive Briefs
            </h1>
            <span className="badge badge-demo">Sample Reports</span>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px' }}>
            Compile verified operational figures into draft briefs with source citations and multi-format exports
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => setIsBuilderModalOpen(true)}
            className="btn btn-primary btn-pill"
            style={{ fontSize: '13px', padding: '8px 18px' }}
          >
            <Plus size={15} />
            <span>Create Report Draft</span>
          </button>
        </div>
      </div>

      {/* Primary Tab Navigation */}
      <div className="pill-tabs-bar" style={{ marginBottom: '24px' }}>
        <button
          onClick={() => setActiveTab('preview')}
          className={`pill-tab ${activeTab === 'preview' ? 'active' : ''}`}
        >
          Report Preview & Export
        </button>
        <button
          onClick={() => setActiveTab('list')}
          className={`pill-tab ${activeTab === 'list' ? 'active' : ''}`}
        >
          Reports Archive ({reports.length})
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB: PREVIEW & EXPORT WORKSPACE                                           */}
      {/* ========================================================================= */}
      {activeTab === 'preview' && activeReport && (
        <div className="split-grid-25-1">
          {/* Main Preview Document */}
          <div className="card-base report-preview-card" style={{ padding: '36px 40px', backgroundColor: '#FFFFFF' }}>
            {/* Header / Watermark */}
            <div style={{ borderBottom: '2px solid var(--border-medium)', paddingBottom: '16px', marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--accent-primary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  MineSetu AI · Executive Reporting Module
                </span>
                <span className="badge badge-match">Draft Report</span>
              </div>
              <h2 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)', margin: '4px 0 8px' }}>
                {activeReport.title}
              </h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '12px', color: 'var(--text-muted)', flexWrap: 'wrap' }}>
                <span><strong>Period:</strong> {activeReport.reportingPeriod}</span>
                <span><strong>Scope:</strong> {activeReport.scope.toUpperCase()}</span>
                <span><strong>Generated:</strong> {new Date(activeReport.generatedAt).toLocaleDateString()}</span>
                <span><strong>Compiled By:</strong> {activeReport.author}</span>
              </div>
            </div>

            {/* Disclaimer Callout */}
            <div style={{
              padding: '10px 14px',
              borderRadius: '6px',
              backgroundColor: 'var(--bg-app)',
              border: '1px solid var(--border-subtle)',
              fontSize: '11px',
              color: 'var(--text-secondary)',
              marginBottom: '24px'
            }}>
              <strong>Demonstration Notice:</strong> Figures synthesized from verified local returns. Exporting a draft does not constitute official statutory submission.
            </div>

            {/* 1. Executive Summary */}
            <div style={{ marginBottom: '28px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                  1. Executive Summary & Operational Findings
                </h3>
                {!isEditingSummary && (
                  <button
                    onClick={() => {
                      setSummaryEditText(activeReport.executiveSummary);
                      setIsEditingSummary(true);
                    }}
                    className="btn btn-outline"
                    style={{ padding: '2px 8px', fontSize: '11px' }}
                  >
                    <Edit2 size={11} /> Edit Summary
                  </button>
                )}
              </div>

              {isEditingSummary ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <textarea
                    rows={5}
                    className="textarea-base"
                    value={summaryEditText}
                    onChange={(e) => setSummaryEditText(e.target.value)}
                    style={{ width: '100%', fontSize: '13px', lineHeight: '1.6' }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                    <button
                      onClick={() => setIsEditingSummary(false)}
                      className="btn btn-outline"
                      style={{ padding: '4px 10px', fontSize: '11px' }}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveSummary}
                      className="btn btn-primary"
                      style={{ padding: '4px 12px', fontSize: '11px' }}
                    >
                      Save Summary
                    </button>
                  </div>
                </div>
              ) : (
                <p style={{ fontSize: '13px', lineHeight: '1.7', color: 'var(--text-secondary)', margin: 0 }}>
                  {activeReport.executiveSummary}
                </p>
              )}
            </div>

            {/* 2. Structured Metrics Table */}
            <div style={{ marginBottom: '28px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '12px' }}>
                2. Operational Excavation & Output Metrics
              </h3>
              <div style={{ border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                <div className="table-responsive">
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '12px' }}>
                  <thead style={{ backgroundColor: 'var(--bg-app)', borderBottom: '1px solid var(--border-medium)' }}>
                    <tr>
                      <th style={{ padding: '8px 12px' }}>Subsidiary</th>
                      <th style={{ padding: '8px 12px' }}>Colliery / Project</th>
                      <th style={{ padding: '8px 12px', textAlign: 'right' }}>Coal (Tonnes)</th>
                      <th style={{ padding: '8px 12px', textAlign: 'right' }}>OB Removal (m³)</th>
                      <th style={{ padding: '8px 12px' }}>Status</th>
                      <th style={{ padding: '8px 12px', textAlign: 'right' }}>Fidelity</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeReport.metricsTable.map((row, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                        <td style={{ padding: '10px 12px', fontWeight: 600 }}>{row.subsidiary}</td>
                        <td style={{ padding: '10px 12px' }}>{row.mine}</td>
                        <td style={{ padding: '10px 12px', textAlign: 'right', fontVariantNumeric: 'tabular-nums', fontWeight: 600 }}>
                          {row.coalTonnes}
                        </td>
                        <td style={{ padding: '10px 12px', textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
                          {row.obM3}
                        </td>
                        <td style={{ padding: '10px 12px' }}>
                          <span className={`badge ${row.status === 'Approved' ? 'badge-success' : 'badge-warning'}`} style={{ fontSize: '10px' }}>
                            {row.status}
                          </span>
                        </td>
                        <td style={{ padding: '10px 12px', textAlign: 'right', fontVariantNumeric: 'tabular-nums', color: 'var(--text-muted)' }}>
                          {row.confidence}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                </div>
              </div>
            </div>

            {/* 3. Citations & Lineage */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
                <BookOpen size={15} style={{ color: 'var(--accent-primary)' }} />
                <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                  3. Grounded Source Evidence Citations
                </h3>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {activeReport.sources.map((src, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: '8px 12px',
                      borderRadius: '6px',
                      backgroundColor: 'var(--bg-app)',
                      border: '1px solid var(--border-subtle)',
                      fontSize: '11px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <span>{src}</span>
                    <span className="badge badge-match" style={{ fontSize: '10px' }}>
                      Cited Source
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Export Actions Panel */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="card-base" style={{ padding: '20px' }}>
              <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '12px' }}>
                Multi-Format Export
              </div>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '16px' }}>
                Download validated draft figures directly to your workstation in standard enterprise formats.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <button
                  onClick={exportPDF}
                  className="btn btn-outline"
                  style={{ width: '100%', justifyContent: 'flex-start', fontSize: '12px', padding: '8px 12px' }}
                >
                  <Printer size={15} style={{ color: '#DC2626' }} />
                  <span>Export as PDF (Print)</span>
                </button>

                <button
                  onClick={exportDocx}
                  className="btn btn-outline"
                  style={{ width: '100%', justifyContent: 'flex-start', fontSize: '12px', padding: '8px 12px' }}
                >
                  <FileText size={15} style={{ color: '#2563EB' }} />
                  <span>Export as Word (.doc)</span>
                </button>

                <button
                  onClick={exportExcel}
                  className="btn btn-outline"
                  style={{ width: '100%', justifyContent: 'flex-start', fontSize: '12px', padding: '8px 12px' }}
                >
                  <FileSpreadsheet size={15} style={{ color: '#10B981' }} />
                  <span>Export as Excel / CSV (.csv)</span>
                </button>
              </div>
            </div>

            {/* Quick Switch Report Draft */}
            <div className="card-base" style={{ padding: '16px' }}>
              <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '10px' }}>
                Available Report Drafts ({reports.length})
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {reports.map(r => (
                  <button
                    key={r.id}
                    onClick={() => selectReport(r.id)}
                    style={{
                      padding: '8px 10px',
                      borderRadius: '6px',
                      border: r.id === activeReport.id ? '1px solid var(--accent-primary)' : '1px solid var(--border-subtle)',
                      backgroundColor: r.id === activeReport.id ? 'var(--accent-light)' : 'transparent',
                      textAlign: 'left',
                      cursor: 'pointer',
                      fontSize: '12px',
                      fontWeight: r.id === activeReport.id ? 700 : 500
                    }}
                  >
                    {r.title}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB: REPORTS ARCHIVE LIST                                                */}
      {/* ========================================================================= */}
      {activeTab === 'list' && (
        <div className="card-base" style={{ padding: 0, overflow: 'hidden' }}>
          <table className="data-table" style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-medium)', fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                <th style={{ padding: '12px 16px' }}>Report Title</th>
                <th style={{ padding: '12px 16px' }}>Reporting Period</th>
                <th style={{ padding: '12px 16px' }}>Scope</th>
                <th style={{ padding: '12px 16px' }}>Status</th>
                <th style={{ padding: '12px 16px' }}>Last Updated</th>
                <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody style={{ fontSize: '13px' }}>
              {reports.map(rep => (
                <tr key={rep.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '14px 16px', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {rep.title}
                  </td>
                  <td style={{ padding: '14px 16px', color: 'var(--text-secondary)' }}>
                    {rep.reportingPeriod}
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <span className="badge badge-match">{rep.scope.toUpperCase()}</span>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <span className="badge badge-info">{rep.draftStatus}</span>
                  </td>
                  <td style={{ padding: '14px 16px', color: 'var(--text-muted)' }}>
                    {new Date(rep.generatedAt).toLocaleDateString()}
                  </td>
                  <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                    <button
                      onClick={() => {
                        selectReport(rep.id);
                        setActiveTab('preview');
                      }}
                      className="btn btn-outline"
                      style={{ padding: '4px 10px', fontSize: '11px' }}
                    >
                      Open Preview
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* MODAL: Report Builder Configuration */}
      {isBuilderModalOpen && (
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
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                Configure New Draft Report
              </h3>
              <button
                onClick={() => setIsBuilderModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateDraft} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>
                  Report Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. FY 2026-27 Semi-Annual Operational & Production Brief"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  style={{ width: '100%', height: '38px', padding: '0 12px', borderRadius: '6px', border: '1px solid var(--border-medium)', fontSize: '13px' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>
                    Reporting Period *
                  </label>
                  <input
                    type="text"
                    required
                    value={newPeriod}
                    onChange={(e) => setNewPeriod(e.target.value)}
                    style={{ width: '100%', height: '38px', padding: '0 12px', borderRadius: '6px', border: '1px solid var(--border-medium)', fontSize: '13px' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>
                    Reporting Scope *
                  </label>
                  <select
                    value={newScope}
                    onChange={(e) => setNewScope(e.target.value as any)}
                    style={{ width: '100%', height: '38px', padding: '0 10px', borderRadius: '6px', border: '1px solid var(--border-medium)', fontSize: '13px' }}
                  >
                    <option value="national">National Multi-Subsidiary Scope</option>
                    <option value="subsidiary">Subsidiary Consolidated Scope</option>
                    <option value="colliery">Individual Colliery Scope</option>
                  </select>
                </div>

                {newScope === 'subsidiary' && (
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>
                      Target Subsidiary *
                    </label>
                    <select
                      value={selectedSubsidiary}
                      onChange={(e) => setSelectedSubsidiary(e.target.value)}
                      style={{ width: '100%', height: '38px', padding: '0 10px', borderRadius: '6px', border: '1px solid var(--border-medium)', fontSize: '13px' }}
                    >
                      <option value="ALL">All Subsidiaries (Consolidated)</option>
                      {MOCK_SUBSIDIARIES.map(s => (
                        <option key={s.code} value={s.code}>{s.code} - {s.name}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* Source Document Selection */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>
                  Select Supporting Evidence Returns ({selectedSources.length} selected)
                </label>
                <div style={{ maxHeight: '130px', overflowY: 'auto', border: '1px solid var(--border-subtle)', borderRadius: '6px', padding: '8px' }}>
                  {documents.map(doc => {
                    const isChecked = selectedSources.includes(doc.id);
                    return (
                      <label key={doc.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', padding: '4px 0', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            if (e.target.checked) setSelectedSources([...selectedSources, doc.id]);
                            else setSelectedSources(selectedSources.filter(id => id !== doc.id));
                          }}
                        />
                        <span>{doc.title} ({doc.subsidiaryCode})</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Output Formats Multi-Select */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>
                  Target Export Formats
                </label>
                <div style={{ display: 'flex', gap: '16px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={exportFormats.pdf}
                      onChange={(e) => setExportFormats({ ...exportFormats, pdf: e.target.checked })}
                    />
                    <span>PDF Document</span>
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={exportFormats.docx}
                      onChange={(e) => setExportFormats({ ...exportFormats, docx: e.target.checked })}
                    />
                    <span>Word (.doc / .docx)</span>
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={exportFormats.xlsx}
                      onChange={(e) => setExportFormats({ ...exportFormats, xlsx: e.target.checked })}
                    />
                    <span>Excel (.csv / .xlsx)</span>
                  </label>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setIsBuilderModalOpen(false)}
                  className="btn btn-outline"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isGenerating}
                  className="btn btn-primary"
                >
                  {isGenerating ? 'Synthesizing Figures...' : 'Compile Draft Brief'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
