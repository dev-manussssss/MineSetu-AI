import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Square,
  Paperclip,
  BrainCircuit,
  Copy,
  Check,
  Plus,
  History,
  Trash2,
  ExternalLink,
  BookOpen,
  FileText,
  X,
  Sparkles,
  Bot,
  User as UserIcon,
  MessageSquare
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { MessageMarkdown } from '../components/chat/MessageMarkdown';

export const QueryPage: React.FC = () => {
  const {
    currentUser,
    chatMessages,
    executeAIQuery,
    threads,
    activeThreadId,
    createNewThread,
    selectThread,
    deleteThread,
    stopStreaming,
    isStreaming,
    navigateTo,
    selectDocument,
    documents
  } = useApp();

  const [queryText, setQueryText] = useState('');
  const [thinkingMode, setThinkingMode] = useState(false);
  const [attachedDocIds, setAttachedDocIds] = useState<string[]>([]);
  const [isAttachMenuOpen, setIsAttachMenuOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Smooth scroll to bottom when new messages arrive or during streaming
  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages.length, isStreaming]);

  // Adjust textarea height dynamically
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 160)}px`;
    }
  }, [queryText]);

  const handleRunQuery = async (queryToRun: string) => {
    const trimmed = queryToRun.trim();
    if (!trimmed || isStreaming) return;

    setQueryText('');
    setAttachedDocIds([]);
    setIsAttachMenuOpen(false);

    try {
      await executeAIQuery(trimmed, thinkingMode, attachedDocIds);
    } catch (err: any) {
      console.error('[Ask-MineSetu Query Failed]', err);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isStreaming) {
      stopStreaming();
    } else {
      handleRunQuery(queryText);
    }
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

  return (
    <div className="ask-chat-workspace">
      {/* 1. Quiet, Minimalist Header with Essential Controls */}
      <header className="ask-top-bar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <h1 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.01em' }}>
            Ask-MineSetu
          </h1>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* + New chat Button */}
          <button
            onClick={() => {
              createNewThread();
              setIsHistoryOpen(false);
            }}
            className="btn btn-outline"
            style={{
              fontSize: '12px',
              padding: '6px 12px',
              borderRadius: 'var(--radius-sm)',
              fontWeight: 500,
              gap: '6px'
            }}
            title="Start a fresh empty conversation"
          >
            <Plus size={14} />
            <span>New chat</span>
          </button>

          {/* History Drawer Toggle */}
          <button
            onClick={() => setIsHistoryOpen(!isHistoryOpen)}
            className="btn btn-outline"
            style={{
              fontSize: '12px',
              padding: '6px 12px',
              borderRadius: 'var(--radius-sm)',
              fontWeight: 500,
              gap: '6px',
              backgroundColor: isHistoryOpen ? 'var(--bg-surface-muted)' : 'transparent'
            }}
            title="Open conversation history"
          >
            <History size={14} />
            <span>History</span>
            {threads.length > 0 && (
              <span style={{
                fontSize: '10px',
                padding: '1px 6px',
                borderRadius: '10px',
                backgroundColor: 'var(--accent-light)',
                color: 'var(--accent-primary)',
                fontWeight: 600
              }}>
                {threads.length}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* 2. Conversation Thread Container */}
      <div className="ask-thread-scroll">
        {chatMessages.length === 0 ? (
          /* Empty State: Quiet greeting with one muted supporting sentence */
          <div className="chat-empty-greeting">
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              backgroundColor: 'var(--accent-light)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--accent-primary)',
              marginBottom: '16px'
            }}>
              <Sparkles size={20} />
            </div>
            <h2 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 8px 0', letterSpacing: '-0.02em' }}>
              How can I help you today?
            </h2>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0, maxWidth: '440px', lineHeight: '1.6' }}>
              MineSetu helps with operational mining records and statutory reports across Coal India subsidiaries.
            </p>
          </div>
        ) : (
          /* Conversation Thread */
          chatMessages.map(msg => {
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
                {/* Message Sender Header */}
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
                      <UserIcon size={12} />
                      <span style={{ fontWeight: 600 }}>{currentUser.name}</span>
                    </>
                  ) : (
                    <>
                      <Bot size={13} style={{ color: 'var(--accent-primary)' }} />
                      <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Ask-MineSetu</span>
                    </>
                  )}
                  <span>·</span>
                  <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>

                {/* Message Surface */}
                <div
                  style={{
                    maxWidth: isUser ? '82%' : '100%',
                    padding: isUser ? '12px 18px' : '18px 22px',
                    borderRadius: isUser ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                    backgroundColor: isUser ? 'var(--bg-dark)' : '#FFFFFF',
                    color: isUser ? '#FFFFFF' : 'var(--text-primary)',
                    boxShadow: isUser ? '0 1px 3px rgba(15,23,42,0.1)' : '0 1px 3px rgba(0,0,0,0.04)',
                    border: isUser ? 'none' : '1px solid var(--border-subtle)',
                    fontSize: '13.5px',
                    lineHeight: '1.65',
                    width: isUser ? 'auto' : '100%'
                  }}
                >
                  {isUser ? (
                    <div style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                      {msg.text}
                    </div>
                  ) : (
                    /* High-Fidelity Assistant Markdown Rendering via Streamdown */
                    <MessageMarkdown content={msg.text} isStreaming={msg.isStreaming} />
                  )}

                  {/* Supporting Evidence Citations (Rendered only when real evidence is present) */}
                  {!isUser && msg.response?.sources && msg.response.sources.length > 0 && (
                    <div style={{
                      marginTop: '16px',
                      paddingTop: '14px',
                      borderTop: '1px solid var(--border-subtle)'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
                        <BookOpen size={14} style={{ color: 'var(--accent-primary)' }} />
                        <span style={{ fontSize: '11px', fontWeight: 650, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-secondary)' }}>
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
                              backgroundColor: 'var(--bg-app)',
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

                  {/* Assistant Actions: Copy & Contextual Report Draft */}
                  {!isUser && !msg.isStreaming && msg.text.trim().length > 0 && (
                    <div style={{
                      marginTop: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '8px',
                      paddingTop: '10px',
                      borderTop: '1px solid var(--border-subtle)'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <button
                          onClick={() => copyToClipboard(msg.text, msg.id)}
                          className="btn btn-outline"
                          style={{ padding: '4px 10px', fontSize: '11px', gap: '5px' }}
                          title="Copy response to clipboard"
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

                        {/* Contextual Report Draft action only when relevant */}
                        {(msg.text.includes('Draft Operational Summary') || msg.text.includes('Report Draft') || msg.text.includes('Statutory Draft')) && (
                          <button
                            onClick={() => handleCreateReportFromAnswer(msg.text)}
                            className="btn btn-outline"
                            style={{ padding: '4px 10px', fontSize: '11px', gap: '5px' }}
                            title="Load draft into Reports Builder"
                          >
                            <FileText size={12} />
                            <span>Create Report Draft</span>
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}

        {/* Streaming Status Indicator */}
        {isStreaming && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', fontSize: '12px', color: 'var(--text-muted)' }}>
            <div style={{
              width: '14px',
              height: '14px',
              borderRadius: '50%',
              border: '2px solid var(--border-subtle)',
              borderTopColor: 'var(--accent-primary)',
              animation: 'spin 1s linear infinite'
            }} />
            <span>Searching records and generating response...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* 3. Attached Documents Context Chips */}
      {attachedDocIds.length > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', margin: '4px 0 8px', flexWrap: 'wrap' }}>
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
                <span>{doc?.title.substring(0, 28)}...</span>
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

      {/* 4. Modern Rounded Message Composer */}
      <form onSubmit={handleSubmit} style={{ position: 'relative', marginTop: '6px' }}>
        <div className="chat-composer-pill">
          <textarea
            ref={textareaRef}
            rows={1}
            value={queryText}
            onChange={(e) => setQueryText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Message MineSetu... (Shift+Enter for newline)"
            className="chat-composer-textarea"
          />

          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingTop: '6px',
            borderTop: '1px solid var(--border-subtle)'
          }}>
            {/* Left Controls: Attachments & Thinking Mode */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {/* Attachment Picker */}
              <div style={{ position: 'relative' }}>
                <button
                  type="button"
                  onClick={() => setIsAttachMenuOpen(!isAttachMenuOpen)}
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: '4px',
                    cursor: 'pointer',
                    color: attachedDocIds.length > 0 ? 'var(--accent-primary)' : 'var(--text-muted)',
                    display: 'flex',
                    alignItems: 'center',
                    borderRadius: '4px'
                  }}
                  title="Attach verified return from archive"
                >
                  <Paperclip size={15} />
                </button>

                {isAttachMenuOpen && (
                  <div style={{
                    position: 'absolute',
                    bottom: '36px',
                    left: 0,
                    width: '280px',
                    backgroundColor: '#FFFFFF',
                    borderRadius: 'var(--radius-md)',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                    border: '1px solid var(--border-subtle)',
                    padding: '12px',
                    zIndex: 40
                  }}>
                    <div style={{ fontSize: '11px', fontWeight: 650, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '8px' }}>
                      Select Documents to Attach
                    </div>
                    <div style={{ maxHeight: '160px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px' }}>
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
                      style={{ width: '100%', marginTop: '8px', fontSize: '11px', padding: '5px' }}
                    >
                      Done
                    </button>
                  </div>
                )}
              </div>

              {/* Thinking / Deep Synthesis Mode Toggle */}
              <button
                type="button"
                onClick={() => setThinkingMode(!thinkingMode)}
                style={{
                  background: thinkingMode ? 'var(--accent-light)' : 'transparent',
                  border: thinkingMode ? '1px solid var(--accent-border)' : '1px solid transparent',
                  borderRadius: '14px',
                  padding: '3px 8px',
                  fontSize: '11px',
                  color: thinkingMode ? 'var(--accent-primary)' : 'var(--text-muted)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
                title="Toggle multi-step verification synthesis"
              >
                <BrainCircuit size={12} />
                <span>Deep Synthesis</span>
              </button>
            </div>

            {/* Right: Send or Stop-Generation Button */}
            <div>
              {isStreaming ? (
                <button
                  type="button"
                  onClick={stopStreaming}
                  className="btn btn-outline"
                  style={{
                    height: '32px',
                    padding: '0 12px',
                    borderRadius: '16px',
                    fontSize: '12px',
                    gap: '5px',
                    color: '#DC2626',
                    borderColor: '#FECACA'
                  }}
                  title="Stop generation"
                >
                  <Square size={11} fill="currentColor" />
                  <span>Stop</span>
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={!queryText.trim()}
                  className="btn btn-primary"
                  style={{
                    height: '32px',
                    width: '32px',
                    padding: 0,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    opacity: !queryText.trim() ? 0.4 : 1,
                    cursor: !queryText.trim() ? 'not-allowed' : 'pointer'
                  }}
                  title="Send message"
                >
                  <Send size={13} />
                </button>
              )}
            </div>
          </div>
        </div>
      </form>

      {/* 5. Conversation History Slide-Over Drawer */}
      {isHistoryOpen && (
        <>
          <div
            onClick={() => setIsHistoryOpen(false)}
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(15, 23, 42, 0.3)',
              zIndex: 48
            }}
          />
          <aside style={{
            position: 'fixed',
            top: 0,
            right: 0,
            bottom: 0,
            width: '340px',
            backgroundColor: '#FFFFFF',
            boxShadow: '-4px 0 24px rgba(0,0,0,0.12)',
            zIndex: 50,
            display: 'flex',
            flexDirection: 'column',
            borderLeft: '1px solid var(--border-subtle)'
          }}>
            {/* Drawer Header */}
            <div style={{
              padding: '16px 20px',
              borderBottom: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: 'var(--bg-app)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MessageSquare size={16} style={{ color: 'var(--accent-primary)' }} />
                <span style={{ fontSize: '14px', fontWeight: 650, color: 'var(--text-primary)' }}>
                  Conversation History
                </span>
              </div>
              <button
                onClick={() => setIsHistoryOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Action to Start New Chat from Drawer */}
            <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-subtle)' }}>
              <button
                onClick={() => {
                  createNewThread();
                  setIsHistoryOpen(false);
                }}
                className="btn btn-primary"
                style={{ width: '100%', fontSize: '12px', padding: '8px', justifyContent: 'center', gap: '6px' }}
              >
                <Plus size={14} />
                <span>+ New chat</span>
              </button>
            </div>

            {/* Thread List */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '8px 12px' }}>
              {threads.length === 0 ? (
                <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '12px', padding: '40px 16px' }}>
                  No previous conversations yet.
                </div>
              ) : (
                threads.map(thread => {
                  const isActive = thread.id === activeThreadId;
                  return (
                    <div
                      key={thread.id}
                      onClick={() => {
                        selectThread(thread.id);
                        setIsHistoryOpen(false);
                      }}
                      style={{
                        padding: '10px 12px',
                        borderRadius: '8px',
                        marginBottom: '6px',
                        backgroundColor: isActive ? 'var(--accent-light)' : 'transparent',
                        border: isActive ? '1px solid var(--accent-border)' : '1px solid transparent',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '8px',
                        transition: 'all var(--transition-fast)'
                      }}
                    >
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div style={{
                          fontSize: '12.5px',
                          fontWeight: isActive ? 600 : 500,
                          color: isActive ? 'var(--accent-primary)' : 'var(--text-primary)',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}>
                          {thread.title}
                        </div>
                        <div style={{ fontSize: '10.5px', color: 'var(--text-muted)', marginTop: '2px' }}>
                          {thread.messages.length} messages · {new Date(thread.updatedAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteThread(thread.id);
                        }}
                        style={{
                          background: 'none',
                          border: 'none',
                          padding: '4px',
                          cursor: 'pointer',
                          color: 'var(--text-muted)',
                          borderRadius: '4px'
                        }}
                        title="Delete conversation"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </aside>
        </>
      )}
    </div>
  );
};
