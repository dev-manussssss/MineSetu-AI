import React, { useState } from 'react';
import {
  Download,
  Printer,
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { MOCK_SUBSIDIARIES } from '../data/mockMiningData';

export const ReportsPage: React.FC = () => {
  const { currentUser } = useApp();
  const [reportType, setReportType] = useState('production_offtake');
  const [selectedSubsidiary, setSelectedSubsidiary] = useState(currentUser.subsidiaryCode || 'ALL');
  const [timeRange, setTimeRange] = useState('Q2_2026');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedReport] = useState<any>({
    title: 'Quarterly Executive Operational Review (Q2 FY 2026)',
    period: 'July 1, 2026 – September 30, 2026',
    generatedAt: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
    author: `${currentUser.name} (${currentUser.roleLabel})`,
    executiveSummary: `During the second quarter of FY 2026, aggregate coal production across monitored Coal India subsidiaries maintained positive pacing at 98.4% of prorated targets. In particular, surface miner throughput at SECL (Gevra OCP) and mechanized dragline operations at NCL (Jayant OCP) demonstrated operational availability above 91%. In contrast, monsoon bench inundation at ECL (Rajmahal OCP) created localized despatch variances that were mitigated through FMC silo rail connectivity.`,
    metricsTable: [
      { subsidiary: 'SECL', mine: 'Gevra Mega OCP', coalTonnes: '524,300', obM3: '1,120,000', status: 'Approved', confidence: '99%' },
      { subsidiary: 'ECL', mine: 'Rajmahal OCP', coalTonnes: '45,210', obM3: '142,500', status: 'Verified', confidence: '94%' },
      { subsidiary: 'NCL', mine: 'Jayant OCP', coalTonnes: '348,000', obM3: '890,000', status: 'Approved', confidence: '99%' },
      { subsidiary: 'BCCL', mine: 'Moonidih UG', coalTonnes: '28,400', obM3: 'N/A (Washery)', status: 'Needs Review', confidence: '74%' },
      { subsidiary: 'CCL', mine: 'Piparwar OCP', coalTonnes: '82,100', obM3: '210,000', status: 'Approved', confidence: '94%' },
    ],
    sources: [
      'SECL_Gevra_ShiftSummary_0926.pdf (Page 1)',
      'ECL_Rajmahal_Monthly_Aug2026.pdf (Pages 1-2)',
      'NCL_Jayant_HEMM_Sep2026.pdf (Page 2)',
      'CCL_Piparwar_Despatch_Aug2026.pdf (Page 1)'
    ]
  });

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
    }, 400);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div>
      {/* Top Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)' }}>
              Automated Report Generation & Archive
            </h1>
            <span className="badge badge-match">SIH Module 1</span>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px' }}>
            Compile multi-subsidiary figures into verified executive briefs with full source citations
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={handlePrint}
            className="btn btn-outline btn-pill"
            style={{ fontSize: '12px', padding: '8px 16px' }}
          >
            <Printer size={14} />
            <span>Print Report</span>
          </button>
          <button
            onClick={handlePrint}
            className="btn btn-primary btn-pill"
            style={{ fontSize: '12px', padding: '8px 18px' }}
          >
            <Download size={14} />
            <span>Download Signed PDF</span>
          </button>
        </div>
      </div>

      {/* Report Configuration Bar */}
      <div className="card-base" style={{ padding: '20px', marginBottom: '24px' }}>
        <form onSubmit={handleGenerate}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', alignItems: 'flex-end' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                Report Framework
              </label>
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                style={{
                  width: '100%',
                  height: '38px',
                  padding: '0 10px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-medium)',
                  backgroundColor: '#FFFFFF',
                  fontSize: '13px'
                }}
              >
                <option value="production_offtake">Production & Offtake Review</option>
                <option value="overburden_stripping">Overburden Removal & HEMM Health</option>
                <option value="safety_dgms">DGMS Safety Compliance Audit</option>
                <option value="rail_logistics">Rail Despatch & Siding Congestion</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                Target Scope
              </label>
              <select
                value={selectedSubsidiary}
                onChange={(e) => setSelectedSubsidiary(e.target.value)}
                disabled={Boolean(currentUser.subsidiaryCode)}
                style={{
                  width: '100%',
                  height: '38px',
                  padding: '0 10px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-medium)',
                  backgroundColor: '#FFFFFF',
                  fontSize: '13px'
                }}
              >
                <option value="ALL">All Subsidiaries (National Overview)</option>
                {MOCK_SUBSIDIARIES.map(s => (
                  <option key={s.code} value={s.code}>{s.code} - {s.name.split(' ')[0]}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                Reporting Timeframe
              </label>
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                style={{
                  width: '100%',
                  height: '38px',
                  padding: '0 10px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-medium)',
                  backgroundColor: '#FFFFFF',
                  fontSize: '13px'
                }}
              >
                <option value="Q2_2026">Quarter 2 (Jul - Sep 2026)</option>
                <option value="AUG_2026">August 2026 Return Cycle</option>
                <option value="YTD_2026">FY 2026-27 Year-To-Date</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={isGenerating}
              className="btn btn-primary"
              style={{ height: '38px', padding: '0 20px', fontSize: '13px' }}
            >
              <Sparkles size={14} />
              <span>{isGenerating ? 'Compiling...' : 'Generate Report'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Report Document Sheet (White Paper Format) */}
      <div className="card-base" style={{ padding: '36px', backgroundColor: '#FFFFFF', maxWidth: '1000px', margin: '0 auto' }}>
        {/* Report Official Heading */}
        <div style={{ textAlign: 'center', borderBottom: '2px solid var(--border-subtle)', paddingBottom: '20px', marginBottom: '24px' }}>
          <div style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.08em', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            MDMS + Mindsetu AI • Operational Executive Reporting
          </div>
          <h2 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)', marginTop: '6px' }}>
            {generatedReport.title}
          </h2>
          <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Reporting Period: {generatedReport.period}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
            Compiled on {generatedReport.generatedAt} • Compiled by {generatedReport.author}
          </div>
        </div>

        {/* Executive Narrative Section */}
        <div style={{ marginBottom: '28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
            <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>
              1. Executive Narrative & Operational Overview
            </span>
            <span className="badge badge-info" style={{ fontSize: '10px' }}>
              AI-Assisted Synthesis
            </span>
          </div>

          <p style={{
            fontSize: '14px',
            lineHeight: '1.7',
            color: 'var(--text-secondary)',
            backgroundColor: 'var(--bg-app)',
            padding: '16px',
            borderRadius: 'var(--radius-md)',
            borderLeft: '4px solid var(--accent-primary)'
          }}>
            {generatedReport.executiveSummary}
          </p>
        </div>

        {/* Tabular Verified Operational Figures */}
        <div style={{ marginBottom: '28px' }}>
          <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '12px' }}>
            2. Verified Subsidiary Key Metrics
          </div>

          <div className="table-container">
            <table className="table-base">
              <thead>
                <tr>
                  <th>Subsidiary</th>
                  <th>Colliery / Mine</th>
                  <th>Coal Output (Tonnes)</th>
                  <th>OB Stripping (m³)</th>
                  <th>Verification Status</th>
                  <th>OCR Confidence</th>
                </tr>
              </thead>
              <tbody>
                {generatedReport.metricsTable.map((row: any, i: number) => (
                  <tr key={i}>
                    <td><strong>{row.subsidiary}</strong></td>
                    <td>{row.mine}</td>
                    <td style={{ fontWeight: 700 }}>{row.coalTonnes}</td>
                    <td>{row.obM3}</td>
                    <td>
                      <span className={`badge ${
                        row.status === 'Approved' ? 'badge-success' :
                        row.status === 'Verified' ? 'badge-info' : 'badge-warning'
                      }`}>
                        {row.status}
                      </span>
                    </td>
                    <td>{row.confidence}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Source References & Audit Footnote */}
        <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '16px' }}>
          <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>
            3. Grounded Document References & Lineage
          </div>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {generatedReport.sources.map((src: string, i: number) => (
              <li key={i} style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CheckCircle2 size={13} style={{ color: '#10B981' }} />
                <span>{src}</span>
              </li>
            ))}
          </ul>

          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '20px', fontStyle: 'italic', borderTop: '1px dashed #CBD5E1', paddingTop: '8px' }}>
            Notice: All metrics shown in this report are synthetic values generated for technical prototype demonstration. Not official CIL statutory returns.
          </div>
        </div>
      </div>
    </div>
  );
};
