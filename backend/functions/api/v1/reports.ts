/**
 * MineSetu AI — Reports API Endpoints
 * Path: /api/v1/reports
 *
 * Endpoints:
 * - GET  /api/v1/reports?action=list       — List report drafts
 * - GET  /api/v1/reports?action=get&id=X   — Get single report
 * - POST /api/v1/reports?action=create     — Create report compilation draft
 * - POST /api/v1/reports?action=compile    — Trigger report compilation job
 * - GET  /api/v1/reports?action=download&id=X&format=pdf — Download compiled report
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
      case 'compile':
        return await handleCompile(req, res);
      case 'download':
        return await handleDownload(req, res);
      default:
        return jsonError(res, `Unknown reports action: ${action}`, 404);
    }
  } catch (err) {
    return json500(res, err);
  }
}

/**
 * GET /api/v1/reports?action=list
 */
async function handleList(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return json405(res, ['GET']);

  const user = await authenticateRequest(req);
  if (!user) return json401(res);
  if (!requirePermission(res, user, 'reports.generate')) return;

  const token = req.headers.authorization!.slice(7);
  const supabase = getUserClient(token);

  const { page = '1', limit = '25' } = req.query as Record<string, string>;
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 25));
  const offset = (pageNum - 1) * limitNum;

  const { data, error, count } = await supabase
    .from('report_drafts')
    .select('*, report_exports(*)', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + limitNum - 1);

  if (error) return jsonError(res, error.message, 500);

  return jsonOk(res, {
    reports: data || [],
    pagination: {
      page: pageNum,
      limit: limitNum,
      total: count || 0,
      totalPages: Math.ceil((count || 0) / limitNum),
    },
  });
}

/**
 * GET /api/v1/reports?action=get&id=X
 */
async function handleGet(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return json405(res, ['GET']);

  const user = await authenticateRequest(req);
  if (!user) return json401(res);
  if (!requirePermission(res, user, 'reports.generate')) return;

  const reportId = req.query.id as string;
  if (!reportId) return jsonError(res, 'Missing report id', 400);

  const token = req.headers.authorization!.slice(7);
  const supabase = getUserClient(token);

  const { data, error } = await supabase
    .from('report_drafts')
    .select('*, report_exports(*)')
    .eq('id', reportId)
    .single();

  if (error) return jsonError(res, error.message, error.code === 'PGRST116' ? 404 : 500);

  return jsonOk(res, { report: data });
}

/**
 * POST /api/v1/reports?action=create
 * Body: {
 *   title, reportType, reportingPeriod, scope,
 *   selectedSubsidiaries, comparisonBasis, executiveSummary?,
 *   outputFormats?
 * }
 */
async function handleCreate(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return json405(res, ['POST']);

  const user = await authenticateRequest(req);
  if (!user) return json401(res);
  if (!requirePermission(res, user, 'reports.generate')) return;

  const {
    title,
    reportType,
    reportingPeriod,
    scope,
    selectedSubsidiaries,
    comparisonBasis,
    executiveSummary,
    outputFormats,
  } = req.body || {};

  if (!title || !reportType || !reportingPeriod) {
    return jsonError(res, 'Missing required fields: title, reportType, reportingPeriod', 400);
  }

  const ALLOWED_FORMATS = ['pdf', 'docx', 'xlsx'];
  if (outputFormats && Array.isArray(outputFormats)) {
    for (const f of outputFormats) {
      if (!ALLOWED_FORMATS.includes(String(f).toLowerCase())) {
        return jsonError(res, `Unsupported format: ${f}. Allowed: ${ALLOWED_FORMATS.join(', ')}`, 400);
      }
    }
  }

  const token = req.headers.authorization!.slice(7);
  const supabase = getUserClient(token);

  const { data, error } = await supabase
    .from('report_drafts')
    .insert({
      title,
      report_type: reportType,
      reporting_period: reportingPeriod,
      scope_filter: {
        scope: scope || 'national',
        selected_subsidiaries: selectedSubsidiaries || [],
        comparison_basis: comparisonBasis || 'previous_period',
      },
      executive_summary: executiveSummary || '',
      metrics_data: {
        output_formats: outputFormats || ['pdf'],
      },
      citations: [],
      status: 'draft',
      author_id: user.id,
    })
    .select('id')
    .single();

  if (error) return jsonError(res, error.message, 500);

  return jsonOk(res, { reportId: data.id, status: 'draft' }, 201);
}

/**
 * POST /api/v1/reports?action=compile
 * Body: { reportId }
 * Triggers a report compilation job in the processing queue.
 */
async function handleCompile(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return json405(res, ['POST']);

  const user = await authenticateRequest(req);
  if (!user) return json401(res);
  if (!requirePermission(res, user, 'reports.generate')) return;

  const { reportId } = req.body || {};
  if (!reportId) return jsonError(res, 'Missing reportId', 400);

  const token = req.headers.authorization!.slice(7);
  const supabase = getUserClient(token);

  // Verify the report exists
  const { data: report, error: fetchError } = await supabase
    .from('report_drafts')
    .select('id, status')
    .eq('id', reportId)
    .single();

  if (fetchError || !report) return jsonError(res, 'Report not found', 404);

  // Enqueue compilation job
  const { error: jobError } = await supabase
    .from('processing_jobs')
    .insert({
      job_type: 'report_export',
      entity_id: reportId,
      status: 'queued',
      attempt_count: 0,
      max_attempts: 3,
      backoff_seconds: 15,
      lease_timeout_seconds: 300,
      payload: {
        report_id: reportId,
        requested_by: user.id,
      },
    });

  if (jobError) return jsonError(res, `Failed to enqueue compilation: ${jobError.message}`, 500);

  // Update report status
  await supabase
    .from('report_drafts')
    .update({ status: 'compiling', updated_at: new Date().toISOString() })
    .eq('id', reportId);

  return jsonOk(res, { reportId, status: 'compiling', message: 'Compilation job enqueued' });
}

/**
 * GET /api/v1/reports?action=download&id=X&format=pdf
 * Returns a signed download URL for the compiled report.
 */
async function handleDownload(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return json405(res, ['GET']);

  const user = await authenticateRequest(req);
  if (!user) return json401(res);
  if (!requirePermission(res, user, 'reports.generate')) return;

  const reportId = req.query.id as string;
  const format = (req.query.format as string) || 'pdf';
  if (!reportId) return jsonError(res, 'Missing report id', 400);

  const ALLOWED_FORMATS = ['pdf', 'docx', 'xlsx'];
  if (!ALLOWED_FORMATS.includes(format.toLowerCase())) {
    return jsonError(res, `Unsupported format: ${format}. Allowed: ${ALLOWED_FORMATS.join(', ')}`, 400);
  }

  const token = req.headers.authorization!.slice(7);
  const supabase = getUserClient(token);

  // Check report_exports table
  const { data: exportItem, error } = await supabase
    .from('report_exports')
    .select('storage_path, format')
    .eq('draft_id', reportId)
    .eq('format', format)
    .limit(1)
    .maybeSingle();

  if (error || !exportItem) {
    return jsonError(res, `Report not compiled in ${format} format yet`, 404);
  }

  // Generate signed download URL (valid for 1 hour)
  const adminClient = getAdminClient();
  const { data: signedUrl, error: signError } = await adminClient.storage
    .from('report-exports')
    .createSignedUrl(exportItem.storage_path, 3600);

  if (signError) return jsonError(res, `Storage error: ${signError.message}`, 500);

  return jsonOk(res, {
    reportId,
    format,
    downloadUrl: signedUrl.signedUrl,
    expiresIn: 3600,
  });
}
