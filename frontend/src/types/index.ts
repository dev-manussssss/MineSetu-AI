// MineSetu AI — Core Domain TypeScript Definitions

export type Role =
  // 4 Approved Primary Personas
  | 'ministry_coal'
  | 'cil_hq'
  | 'cmpdi'
  | 'subsidiary_officer'
  // Legacy aliases for full backward-compatibility with tests & prior scaffolding
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
  organization?: string;
  subsidiaryCode?: string; // e.g. 'ECL', 'SECL'
  collieryName?: string;
  avatarUrl?: string;
  isDemo: boolean;
}

export type Permission =
  | 'documents.upload'
  | 'documents.view'
  | 'documents.verify'
  | 'documents.approve'
  | 'manual.entry'
  | 'submissions.review'
  | 'submissions.return'
  | 'requests.create'
  | 'requests.respond'
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
  | 'draft'
  | 'queued'
  | 'processing'
  | 'completed'
  | 'partially_extracted'
  | 'needs_review'
  | 'ready_to_search'
  | 'submitted'
  | 'under_review'
  | 'returned_for_correction'
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
  boundingBox?: [number, number, number, number];
  notes?: string;
}

export interface DocumentRecord {
  id: string;
  title: string;
  fileName: string;
  category?: 'production' | 'overburden' | 'geological' | 'safety' | 'despatch' | 'statutory';
  reportingPeriod?: string;
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
  fileUrl?: string;
}

export interface ManualRecordField {
  id: string;
  fieldName: string;
  value: string;
  unit: string;
  sourceNote?: string;
}

export interface ManualRecord {
  id: string;
  title: string;
  category: 'production' | 'overburden' | 'geological' | 'safety' | 'despatch';
  reportingPeriod: string;
  subsidiaryCode: string;
  collieryName: string;
  sourceDate: string;
  sourceExplanation?: string;
  status: 'draft' | 'submitted' | 'under_review' | 'accepted' | 'returned';
  fields: ManualRecordField[];
  authorName: string;
  authorRole: string;
  createdAt: string;
  isDemo: boolean;
  notes?: string;
}

export interface InformationRequest {
  id: string;
  requestNumber: string;
  subject: string;
  description: string;
  requestingOrg: string;
  requestingPersona: string;
  recipientOrg: string;
  recipientPersona: string;
  reportingPeriod: string;
  requestedFields: string[];
  dueDate: string;
  status: 'draft' | 'awaiting_response' | 'partially_answered' | 'submitted' | 'clarification_required' | 'completed';
  lastUpdate: string;
  responseText?: string;
  attachedDocumentIds?: string[];
  clarificationNotes?: string[];
  isDemo: boolean;
}

export interface GroundedSource {
  documentId: string;
  documentTitle: string;
  subsidiary: string;
  collieryName?: string;
  pageNumber: number;
  tableReference?: string;
  excerpt: string;
  verifiedStatus: 'approved' | 'needs_review' | 'verified';
}

export interface AIQueryResponse {
  answer: string;
  confidence: number;
  sources: GroundedSource[];
  status: 'sufficient' | 'insufficient' | 'conflicting';
  conflictDetails?: string;
  suggestedFollowUps?: string[];
}

export interface ReportDraft {
  id: string;
  title: string;
  reportType: string;
  reportingPeriod: string;
  scope: string;
  selectedSubsidiaries: string[];
  comparisonBasis: string;
  executiveSummary: string;
  metricsTable: Array<{
    subsidiary: string;
    mine: string;
    coalTonnes: string;
    obM3: string;
    status: string;
    confidence: string;
  }>;
  sources: string[];
  draftStatus: 'draft' | 'reviewed' | 'final';
  generatedAt: string;
  author: string;
  isDemo: boolean;
  outputFormats: Array<'pdf' | 'docx' | 'xlsx'>;
}

export interface TopicCluster {
  id: string;
  name: string;
  weight: number; // For word cloud sizing (12-36px)
  frequency: number;
  sentiment: 'positive' | 'neutral' | 'urgent';
  subsidiaryBreakdown: Record<string, number>;
  sampleExcerpts: string[];
  category?: string;
}

export interface AuditEvent {
  id: string;
  timestamp: string;
  actorName: string;
  actorRole: string;
  action: string;
  entityType: string;
  entityId: string;
  result: 'success' | 'failure' | 'denied';
  metadata?: Record<string, any>;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: 'request' | 'document' | 'review' | 'system';
  linkRoute?: string;
}
