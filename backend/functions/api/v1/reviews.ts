/**
 * MineSetu AI — Review Queue API Endpoints
 * Path: /api/v1/reviews
 *
 * Endpoints:
 * - GET   /api/v1/reviews?action=queue        — Get pending review items
 * - GET   /api/v1/reviews?action=get&id=X     — Get review details
 * - POST  /api/v1/reviews?action=approve      — Approve a submission
 * - POST  /api/v1/reviews?action=return       — Return for corrections
 * - POST  /api/v1/reviews?action=reject       — Reject a submission
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
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
} from '../../lib/api-utils';
import { getUserClient, getAdminClient } from '../../lib/supabase';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleCors(req, res)) return;

  const action = (req.query.action as string) || 'queue';

  try {
    switch (action) {
      case 'queue':
        return await handleQueue(req, res);
      case 'get':
        return await handleGet(req, res);
      case 'approve':
        return await handleApproval(req, res, 'approved');
      case 'return':
        return await handleApproval(req, res, 'returned_for_correction');
      case 'reject':
        return await handleApproval(req, res, 'rejected');
      default:
        return jsonError(res, `Unknown reviews action: ${action}`, 404);
    }
  } catch (err) {
    return json500(res, err);
  }
}

/**
 * GET /api/v1/reviews?action=queue
 * Returns all documents and manual records pending review.
 * Query params: type (document|manual_record), page, limit
 */
async function handleQueue(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return json405(res, ['GET']);

  const user = await authenticateRequest(req);
  if (!user) return json401(res);
  if (!requirePermission(res, user, 'submissions.review')) return;

  const token = req.headers.authorization!.slice(7);
  const supabase = getUserClient(token);

  const { type, page = '1', limit = '25' } = req.query as Record<string, string>;
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 25));
  const offset = (pageNum - 1) * limitNum;

  const results: { documents?: any[]; manualRecords?: any[]; totalItems: number } = {
    totalItems: 0,
  };

  // Fetch review tasks and discrepancies if available
  const { data: tasks } = await supabase
    .from('review_tasks')
    .select('*')
    .eq('status', 'pending')
    .order('created_at', { ascending: true })
    .range(offset, offset + limitNum - 1);

  // Fetch pending documents
  if (!type || type === 'document') {
    const { data: docs, count: docCount } = await supabase
      .from('documents')
      .select('id, title, file_name, category, organization_id, status, created_at, uploaded_by', {
        count: 'exact',
      })
      .in('status', ['submitted', 'under_review', 'needs_review', 'verified'])
      .order('created_at', { ascending: true })
      .range(offset, offset + limitNum - 1);

    results.documents = docs || [];
    results.totalItems += docCount || 0;
  }

  // Fetch pending manual records
  if (!type || type === 'manual_record') {
    const { data: records, count: recCount } = await supabase
      .from('manual_records')
      .select('id, title, category, organization_id, status, created_at, author_id', {
        count: 'exact',
      })
      .in('status', ['submitted', 'under_review'])
      .order('created_at', { ascending: true })
      .range(offset, offset + limitNum - 1);

    results.manualRecords = records || [];
    results.totalItems += recCount || 0;
  }

  return jsonOk(res, { ...results, reviewTasks: tasks || [] });
}

/**
 * GET /api/v1/reviews?action=get&id=X&type=document|manual_record
 */
async function handleGet(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return json405(res, ['GET']);

  const user = await authenticateRequest(req);
  if (!user) return json401(res);
  if (!requirePermission(res, user, 'submissions.review')) return;

  const { id, type = 'document' } = req.query as Record<string, string>;
  if (!id) return jsonError(res, 'Missing id', 400);

  const token = req.headers.authorization!.slice(7);
  const supabase = getUserClient(token);

  // Fetch discrepancies if comparing against baselines
  const { data: discrepanciesList } = await supabase
    .from('discrepancies')
    .select('*')
    .eq('document_id', id);

  if (type === 'manual_record') {
    const { data, error } = await supabase
      .from('manual_records')
      .select('*, manual_record_fields(*)')
      .eq('id', id)
      .single();
    if (error) return jsonError(res, error.message, error.code === 'PGRST116' ? 404 : 500);
    return jsonOk(res, { type: 'manual_record', item: data, discrepancies: discrepanciesList || [] });
  }

  // Default: document
  const { data, error } = await supabase
    .from('documents')
    .select('*, extracted_records(*)')
    .eq('id', id)
    .single();
  if (error) return jsonError(res, error.message, error.code === 'PGRST116' ? 404 : 500);
  return jsonOk(res, { type: 'document', item: data, discrepancies: discrepanciesList || [] });
}

/**
 * POST /api/v1/reviews?action=approve|return|reject
 * Body: { entityId, entityType, reviewNotes? }
 *
 * Separation-of-duty: The reviewer cannot be the original uploader/author.
 * This is also enforced at the database level via triggers.
 */
async function handleApproval(
  req: VercelRequest,
  res: VercelResponse,
  targetStatus: string
) {
  if (req.method !== 'POST') return json405(res, ['POST']);

  const user = await authenticateRequest(req);
  if (!user) return json401(res);

  // Permission check
  if (targetStatus === 'approved' || targetStatus === 'rejected') {
    if (!requirePermission(res, user, 'documents.approve')) return;
  } else {
    if (!requirePermission(res, user, 'submissions.return')) return;
  }

  const { entityId, entityType = 'document', reviewNotes } = req.body || {};
  if (!entityId) return jsonError(res, 'Missing entityId', 400);

  if (entityType && !['document', 'manual_record'].includes(entityType)) {
    return jsonError(res, `Invalid entityType: ${entityType}. Allowed: document, manual_record`, 400);
  }

  const token = req.headers.authorization!.slice(7);
  const supabase = getUserClient(token);

  const table = entityType === 'manual_record' ? 'manual_records' : 'documents';
  const authorField = entityType === 'manual_record' ? 'author_id' : 'uploaded_by';

  // Fetch current item to verify separation of duty
  const { data: item, error: fetchError } = await supabase
    .from(table)
    .select(`id, status, ${authorField}`)
    .eq('id', entityId)
    .single();

  if (fetchError || !item) return jsonError(res, 'Item not found', 404);

  // Enforce separation of duty (server-side): Reviewers cannot approve items they uploaded
  const authorId = (item as any)[authorField];
  if (authorId === user.id) {
    return json403(res, 'Separation of duty violation: Reviewers cannot approve items they uploaded');
  }

  // Map status for manual_records (they use 'accepted'/'returned' instead)
  let mappedStatus = targetStatus;
  if (entityType === 'manual_record') {
    if (targetStatus === 'approved') mappedStatus = 'accepted';
    if (targetStatus === 'returned_for_correction') mappedStatus = 'returned';
  } else {
    // For documents: approved -> 'verified', rejected -> 'flagged'
    if (targetStatus === 'approved') mappedStatus = 'verified';
    if (targetStatus === 'rejected') mappedStatus = 'flagged';
    if (targetStatus === 'returned_for_correction') mappedStatus = 'needs_review';
  }

  const { error: updateError } = await supabase
    .from(table)
    .update({ status: mappedStatus, updated_at: new Date().toISOString() })
    .eq('id', entityId);

  if (updateError) {
    // Check if this is the separation-of-duty trigger error
    if (updateError.message?.includes('cannot approve their own') || updateError.message?.includes('separation_of_duty')) {
      return json403(res, 'Database-enforced separation of duty: you cannot approve your own submission');
    }
    return jsonError(res, updateError.message, 500);
  }

  // Update or insert linked review_tasks
  try {
    const taskStatus = mappedStatus === 'returned' || mappedStatus === 'needs_review'
      ? 'returned_for_correction'
      : mappedStatus === 'rejected' || mappedStatus === 'flagged'
      ? 'rejected'
      : 'accepted';

    const { data: existingTask } = await supabase
      .from('review_tasks')
      .select('id')
      .eq('entity_id', entityId)
      .limit(1)
      .maybeSingle();

    if (existingTask) {
      await supabase
        .from('review_tasks')
        .update({
          status: taskStatus,
          reviewer_id: user.id,
          remarks: reviewNotes || null,
          resolved_at: new Date().toISOString(),
        })
        .eq('id', existingTask.id);
    } else {
      await supabase.from('review_tasks').insert({
        entity_id: entityId,
        entity_type: entityType,
        assigned_role: user.role,
        stage: 'final_approval',
        status: taskStatus,
        reviewer_id: user.id,
        remarks: reviewNotes || null,
        resolved_at: new Date().toISOString(),
      });
    }
  } catch (err) {
    // Non-fatal if review_task record table update fails
  }

  // Audit log
  try {
    const adminClient = getAdminClient();
    await adminClient.from('audit_logs').insert({
      actor_id: user.id,
      actor_role: user.role,
      actor_email: user.email,
      action: `review.${targetStatus}`,
      entity_type: entityType,
      entity_id: entityId,
      result: 'success',
      metadata: { review_notes: reviewNotes || null, status: mappedStatus },
    });
  } catch (auditErr) {
    console.error('[Audit] Failed to log review action:', auditErr);
  }

  return jsonOk(res, { entityId, entityType, status: mappedStatus });
}
