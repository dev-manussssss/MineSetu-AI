/**
 * MineSetu AI — API Gateway Shared Utilities
 *
 * Common helpers for Vercel serverless API functions:
 * - CORS handling
 * - JWT extraction and validation
 * - Standardized JSON responses
 * - Error handling with safe serialization
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getUserClient } from './supabase';

// ---------------------------------------------------------------------------
// CORS
// ---------------------------------------------------------------------------

const ALLOWED_ORIGINS = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:3000',
  process.env.VITE_APP_URL,
].filter(Boolean) as string[];

/**
 * Sets CORS headers. Returns true if the request is a preflight OPTIONS
 * request (caller should return immediately).
 */
export function handleCors(req: VercelRequest, res: VercelResponse): boolean {
  const origin = req.headers.origin || '';
  if (ALLOWED_ORIGINS.includes(origin) || process.env.VITE_APP_ENV === 'development') {
    res.setHeader('Access-Control-Allow-Origin', origin || '*');
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Demo-Role');
  res.setHeader('Access-Control-Max-Age', '86400');

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return true;
  }
  return false;
}

// ---------------------------------------------------------------------------
// JWT & Auth
// ---------------------------------------------------------------------------

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: string;
  organization_id: string | null;
  subsidiary_code: string | null;
  mine_id?: string | null;
  app_metadata: Record<string, unknown>;
  user_metadata: Record<string, unknown>;
}

/**
 * Extracts the Bearer token from the Authorization header.
 */
export function extractBearerToken(req: VercelRequest): string | null {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.slice(7);
}

/**
 * Validates JWT via Supabase `auth.getUser()` and returns the authenticated
 * user profile. Returns null if the token is invalid or expired.
 */
export async function authenticateRequest(
  req: VercelRequest
): Promise<AuthenticatedUser | null> {
  const token = extractBearerToken(req);
  if (!token) return null;

  // Support deterministic mock tokens during automated test suite execution
  if (process.env.VITE_APP_ENV === 'test' && token.startsWith('test-token-')) {
    const role = token.replace('test-token-', '');
    return {
      id: `usr_${role}_01`,
      email: `${role}@test.minesetu.gov.in`,
      role: role,
      organization_id: 'org_test_01',
      subsidiary_code: 'TEST',
      mine_id: 'mine_test_01',
      app_metadata: { role, organization_id: 'org_test_01', subsidiary_code: 'TEST' },
      user_metadata: {},
    };
  }

  const supabase = getUserClient(token);
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) return null;

  const user = data.user;
  return {
    id: user.id,
    email: user.email || '',
    role: (user.app_metadata?.role as string) || 'subsidiary_officer',
    organization_id: (user.app_metadata?.organization_id as string) || null,
    subsidiary_code: (user.app_metadata?.subsidiary_code as string) || null,
    mine_id: (user.app_metadata?.mine_id as string) || (user.user_metadata?.mine_id as string) || null,
    app_metadata: user.app_metadata || {},
    user_metadata: user.user_metadata || {},
  };
}

// ---------------------------------------------------------------------------
// Standardized JSON Responses
// ---------------------------------------------------------------------------

export function jsonOk(res: VercelResponse, data: unknown, status = 200) {
  return res.status(status).json({ ok: true, data });
}

export function jsonError(
  res: VercelResponse,
  message: string,
  status = 400,
  details?: unknown
) {
  return res.status(status).json({ ok: false, error: message, details });
}

export function json401(res: VercelResponse, message = 'Unauthorized') {
  return jsonError(res, message, 401);
}

export function json403(res: VercelResponse, message = 'Forbidden') {
  return jsonError(res, message, 403);
}

export function json404(res: VercelResponse, message = 'Not found') {
  return jsonError(res, message, 404);
}

export function json405(res: VercelResponse, allowed: string[]) {
  res.setHeader('Allow', allowed.join(', '));
  return jsonError(res, `Method not allowed. Use: ${allowed.join(', ')}`, 405);
}

export function json500(res: VercelResponse, err: unknown) {
  const message =
    err instanceof Error ? err.message : 'Internal server error';
  console.error('[API Error]', err);
  return jsonError(res, message, 500);
}

// ---------------------------------------------------------------------------
// RBAC Permission Check
// ---------------------------------------------------------------------------

import { ROLE_PERMISSIONS } from './permissions';

/**
 * Checks whether the given role has a specific permission.
 */
export function hasPermission(role: string, permission: string): boolean {
  const perms = ROLE_PERMISSIONS[role];
  if (!perms) return false;
  return perms.includes(permission);
}

/**
 * Guard that returns 403 if the user lacks the required permission.
 * Returns true if authorized, false if already responded with 403.
 */
export function requirePermission(
  res: VercelResponse,
  user: AuthenticatedUser,
  permission: string
): boolean {
  if (!hasPermission(user.role, permission)) {
    json403(res, `Insufficient permission: ${permission}`);
    return false;
  }
  return true;
}
