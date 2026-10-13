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
  X,
  Sparkles,
  Bot,
  User,
  ArrowRight
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

  const QUICK_PROMPT_CARDS = [
    {
      title: 'Rajmahal Coal Production (ECL)',
      subtitle: 'Raw coal excavation, OB removal & rail rakes',
      query: 'What was the monthly coal production and OB removal at Rajmahal OCP?',
      tag: 'ECL · Aug 2026'
    },
    {
      title: 'Gevra Surface Miner Uptime (SECL)',
      subtitle: 'Heavy excavation, surface miner hours & conveyor uptime',
      query: 'What is the surface miner operating uptime and production at Gevra Mega Project?',
      tag: 'SECL · Sep 2026'
    },
    {
      title: 'Compare ECL & SECL Performance',
      subtitle: 'Multi-subsidiary excavation, stripping & recovery metrics',
      query: 'Compare Q2 operational excavation returns between ECL and SECL',
      tag: 'Comparative'
    },
    {
      title: 'Draft Operational Summary Report',
      subtitle: 'Compile monitored multi-subsidiary returns into a brief',
      query: 'Draft an operational summary report for monitored returns',
      tag: 'Statutory Draft'
    }
  ];

  const BOTTOM_SUGGESTED_CHIPS = [
    'Rajmahal OCP production (ECL)',
    'Gevra Mega Project surface miner (SECL)',
    'Compare ECL vs SECL',
    'Jayant OCP dragline productivity (NCL)',
    'Piparwar washed coal despatches (CCL)',
    'Moonidih UG washery yield (BCCL)',
    'Draft operational summary report'
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
    sessionStorage.setItem('minesetu_draft_seed', text);
    navigateTo('/reports');
  };

  const isInitialState = chatMessages.length === 1 && chatMessages[0].id === 'msg-welcome';

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', flexDirection: 'column', height: 'calc(100vh - 140px)' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
              Ask-MineSetu
            </h1>
            <span className="badge badge-neutral" style={{ fontSize: '11px' }}>Source-Grounded RAG</span>
            <span className="badge badge-demo" style={{ fontSize: '11px', backgroundColor: '#EEF2FF', color: '#4338CA', border: '1px solid #C7D2FE' }}>
              Verified Multi-Subsidiary Archive
            </span>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '3px 0 0' }}>
            Query verified operational returns, inspect original evidence citations, and draft statutory reports
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
          marginBottom: '12px',
          backgroundColor: '#F8FAFC',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-subtle)'
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
              {/* Message Header / Timestamp */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '11px',
                color: 'var(--text-muted)',
                padding: '0 4px'
              }}>
                {isUser ? (
                  <>
                    <User size={12} />
                    <span style={{ fontWeight: 600 }}>{currentUser.name}</span>
                  </>
                ) : (
                  <>
                    <Bot size={13} style={{ color: 'var(--accent-primary)' }} />
                    <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Ask-MineSetu</span>
                    <span className="badge badge-demo" style={{ fontSize: '9px', padding: '1px 5px' }}>Verified Engine</span>
                  </>
                )}
                <span>·</span>
                <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>

              {/* Message Bubble */}
              <div
                style={{
                  maxWidth: isUser ? '82%' : '92%',
                  padding: isUser ? '14px 18px' : '18px 22px',
                  borderRadius: isUser ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                  backgroundColor: isUser ? '#1E293B' : '#FFFFFF',
                  color: isUser ? '#FFFFFF' : 'var(--text-primary)',
                  boxShadow: isUser ? '0 2px 4px rgba(15,23,42,0.1)' : '0 1px 3px rgba(0,0,0,0.05)',
                  border: isUser ? 'none' : '1px solid var(--border-subtle)',
                  fontSize: '13px',
                  lineHeight: '1.65'
                }}
              >
                <div style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                  {msg.text}
                </div>

                {/* Grounded Sources & Citations */}
                {msg.response && msg.response.sources && msg.response.sources.length > 0 && (
                  <div style={{
                    marginTop: '16px',
                    paddingTop: '14px',
                    borderTop: '1px solid var(--border-subtle)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
                      <BookOpen size={14} style={{ color: 'var(--accent-primary)' }} />
                      <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-muted)' }}>
                        Supporting Sources & Evidence Citations ({msg.response.sources.length})
                      </span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {msg.response.sources.map((src, sIdx) => (
                        <div
                          key={sIdx}
                          style={{
                            padding: '10px 14px',
                            borderRadius: '8px',
                            backgroundColor: '#F8FAFC',
                            border: '1px solid var(--border-subtle)',
                            fontSize: '12px'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px', flexWrap: 'wrap', gap: '6px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                                {src.documentTitle}
                              </span>
                              <span className="badge badge-neutral" style={{ fontSize: '10px', padding: '1px 6px' }}>
                                {src.subsidiary}
                              </span>
                            </div>
                            <span className="badge badge-match" style={{ fontSize: '10px', padding: '1px 6px' }}>
                              Page {src.pageNumber} {src.tableReference ? `· ${src.tableReference}` : ''}
                            </span>
                          </div>
                          <p style={{ fontStyle: 'italic', color: 'var(--text-secondary)', margin: '0 0 8px', lineHeight: '1.5' }}>
                            "{src.excerpt}"
                          </p>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
                            <button
                              onClick={() => {
                                selectDocument(src.documentId);
                                navigateTo('/documents/verify');
                              }}
                              className="btn btn-outline"
                              style={{ padding: '3px 10px', fontSize: '11px', gap: '4px' }}
                            >
                              <ExternalLink size={11} /> Open in Validation Workbench
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Anti-Hallucination Guardrail / Insufficient Notice */}
                {msg.response && msg.response.status === 'insufficient' && !msg.text.includes('Security Notice') && (
                  <div style={{
                    marginTop: '12px',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    backgroundColor: '#FEF2F2',
                    border: '1px solid #FECACA',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    color: '#991B1B',
                    fontSize: '12px'
                  }}>
                    <AlertTriangle size={15} style={{ flexShrink: 0 }} />
                    <span>Anti-Hallucination Guardrail: Verified source evidence is strictly enforced. No fabricated figures generated.</span>
                  </div>
                )}

                {/* Assistant Message Actions & Follow-ups */}
                {!isUser && msg.id !== 'msg-welcome' && (
                  <div style={{
                    marginTop: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '8px',
                    paddingTop: '10px',
                    borderTop: '1px solid #F1F5F9'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <button
                        onClick={() => copyToClipboard(msg.text, msg.id)}
                        className="btn btn-outline"
                        style={{ padding: '4px 10px', fontSize: '11px', gap: '5px' }}
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
                        style={{ padding: '4px 10px', fontSize: '11px', gap: '5px' }}
                      >
                        <FileText size={12} />
                        <span>Create Report Draft</span>
                      </button>
                    </div>

                    {msg.response?.confidence && (
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                        Grounding Confidence: {Math.round(msg.response.confidence * 100)}%
                      </span>
                    )}
                  </div>
                )}

                {/* Interactive Suggested Follow-Ups */}
                {!isUser && msg.response?.suggestedFollowUps && msg.response.suggestedFollowUps.length > 0 && (
                  <div style={{ marginTop: '12px', paddingTop: '10px', borderTop: '1px dashed #E2E8F0' }}>
                    <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>
                      Suggested Follow-Ups:
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {msg.response.suggestedFollowUps.map((followUp, fIdx) => (
                        <button
                          key={fIdx}
                          type="button"
                          onClick={() => {
                            setQueryText(followUp);
                            handleRunQuery(followUp);
                          }}
                          className="chat-suggestion-chip"
                          style={{
                            fontSize: '11px',
                            padding: '4px 10px',
                            borderRadius: '14px',
                            backgroundColor: '#F1F5F9',
                            border: '1px solid #E2E8F0',
                            color: '#334155',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            textAlign: 'left'
                          }}
                        >
                          <Sparkles size={11} style={{ color: 'var(--accent-primary)' }} />
                          <span>{followUp}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Welcome Hero State: 4 Quick Action Cards (Reference Image 1) */}
        {isInitialState && (
          <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '14px 18px',
              backgroundColor: '#FFFFFF',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
              boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
            }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                backgroundColor: 'var(--accent-light)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--accent-primary)',
                flexShrink: 0
              }}>
                <Sparkles size={18} />
              </div>
              <div>
                <h3 style={{ fontSize: '14px', fontWeight: 600, margin: 0, color: 'var(--text-primary)' }}>
                  How can I help with your mining reports and operational data today?
                </h3>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '2px 0 0' }}>
                  Select one of the verified inquiries below or ask a question directly in the prompt bar.
                </p>
              </div>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '12px'
            }}>
              {QUICK_PROMPT_CARDS.map((card, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    setQueryText(card.query);
                    handleRunQuery(card.query);
                  }}
                  className="chat-suggestion-card"
                  style={{
                    padding: '14px 16px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: '#FFFFFF',
                    border: '1px solid var(--border-subtle)',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                        {card.title}
                      </span>
                      <span className="badge badge-neutral" style={{ fontSize: '10px', padding: '1px 6px' }}>
                        {card.tag}
                      </span>
                    </div>
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0, lineHeight: '1.4' }}>
                      {card.subtitle}
                    </p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: 'var(--accent-primary)', fontWeight: 600, marginTop: '12px' }}>
                    <span>Ask this inquiry</span>
                    <ArrowRight size={12} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Loading Spinner */}
        {isLoading && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 18px', backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid var(--border-subtle)', width: 'fit-content' }}>
            <div style={{
              width: '18px',
              height: '18px',
              borderRadius: '50%',
              border: '2px solid var(--border-subtle)',
              borderTopColor: 'var(--accent-primary)',
              animation: 'spin 1s linear infinite'
            }} />
            <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
              {thinkingMode ? 'Analyzing multi-subsidiary returns and verifying source citations...' : 'Retrieving grounded evidence from verified returns...'}
            </span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Responsive Suggested Chips (Clean wrapping, NO horizontal scrollbar! Addresses Bug Report Page 5) */}
      <div style={{ marginBottom: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '6px' }}>
          <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', flexShrink: 0 }}>
            Quick Prompts:
          </span>
          {BOTTOM_SUGGESTED_CHIPS.map((chip, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setQueryText(chip);
                handleRunQuery(chip);
              }}
              className="chat-suggestion-chip"
              style={{
                padding: '3px 10px',
                borderRadius: '12px',
                backgroundColor: '#FFFFFF',
                border: '1px solid var(--border-subtle)',
                fontSize: '11px',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              {chip}
            </button>
          ))}
        </div>
      </div>

      {/* Attached Documents Tags */}
      {attachedDocIds.length > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)' }}>Attached Context:</span>
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
                <span>{doc?.title.substring(0, 32)}...</span>
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
      <div className="card-base" style={{ padding: '12px 16px', position: 'relative', borderRadius: 'var(--radius-lg)' }}>
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
                  width: '300px',
                  backgroundColor: '#FFFFFF',
                  borderRadius: 'var(--radius-md)',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                  border: '1px solid var(--border-subtle)',
                  padding: '12px',
                  zIndex: 40
                }}>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>
                    Attach Verified Documents ({documents.length})
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
                    style={{ width: '100%', marginTop: '8px', fontSize: '11px', padding: '6px' }}
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
              placeholder="Ask Ask-MineSetu or describe the statutory report draft you need (Shift+Enter for newline)..."
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
                height: '36px',
                padding: '0 16px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '13px',
                opacity: (!queryText.trim() || isLoading) ? 0.5 : 1,
                cursor: (!queryText.trim() || isLoading) ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
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

            <span>Strictly grounded on verified returns · Anti-hallucination guardrail active</span>
          </div>
        </form>
      </div>
    </div>
  );
};
