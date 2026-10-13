import React, { createContext, useContext, useState, useEffect } from 'react';
import type {
  User,
  Role,
  DocumentRecord,
  ManualRecord,
  InformationRequest,
  ReportDraft,
  TopicCluster,
  AuditEvent,
  AIQueryResponse,
  NotificationItem
} from '../types';
import { DEMO_PERSONAS } from '../lib/rbac';
import {
  INITIAL_DOCUMENTS,
  INITIAL_MANUAL_RECORDS,
  INITIAL_INFORMATION_REQUESTS,
  INITIAL_REPORTS,
  TOPIC_CLUSTERS,
  INITIAL_NOTIFICATIONS,
  INITIAL_AUDIT_LOGS
} from '../data/mockMiningData';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  response?: AIQueryResponse;
}

interface AppContextType {
  // User & Persona
  currentUser: User;
  switchRole: (role: Role) => void;
  currentRoute: string;
  navigateTo: (route: string) => void;

  // Documents
  documents: DocumentRecord[];
  selectedDocumentId: string | null;
  selectDocument: (id: string | null) => void;
  updateExtractedField: (docId: string, fieldId: string, verifiedValue: string, notes?: string) => void;
  setDocumentStatus: (docId: string, status: DocumentRecord['status'], reviewNotes?: string) => void;
  uploadDocument: (newDoc: Partial<DocumentRecord>) => Promise<string>;
  deleteDocument: (docId: string) => void;

  // Manual Records (First-Class Ingestion)
  manualRecords: ManualRecord[];
  addManualRecord: (newRec: Omit<ManualRecord, 'id' | 'createdAt' | 'authorName' | 'authorRole' | 'isDemo'>) => string;
  updateManualRecordStatus: (recId: string, status: ManualRecord['status']) => void;

  // Requests
  requests: InformationRequest[];
  selectedRequestId: string | null;
  selectRequest: (id: string | null) => void;
  createRequest: (reqData: Partial<InformationRequest>) => string;
  respondToRequest: (reqId: string, responseText: string, attachedDocumentIds?: string[]) => void;
  updateRequestStatus: (reqId: string, status: InformationRequest['status'], note?: string) => void;

  // Reports
  reports: ReportDraft[];
  selectedReportId: string | null;
  selectReport: (id: string | null) => void;
  createReportDraft: (reportData: Partial<ReportDraft>) => string;
  updateReportDraftText: (reportId: string, newSummary: string) => void;

  // Topic Intelligence
  topicClusters: TopicCluster[];
  selectedTopic: string | null;
  selectTopic: (topicName: string | null) => void;

  // AI Query ("Ask-MineSetu")
  chatMessages: ChatMessage[];
  executeAIQuery: (query: string, thinkingMode?: boolean, attachedDocIds?: string[]) => Promise<AIQueryResponse>;
  clearChat: () => void;

  // Notifications
  notifications: NotificationItem[];
  markNotificationAsRead: (id: string) => void;
  isNotificationsOpen: boolean;
  setIsNotificationsOpen: (open: boolean) => void;

  // Global Search
  globalSearchQuery: string;
  setGlobalSearchQuery: (query: string) => void;

  // Audit Logs
  auditLogs: AuditEvent[];
  logAuditAction: (action: string, entityType: string, entityId: string, result: 'success' | 'failure' | 'denied', metadata?: Record<string, any>) => void;

  // Demo Dataset Controls
  resetDatasetToDefaults: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 1. Initial User Persona (Defaults to CMPDI Nodal Expert)
  const [currentUser, setCurrentUser] = useState<User>(() => {
    const saved = localStorage.getItem('minesetu_active_role') as Role;
    if (saved && DEMO_PERSONAS[saved]) return DEMO_PERSONAS[saved];
    return DEMO_PERSONAS['cmpdi'];
  });

  // 2. Navigation Routing
  const [currentRoute, setCurrentRoute] = useState<string>(() => {
    return window.location.pathname || '/';
  });

  // 3. Core Operational State
  const [documents, setDocuments] = useState<DocumentRecord[]>(() => {
    const saved = localStorage.getItem('minesetu_docs');
    return saved ? JSON.parse(saved) : INITIAL_DOCUMENTS;
  });
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(INITIAL_DOCUMENTS[0].id);

  const [manualRecords, setManualRecords] = useState<ManualRecord[]>(() => {
    const saved = localStorage.getItem('minesetu_manual_recs');
    return saved ? JSON.parse(saved) : INITIAL_MANUAL_RECORDS;
  });

  const [requests, setRequests] = useState<InformationRequest[]>(() => {
    const saved = localStorage.getItem('minesetu_requests');
    return saved ? JSON.parse(saved) : INITIAL_INFORMATION_REQUESTS;
  });
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(INITIAL_INFORMATION_REQUESTS[0].id);

  const [reports, setReports] = useState<ReportDraft[]>(() => {
    const saved = localStorage.getItem('minesetu_reports');
    return saved ? JSON.parse(saved) : INITIAL_REPORTS;
  });
  const [selectedReportId, setSelectedReportId] = useState<string | null>(INITIAL_REPORTS[0].id);

  const [topicClusters] = useState<TopicCluster[]>(TOPIC_CLUSTERS);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);

  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  const [auditLogs, setAuditLogs] = useState<AuditEvent[]>(() => {
    const saved = localStorage.getItem('minesetu_audit');
    return saved ? JSON.parse(saved) : INITIAL_AUDIT_LOGS;
  });

  const [globalSearchQuery, setGlobalSearchQuery] = useState('');

  // 4. Conversational History for Ask-MineSetu
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-welcome',
      sender: 'assistant',
      text: 'How can I help with your mining reports? Ask about verified production figures, mining records, reporting discrepancies, or source documents.',
      timestamp: '2026-10-04T09:00:00Z',
    }
  ]);

  // Sync state changes to localStorage
  useEffect(() => {
    localStorage.setItem('minesetu_docs', JSON.stringify(documents));
  }, [documents]);

  useEffect(() => {
    localStorage.setItem('minesetu_manual_recs', JSON.stringify(manualRecords));
  }, [manualRecords]);

  useEffect(() => {
    localStorage.setItem('minesetu_requests', JSON.stringify(requests));
  }, [requests]);

  useEffect(() => {
    localStorage.setItem('minesetu_reports', JSON.stringify(reports));
  }, [reports]);

  useEffect(() => {
    localStorage.setItem('minesetu_audit', JSON.stringify(auditLogs));
  }, [auditLogs]);

  // Sync route on popstate
  useEffect(() => {
    const handlePopState = () => {
      setCurrentRoute(window.location.pathname || '/');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateTo = (route: string) => {
    window.history.pushState({}, '', route);
    setCurrentRoute(route);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const switchRole = (newRole: Role) => {
    const persona = DEMO_PERSONAS[newRole];
    if (persona) {
      setCurrentUser(persona);
      localStorage.setItem('minesetu_active_role', newRole);
      logAuditAction('role.switch', 'user', persona.id, 'success', {
        newRole,
        email: persona.email
      });
    }
  };

  const logAuditAction = (
    action: string,
    entityType: string,
    entityId: string,
    result: 'success' | 'failure' | 'denied',
    metadata?: Record<string, any>
  ) => {
    const newEntry: AuditEvent = {
      id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
      actorName: currentUser.name,
      actorRole: currentUser.role,
      action,
      entityType,
      entityId,
      result,
      metadata,
    };
    setAuditLogs(prev => [newEntry, ...prev.slice(0, 99)]);
  };

  // Document Actions
  const selectDocument = (id: string | null) => {
    setSelectedDocumentId(id);
  };

  const updateExtractedField = (docId: string, fieldId: string, verifiedValue: string, notes?: string) => {
    setDocuments(prevDocs =>
      prevDocs.map(doc => {
        if (doc.id !== docId) return doc;
        const updatedFields = doc.extractedFields.map(f => {
          if (f.id !== fieldId) return f;
          return {
            ...f,
            verifiedValue,
            status: 'verified' as const,
            notes: notes || f.notes,
          };
        });
        return { ...doc, extractedFields: updatedFields };
      })
    );
    logAuditAction('ocr.verify_field', 'extracted_field', fieldId, 'success', { docId, verifiedValue, notes });
  };

  const setDocumentStatus = (docId: string, status: DocumentRecord['status'], reviewNotes?: string) => {
    setDocuments(prevDocs =>
      prevDocs.map(doc => {
        if (doc.id !== docId) return doc;
        return {
          ...doc,
          status,
          extractedSummary: reviewNotes ? `${doc.extractedSummary} [Reviewer: ${reviewNotes}]` : doc.extractedSummary,
        };
      })
    );
    logAuditAction('document.status_change', 'document', docId, 'success', { newStatus: status, reviewNotes });
  };

  const uploadDocument = async (newDoc: Partial<DocumentRecord>): Promise<string> => {
    const newId = `doc-${Date.now().toString(36)}`;
    const created: DocumentRecord = {
      id: newId,
      title: newDoc.title || 'Untitled Operational Return',
      fileName: newDoc.fileName || 'Return.pdf',
      category: newDoc.category || 'production',
      reportingPeriod: newDoc.reportingPeriod || 'Current Period',
      subsidiaryCode: newDoc.subsidiaryCode || currentUser.subsidiaryCode || 'ECL',
      collieryName: newDoc.collieryName || currentUser.collieryName || 'Central Colliery',
      status: 'needs_review',
      ocrConfidence: 91.2,
      uploadedAt: new Date().toISOString(),
      uploadedBy: `${currentUser.name} (${currentUser.roleLabel})`,
      fileSize: newDoc.fileSize || '1.8 MB',
      pageCount: newDoc.pageCount || 2,
      extractedSummary: newDoc.extractedSummary || 'Extracted statutory operational metrics awaiting human verification.',
      isDemo: true,
      extractedFields: [
        {
          id: `f-${Date.now()}-1`,
          fieldName: 'coal_prod_tonnes',
          label: 'Coal Production (Tonnes)',
          extractedValue: '38,900',
          verifiedValue: '38,900',
          unit: 'Tonnes',
          confidence: 94,
          status: 'verified',
          pageNumber: 1
        },
        {
          id: `f-${Date.now()}-2`,
          fieldName: 'ob_removal_m3',
          label: 'Overburden Removal (m³)',
          extractedValue: '112,000',
          verifiedValue: undefined,
          unit: 'm³',
          confidence: 86,
          status: 'auto_extracted',
          pageNumber: 1
        }
      ]
    };

    setDocuments(prev => [created, ...prev]);
    logAuditAction('documents.upload', 'document', newId, 'success', { title: created.title, subsidiary: created.subsidiaryCode });
    return newId;
  };

  const deleteDocument = (docId: string) => {
    setDocuments(prev => prev.filter(d => d.id !== docId));
    logAuditAction('documents.delete', 'document', docId, 'success');
  };

  // Manual Records Actions
  const addManualRecord = (newRec: Omit<ManualRecord, 'id' | 'createdAt' | 'authorName' | 'authorRole' | 'isDemo'>): string => {
    const id = `man-${Date.now().toString(36)}`;
    const created: ManualRecord = {
      ...newRec,
      id,
      authorName: currentUser.name,
      authorRole: currentUser.roleLabel,
      createdAt: new Date().toISOString(),
      isDemo: true,
    };
    setManualRecords(prev => [created, ...prev]);
    logAuditAction('manual_record.create', 'manual_record', id, 'success', { category: created.category, status: created.status });
    return id;
  };

  const updateManualRecordStatus = (recId: string, status: ManualRecord['status']) => {
    setManualRecords(prev =>
      prev.map(r => (r.id === recId ? { ...r, status } : r))
    );
    logAuditAction('manual_record.status_change', 'manual_record', recId, 'success', { status });
  };

  // Information Request Actions
  const selectRequest = (id: string | null) => {
    setSelectedRequestId(id);
  };

  const createRequest = (reqData: Partial<InformationRequest>): string => {
    const id = `req-${Date.now().toString(36)}`;
    const created: InformationRequest = {
      id,
      requestNumber: `MOC/REQ/${new Date().getFullYear()}/${Math.floor(100 + Math.random() * 900)}`,
      subject: reqData.subject || 'Information Request',
      description: reqData.description || 'Statutory reporting clarification inquiry',
      requestingOrg: currentUser.organization || 'Ministry of Coal',
      requestingPersona: `${currentUser.name} (${currentUser.roleLabel})`,
      recipientOrg: reqData.recipientOrg || 'Eastern Coalfields Limited',
      recipientPersona: reqData.recipientPersona || 'Subsidiary Technical Cell',
      reportingPeriod: reqData.reportingPeriod || 'Current Quarter',
      requestedFields: reqData.requestedFields || ['Coal Production', 'Overburden Removal'],
      dueDate: reqData.dueDate || new Date(Date.now() + 7 * 86400000).toISOString(),
      status: 'awaiting_response',
      lastUpdate: new Date().toISOString(),
      isDemo: true,
    };
    setRequests(prev => [created, ...prev]);
    logAuditAction('request.create', 'information_request', id, 'success', { subject: created.subject });
    return id;
  };

  const respondToRequest = (reqId: string, responseText: string, attachedDocumentIds?: string[]) => {
    setRequests(prev =>
      prev.map(req => {
        if (req.id !== reqId) return req;
        return {
          ...req,
          responseText,
          attachedDocumentIds: attachedDocumentIds || req.attachedDocumentIds,
          status: 'submitted',
          lastUpdate: new Date().toISOString(),
        };
      })
    );
    logAuditAction('request.respond', 'information_request', reqId, 'success', { responseLength: responseText.length });
  };

  const updateRequestStatus = (reqId: string, status: InformationRequest['status'], note?: string) => {
    setRequests(prev =>
      prev.map(req => {
        if (req.id !== reqId) return req;
        const notes = note ? [...(req.clarificationNotes || []), note] : req.clarificationNotes;
        return {
          ...req,
          status,
          clarificationNotes: notes,
          lastUpdate: new Date().toISOString(),
        };
      })
    );
    logAuditAction('request.status_change', 'information_request', reqId, 'success', { status, note });
  };

  // Reports Actions
  const selectReport = (id: string | null) => {
    setSelectedReportId(id);
  };

  const createReportDraft = (reportData: Partial<ReportDraft>): string => {
    const id = `rep-${Date.now().toString(36)}`;
    const created: ReportDraft = {
      id,
      title: reportData.title || 'Automated Operational Performance Report',
      reportType: reportData.reportType || 'Quarterly Operational Review',
      reportingPeriod: reportData.reportingPeriod || 'Q2 FY 2026',
      scope: reportData.scope || 'Multi-Subsidiary Consolidated',
      selectedSubsidiaries: reportData.selectedSubsidiaries || ['ECL', 'SECL'],
      comparisonBasis: reportData.comparisonBasis || 'Year-on-Year',
      executiveSummary: reportData.executiveSummary || 'Consolidated operational summary compiled from verified returns.',
      metricsTable: reportData.metricsTable || [
        { subsidiary: 'SECL', mine: 'Gevra Mega OCP', coalTonnes: '524,300', obM3: '1,120,000', status: 'Approved', confidence: '99%' },
        { subsidiary: 'ECL', mine: 'Rajmahal OCP', coalTonnes: '45,210', obM3: '142,500', status: 'Verified', confidence: '94%' },
      ],
      sources: reportData.sources || ['ECL_Rajmahal_Monthly_Aug2026.pdf', 'SECL_Gevra_ShiftSummary_0926.pdf'],
      draftStatus: 'draft',
      generatedAt: new Date().toISOString(),
      author: `${currentUser.name} (${currentUser.roleLabel})`,
      outputFormats: reportData.outputFormats || ['pdf', 'docx', 'xlsx'],
      isDemo: true,
    };
    setReports(prev => [created, ...prev]);
    logAuditAction('report.create', 'report', id, 'success', { title: created.title });
    return id;
  };

  const updateReportDraftText = (reportId: string, newSummary: string) => {
    setReports(prev =>
      prev.map(r => (r.id === reportId ? { ...r, executiveSummary: newSummary, draftStatus: 'reviewed' } : r))
    );
    logAuditAction('report.update_text', 'report', reportId, 'success');
  };

  // Topics Action
  const selectTopic = (topicName: string | null) => {
    setSelectedTopic(topicName);
  };

  // Notifications
  const markNotificationAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: true } : n))
    );
  };

  // AI Query Execution (Grounded RAG Engine with Robust Intent Classification)
  const executeAIQuery = async (
    query: string,
    thinkingMode = false,
    attachedDocIds: string[] = []
  ): Promise<AIQueryResponse> => {
    logAuditAction('ai.query', 'query', 'query_exec', 'success', { query, thinkingMode, attachedDocIds });

    // Simulate thinking delay if enabled
    const delay = thinkingMode ? 700 : 350;
    await new Promise(r => setTimeout(r, delay));

    const trimmed = query.trim();
    const lower = trimmed.toLowerCase();

    // Check attached documents if specified
    const attachedSources = attachedDocIds.map(docId => {
      const doc = documents.find(d => d.id === docId);
      if (!doc) return null;
      return {
        documentId: doc.id,
        documentTitle: doc.title,
        subsidiary: doc.subsidiaryCode,
        collieryName: doc.collieryName,
        pageNumber: 1,
        tableReference: 'Attached Document Overview',
        excerpt: doc.extractedSummary || 'Directly attached context document.',
        verifiedStatus: doc.status === 'approved' ? ('approved' as const) : ('verified' as const)
      };
    }).filter(Boolean) as AIQueryResponse['sources'];

    let answerText = '';
    let sources: AIQueryResponse['sources'] = [];
    let status: AIQueryResponse['status'] = 'sufficient';
    let confidence = 0.95;
    let suggestedFollowUps: string[] = [];

    // 1. Security / Prompt Injection / Jailbreak Guardrail
    if (
      lower.includes('ignore previous') ||
      lower.includes('ignore all') ||
      lower.includes('bypass rules') ||
      lower.includes('system prompt') ||
      lower.includes('pretend to be') ||
      lower.includes('jailbreak')
    ) {
      answerText = 'Security Notice: Ask-MineSetu operates strictly within authorized, role-based coal sector governance frameworks. Instructions attempting to bypass validation rules, auditing mechanisms, or verified source groundings are disregarded. Please submit a valid operational inquiry.';
      confidence = 0.99;
      status = 'insufficient';
      suggestedFollowUps = [
        'Query verified ECL production records',
        'Review available SECL operational returns'
      ];
    }
    // 2. Greetings & Introductions (Natural & Brief, NO fake mining figures!)
    else if (
      /^(hi|hello|hey|namaste|greetings|good\s+(morning|afternoon|evening)|hola)(\s+[a-z]+)?[.!?]?$/i.test(lower) ||
      lower === 'hi' ||
      lower === 'hello' ||
      lower === 'hey' ||
      lower === 'who are you' ||
      lower === 'what can you do' ||
      lower === 'help' ||
      lower === 'how does this work'
    ) {
      answerText = `Hello! I am **Ask-MineSetu**, your AI assistant for verified coal-sector operational records and statutory returns across Coal India subsidiaries.

I can help you:
• Query verified raw coal production, overburden (OB) stripping, and rail despatches (e.g., ECL Rajmahal OCP, SECL Gevra Mega Project).
• Inspect grounded evidence, OCR extractions, and original document references in the Validation Workbench.
• Compare multi-subsidiary operational metrics and fleet availability.
• Assist in drafting executive and statutory reports based strictly on approved records.

How can I assist you with your mining records today?`;
      confidence = 1.0;
      status = 'sufficient';
      sources = [];
      suggestedFollowUps = [
        'What was the monthly coal production and OB removal at Rajmahal OCP?',
        'What is the surface miner operating uptime and production at Gevra Mega Project?',
        'Compare Q2 returns between ECL and SECL',
        'Draft an executive summary report for monitored returns'
      ];
    }
    // 3. Out-of-Domain Anti-Hallucination Guardrail Check
    else if (
      lower.includes('uranium') ||
      lower.includes('bauxite') ||
      lower.includes('nuclear') ||
      lower.includes('gold') ||
      lower.includes('petroleum') ||
      lower.includes('crude oil') ||
      lower.includes('crypto') ||
      lower.includes('bitcoin') ||
      lower.includes('weather forecast')
    ) {
      answerText = 'Anti-Hallucination Guardrail: Insufficient source evidence exists in authorized records to answer this inquiry. The accessible MineSetu archive is strictly restricted to verified coal-sector operational, excavation, and statutory returns. No records exist for external commodities or non-coal subjects.';
      confidence = 0.12;
      status = 'insufficient';
      sources = [];
      suggestedFollowUps = [
        'Review available Coal India subsidiary production returns',
        'What was the monthly coal production and OB removal at Rajmahal OCP?'
      ];
    }
    // 4. Report Generation Requests
    else if (
      lower.includes('draft report') ||
      lower.includes('create report') ||
      lower.includes('generate report') ||
      lower.includes('compile report') ||
      lower.includes('executive summary') ||
      lower.includes('statutory draft') ||
      lower.includes('prepare report') ||
      lower.includes('quarterly summary')
    ) {
      answerText = `### Draft Operational Summary Report (Verified Returns)

**Reporting Cycle:** August – September 2026
**Entities Included:** ECL (Rajmahal OCP), SECL (Gevra Mega Project), NCL (Jayant OCP), CCL (Piparwar OCP)

**1. Operational Highlights:**
• **SECL Gevra Mega Project:** Heavy excavation achieved 524,300 tonnes of raw coal production and 1,120,000 m³ overburden removal (Surface miner operating hours: 432 hrs; Conveyor uptime: 98.2%). Status: Approved.
• **ECL Rajmahal OCP:** Monitored monthly coal production reached 45,210 tonnes with 142,500 m³ OB removal; 38.4% average ash content. Status: Verified (Rail despatch rakes flagged for manual review).
• **NCL Jayant OCP:** Dragline excavation reached 348,000 m³ with 91.8% HEMM fleet availability. Status: Approved.
• **CCL Piparwar OCP:** Washed coal despatch reached 82,100 tonnes via 21 loaded railway rakes. Status: Approved.

**2. Data Gaps & Pending Items:**
• **BCCL Moonidih UG:** Raw coal feed is 28,400 tonnes, but clean coking yield (48.2%) is flagged due to carbon-copy slip smudge. Excluded from consolidated totals pending Nodal review.
• **WCL & MCL:** Formal returns for this cycle have not been ingested.

You can click **"Create Report Draft"** below to load these verified figures into the Reports Builder for export.`;
      confidence = 0.96;
      status = 'sufficient';
      sources = [
        {
          documentId: 'doc-secl-002',
          documentTitle: 'Gevra Mega Project Heavy Excavation Shift Summary',
          subsidiary: 'SECL',
          collieryName: 'Gevra OCP',
          pageNumber: 1,
          tableReference: 'Surface Miner Shift Log',
          excerpt: 'Cumulative output exceeds 520,000 MT for the ten-day period with 98.2% conveyor belt uptime.',
          verifiedStatus: 'approved'
        },
        {
          documentId: 'doc-ecl-001',
          documentTitle: 'Rajmahal OCP Monthly Production & Despatch Return - Aug 2026',
          subsidiary: 'ECL',
          collieryName: 'Rajmahal OCP',
          pageNumber: 1,
          tableReference: 'Table 1: Excavation Summary',
          excerpt: 'Daily coal excavation totaled 45,210 tonnes. Overburden stripping reached 142,500 m³ with 3 shovel-dumper spreads.',
          verifiedStatus: 'verified'
        },
        {
          documentId: 'doc-ncl-004',
          documentTitle: 'Jayant OCP Dragline Productivity & HEMM Uptime Return',
          subsidiary: 'NCL',
          collieryName: 'Jayant OCP',
          pageNumber: 2,
          tableReference: 'Dragline Log',
          excerpt: 'Dragline excavation reached 348,000 m³ with 91.8% fleet availability.',
          verifiedStatus: 'approved'
        },
        {
          documentId: 'doc-ccl-005',
          documentTitle: 'Piparwar Open Cast Beneficiation & Despatch Return',
          subsidiary: 'CCL',
          collieryName: 'Piparwar OCP',
          pageNumber: 1,
          tableReference: 'Despatch Log',
          excerpt: 'Washed coal despatch reached 82,100 tonnes via 21 loaded railway rakes.',
          verifiedStatus: 'approved'
        }
      ];
      suggestedFollowUps = [
        'Open in Reports Builder to finalize statutory filing',
        'Inspect BCCL Moonidih flagged yield in Validation Workbench',
        'Create an Information Request for missing WCL returns'
      ];
    }
    // 5. Ambiguous / Too Vague Questions (Missing Colliery or Period)
    else if (
      /^(what is the production\??|production\??|coal production\??|how much coal\??|show data|status\??|give me numbers|show reports\??|what are the numbers\??)$/i.test(lower)
    ) {
      answerText = `Could you please clarify which operational entity or reporting period you would like to inspect?

Available verified datasets in this environment:
1. **ECL — Rajmahal OCP** (Monthly Return, August 2026: 45,210 T coal, 142,500 m³ OB removal)
2. **SECL — Gevra Mega Project** (Shift Summary, September 2026: 524,300 T coal, 432 surface miner hrs)
3. **NCL — Jayant OCP** (HEMM Return, September 2026: 348,000 m³ dragline, 91.8% fleet availability)
4. **CCL — Piparwar OCP** (Despatch Return, August 2026: 82,100 T washed coal, 21 rakes)
5. **BCCL — Moonidih UG** (Washery Audit, Q2 FY 2026: 28,400 T feed, 48.2% clean yield — flagged)

Please select one of the queries below or specify the colliery name.`;
      confidence = 0.60;
      status = 'insufficient';
      sources = [];
      suggestedFollowUps = [
        'What was the monthly coal production and OB removal at Rajmahal OCP?',
        'What is the surface miner operating uptime and production at Gevra Mega Project?',
        'Compare Q2 returns between ECL and SECL'
      ];
    }
    // 6. Comparative Queries (ECL vs SECL)
    else if (
      lower.includes('compare') ||
      (lower.includes('ecl') && lower.includes('secl')) ||
      lower.includes('versus') ||
      lower.includes('vs')
    ) {
      answerText = `### Operational Comparison: ECL vs SECL (Q2 2026 Returns)

• **SECL (Gevra Mega Project, Open Cast):**
  - **Raw Coal Production:** 524,300 tonnes
  - **Overburden (OB) Removal:** 1,120,000 m³
  - **Equipment Availability:** 432 surface miner operating hours with 98.2% conveyor belt uptime.
  - **Status:** Approved (verified by Area Technical team).

• **ECL (Rajmahal OCP, Open Cast):**
  - **Raw Coal Production:** 45,210 tonnes
  - **Overburden (OB) Removal:** 142,500 m³
  - **Quality & Despatch:** 38.4% average ash content; 18 rail rakes despatched (rail rake slip flagged for manual review due to blur).
  - **Status:** Verified (Bench 3 monsoon de-watering noted).

**Operational Analysis:** SECL Gevra operates world-scale high-capacity continuous surface mining, achieving ~11.6x the raw coal output of ECL Rajmahal during this reporting interval.`;
      confidence = 0.98;
      status = 'sufficient';
      sources = [
        {
          documentId: 'doc-secl-002',
          documentTitle: 'Gevra Mega Project Heavy Excavation Shift Summary',
          subsidiary: 'SECL',
          collieryName: 'Gevra OCP',
          pageNumber: 1,
          tableReference: 'Surface Miner Shift Log',
          excerpt: 'Cumulative output exceeds 520,000 MT for the ten-day period with 98.2% conveyor belt uptime.',
          verifiedStatus: 'approved'
        },
        {
          documentId: 'doc-ecl-001',
          documentTitle: 'Rajmahal OCP Monthly Production & Despatch Return - Aug 2026',
          subsidiary: 'ECL',
          collieryName: 'Rajmahal OCP',
          pageNumber: 1,
          tableReference: 'Table 1: Excavation Summary',
          excerpt: 'Daily coal excavation totaled 45,210 tonnes. Overburden stripping reached 142,500 m³ with 3 shovel-dumper spreads.',
          verifiedStatus: 'verified'
        }
      ];
      suggestedFollowUps = [
        'Compile this comparative data into a draft report',
        'Inspect Rajmahal OCP document in Validation Workbench',
        'View SECL Gevra shift summary in Validation Workbench'
      ];
    }
    // 7. ECL / Rajmahal Queries
    else if (lower.includes('rajmahal') || (lower.includes('ecl') && !lower.includes('secl'))) {
      answerText = 'According to the verified monthly operational returns for ECL Rajmahal OCP (August 2026), raw coal production totaled 45,210 tonnes with an overburden removal of 142,500 m³. Average ash content was determined at 38.4% across 18 despatched railway rakes (1 rail despatch field flagged for verification).';
      confidence = 0.97;
      status = 'sufficient';
      sources = [
        {
          documentId: 'doc-ecl-001',
          documentTitle: 'Rajmahal OCP Monthly Production & Despatch Return - Aug 2026',
          subsidiary: 'ECL',
          collieryName: 'Rajmahal OCP',
          pageNumber: 1,
          tableReference: 'Table 1: Excavation Summary',
          excerpt: 'Daily coal excavation totaled 45,210 tonnes. Overburden stripping reached 142,500 m³ with 3 shovel-dumper spreads.',
          verifiedStatus: 'verified'
        }
      ];
      suggestedFollowUps = [
        'Inspect source document in Validation Workbench',
        'Compare Rajmahal returns with SECL Gevra',
        'Draft a monthly return report for ECL'
      ];
    }
    // 8. SECL / Gevra Queries
    else if (lower.includes('gevra') || lower.includes('secl') || lower.includes('surface miner')) {
      answerText = 'During the September 2026 reporting cycle at SECL Gevra Mega Project, heavy excavation achieved 524,300 tonnes of coal production and 1,120,000 m³ of overburden removal. Surface miner operating hours totaled 432 hours with 98.2% conveyor uptime.';
      confidence = 0.99;
      status = 'sufficient';
      sources = [
        {
          documentId: 'doc-secl-002',
          documentTitle: 'Gevra Mega Project Heavy Excavation Shift Summary',
          subsidiary: 'SECL',
          collieryName: 'Gevra OCP',
          pageNumber: 1,
          tableReference: 'Surface Miner Shift Log',
          excerpt: 'Cumulative output exceeds 520,000 MT for the ten-day period with 98.2% conveyor belt uptime.',
          verifiedStatus: 'approved'
        }
      ];
      suggestedFollowUps = [
        'Inspect Gevra shift log in Validation Workbench',
        'Compare Gevra performance with ECL Rajmahal',
        'Compile this comparative data into a draft report'
      ];
    }
    // 9. BCCL / Moonidih / Washery Queries
    else if (lower.includes('washery') || lower.includes('bccl') || lower.includes('moonidih') || lower.includes('coking')) {
      answerText = 'At BCCL Moonidih Underground washery, raw coal feed was audited at 28,400 tonnes with clean coking yield preliminarily extracted at 48.2% and middlings production at 8,950 tonnes. Note: Carbon-copy slip decimals are flagged for human clarification in the Validation Workbench.';
      confidence = 0.88;
      status = 'insufficient';
      sources = [
        {
          documentId: 'doc-bccl-003',
          documentTitle: 'Moonidih Underground Washery Yield & Prime Coking Coal Audit',
          subsidiary: 'BCCL',
          collieryName: 'Moonidih UG',
          pageNumber: 1,
          tableReference: 'Washery Throughput Table',
          excerpt: 'Raw Coal Feed: 28,400 T. Clean Coking Yield %: 48.2% [Flagged for Decimal Clarification].',
          verifiedStatus: 'needs_review'
        }
      ];
      suggestedFollowUps = [
        'Open Moonidih audit in Validation Workbench to verify smudged values',
        'Create an Information Request to BCCL Nodal Cell',
        'Check average ash and coking yield parameters'
      ];
    }
    // 10. NCL / Jayant / Dragline / HEMM
    else if (lower.includes('jayant') || lower.includes('ncl') || lower.includes('dragline') || lower.includes('hemm')) {
      answerText = 'At NCL Jayant OCP (September 2026), dragline excavation reached 348,000 m³ with an overall HEMM fleet availability of 91.8%. Dragline 24/96 operated at 89.4% operational efficiency with cycle times averaging 62 seconds per pass.';
      confidence = 0.98;
      status = 'sufficient';
      sources = [
        {
          documentId: 'doc-ncl-004',
          documentTitle: 'Jayant OCP Dragline Productivity & HEMM Uptime Return',
          subsidiary: 'NCL',
          collieryName: 'Jayant OCP',
          pageNumber: 2,
          tableReference: 'HEMM Availability & Dragline Productivity',
          excerpt: 'Dragline 24/96 operated at 89.4% operational efficiency. Dragline cycle time averaged 62 seconds per pass.',
          verifiedStatus: 'approved'
        }
      ];
      suggestedFollowUps = [
        'Inspect Jayant HEMM return in Validation Workbench',
        'Draft an executive summary report for monitored returns'
      ];
    }
    // 11. CCL / Piparwar / Despatch
    else if (lower.includes('piparwar') || lower.includes('ccl') || lower.includes('rake') || lower.includes('despatch')) {
      answerText = 'At CCL Piparwar OCP (August 2026), beneficiated washed coal despatch reached 82,100 tonnes across 21 loaded railway rakes via the Tori-Shivpur rail line with zero recorded demurrage.';
      confidence = 0.96;
      status = 'sufficient';
      sources = [
        {
          documentId: 'doc-ccl-005',
          documentTitle: 'Piparwar Open Cast Beneficiation & Despatch Return',
          subsidiary: 'CCL',
          collieryName: 'Piparwar OCP',
          pageNumber: 1,
          tableReference: 'Despatch & Railway Rakes Log',
          excerpt: 'Beneficiated coal rakes despatched to Dadri & Rihand STPS via Tori-Shivpur rail line. Zero demurrage recorded.',
          verifiedStatus: 'approved'
        }
      ];
      suggestedFollowUps = [
        'Inspect Piparwar return in Validation Workbench',
        'Review multi-subsidiary rail despatch statistics'
      ];
    }
    // 12. Safety & Compliance
    else if (lower.includes('safety') || lower.includes('compliance') || lower.includes('dgms')) {
      answerText = 'Mechanized HEMM safety audit returns for Q2 show 94.2% statutory compliance across mechanized open cast operations. All active dragline and shovel-dumper spreads at Jayant OCP and Gevra OCP operated with zero DGMS critical safety notices recorded in audited shift logs.';
      confidence = 0.92;
      status = 'sufficient';
      sources = [
        {
          documentId: 'doc-ncl-004',
          documentTitle: 'Jayant OCP Dragline Productivity & HEMM Uptime Return',
          subsidiary: 'NCL',
          collieryName: 'Jayant OCP',
          pageNumber: 3,
          tableReference: 'Statutory Safety & Fleet Compliance',
          excerpt: 'HEMM fleet availability 91.8%. Zero DGMS statutory violations recorded during shift cycles.',
          verifiedStatus: 'approved'
        }
      ];
      suggestedFollowUps = [
        'Review Jayant OCP safety compliance records',
        'Draft safety and equipment availability report'
      ];
    }
    // 13. Data Gaps / Un-ingested Entities (e.g. Korba, 2024, WCL, MCL)
    else if (
      lower.includes('korba') ||
      lower.includes('talcher') ||
      lower.includes('singareni') ||
      lower.includes('sccl') ||
      lower.includes('wcl') ||
      lower.includes('mcl') ||
      lower.includes('2024') ||
      lower.includes('2025')
    ) {
      answerText = `No verified operational returns for "${trimmed}" are currently ingested in the authorized archive.

Available ingested returns in this environment cover:
• **ECL** (Rajmahal OCP – Aug 2026)
• **SECL** (Gevra Mega Project – Sep 2026)
• **NCL** (Jayant OCP – Sep 2026)
• **CCL** (Piparwar OCP – Aug 2026)
• **BCCL** (Moonidih UG Washery – Q2 2026)

To incorporate records for this unit, an authorized officer can upload statutory return documents or submit shift figures via the **Documents & Ingestion** pipeline.`;
      confidence = 0.15;
      status = 'insufficient';
      sources = [];
      suggestedFollowUps = [
        'Upload operational documents in Ingestion pipeline',
        'Create an Information Request for missing returns',
        'What was the monthly coal production and OB removal at Rajmahal OCP?'
      ];
    }
    // 14. Honest Fallback (Never fabricate figures or hallucinate!)
    else {
      answerText = `I could not locate verified coal records matching "${trimmed}" in the current archive.

Ask-MineSetu is strictly grounded on verified Coal India records to prevent hallucination. You can:
1. **Query specific collieries:** Rajmahal OCP (ECL), Gevra Mega Project (SECL), Jayant OCP (NCL), Piparwar OCP (CCL), or Moonidih UG (BCCL).
2. **Query specific operational metrics:** Raw coal production, Overburden (OB) removal, HEMM fleet uptime, or Rail despatches.
3. **Compare performance:** Compare ECL vs SECL excavation figures.
4. **Draft a report:** Request an executive summary report from verified returns.`;
      confidence = 0.20;
      status = 'insufficient';
      sources = [];
      suggestedFollowUps = [
        'What was the monthly coal production and OB removal at Rajmahal OCP?',
        'What is the surface miner operating uptime and production at Gevra Mega Project?',
        'Compare Q2 returns between ECL and SECL',
        'Draft an executive summary report for monitored returns'
      ];
    }

    // Combine attached sources if any were provided
    if (attachedSources.length > 0) {
      sources = [...attachedSources, ...sources.filter(s => !attachedDocIds.includes(s.documentId))];
    }

    const aiRes: AIQueryResponse = {
      answer: answerText,
      confidence,
      status,
      sources,
      suggestedFollowUps
    };

    setChatMessages(prev => [
      ...prev,
      { id: `usr-${Date.now()}`, sender: 'user', text: query, timestamp: new Date().toISOString() },
      { id: `ast-${Date.now()}`, sender: 'assistant', text: aiRes.answer, timestamp: new Date().toISOString(), response: aiRes }
    ]);

    return aiRes;
  };

  const clearChat = () => {
    setChatMessages([
      {
        id: 'msg-welcome',
        sender: 'assistant',
        text: 'Welcome to Ask-MineSetu. Inquire about verified multi-subsidiary coal production, overburden removal, HEMM availability, or request assistance compiling statutory report drafts.',
        timestamp: new Date().toISOString(),
      }
    ]);
  };

  const resetDatasetToDefaults = () => {
    localStorage.removeItem('minesetu_docs');
    localStorage.removeItem('minesetu_manual_recs');
    localStorage.removeItem('minesetu_requests');
    localStorage.removeItem('minesetu_reports');
    localStorage.removeItem('minesetu_audit');
    localStorage.removeItem('minesetu_active_role');

    setDocuments(INITIAL_DOCUMENTS);
    setManualRecords(INITIAL_MANUAL_RECORDS);
    setRequests(INITIAL_INFORMATION_REQUESTS);
    setReports(INITIAL_REPORTS);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    setCurrentUser(DEMO_PERSONAS['cmpdi']);
    clearChat();
    logAuditAction('dataset.reset', 'system', 'seed', 'success');
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        switchRole,
        currentRoute,
        navigateTo,

        documents,
        selectedDocumentId,
        selectDocument,
        updateExtractedField,
        setDocumentStatus,
        uploadDocument,
        deleteDocument,

        manualRecords,
        addManualRecord,
        updateManualRecordStatus,

        requests,
        selectedRequestId,
        selectRequest,
        createRequest,
        respondToRequest,
        updateRequestStatus,

        reports,
        selectedReportId,
        selectReport,
        createReportDraft,
        updateReportDraftText,

        topicClusters,
        selectedTopic,
        selectTopic,

        chatMessages,
        executeAIQuery,
        clearChat,

        notifications,
        markNotificationAsRead,
        isNotificationsOpen,
        setIsNotificationsOpen,

        globalSearchQuery,
        setGlobalSearchQuery,

        auditLogs,
        logAuditAction,

        resetDatasetToDefaults,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
