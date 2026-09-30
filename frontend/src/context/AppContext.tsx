import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User, Role, DocumentRecord, ParliamentaryQuery, TopicCluster, AuditEvent, AIQueryResponse } from '../types';
import { DEMO_PERSONAS, can } from '../lib/rbac';
import { INITIAL_DOCUMENTS, INITIAL_PARLIAMENTARY_QUERIES, TOPIC_CLUSTERS, INITIAL_AUDIT_LOGS } from '../data/mockMiningData';

interface AppContextType {
  currentUser: User;
  switchRole: (role: Role) => void;
  currentRoute: string;
  navigateTo: (route: string) => void;
  
  // Document Intelligence state & actions
  documents: DocumentRecord[];
  selectedDocumentId: string | null;
  selectDocument: (id: string | null) => void;
  updateExtractedField: (docId: string, fieldId: string, verifiedValue: string, notes?: string) => void;
  setDocumentStatus: (docId: string, status: DocumentRecord['status'], reviewNotes?: string) => void;
  uploadDocument: (newDoc: Partial<DocumentRecord>) => Promise<string>;

  // Parliamentary Desk state & actions
  parliamentaryQueries: ParliamentaryQuery[];
  selectedQueryId: string | null;
  selectParliamentaryQuery: (id: string | null) => void;
  updateQueryResponse: (queryId: string, responseText: string, status: ParliamentaryQuery['workflowStatus']) => void;

  // Topic Intelligence
  topicClusters: TopicCluster[];
  selectedTopic: string | null;
  selectTopic: (topicName: string | null) => void;

  // Audit Logs
  auditLogs: AuditEvent[];
  logAuditAction: (action: string, entityType: string, entityId: string, result: 'success' | 'failure' | 'denied', metadata?: Record<string, any>) => void;

  // AI Query (RAG)
  executeAIQuery: (query: string, subsidiaryFilter?: string) => Promise<AIQueryResponse>;

  // Admin Actions
  resetDatasetToDefaults: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Default user is CMPDI Nodal Expert (central to data validation & AI modules)
  const [currentUser, setCurrentUser] = useState<User>(() => {
    const savedRole = localStorage.getItem('minesetu_active_role') as Role;
    return (savedRole && DEMO_PERSONAS[savedRole]) ? DEMO_PERSONAS[savedRole] : DEMO_PERSONAS['cmpdi_nodal'];
  });

  const [currentRoute, setCurrentRoute] = useState<string>(() => {
    return window.location.pathname || '/';
  });

  const [documents, setDocuments] = useState<DocumentRecord[]>(INITIAL_DOCUMENTS);
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(INITIAL_DOCUMENTS[0].id);
  const [parliamentaryQueries, setParliamentaryQueries] = useState<ParliamentaryQuery[]>(INITIAL_PARLIAMENTARY_QUERIES);
  const [selectedQueryId, setSelectedQueryId] = useState<string | null>(INITIAL_PARLIAMENTARY_QUERIES[0].id);
  const [topicClusters] = useState<TopicCluster[]>(TOPIC_CLUSTERS);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditEvent[]>(INITIAL_AUDIT_LOGS);

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
      logAuditAction('role.switch', 'user', persona.id, 'success', { newRole, email: persona.email });
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
      metadata: metadata || {}
    };
    setAuditLogs(prev => [newEntry, ...prev]);
  };

  const selectDocument = (id: string | null) => {
    setSelectedDocumentId(id);
  };

  const selectParliamentaryQuery = (id: string | null) => {
    setSelectedQueryId(id);
  };

  const selectTopic = (topicName: string | null) => {
    setSelectedTopic(topicName);
  };

  const updateExtractedField = (docId: string, fieldId: string, verifiedValue: string, notes?: string) => {
    if (!can(currentUser, 'documents.verify')) {
      logAuditAction('documents.verify', 'extracted_record', fieldId, 'denied', { reason: 'Unauthorized role' });
      alert('Access Denied: Your current role lacks verification privileges.');
      return;
    }

    setDocuments(prev =>
      prev.map(doc => {
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

    logAuditAction('documents.verify', 'extracted_record', fieldId, 'success', {
      docId,
      verifiedValue,
      notes
    });
  };

  const setDocumentStatus = (docId: string, status: DocumentRecord['status'], reviewNotes?: string) => {
    if (status === 'approved' && !can(currentUser, 'documents.approve')) {
      logAuditAction('documents.approve', 'document', docId, 'denied', { reason: 'Approval rights required' });
      alert('Access Denied: Only CMPDI Nodal, Subsidiary Managers, or Executives may approve documents.');
      return;
    }

    setDocuments(prev =>
      prev.map(doc => {
        if (doc.id !== docId) return doc;
        return { ...doc, status };
      })
    );

    logAuditAction(`documents.${status}`, 'document', docId, 'success', { status, reviewNotes });
  };

  const uploadDocument = async (newDoc: Partial<DocumentRecord>): Promise<string> => {
    if (!can(currentUser, 'documents.upload')) {
      logAuditAction('documents.upload', 'document', 'new', 'denied', { reason: 'Upload rights required' });
      throw new Error('Access Denied: Your role lacks document upload permission.');
    }

    const docId = `doc-${newDoc.subsidiaryCode?.toLowerCase() || 'gen'}-${Date.now().toString(36)}`;
    const fullRecord: DocumentRecord = {
      id: docId,
      title: newDoc.title || 'Untitled Colliery Log Return',
      fileName: newDoc.fileName || 'scanned_return.pdf',
      subsidiaryCode: newDoc.subsidiaryCode || currentUser.subsidiaryCode || 'CMPDI',
      collieryName: newDoc.collieryName || currentUser.collieryName || 'Central Cell',
      status: 'needs_review',
      ocrConfidence: 91.5,
      uploadedAt: new Date().toISOString(),
      uploadedBy: `${currentUser.name} (${currentUser.roleLabel})`,
      fileSize: newDoc.fileSize || '1.9 MB',
      pageCount: newDoc.pageCount || 2,
      extractedSummary: newDoc.extractedSummary || 'Automatic OCR processed key tabular entries.',
      extractedFields: newDoc.extractedFields || [
        { id: `f-${Date.now()}-1`, fieldName: 'coal_prod_tonnes', label: 'Coal Excavation', extractedValue: '31,240', unit: 'Tonnes', confidence: 93, status: 'auto_extracted', pageNumber: 1 },
        { id: `f-${Date.now()}-2`, fieldName: 'ob_removal_m3', label: 'Overburden Removal', extractedValue: '88,400', unit: 'm³', confidence: 90, status: 'auto_extracted', pageNumber: 1 }
      ],
      isDemo: true,
    };

    setDocuments(prev => [fullRecord, ...prev]);
    logAuditAction('documents.upload', 'document', docId, 'success', { title: fullRecord.title });
    return docId;
  };

  const updateQueryResponse = (queryId: string, responseText: string, status: ParliamentaryQuery['workflowStatus']) => {
    setParliamentaryQueries(prev =>
      prev.map(q => {
        if (q.id !== queryId) return q;
        if (status === 'approved') {
          return { ...q, approvedResponse: responseText, workflowStatus: 'approved', approvedByName: currentUser.name };
        }
        return { ...q, reviewedResponse: responseText, workflowStatus: status };
      })
    );

    logAuditAction(`parliamentary.${status}`, 'parliamentary_query', queryId, 'success', { status });
  };

  const executeAIQuery = async (query: string, subsidiaryFilter?: string): Promise<AIQueryResponse> => {
    // Artificial latency for authentic grounded inference experience
    await new Promise(r => setTimeout(r, 600));

    const lowerQ = query.toLowerCase();

    // Check for out-of-domain or unsubstantiated query
    if (lowerQ.includes('uranium') || lowerQ.includes('petroleum') || lowerQ.includes('gold reserves') || lowerQ.includes('cryptocurrency')) {
      logAuditAction('ai.query', 'ai_engine', 'insufficient_evidence', 'success', { query });
      return {
        answer: 'Insufficient source evidence to answer this question. The current MDMS knowledge base only indexes verified Coal India operational returns, lithology logs, and statutory DGMS safety filings.',
        confidence: 0.15,
        sources: [],
        status: 'insufficient'
      };
    }

    // Filter relevant documents
    const candidateDocs = documents.filter(doc => {
      if (subsidiaryFilter && subsidiaryFilter !== 'ALL' && doc.subsidiaryCode !== subsidiaryFilter) {
        return false;
      }
      return true;
    });

    // Check for Gevra / SECL production
    if (lowerQ.includes('gevra') || lowerQ.includes('secl') || lowerQ.includes('surface miner')) {
      const seclDoc = candidateDocs.find(d => d.subsidiaryCode === 'SECL') || candidateDocs[0];
      return {
        answer: 'Based on the verified Heavy Excavation Shift Summary for SECL Gevra Mega Project, cumulative coal production reached 524,300 tonnes for the evaluated cycle with 1,120,000 m³ of overburden removal. Surface miners operated for 432 hours with an average 98.2% conveyor belt uptime.',
        confidence: 0.96,
        status: 'sufficient',
        sources: [
          {
            documentId: seclDoc.id,
            documentTitle: seclDoc.title,
            subsidiary: 'SECL',
            pageNumber: 1,
            excerpt: 'Total coal excavation: 524,300 tonnes. OB stripping: 1,120,000 m³; surface miners uptime: 98.2%.',
            verifiedStatus: 'approved'
          }
        ],
        suggestedFollowUps: [
          'What was the OB stripping ratio at Gevra OCP?',
          'Compare Gevra production with Rajmahal OCP (ECL)',
          'Check conveyor downtime logs'
        ]
      };
    }

    // Check for Rajmahal / ECL
    if (lowerQ.includes('rajmahal') || lowerQ.includes('ecl') || lowerQ.includes('ash')) {
      const eclDoc = candidateDocs.find(d => d.subsidiaryCode === 'ECL') || candidateDocs[0];
      return {
        answer: 'According to the verified Monthly Return for ECL Rajmahal OCP, total coal production was recorded at 45,210 tonnes with an average ash content of 38.4%. Overburden removal totaled 142,500 m³ across 3 shovel-dumper spreads.',
        confidence: 0.94,
        status: 'sufficient',
        sources: [
          {
            documentId: eclDoc.id,
            documentTitle: eclDoc.title,
            subsidiary: 'ECL',
            pageNumber: 1,
            excerpt: 'Coal Production: 45,210 Tonnes. Average Ash Content: 38.4%. Rail Despatch: 18 rakes.',
            verifiedStatus: 'needs_review'
          }
        ],
        suggestedFollowUps: [
          'What caused the rail despatch rake delay at Rajmahal?',
          'View unverified fields in Rajmahal August return',
          'Download ECL monthly executive summary'
        ]
      };
    }

    // Check for safety compliance / DGMS
    if (lowerQ.includes('safety') || lowerQ.includes('dgms') || lowerQ.includes('inspection')) {
      return {
        answer: 'Statutory safety audits across Coal India open cast mechanized fleets achieved a 96.8% compliance rating. Continuous slope stability radar monitoring and mandatory audio-visual alarms (AVA) on all 100-tonne haul dumpers have been fully implemented.',
        confidence: 0.92,
        status: 'sufficient',
        sources: [
          {
            documentId: 'doc-ncl-004',
            documentTitle: 'Jayant OCP Dragline Productivity & HEMM Uptime Return',
            subsidiary: 'NCL',
            pageNumber: 2,
            excerpt: 'HEMM Fleet Availability: 91.8%. Audio-visual alarm retrofitting completed with zero major lost-time infractions.',
            verifiedStatus: 'approved'
          }
        ],
        suggestedFollowUps: [
          'Show safety compliance breakdown by subsidiary',
          'View recent DGMS circulars',
          'Draft parliamentary reply for Q#402'
        ]
      };
    }

    // Default grounded synthesis
    const topDoc = candidateDocs[0] || documents[0];
    return {
      answer: `Cross-subsidiary synthesis over ${candidateDocs.length} verified documents shows consistent operational pacing. In ${topDoc.subsidiaryCode} (${topDoc.collieryName}), the most recent reported figure is ${topDoc.extractedFields[0]?.label || 'Production'} of ${topDoc.extractedFields[0]?.extractedValue || 'N/A'} ${topDoc.extractedFields[0]?.unit || ''}.`,
      confidence: 0.88,
      status: 'sufficient',
      sources: [
        {
          documentId: topDoc.id,
          documentTitle: topDoc.title,
          subsidiary: topDoc.subsidiaryCode,
          pageNumber: 1,
          excerpt: topDoc.extractedSummary,
          verifiedStatus: topDoc.status === 'approved' ? 'approved' : 'verified'
        }
      ],
      suggestedFollowUps: [
        'Filter query to a single subsidiary',
        'Compare actual vs target tonnages',
        'View full OCR extraction table'
      ]
    };
  };

  const resetDatasetToDefaults = () => {
    setDocuments(INITIAL_DOCUMENTS);
    setParliamentaryQueries(INITIAL_PARLIAMENTARY_QUERIES);
    setSelectedDocumentId(INITIAL_DOCUMENTS[0].id);
    setSelectedQueryId(INITIAL_PARLIAMENTARY_QUERIES[0].id);
    setSelectedTopic(null);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    logAuditAction('system.reset', 'database', 'global', 'success', { note: 'Synthetic dataset reseeded to factory baseline' });
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
        parliamentaryQueries,
        selectedQueryId,
        selectParliamentaryQuery,
        updateQueryResponse,
        topicClusters,
        selectedTopic,
        selectTopic,
        auditLogs,
        logAuditAction,
        executeAIQuery,
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
