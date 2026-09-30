// MDMS + Mindsetu AI — Core Domain TypeScript Definitions

export type Role =
  | 'ministry_exec'
  | 'cil_exec'
  | 'cmpdi_nodal'
  | 'subsidiary_mgr'
  | 'parliamentary_cell'
  | 'field_officer'
  | 'sys_admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  roleLabel: string;
  department: string;
  subsidiaryCode?: string; // e.g. 'ECL', 'SECL'
  collieryName?: string;
  isDemo: boolean;
}

export type Permission =
  | 'documents.upload'
  | 'documents.view'
  | 'documents.verify'
  | 'documents.approve'
  | 'analytics.national'
  | 'analytics.subsidiary'
  | 'queries.execute'
  | 'parliamentary.draft'
  | 'parliamentary.approve'
  | 'reports.generate'
  | 'topic.analyze'
  | 'admin.users'
  | 'audit.view';

export type DocumentStatus =
  | 'queued'
  | 'processing'
  | 'completed'
  | 'partially_extracted'
  | 'needs_review'
  | 'approved'
  | 'rejected'
  | 'failed';

export interface ExtractedField {
  id: string;
  fieldName: string;
  label: string;
  extractedValue: string;
  verifiedValue?: string;
  unit?: string;
  confidence: number; // 0-100
  status: 'auto_extracted' | 'verified' | 'flagged_error' | 'approved';
  pageNumber: number;
  notes?: string;
}

export interface DocumentRecord {
  id: string;
  title: string;
  fileName: string;
  subsidiaryCode: string;
  collieryName: string;
  status: DocumentStatus;
  ocrConfidence: number;
  uploadedAt: string;
  uploadedBy: string;
  fileSize: string;
  pageCount: number;
  extractedSummary: string;
  extractedFields: ExtractedField[];
  isDemo: boolean;
}

export interface GroundedSource {
  documentId: string;
  documentTitle: string;
  subsidiary: string;
  pageNumber: number;
  excerpt: string;
  verifiedStatus: 'approved' | 'needs_review' | 'verified';
}

export interface AIQueryResponse {
  answer: string;
  confidence: number;
  sources: GroundedSource[];
  status: 'sufficient' | 'insufficient' | 'conflicting';
  suggestedFollowUps?: string[];
}

export interface ParliamentaryQuery {
  id: string;
  queryNumber: string;
  house: 'Lok Sabha' | 'Rajya Sabha';
  session: string;
  questionText: string;
  category: string;
  workflowStatus:
    | 'intake'
    | 'retrieval_complete'
    | 'ai_draft_ready'
    | 'under_review'
    | 'approved'
    | 'dispatched';
  aiDraft?: string;
  reviewedResponse?: string;
  approvedResponse?: string;
  groundedSources: GroundedSource[];
  assignedToName: string;
  approvedByName?: string;
  submissionDeadline: string;
  isDemo: boolean;
}

export interface TopicCluster {
  id: string;
  name: string;
  weight: number; // For word cloud sizing (10-100)
  frequency: number;
  sentiment: 'positive' | 'neutral' | 'urgent';
  subsidiaryBreakdown: Record<string, number>;
  sampleExcerpts: string[];
}

export interface AuditEvent {
  id: string;
  timestamp: string;
  actorName: string;
  actorRole: Role;
  action: string;
  entityType: string;
  entityId: string;
  result: 'success' | 'failure' | 'denied';
  metadata?: Record<string, any>;
}
