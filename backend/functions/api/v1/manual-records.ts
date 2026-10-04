/**
 * MineSetu AI — Manual Records API Endpoints
 * Path: /api/v1/manual-records
 *
 * Endpoints:
 * - GET    /api/v1/manual-records?action=list    — List manual records
 * - GET    /api/v1/manual-records?action=get&id=X — Get single record
 * - POST   /api/v1/manual-records?action=create  — Create manual data entry
 * - PATCH  /api/v1/manual-records?action=status  — Update record status
 * - DELETE /api/v1/manual-records?action=delete&id=X — Soft-delete
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

const VALID_CATEGORIES = ['production', 'overburden', 'geological', 'safety', 'despatch'] as const;
const VALID_STATUSES = ['draft', 'submitted', 'under_review', 'accepted', 'returned'] as const;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleCors(req, res)) return;

  const action = (req.query.action as string) || 'list';

  try {
    switch (action) {
      case 'list':
        return await handleList(req, res);
      case 'get':
        return await handleGet(req, res);
      case 'create':
        return await handleCreate(req, res);
      case 'status':
        return await handleStatusUpdate(req, res);
      case 'delete':
        return await handleDelete(req, res);
      default:
        return jsonError(res, `Unknown manual-records action: ${action}`, 404);
    }
  } catch (err) {
    return json500(res, err);
  }
}

/**
 * GET /api/v1/manual-records?action=list
 * Query params: category, status, organizationId, mineId, page, limit
 */
async function handleList(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return json405(res, ['GET']);

  const user = await authenticateRequest(req);
  if (!user) return json401(res);
  if (!requirePermission(res, user, 'documents.view')) return;

  const token = req.headers.authorization!.slice(7);
  const supabase = getUserClient(token);

  const {
    category,
    status,
    organizationId,
    mineId,
    page = '1',
    limit = '25',
  } = req.query as Record<string, string>;

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 25));
  const offset = (pageNum - 1) * limitNum;

  let query = supabase
    .from('manual_records')
    .select('*, manual_record_fields(*)', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + limitNum - 1);

  if (category) query = query.eq('category', category);
  if (status) query = query.eq('status', status);
  if (organizationId) query = query.eq('organization_id', organizationId);
  if (mineId) query = query.eq('mine_id', mineId);

  const { data, error, count } = await query;
  if (error) return jsonError(res, error.message, 500);

  return jsonOk(res, {
    records: data || [],
    pagination: {
      page: pageNum,
      limit: limitNum,
      total: count || 0,
      totalPages: Math.ceil((count || 0) / limitNum),
    },
  });
}

/**
 * GET /api/v1/manual-records?action=get&id=X
 */
async function handleGet(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return json405(res, ['GET']);

  const user = await authenticateRequest(req);
  if (!user) return json401(res);
  if (!requirePermission(res, user, 'documents.view')) return;

  const recId = req.query.id as string;
  if (!recId) return jsonError(res, 'Missing record id', 400);

  const token = req.headers.authorization!.slice(7);
  const supabase = getUserClient(token);

  const { data, error } = await supabase
    .from('manual_records')
    .select('*, manual_record_fields(*)')
    .eq('id', recId)
    .single();

  if (error) return jsonError(res, error.message, error.code === 'PGRST116' ? 404 : 500);

  return jsonOk(res, { record: data });
}

/**
 * POST /api/v1/manual-records?action=create
 * Body: {
 *   title, category, reportingPeriod, mineId?,
 *   sourceDate, sourceExplanation?,
 *   fields: [{ fieldName, value, unit, sourceNote? }]
 * }
 */
async function handleCreate(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return json405(res, ['POST']);

  const user = await authenticateRequest(req);
  if (!user) return json401(res);
  if (!requirePermission(res, user, 'manual.entry')) return;

  const {
    title,
    category,
    reportingPeriod,
    mineId,
    sourceDate,
    sourceExplanation,
    fields,
  } = req.body || {};

  // Validate required fields
  if (!title || !category || !reportingPeriod) {
    return jsonError(res, 'Missing required fields: title, category, reportingPeriod', 400);
  }

  if (!VALID_CATEGORIES.includes(category)) {
    return jsonError(res, `Invalid category. Allowed: ${VALID_CATEGORIES.join(', ')}`, 400);
  }

  if (!fields || !Array.isArray(fields) || fields.length === 0) {
    return jsonError(res, 'At least one field is required', 400);
  }

  // Validate each field has required properties and valid numeric precision upfront
  const validatedFields: Array<{ fieldName: string; value: number; unit: string; sourceNote?: string | null }> = [];
  for (const field of fields) {
    if (!field.fieldName || field.value === undefined || !field.unit) {
      return jsonError(res, 'Each field must have fieldName, value, and unit', 400);
    }
    const numVal = typeof field.value === 'number' ? field.value : parseFloat(String(field.value).replace(/,/g, ''));
    if (isNaN(numVal) || !isFinite(numVal)) {
      return jsonError(res, `Field '${field.fieldName}' must be a valid finite numeric value`, 400);
    }
    if (Math.abs(numVal) >= 1e11) {
      return jsonError(res, `Field '${field.fieldName}' exceeds maximum allowed precision (NUMERIC(14,3))`, 400);
    }
    validatedFields.push({
      fieldName: field.fieldName,
      value: numVal,
      unit: field.unit,
      sourceNote: field.sourceNote || null,
    });
  }

  const token = req.headers.authorization!.slice(7);
  const supabase = getUserClient(token);

  // Resolve mine_id (required NOT NULL by manual_records)
  let resolvedMineId = mineId || user.mine_id;
  if (!resolvedMineId) {
    const { data: mine } = await supabase
      .from('mines')
      .select('id')
      .eq('organization_id', user.organization_id)
      .limit(1)
      .maybeSingle();

    if (mine) {
      resolvedMineId = mine.id;
    } else {
      const { data: anyMine } = await supabase.from('mines').select('id').limit(1).maybeSingle();
      resolvedMineId = anyMine?.id;
    }
  }

  if (!resolvedMineId) {
    return jsonError(res, 'No mine found to associate with manual record', 400);
  }

  // Insert the manual record
  const { data: record, error: recError } = await supabase
    .from('manual_records')
    .insert({
      title,
      category,
      reporting_period: reportingPeriod,
      mine_id: resolvedMineId,
      source_date: sourceDate || new Date().toISOString().split('T')[0],
      source_explanation: sourceExplanation || 'Manual statutory entry',
      author_id: user.id,
      organization_id: user.organization_id,
      status: 'draft',
      is_demo: false,
    })
    .select('id')
    .single();

  if (recError) return jsonError(res, recError.message, 500);

  // Insert fields
  const fieldRows = validatedFields.map(f => ({
    manual_record_id: record.id,
    field_name: f.fieldName,
    value: f.value,
    unit: f.unit,
    source_note: f.sourceNote,
  }));

  const { error: fieldsError } = await supabase
    .from('manual_record_fields')
    .insert(fieldRows);

  if (fieldsError) {
    console.error('[ManualRecords] Failed to insert fields:', fieldsError);
    await supabase.from('manual_records').delete().eq('id', record.id);
    return jsonError(res, `Failed to create record fields: ${fieldsError.message}`, 500);
  }

  // Log audit event
  try {
    const adminClient = getAdminClient();
    await adminClient.from('audit_logs').insert({
      actor_id: user.id,
      actor_role: user.role,
      actor_email: user.email,
      action: 'manual_record.created',
      entity_type: 'manual_record',
      entity_id: record.id,
      result: 'success',
      metadata: { category, field_count: fields.length, mine_id: resolvedMineId },
    });
  } catch (auditErr) {
    console.error('[Audit] Failed to log manual record creation:', auditErr);
  }

  return jsonOk(res, { recordId: record.id, status: 'draft' }, 201);
}

/**
 * PATCH /api/v1/manual-records?action=status
 * Body: { recordId, status, reviewNotes? }
 */
async function handleStatusUpdate(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'PATCH') return json405(res, ['PATCH']);

  const user = await authenticateRequest(req);
  if (!user) return json401(res);

  const { recordId, status, reviewNotes } = req.body || {};
  if (!recordId || !status) return jsonError(res, 'Missing recordId or status', 400);

  if (!VALID_STATUSES.includes(status)) {
    return jsonError(res, `Invalid status. Allowed: ${VALID_STATUSES.join(', ')}`, 400);
  }

  // Check permission based on target status
  if (['under_review', 'accepted', 'returned'].includes(status)) {
    if (!requirePermission(res, user, 'submissions.review')) return;
  }

  const token = req.headers.authorization!.slice(7);
  const supabase = getUserClient(token);

  const { error } = await supabase
    .from('manual_records')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', recordId);

  if (error) return jsonError(res, error.message, 500);

  // If a review task exists, resolve it
  if (reviewNotes || ['accepted', 'returned'].includes(status)) {
    try {
      await supabase
        .from('review_tasks')
        .update({
          status: status === 'returned' ? 'returned_for_correction' : 'accepted',
          reviewer_id: user.id,
          remarks: reviewNotes || null,
          resolved_at: new Date().toISOString(),
        })
        .eq('entity_id', recordId);
    } catch {
      // Non-fatal
    }
  }

  return jsonOk(res, { recordId, status });
}

/**
 * DELETE /api/v1/manual-records?action=delete&id=X
 */
async function handleDelete(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'DELETE') return json405(res, ['DELETE']);

  const user = await authenticateRequest(req);
  if (!user) return json401(res);
  if (!requirePermission(res, user, 'manual.entry')) return;

  const recId = req.query.id as string;
  if (!recId) return jsonError(res, 'Missing record id', 400);

  const token = req.headers.authorization!.slice(7);
  const supabase = getUserClient(token);

  // Only allow deletion of draft records
  const { data: record } = await supabase
    .from('manual_records')
    .select('status, author_id')
    .eq('id', recId)
    .single();

  if (!record) return jsonError(res, 'Record not found', 404);

  if (record.status !== 'draft') {
    return jsonError(res, 'Only draft records can be deleted', 409);
  }

  if (record.author_id !== user.id && user.role !== 'sys_admin') {
    return json403(res, 'Only the author or admin can delete records');
  }

  // Delete fields first, then the record
  await supabase.from('manual_record_fields').delete().eq('manual_record_id', recId);
  const { error } = await supabase.from('manual_records').delete().eq('id', recId);

  if (error) return jsonError(res, error.message, 500);

  return jsonOk(res, { recordId: recId, message: 'Record deleted' });
}
