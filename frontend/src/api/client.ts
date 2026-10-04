/**
 * MineSetu AI — Typed API Client
 *
 * Provides a typed, centralized API client for all frontend-to-backend
 * communication. Supports dual-mode operation:
 *
 * 1. **Live mode**: Calls the Vercel API gateway at /api/v1/*
 * 2. **Demo mode**: Falls back to local mock data when API is unavailable
 *
 * All methods attach the Bearer JWT token from Supabase session.
 */

import { getSupabaseClient } from '../lib/supabase';
import type {
  DocumentRecord,
  ManualRecord,
  InformationRequest,
  ReportDraft,
  Role,
  User,
  Permission,
} from '../types';

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';
const IS_DEMO_MODE = import.meta.env.VITE_APP_DEMO_MODE === 'true';

// ---------------------------------------------------------------------------
// HTTP Helpers
// ---------------------------------------------------------------------------

interface ApiResponse<T = unknown> {
  ok: boolean;
  data?: T;
  error?: string;
  details?: unknown;
}

async function getAuthHeaders(): Promise<Record<string, string>> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  const supabase = getSupabaseClient();
  if (supabase) {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.access_token) {
      headers['Authorization'] = `Bearer ${session.access_token}`;
    }
  }

  // In demo mode, attach the demo role header for /me endpoint
  if (IS_DEMO_MODE) {
    const demoRole = localStorage.getItem('minesetu_demo_role');
    if (demoRole) {
      headers['X-Demo-Role'] = demoRole;
    }
  }

  return headers;
}

async function apiRequest<T>(
  path: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers: { ...headers, ...options.headers },
    });

    const json = await response.json();
    return json as ApiResponse<T>;
  } catch (err) {
    console.warn(`[API] Request failed: ${path}`, err);
    return {
      ok: false,
      error: err instanceof Error ? err.message : 'Network error',
    };
  }
}

// ---------------------------------------------------------------------------
// Auth API
// ---------------------------------------------------------------------------

export const authApi = {
  async login(email: string, password: string) {
    return apiRequest<{
      session: { access_token: string; refresh_token: string; expires_at: number };
      user: { id: string; email: string; role: string };
    }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  async logout() {
    return apiRequest<{ message: string }>('/auth/logout', {
      method: 'POST',
    });
  },

  async getMe() {
    return apiRequest<{
      user: User & { isDemo: boolean };
      permissions: Permission[];
    }>('/auth/me');
  },

  async switchDemoPersona(role: Role) {
    localStorage.setItem('minesetu_demo_role', role);
    return apiRequest<{
      user: User & { isDemo: boolean };
      permissions: Permission[];
    }>('/auth/demo', {
      method: 'POST',
      body: JSON.stringify({ role }),
    });
  },
};

// ---------------------------------------------------------------------------
// Documents API
// ---------------------------------------------------------------------------

export const documentsApi = {
  async list(params?: {
    category?: string;
    status?: string;
    subsidiaryCode?: string;
    page?: number;
    limit?: number;
  }) {
    const searchParams = new URLSearchParams({ action: 'list' });
    if (params?.category) searchParams.set('category', params.category);
    if (params?.status) searchParams.set('status', params.status);
    if (params?.subsidiaryCode) searchParams.set('subsidiaryCode', params.subsidiaryCode);
    if (params?.page) searchParams.set('page', String(params.page));
    if (params?.limit) searchParams.set('limit', String(params.limit));

    return apiRequest<{
      documents: DocumentRecord[];
      pagination: { page: number; limit: number; total: number; totalPages: number };
    }>(`/documents?${searchParams}`);
  },

  async get(id: string) {
    return apiRequest<{ document: DocumentRecord }>(`/documents?action=get&id=${id}`);
  },

  async createUploadIntent(data: {
    fileName: string;
    fileSizeBytes: number;
    mimeType: string;
    category?: string;
    reportingPeriod?: string;
    mineId?: string;
  }) {
    return apiRequest<{
      documentId: string;
      signedUrl: string;
      storagePath: string;
      expiresIn: number;
    }>('/documents?action=upload-intent', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async confirmUpload(documentId: string, sha256Hash?: string) {
    return apiRequest<{
      documentId: string;
      status: string;
      message: string;
    }>('/documents?action=confirm', {
      method: 'POST',
      body: JSON.stringify({ documentId, sha256Hash }),
    });
  },

  async updateStatus(documentId: string, status: string, reviewNotes?: string) {
    return apiRequest<{ documentId: string; status: string }>(
      '/documents?action=status',
      {
        method: 'PATCH',
        body: JSON.stringify({ documentId, status, reviewNotes }),
      }
    );
  },

  async updateField(documentId: string, fieldId: string, verifiedValue: string, notes?: string) {
    return apiRequest<{ fieldId: string; verifiedValue: string; status: string }>(
      '/documents?action=field',
      {
        method: 'PATCH',
        body: JSON.stringify({ documentId, fieldId, verifiedValue, notes }),
      }
    );
  },

  async delete(id: string) {
    return apiRequest<{ documentId: string; message: string }>(
      `/documents?action=delete&id=${id}`,
      { method: 'DELETE' }
    );
  },

  /**
   * Upload a file directly to Supabase Storage using the signed URL.
   * This bypasses the API gateway — the binary goes straight to storage.
   */
  async uploadFile(signedUrl: string, file: File): Promise<{ ok: boolean; error?: string }> {
    try {
      const response = await fetch(signedUrl, {
        method: 'PUT',
        headers: { 'Content-Type': file.type },
        body: file,
      });

      if (!response.ok) {
        return { ok: false, error: `Upload failed: ${response.statusText}` };
      }
      return { ok: true };
    } catch (err) {
      return {
        ok: false,
        error: err instanceof Error ? err.message : 'Upload failed',
      };
    }
  },
};

// ---------------------------------------------------------------------------
// Manual Records API
// ---------------------------------------------------------------------------

export const manualRecordsApi = {
  async list(params?: {
    category?: string;
    status?: string;
    subsidiaryCode?: string;
    page?: number;
    limit?: number;
  }) {
    const searchParams = new URLSearchParams({ action: 'list' });
    if (params?.category) searchParams.set('category', params.category);
    if (params?.status) searchParams.set('status', params.status);
    if (params?.subsidiaryCode) searchParams.set('subsidiaryCode', params.subsidiaryCode);
    if (params?.page) searchParams.set('page', String(params.page));
    if (params?.limit) searchParams.set('limit', String(params.limit));

    return apiRequest<{
      records: ManualRecord[];
      pagination: { page: number; limit: number; total: number; totalPages: number };
    }>(`/manual-records?${searchParams}`);
  },

  async get(id: string) {
    return apiRequest<{ record: ManualRecord }>(`/manual-records?action=get&id=${id}`);
  },

  async create(data: {
    title: string;
    category: string;
    reportingPeriod: string;
    subsidiaryCode?: string;
    collieryName?: string;
    sourceDate?: string;
    sourceExplanation?: string;
    notes?: string;
    fields: Array<{ fieldName: string; value: string; unit: string; sourceNote?: string }>;
  }) {
    return apiRequest<{ recordId: string; status: string }>('/manual-records?action=create', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateStatus(recordId: string, status: string, reviewNotes?: string) {
    return apiRequest<{ recordId: string; status: string }>(
      '/manual-records?action=status',
      {
        method: 'PATCH',
        body: JSON.stringify({ recordId, status, reviewNotes }),
      }
    );
  },

  async delete(id: string) {
    return apiRequest<{ recordId: string; message: string }>(
      `/manual-records?action=delete&id=${id}`,
      { method: 'DELETE' }
    );
  },
};

// ---------------------------------------------------------------------------
// Requests API
// ---------------------------------------------------------------------------

export const requestsApi = {
  async list(params?: {
    status?: string;
    direction?: 'sent' | 'received';
    page?: number;
    limit?: number;
  }) {
    const searchParams = new URLSearchParams({ action: 'list' });
    if (params?.status) searchParams.set('status', params.status);
    if (params?.direction) searchParams.set('direction', params.direction);
    if (params?.page) searchParams.set('page', String(params.page));
    if (params?.limit) searchParams.set('limit', String(params.limit));

    return apiRequest<{
      requests: InformationRequest[];
      pagination: { page: number; limit: number; total: number; totalPages: number };
    }>(`/requests?${searchParams}`);
  },

  async get(id: string) {
    return apiRequest<{ request: InformationRequest }>(`/requests?action=get&id=${id}`);
  },

  async create(data: {
    subject: string;
    description: string;
    recipientOrganizationId: string;
    reportingPeriod?: string;
    requestedFields?: string[];
    dueDate?: string;
  }) {
    return apiRequest<{ requestId: string; requestNumber: string; status: string }>(
      '/requests?action=create',
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );
  },

  async respond(requestId: string, responseText: string, attachedDocumentIds?: string[]) {
    return apiRequest<{ requestId: string; message: string }>('/requests?action=respond', {
      method: 'POST',
      body: JSON.stringify({ requestId, responseText, attachedDocumentIds }),
    });
  },

  async updateStatus(requestId: string, status: string, note?: string) {
    return apiRequest<{ requestId: string; status: string }>('/requests?action=status', {
      method: 'PATCH',
      body: JSON.stringify({ requestId, status, note }),
    });
  },
};

// ---------------------------------------------------------------------------
// Reviews API
// ---------------------------------------------------------------------------

export const reviewsApi = {
  async getQueue(params?: {
    type?: 'document' | 'manual_record';
    page?: number;
    limit?: number;
  }) {
    const searchParams = new URLSearchParams({ action: 'queue' });
    if (params?.type) searchParams.set('type', params.type);
    if (params?.page) searchParams.set('page', String(params.page));
    if (params?.limit) searchParams.set('limit', String(params.limit));

    return apiRequest<{
      documents?: any[];
      manualRecords?: any[];
      totalItems: number;
    }>(`/reviews?${searchParams}`);
  },

  async get(id: string, type: 'document' | 'manual_record' = 'document') {
    return apiRequest<{ type: string; item: any }>(`/reviews?action=get&id=${id}&type=${type}`);
  },

  async approve(entityId: string, entityType: string = 'document', reviewNotes?: string) {
    return apiRequest<{ entityId: string; status: string }>('/reviews?action=approve', {
      method: 'POST',
      body: JSON.stringify({ entityId, entityType, reviewNotes }),
    });
  },

  async returnForCorrection(
    entityId: string,
    entityType: string = 'document',
    reviewNotes?: string
  ) {
    return apiRequest<{ entityId: string; status: string }>('/reviews?action=return', {
      method: 'POST',
      body: JSON.stringify({ entityId, entityType, reviewNotes }),
    });
  },

  async reject(entityId: string, entityType: string = 'document', reviewNotes?: string) {
    return apiRequest<{ entityId: string; status: string }>('/reviews?action=reject', {
      method: 'POST',
      body: JSON.stringify({ entityId, entityType, reviewNotes }),
    });
  },
};

// ---------------------------------------------------------------------------
// Reports API
// ---------------------------------------------------------------------------

export const reportsApi = {
  async list(params?: { page?: number; limit?: number }) {
    const searchParams = new URLSearchParams({ action: 'list' });
    if (params?.page) searchParams.set('page', String(params.page));
    if (params?.limit) searchParams.set('limit', String(params.limit));

    return apiRequest<{
      reports: ReportDraft[];
      pagination: { page: number; limit: number; total: number; totalPages: number };
    }>(`/reports?${searchParams}`);
  },

  async get(id: string) {
    return apiRequest<{ report: ReportDraft }>(`/reports?action=get&id=${id}`);
  },

  async create(data: {
    title: string;
    reportType: string;
    reportingPeriod: string;
    scope?: string;
    selectedSubsidiaries?: string[];
    comparisonBasis?: string;
    executiveSummary?: string;
    outputFormats?: string[];
  }) {
    return apiRequest<{ reportId: string; status: string }>('/reports?action=create', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async compile(reportId: string) {
    return apiRequest<{ reportId: string; status: string; message: string }>(
      '/reports?action=compile',
      {
        method: 'POST',
        body: JSON.stringify({ reportId }),
      }
    );
  },

  async download(reportId: string, format: string = 'pdf') {
    return apiRequest<{
      reportId: string;
      format: string;
      downloadUrl: string;
      expiresIn: number;
    }>(`/reports?action=download&id=${reportId}&format=${format}`);
  },
};
