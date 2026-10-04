import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  AlertTriangle,
  ExternalLink,
  BookOpen,
  Copy,
  Check,
  RotateCcw,
  Paperclip,
  BrainCircuit,
  FileText,
  X
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const QueryPage: React.FC = () => {
  const {
    currentUser,
    chatMessages,
    executeAIQuery,
    clearChat,
    navigateTo,
    selectDocument,
    documents
  } = useApp();

  const [queryText, setQueryText] = useState('');
  const [thinkingMode, setThinkingMode] = useState(false);
  const [attachedDocIds, setAttachedDocIds] = useState<string[]>([]);
  const [isAttachMenuOpen, setIsAttachMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const SUGGESTED_QUERIES = [
    'What was the monthly coal production and OB removal at Rajmahal OCP?',
    'What is the surface miner operating uptime and production at Gevra Mega Project?',
    'What is the overall safety audit compliance score for mechanized HEMM?',
    'What are the uranium reserves in central mining zones?' // Demonstrates anti-hallucination guardrail
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages, isLoading]);

  const handleRunQuery = async (queryToRun: string) => {
    if (!queryToRun.trim() || isLoading) return;
    setIsLoading(true);
    try {
      await executeAIQuery(queryToRun, thinkingMode, attachedDocIds);
      setQueryText('');
      setAttachedDocIds([]);
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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleRunQuery(queryText);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleCreateReportFromAnswer = (text: string) => {
    // Navigate to reports builder
    navigateTo('/reports');
    // Session state or message will guide report compilation
    console.log('Seeding report with answer:', text);
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', flexDirection: 'column', height: 'calc(100vh - 160px)' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)' }}>
              Ask MineSetu
            </h1>
            <span className="badge badge-neutral">Source-Grounded RAG</span>
            <span className="badge badge-neutral">Sample Data</span>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px' }}>
            Search records, understand operational figures, inspect citations and prepare reports
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={clearChat}
            className="btn btn-outline"
            style={{ fontSize: '12px', padding: '6px 12px' }}
            title="Start new inquiry task"
          >
            <RotateCcw size={13} />
            <span>Reset Conversation</span>
          </button>
        </div>
      </div>

      {/* Conversation Scroll Container */}
      <div
        className="card-base"
        style={{
          flex: 1,
          padding: '20px',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
          marginBottom: '16px',
          backgroundColor: '#FAFAFA'
        }}
      >
        {chatMessages.map(msg => {
          const isUser = msg.sender === 'user';
          return (
            <div
              key={msg.id}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: isUser ? 'flex-end' : 'flex-start',
                gap: '6px',
                width: '100%'
              }}
            >
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '11px',
                color: 'var(--text-muted)'
              }}>
                <span style={{ fontWeight: 600 }}>{isUser ? currentUser.name : 'MineSetu AI Assistant'}</span>
                <span>·</span>
                <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                {!isUser && <span className="badge badge-demo" style={{ fontSize: '9px', padding: '0 4px' }}>Demo Response</span>}
              </div>

              <div
                style={{
                  maxWidth: isUser ? '80%' : '92%',
                  padding: '16px 20px',
                  borderRadius: isUser ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                  backgroundColor: isUser ? 'var(--accent-primary)' : '#FFFFFF',
                  color: isUser ? '#FFFFFF' : 'var(--text-primary)',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                  border: isUser ? 'none' : '1px solid var(--border-subtle)',
                  fontSize: '13px',
                  lineHeight: '1.6'
                }}
              >
                <div style={{ whiteSpace: 'pre-wrap' }}>
                  {msg.text}
                </div>

                {/* Grounded Sources & Citations */}
                {msg.response && msg.response.sources && msg.response.sources.length > 0 && (
                  <div style={{
                    marginTop: '16px',
                    paddingTop: '12px',
                    borderTop: '1px solid var(--border-subtle)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                      <BookOpen size={14} style={{ color: 'var(--accent-primary)' }} />
                      <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-muted)' }}>
                        Supporting Sources & Evidence Citations
                      </span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {msg.response.sources.map((src, sIdx) => (
                        <div
                          key={sIdx}
                          style={{
                            padding: '10px 12px',
                            borderRadius: '6px',
                            backgroundColor: 'var(--bg-app)',
                            border: '1px solid var(--border-subtle)',
                            fontSize: '12px'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                            <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                              {src.documentTitle}
                            </span>
                            <span className="badge badge-match" style={{ fontSize: '10px' }}>
                              Page {src.pageNumber} {src.tableReference ? `· ${src.tableReference}` : ''}
                            </span>
                          </div>
                          <p style={{ fontStyle: 'italic', color: 'var(--text-secondary)', margin: '0 0 6px' }}>
                            "{src.excerpt}"
                          </p>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
                            <button
                              onClick={() => {
                                selectDocument(src.documentId);
                                navigateTo('/documents/verify');
                              }}
                              className="btn btn-outline"
                              style={{ padding: '2px 8px', fontSize: '11px' }}
                            >
                              <ExternalLink size={11} /> Open in Validation Workbench
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Out of Domain / Insufficient Notice */}
                {msg.response && msg.response.status === 'insufficient' && (
                  <div style={{
                    marginTop: '12px',
                    padding: '10px 14px',
                    borderRadius: '6px',
                    backgroundColor: '#FEF2F2',
                    border: '1px solid #FECACA',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    color: '#991B1B',
                    fontSize: '12px'
                  }}>
                    <AlertTriangle size={15} style={{ flexShrink: 0 }} />
                    <span>Anti-Hallucination Guardrail: No verified coal-sector returns support this inquiry.</span>
                  </div>
                )}

                {/* Assistant Message Actions */}
                {!isUser && msg.id !== 'msg-welcome' && (
                  <div style={{
                    marginTop: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    flexWrap: 'wrap'
                  }}>
                    <button
                      onClick={() => copyToClipboard(msg.text, msg.id)}
                      className="btn btn-outline"
                      style={{ padding: '4px 10px', fontSize: '11px' }}
                    >
                      {copiedId === msg.id ? (
                        <>
                          <Check size={12} style={{ color: '#10B981' }} />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy size={12} />
                          <span>Copy Answer</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => handleCreateReportFromAnswer(msg.text)}
                      className="btn btn-outline"
                      style={{ padding: '4px 10px', fontSize: '11px' }}
                    >
                      <FileText size={12} />
                      <span>Create Report Draft</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px', backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid var(--border-subtle)', width: 'fit-content' }}>
            <div style={{
              width: '18px',
              height: '18px',
              borderRadius: '50%',
              border: '2px solid var(--border-subtle)',
              borderTopColor: 'var(--accent-primary)',
              animation: 'spin 1s linear infinite'
            }} />
            <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
              {thinkingMode ? 'Analyzing multi-subsidiary returns and verifying citations...' : 'Retrieving grounded evidence from verified returns...'}
            </span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Prompts */}
      <div style={{ marginBottom: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
          <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', flexShrink: 0 }}>
            Suggested:
          </span>
          {SUGGESTED_QUERIES.map((q, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setQueryText(q);
                handleRunQuery(q);
              }}
              style={{
                padding: '4px 10px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'var(--bg-app)',
                border: '1px solid var(--border-subtle)',
                fontSize: '11px',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all var(--transition-fast)'
              }}
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Attached Documents Tags */}
      {attachedDocIds.length > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)' }}>Attached:</span>
          {attachedDocIds.map(docId => {
            const doc = documents.find(d => d.id === docId);
            return (
              <span
                key={docId}
                style={{
                  fontSize: '11px',
                  backgroundColor: 'var(--accent-light)',
                  color: 'var(--accent-primary)',
                  padding: '2px 8px',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <Paperclip size={10} />
                <span>{doc?.title.substring(0, 30)}...</span>
                <X
                  size={12}
                  style={{ cursor: 'pointer' }}
                  onClick={() => setAttachedDocIds(attachedDocIds.filter(id => id !== docId))}
                />
              </span>
            );
          })}
        </div>
      )}

      {/* Composer Card */}
      <div className="card-base" style={{ padding: '12px 16px', position: 'relative' }}>
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* Attachment Button */}
            <div style={{ position: 'relative' }}>
              <button
                type="button"
                onClick={() => setIsAttachMenuOpen(!isAttachMenuOpen)}
                className="btn btn-outline"
                style={{ padding: '8px', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                title="Attach documents from available archive"
              >
                <Paperclip size={15} />
              </button>

              {isAttachMenuOpen && (
                <div style={{
                  position: 'absolute',
                  bottom: '48px',
                  left: 0,
                  width: '280px',
                  backgroundColor: '#FFFFFF',
                  borderRadius: 'var(--radius-md)',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                  border: '1px solid var(--border-subtle)',
                  padding: '12px',
                  zIndex: 40
                }}>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>
                    Attach Documents ({documents.length})
                  </div>
                  <div style={{ maxHeight: '180px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {documents.map(doc => {
                      const isAttached = attachedDocIds.includes(doc.id);
                      return (
                        <label key={doc.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', cursor: 'pointer' }}>
                          <input
                            type="checkbox"
                            checked={isAttached}
                            onChange={(e) => {
                              if (e.target.checked) setAttachedDocIds([...attachedDocIds, doc.id]);
                              else setAttachedDocIds(attachedDocIds.filter(id => id !== doc.id));
                            }}
                          />
                          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {doc.title}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsAttachMenuOpen(false)}
                    className="btn btn-primary"
                    style={{ width: '100%', marginTop: '8px', fontSize: '11px', padding: '4px' }}
                  >
                    Done
                  </button>
                </div>
              )}
            </div>

            {/* Multiline Text Input */}
            <textarea
              rows={2}
              value={queryText}
              onChange={(e) => setQueryText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask a question or describe the report you need (Shift+Enter for newline)..."
              style={{
                flex: 1,
                border: 'none',
                outline: 'none',
                resize: 'none',
                fontSize: '13px',
                fontFamily: 'inherit',
                color: 'var(--text-primary)',
                backgroundColor: 'transparent'
              }}
            />

            {/* Send Button */}
            <button
              type="submit"
              disabled={isLoading || !queryText.trim()}
              className="btn btn-primary"
              style={{
                height: '34px',
                padding: '0 14px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '13px',
                opacity: (!queryText.trim() || isLoading) ? 0.5 : 1,
                cursor: (!queryText.trim() || isLoading) ? 'not-allowed' : 'pointer'
              }}
            >
              <Send size={14} />
              <span>Send</span>
            </button>
          </div>

          {/* Composer Footer: Thinking Mode & Status */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '8px',
            marginTop: '8px',
            paddingTop: '8px',
            borderTop: '1px solid var(--border-subtle)',
            fontSize: '11px',
            color: 'var(--text-muted)'
          }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={thinkingMode}
                onChange={(e) => setThinkingMode(e.target.checked)}
              />
              <BrainCircuit size={13} style={{ color: thinkingMode ? 'var(--accent-primary)' : 'var(--text-muted)' }} />
              <span>Deep Synthesis Mode (Simulate multi-step verification)</span>
            </label>

            <span>Strictly grounded on verified returns · No external internet browsing</span>
          </div>
        </form>
      </div>
    </div>
  );
};
