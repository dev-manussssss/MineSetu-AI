/**
 * MineSetu AI — Documents API Endpoints
 * Path: /api/v1/documents
 *
 * Endpoints:
 * - GET    /api/v1/documents?action=list       — List documents (filtered by user org/role)
 * - GET    /api/v1/documents?action=get&id=X   — Get single document with extracted fields
 * - POST   /api/v1/documents?action=upload-intent  — Create upload intent + signed URL
 * - POST   /api/v1/documents?action=confirm    — Confirm upload + enqueue processing job
 * - PATCH  /api/v1/documents?action=status     — Update document status (review workflow)
 * - PATCH  /api/v1/documents?action=field      — Update a single extracted field value
 * - DELETE /api/v1/documents?action=delete&id=X — Soft-delete a document
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import crypto from 'node:crypto';
import {
  handleCors,
  authenticateRequest,
  jsonOk,
  jsonError,
  json401,
  json403,
  json405,
  json500,
  requirePermission,
  type AuthenticatedUser,
} from '../../lib/api-utils';
import { getUserClient, getAdminClient } from '../../lib/supabase';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleCors(req, res)) return;

  const action = (req.query.action as string) || 'list';

  try {
    switch (action) {
      case 'list':
        return await handleList(req, res);
      case 'get':
        return await handleGet(req, res);
      case 'upload-intent':
        return await handleUploadIntent(req, res);
      case 'confirm':
        return await handleConfirm(req, res);
      case 'status':
        return await handleStatusUpdate(req, res);
      case 'field':
        return await handleFieldUpdate(req, res);
      case 'delete':
        return await handleDelete(req, res);
      default:
        return jsonError(res, `Unknown documents action: ${action}`, 404);
    }
  } catch (err) {
    return json500(res, err);
  }
}

/**
 * GET /api/v1/documents?action=list
 * Query params: category, status, subsidiaryCode, page, limit
 * RLS enforces org-scoped visibility automatically.
 */
async function handleList(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return json405(res, ['GET']);

  const user = await authenticateRequest(req);
  if (!user) return json401(res);
  if (!requirePermission(res, user, 'documents.view')) return;

  const supabase = getUserClient(req.headers.authorization!.slice(7));
  const {
    category,
    status,
    subsidiaryCode,
    page = '1',
    limit = '25',
  } = req.query as Record<string, string>;

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 25));
  const offset = (pageNum - 1) * limitNum;

  let query = supabase
    .from('documents')
    .select('*, extracted_records(*)', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + limitNum - 1);

  if (category) query = query.eq('category', category);
  if (status) query = query.eq('status', status);

  const { data, error, count } = await query;
  if (error) return jsonError(res, error.message, 500);

  return jsonOk(res, {
    documents: data || [],
    pagination: {
      page: pageNum,
      limit: limitNum,
      total: count || 0,
      totalPages: Math.ceil((count || 0) / limitNum),
    },
  });
}

/**
 * GET /api/v1/documents?action=get&id=X
 */
async function handleGet(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return json405(res, ['GET']);

  const user = await authenticateRequest(req);
  if (!user) return json401(res);
  if (!requirePermission(res, user, 'documents.view')) return;

  const docId = req.query.id as string;
  if (!docId) return jsonError(res, 'Missing document id', 400);

  const supabase = getUserClient(req.headers.authorization!.slice(7));
  const { data, error } = await supabase
    .from('documents')
    .select('*, extracted_records(*)')
    .eq('id', docId)
    .single();

  if (error) return jsonError(res, error.message, error.code === 'PGRST116' ? 404 : 500);

  return jsonOk(res, { document: data });
}

/**
 * POST /api/v1/documents?action=upload-intent
 * Body: { fileName, fileSizeBytes, mimeType, category, reportingPeriod, mineId }
 *
 * Flow:
 * 1. Validates permission (documents.upload)
 * 2. Creates a `documents` row with status = 'draft'
 * 3. Generates a Supabase Storage signed upload URL
 * 4. Returns { documentId, signedUrl, storagePath }
 */
async function handleUploadIntent(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return json405(res, ['POST']);

  const user = await authenticateRequest(req);
  if (!user) return json401(res);
  if (!requirePermission(res, user, 'documents.upload')) return;

  const { fileName, fileSizeBytes, mimeType, category, reportingPeriod, mineId } =
    req.body || {};

  if (!fileName || !mimeType) {
    return jsonError(res, 'Missing required fields: fileName, mimeType', 400);
  }

  // Validate file size (max 10 MB, non-negative)
  const maxSize = 10 * 1024 * 1024;
  if (fileSizeBytes !== undefined) {
    if (typeof fileSizeBytes !== 'number' || isNaN(fileSizeBytes) || fileSizeBytes < 0 || fileSizeBytes > maxSize) {
      return jsonError(res, `Invalid file size. Must be a number between 0 and ${maxSize} bytes`, 400);
    }
  }

  // Validate MIME types
  const allowedMimes = [
    'application/pdf',
    'image/png',
    'image/jpeg',
    'image/tiff',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel',
  ];
  if (!allowedMimes.includes(mimeType)) {
    return jsonError(res, `Unsupported file type: ${mimeType}. Allowed: ${allowedMimes.join(', ')}`, 400);
  }

  const token = req.headers.authorization!.slice(7);
  const supabase = getUserClient(token);

  // Generate storage path: {org_id}/{YYYY-MM}/{uuid}_{sanitized_filename}
  const now = new Date();
  const datePath = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const safeFileName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
  const fileId = crypto.randomUUID();
  const storagePath = `${user.organization_id || 'unassigned'}/${datePath}/${fileId}_${safeFileName}`;

  // Create document record with status 'draft'
  const provisionalHash = crypto.createHash('sha256').update(`${fileId}_${safeFileName}_${Date.now()}`).digest('hex');
  const { data: docRow, error: insertError } = await supabase
    .from('documents')
    .insert({
      title: fileName.replace(/\.[^.]+$/, ''),
      file_name: fileName,
      category: category || 'statutory',
      reporting_period: reportingPeriod || 'August 2026',
      mine_id: mineId || null,
      organization_id: user.organization_id || '11111111-1111-1111-1111-111111111103',
      uploaded_by: user.id,
      status: 'draft',
      file_size_bytes: fileSizeBytes || 0,
      mime_type: mimeType,
      storage_path: storagePath,
      sha256_hash: provisionalHash,
    })
    .select('id')
    .single();

  if (insertError) return jsonError(res, insertError.message, 500);

  // Generate signed upload URL (valid for 10 minutes)
  const adminClient = getAdminClient();
  const { data: signedData, error: signError } = await adminClient.storage
    .from('raw-documents')
    .createSignedUploadUrl(storagePath);

  if (signError) {
    // Clean up the draft record on storage failure
    await supabase.from('documents').delete().eq('id', docRow.id);
    return jsonError(res, `Storage error: ${signError.message}`, 500);
  }

  return jsonOk(res, {
    documentId: docRow.id,
    signedUrl: signedData.signedUrl,
    storagePath,
    expiresIn: 600, // 10 minutes
  }, 201);
}

/**
 * POST /api/v1/documents?action=confirm
 * Body: { documentId, sha256Hash }
 *
 * Flow:
 * 1. Verifies the file exists in storage
 * 2. Verifies the SHA-256 hash (if provided)
 * 3. Updates document status to 'queued'
 * 4. Creates a processing_jobs row
 */
async function handleConfirm(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return json405(res, ['POST']);

  const user = await authenticateRequest(req);
  if (!user) return json401(res);
  if (!requirePermission(res, user, 'documents.upload')) return;

  const { documentId, sha256Hash } = req.body || {};
  if (!documentId) return jsonError(res, 'Missing documentId', 400);

  if (sha256Hash && (typeof sha256Hash !== 'string' || !/^[a-fA-F0-9]{64}$/.test(sha256Hash))) {
    return jsonError(res, 'Invalid SHA-256 hash. Must be a 64-character hexadecimal string', 400);
  }

  const token = req.headers.authorization!.slice(7);
  const supabase = getUserClient(token);

  // Fetch the document and verify ownership
  const { data: doc, error: fetchError } = await supabase
    .from('documents')
    .select('id, status, storage_path, uploaded_by')
    .eq('id', documentId)
    .single();

  if (fetchError || !doc) return jsonError(res, 'Document not found', 404);

  if (doc.status !== 'draft') {
    return jsonError(res, `Document is already in status: ${doc.status}`, 409);
  }

  if (doc.uploaded_by !== user.id) {
    return json403(res, 'You can only confirm your own uploads');
  }

  // Verify file exists in storage
  const adminClient = getAdminClient();
  const { data: fileList } = await adminClient.storage
    .from('raw-documents')
    .list(doc.storage_path.split('/').slice(0, -1).join('/'), {
      search: doc.storage_path.split('/').pop(),
    });

  if (!fileList || fileList.length === 0) {
    return jsonError(res, 'File not found in storage. Please re-upload.', 404);
  }

  // Update document status to 'queued' and store the hash
  const updatePayload: Record<string, unknown> = {
    status: 'queued',
    updated_at: new Date().toISOString(),
  };
  if (sha256Hash) updatePayload.sha256_hash = sha256Hash;

  const { error: updateError } = await supabase
    .from('documents')
    .update(updatePayload)
    .eq('id', documentId);

  if (updateError) return jsonError(res, updateError.message, 500);

  // Enqueue processing job
  const { error: jobError } = await supabase
    .from('processing_jobs')
    .insert({
      job_type: 'document_ocr',
      entity_id: documentId,
      status: 'queued',
      payload: {
        document_id: documentId,
        storage_path: doc.storage_path,
        requested_by: user.id,
      },
    });

  if (jobError) {
    console.error('[Documents] Failed to enqueue processing job:', jobError);
    // Non-fatal: document is still queued, job can be retried
  }

  return jsonOk(res, {
    documentId,
    status: 'queued',
    message: 'Upload confirmed and processing job enqueued',
  });
}

/**
 * PATCH /api/v1/documents?action=status
 * Body: { documentId, status, reviewNotes? }
 * Used by reviewers to approve/reject/return documents.
 */
async function handleStatusUpdate(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'PATCH') return json405(res, ['PATCH']);

  const user = await authenticateRequest(req);
  if (!user) return json401(res);

  const { documentId, status, reviewNotes } = req.body || {};
  if (!documentId || !status) {
    return jsonError(res, 'Missing documentId or status', 400);
  }

  // Permission check based on target status
  const statusPermissionMap: Record<string, string> = {
    approved: 'documents.approve',
    rejected: 'documents.approve',
    returned_for_correction: 'submissions.return',
    submitted: 'documents.upload',
    under_review: 'submissions.review',
  };

  const requiredPermission = statusPermissionMap[status];
  if (requiredPermission && !requirePermission(res, user, requiredPermission)) {
    return;
  }

  const token = req.headers.authorization!.slice(7);
  const supabase = getUserClient(token);

  // Separation of duty check: uploader cannot approve their own document
  if (status === 'approved' || status === 'rejected') {
    const { data: existingDoc } = await supabase
      .from('documents')
      .select('uploaded_by')
      .eq('id', documentId)
      .single();

    if (existingDoc && existingDoc.uploaded_by === user.id) {
      return json403(res, 'Separation of duty violation: Uploader cannot approve their own document');
    }
  }

  const updateData: Record<string, unknown> = {
    status,
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabase
    .from('documents')
    .update(updateData)
    .eq('id', documentId);

  if (error) return jsonError(res, error.message, 500);

  // Log the review action in audit_logs (via admin client to bypass append-only constraints)
  try {
    const adminClient = getAdminClient();
    await adminClient.from('audit_logs').insert({
      actor_id: user.id,
      actor_role: user.role,
      action: `document.${status}`,
      entity_type: 'document',
      entity_id: documentId,
      result: 'success',
      metadata: { review_notes: reviewNotes || null },
    });
  } catch (auditErr) {
    console.error('[Audit] Failed to log document status change:', auditErr);
  }

  return jsonOk(res, { documentId, status });
}

/**
 * PATCH /api/v1/documents?action=field
 * Body: { documentId, fieldId, verifiedValue, notes? }
 */
async function handleFieldUpdate(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'PATCH') return json405(res, ['PATCH']);

  const user = await authenticateRequest(req);
  if (!user) return json401(res);
  if (!requirePermission(res, user, 'documents.verify')) return;

  const { documentId, fieldId, verifiedValue, notes } = req.body || {};
  if (!documentId || !fieldId || verifiedValue === undefined) {
    return jsonError(res, 'Missing documentId, fieldId, or verifiedValue', 400);
  }

  const token = req.headers.authorization!.slice(7);
  const supabase = getUserClient(token);

  const updateData: Record<string, unknown> = {
    verified_value: verifiedValue,
    status: 'verified',
    verified_by: user.id,
    verification_notes: notes || null,
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabase
    .from('extracted_records')
    .update(updateData)
    .eq('id', fieldId)
    .eq('document_id', documentId);

  if (error) return jsonError(res, error.message, 500);

  return jsonOk(res, { fieldId, verifiedValue, status: 'verified' });
}

/**
 * DELETE /api/v1/documents?action=delete&id=X
 * Soft-delete: sets status to 'rejected' rather than removing the row.
 */
async function handleDelete(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'DELETE') return json405(res, ['DELETE']);

  const user = await authenticateRequest(req);
  if (!user) return json401(res);
  if (!requirePermission(res, user, 'documents.upload')) return;

  const docId = req.query.id as string;
  if (!docId) return jsonError(res, 'Missing document id', 400);

  const token = req.headers.authorization!.slice(7);
  const supabase = getUserClient(token);

  // Verify ownership (only uploader or admin can delete)
  const { data: doc } = await supabase
    .from('documents')
    .select('uploaded_by')
    .eq('id', docId)
    .single();

  if (!doc) return jsonError(res, 'Document not found', 404);

  if (doc.uploaded_by !== user.id && user.role !== 'sys_admin') {
    return json403(res, 'Only the uploader or admin can delete documents');
  }

  const { error } = await supabase
    .from('documents')
    .update({
      status: 'rejected',
      updated_at: new Date().toISOString(),
    })
    .eq('id', docId);

  if (error) return jsonError(res, error.message, 500);

  return jsonOk(res, { documentId: docId, message: 'Document soft-deleted' });
}
