/**
 * MineSetu AI — Information Requests API Endpoints
 * Path: /api/v1/requests
 *
 * Endpoints:
 * - GET   /api/v1/requests?action=list        — List requests (filtered by role)
 * - GET   /api/v1/requests?action=get&id=X    — Get single request
 * - POST  /api/v1/requests?action=create      — Create new information request
 * - POST  /api/v1/requests?action=respond     — Respond to a request
 * - PATCH /api/v1/requests?action=status      — Update request status
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import {
  handleCors,
  authenticateRequest,
  jsonOk,
  jsonError,
  json401,
  json405,
  json500,
  requirePermission,
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
      case 'create':
        return await handleCreate(req, res);
      case 'respond':
        return await handleRespond(req, res);
      case 'status':
        return await handleStatusUpdate(req, res);
      default:
        return jsonError(res, `Unknown requests action: ${action}`, 404);
    }
  } catch (err) {
    return json500(res, err);
  }
}

/**
 * GET /api/v1/requests?action=list
 * Query params: status, direction (sent|received), page, limit
 */
async function handleList(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return json405(res, ['GET']);

  const user = await authenticateRequest(req);
  if (!user) return json401(res);

  const token = req.headers.authorization!.slice(7);
  const supabase = getUserClient(token);

  const {
    status,
    direction,
    page = '1',
    limit = '25',
  } = req.query as Record<string, string>;

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 25));
  const offset = (pageNum - 1) * limitNum;

  let query = supabase
    .from('information_requests')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + limitNum - 1);

  if (status) query = query.eq('status', status);

  // Filter by direction: requests initiated by user vs requests targeted to user's org
  if (direction === 'sent') {
    query = query.eq('initiator_id', user.id);
  } else if (direction === 'received') {
    query = query.eq('target_org_id', user.organization_id);
  }

  const { data, error, count } = await query;
  if (error) return jsonError(res, error.message, 500);

  return jsonOk(res, {
    requests: data || [],
    pagination: {
      page: pageNum,
      limit: limitNum,
      total: count || 0,
      totalPages: Math.ceil((count || 0) / limitNum),
    },
  });
}

/**
 * GET /api/v1/requests?action=get&id=X
 */
async function handleGet(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return json405(res, ['GET']);

  const user = await authenticateRequest(req);
  if (!user) return json401(res);

  const reqId = req.query.id as string;
  if (!reqId) return jsonError(res, 'Missing request id', 400);

  const token = req.headers.authorization!.slice(7);
  const supabase = getUserClient(token);

  const { data, error } = await supabase
    .from('information_requests')
    .select('*, request_responses(*), request_clarifications(*)')
    .eq('id', reqId)
    .single();

  if (error) return jsonError(res, error.message, error.code === 'PGRST116' ? 404 : 500);

  return jsonOk(res, { request: data });
}

/**
 * POST /api/v1/requests?action=create
 * Body: {
 *   subject, description, recipientOrganizationId, reportingPeriod?,
 *   requestedFields?, dueDate?
 * }
 */
async function handleCreate(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return json405(res, ['POST']);

  const user = await authenticateRequest(req);
  if (!user) return json401(res);
  if (!requirePermission(res, user, 'requests.create')) return;

  const {
    subject,
    description,
    recipientOrganizationId,
    reportingPeriod,
    requestedFields,
    dueDate,
  } = req.body || {};

  if (!subject || !description || !recipientOrganizationId) {
    return jsonError(
      res,
      'Missing required fields: subject, description, recipientOrganizationId',
      400
    );
  }

  const token = req.headers.authorization!.slice(7);
  const supabase = getUserClient(token);

  // Generate request number: IR-YYYYMMDD-XXXX
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
  const randomSuffix = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, '0');
  const requestNumber = `IR-${dateStr}-${randomSuffix}`;

  const defaultDueDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const defaultPeriod = reportingPeriod || new Date().toISOString().slice(0, 7);

  const { data, error } = await supabase
    .from('information_requests')
    .insert({
      request_number: requestNumber,
      subject,
      description,
      initiator_id: user.id,
      initiator_org_id: user.organization_id,
      target_org_id: recipientOrganizationId,
      reporting_period: defaultPeriod,
      requested_fields: requestedFields || [],
      due_date: dueDate || defaultDueDate,
      status: 'awaiting_response',
    })
    .select('id, request_number')
    .single();

  if (error) return jsonError(res, error.message, 500);

  // Audit log
  try {
    const adminClient = getAdminClient();
    await adminClient.from('audit_logs').insert({
      actor_id: user.id,
      actor_role: user.role,
      actor_email: user.email,
      action: 'request.created',
      entity_type: 'information_request',
      entity_id: data.id,
      result: 'success',
      metadata: { request_number: data.request_number, recipient_org: recipientOrganizationId },
    });
  } catch (auditErr) {
    console.error('[Audit] Failed to log request creation:', auditErr);
  }

  return jsonOk(res, {
    requestId: data.id,
    requestNumber: data.request_number,
    status: 'awaiting_response',
  }, 201);
}

/**
 * POST /api/v1/requests?action=respond
 * Body: { requestId, responseText, attachedDocumentIds? }
 */
async function handleRespond(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return json405(res, ['POST']);

  const user = await authenticateRequest(req);
  if (!user) return json401(res);
  if (!requirePermission(res, user, 'requests.respond')) return;

  const { requestId, responseText, attachedDocumentIds } = req.body || {};
  if (!requestId || !responseText) {
    return jsonError(res, 'Missing requestId or responseText', 400);
  }

  const token = req.headers.authorization!.slice(7);
  const supabase = getUserClient(token);

  // Verify the request exists and is in a respondable state
  const { data: request, error: reqError } = await supabase
    .from('information_requests')
    .select('id, status, target_org_id')
    .eq('id', requestId)
    .single();

  if (reqError || !request) return jsonError(res, 'Request not found', 404);

  const respondableStatuses = ['awaiting_response', 'clarification_required', 'partially_answered'];
  if (!respondableStatuses.includes(request.status)) {
    return jsonError(res, `Request is in status: ${request.status}. Cannot respond.`, 409);
  }

  // Insert the response
  const { error: respError } = await supabase
    .from('request_responses')
    .insert({
      request_id: requestId,
      responder_id: user.id,
      response_text: responseText,
      attached_document_ids: attachedDocumentIds || [],
    });

  if (respError) return jsonError(res, respError.message, 500);

  // Update request status
  const { error: updateError } = await supabase
    .from('information_requests')
    .update({
      status: 'submitted',
      updated_at: new Date().toISOString(),
    })
    .eq('id', requestId);

  if (updateError) {
    console.error('[Requests] Failed to update request status:', updateError);
  }

  return jsonOk(res, { requestId, message: 'Response submitted' });
}

/**
 * PATCH /api/v1/requests?action=status
 * Body: { requestId, status, note? }
 */
async function handleStatusUpdate(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'PATCH') return json405(res, ['PATCH']);

  const user = await authenticateRequest(req);
  if (!user) return json401(res);

  const { requestId, status, note } = req.body || {};
  if (!requestId || !status) return jsonError(res, 'Missing requestId or status', 400);

  const validStatuses = [
    'draft',
    'awaiting_response',
    'partially_answered',
    'submitted',
    'clarification_required',
    'completed',
  ];
  if (!validStatuses.includes(status)) {
    return jsonError(res, `Invalid status. Allowed: ${validStatuses.join(', ')}`, 400);
  }

  const token = req.headers.authorization!.slice(7);
  const supabase = getUserClient(token);

  const { error } = await supabase
    .from('information_requests')
    .update({
      status,
      updated_at: new Date().toISOString(),
    })
    .eq('id', requestId);

  if (error) return jsonError(res, error.message, 500);

  // If a clarification note was provided, insert into request_clarifications
  if (note) {
    try {
      await supabase.from('request_clarifications').insert({
        request_id: requestId,
        author_id: user.id,
        clarification_text: note,
      });
    } catch (clarErr) {
      console.error('[Requests] Failed to record clarification:', clarErr);
    }
  }

  return jsonOk(res, { requestId, status });
}
