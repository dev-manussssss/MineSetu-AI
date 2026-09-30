import React, { useState } from 'react';
import {
  Sparkles,
  Send,
  AlertTriangle,
  ExternalLink,
  ShieldCheck,
  BookOpen
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import type { AIQueryResponse } from '../types';
import { MOCK_SUBSIDIARIES } from '../data/mockMiningData';

export const QueryPage: React.FC = () => {
  const { currentUser, executeAIQuery, navigateTo, selectDocument } = useApp();
  const [queryText, setQueryText] = useState('');
  const [subsidiaryFilter, setSubsidiaryFilter] = useState(currentUser.subsidiaryCode || 'ALL');
  const [isLoading, setIsLoading] = useState(false);
  const [activeResponse, setActiveResponse] = useState<AIQueryResponse | null>(null);

  const SUGGESTED_QUERIES = [
    'What was the monthly coal production and OB removal at Rajmahal OCP?',
    'What is the surface miner operating uptime and production at Gevra Mega Project?',
    'What is the overall safety audit compliance score for mechanized HEMM?',
    'What are the uranium reserves in central mining zones?' // Demonstrates anti-hallucination guardrail
  ];

  const handleRunQuery = async (queryToRun: string) => {
    if (!queryToRun.trim()) return;
    setIsLoading(true);
    setActiveResponse(null);
    try {
      const res = await executeAIQuery(queryToRun, subsidiaryFilter);
      setActiveResponse(res);
    } catch (err: any) {
      alert('AI Query failed: ' + (err.message || 'Unknown error'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleRunQuery(queryText);
  };

  return (
    <div>
      {/* Top Header */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)' }}>
            AI-Based Query & Source-Grounded RAG
          </h1>
          <span className="badge badge-match">SIH Module 3</span>
        </div>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px' }}>
          Strictly grounded retrieval across approved MDMS returns with mandatory document and page citations
        </p>
      </div>

      {/* Query Input Card */}
      <div className="card-base" style={{ padding: '24px', marginBottom: '24px' }}>
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={18} style={{ color: 'var(--accent-primary)' }} />
              <span style={{ fontSize: '13px', fontWeight: 700 }}>Enter Operational Inquiry</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Retrieval Scope:</span>
              <select
                value={subsidiaryFilter}
                onChange={(e) => setSubsidiaryFilter(e.target.value)}
                disabled={Boolean(currentUser.subsidiaryCode)}
                style={{
                  height: '32px',
                  padding: '0 8px',
                  borderRadius: '6px',
                  border: '1px solid var(--border-medium)',
                  fontSize: '12px',
                  backgroundColor: '#FFFFFF',
                  cursor: 'pointer'
                }}
              >
                <option value="ALL">All Subsidiaries</option>
                {MOCK_SUBSIDIARIES.map(s => (
                  <option key={s.code} value={s.code}>{s.code}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ position: 'relative', marginBottom: '16px' }}>
            <textarea
              rows={3}
              value={queryText}
              onChange={(e) => setQueryText(e.target.value)}
              placeholder="e.g. Inquire about monthly coal excavation, overburden removal rates, rail despatch rakes, or safety audit compliance..."
              style={{
                width: '100%',
                padding: '12px 14px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-medium)',
                fontSize: '14px',
                fontFamily: 'inherit',
                color: 'var(--text-primary)',
                outline: 'none',
                resize: 'none'
              }}
            />
          </div>

          {/* Suggested Prompt Chips */}
          <div style={{ marginBottom: '16px' }}>
            <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
              Suggested Grounded Queries:
            </span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {SUGGESTED_QUERIES.map((q, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setQueryText(q);
                    handleRunQuery(q);
                  }}
                  style={{
                    padding: '6px 12px',
                    borderRadius: 'var(--radius-full)',
                    backgroundColor: 'var(--bg-app)',
                    border: '1px solid var(--border-subtle)',
                    fontSize: '12px',
                    color: 'var(--text-secondary)',
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button
              type="submit"
              disabled={isLoading || !queryText.trim()}
              className="btn btn-primary btn-pill"
              style={{ padding: '9px 24px', fontSize: '13px' }}
            >
              {isLoading ? (
                <span>Retrieving Grounded Sources...</span>
              ) : (
                <>
                  <Send size={14} />
                  <span>Execute Grounded Query</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Query Results Presentation */}
      {isLoading && (
        <div className="card-base" style={{ textAlign: 'center', padding: '48px 24px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            border: '3px solid var(--border-subtle)',
            borderTopColor: 'var(--accent-primary)',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }} />
          <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
            Retrieving Verified Documents & Synthesizing Grounded Response...
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
            Applying strict anti-hallucination verification
          </div>
        </div>
      )}

      {activeResponse && !isLoading && (
        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '24px' }}>
          {/* Left Column: AI Answer & Grounding Status */}
          <div className="card-base" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={18} style={{ color: 'var(--accent-primary)' }} />
                <h3 style={{ fontSize: '16px', fontWeight: 700 }}>Synthesized Response</h3>
              </div>
              <span className={`badge ${
                activeResponse.status === 'sufficient' ? 'badge-success' : 'badge-warning'
              }`}>
                {activeResponse.status === 'sufficient' ? '100% Grounded in Sources' : 'Insufficient Evidence'}
              </span>
            </div>

            {/* Answer Text */}
            <div style={{
              fontSize: '14px',
              lineHeight: '1.7',
              color: 'var(--text-primary)',
              backgroundColor: 'var(--bg-app)',
              padding: '18px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
              marginBottom: '20px'
            }}>
              {activeResponse.answer}
            </div>

            {/* Guardrail Disclaimer */}
            <div style={{
              fontSize: '12px',
              color: 'var(--text-muted)',
              borderTop: '1px solid var(--border-subtle)',
              paddingTop: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <ShieldCheck size={14} style={{ color: '#10B981' }} />
              <span>
                Assisted Response. Figures are derived from validated operational returns with document lineage.
              </span>
            </div>

            {/* Suggested Follow-ups */}
            {activeResponse.suggestedFollowUps && activeResponse.suggestedFollowUps.length > 0 && (
              <div style={{ marginTop: '16px' }}>
                <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  Suggested Follow-up Inquiries:
                </span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '6px' }}>
                  {activeResponse.suggestedFollowUps.map((fu, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setQueryText(fu);
                        handleRunQuery(fu);
                      }}
                      style={{
                        textAlign: 'left',
                        padding: '6px 10px',
                        borderRadius: '6px',
                        backgroundColor: '#FFFFFF',
                        border: '1px solid var(--border-subtle)',
                        fontSize: '12px',
                        color: 'var(--accent-primary)',
                        cursor: 'pointer'
                      }}
                    >
                      → {fu}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Grounded Sources & Citations */}
          <div className="card-base" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <BookOpen size={18} style={{ color: 'var(--accent-primary)' }} />
                <h3 style={{ fontSize: '15px', fontWeight: 700 }}>Supporting Citations</h3>
              </div>
              <span className="badge badge-match">
                {activeResponse.sources.length} Verified Sources
              </span>
            </div>

            {activeResponse.sources.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '32px 16px', color: 'var(--text-muted)', fontSize: '13px' }}>
                <AlertTriangle size={24} style={{ color: '#F59E0B', margin: '0 auto 8px' }} />
                No source documents contained supporting evidence for this inquiry. As per guidelines, AI refuses to fabricate figures.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {activeResponse.sources.map((src, idx) => (
                  <div
                    key={idx}
                    style={{
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-md)',
                      padding: '14px',
                      backgroundColor: '#FFFFFF'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span className="badge" style={{ backgroundColor: '#F1F5F9', color: '#0F172A', fontWeight: 700 }}>
                        {src.subsidiary}
                      </span>
                      <span className="badge badge-success">
                        Page {src.pageNumber}
                      </span>
                    </div>

                    <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
                      {src.documentTitle}
                    </div>

                    <div style={{
                      fontSize: '12px',
                      color: 'var(--text-secondary)',
                      backgroundColor: 'var(--bg-surface-muted)',
                      padding: '8px',
                      borderRadius: '4px',
                      fontStyle: 'italic',
                      lineHeight: '1.4'
                    }}>
                      "{src.excerpt}"
                    </div>

                    <button
                      onClick={() => {
                        selectDocument(src.documentId);
                        navigateTo('/documents/verify');
                      }}
                      style={{
                        marginTop: '8px',
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--accent-primary)',
                        fontSize: '11px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <ExternalLink size={12} /> Inspect Source Return
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
