/**
 * MineSetu AI — Auth API Endpoints
 * Path: /api/v1/auth
 *
 * Endpoints:
 * - POST /api/v1/auth/login     — Authenticate with Supabase credentials
 * - POST /api/v1/auth/logout    — Invalidate session
 * - GET  /api/v1/auth/me        — Return current user profile with role claims
 * - POST /api/v1/auth/demo      — Switch to a demo persona (demo mode only)
 *
 * In demo mode (VITE_APP_DEMO_MODE=true), the /demo endpoint allows
 * persona switching without real Supabase credentials.
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import {
  handleCors,
  authenticateRequest,
  extractBearerToken,
  jsonOk,
  jsonError,
  json401,
  json405,
  json500,
} from '../../../lib/api-utils';
import { getUserClient, getAdminClient } from '../../../lib/supabase';
import { ROLE_PERMISSIONS } from '../../../lib/permissions';

const IS_DEMO_MODE = process.env.VITE_APP_DEMO_MODE === 'true';

/**
 * Demo persona definitions (server-side version of DEMO_PERSONAS).
 * Only used when VITE_APP_DEMO_MODE=true.
 */
const DEMO_PERSONAS: Record<string, {
  id: string;
  name: string;
  email: string;
  role: string;
  roleLabel: string;
  department: string;
  organization: string;
  subsidiaryCode?: string;
  collieryName?: string;
}> = {
  ministry_coal: {
    id: 'usr_min_01',
    name: 'Dr. Rajeshwar Sharma, IAS',
    email: 'ministry.exec@demo.coal.gov.in',
    role: 'ministry_coal',
    roleLabel: 'Ministry of Coal (Executive)',
    department: 'Ministry of Coal, Shastri Bhawan, New Delhi',
    organization: 'Ministry of Coal',
  },
  cil_hq: {
    id: 'usr_cil_01',
    name: 'Er. S. N. Bhattacharya',
    email: 'cil.director@demo.coalindia.in',
    role: 'cil_hq',
    roleLabel: 'CIL Headquarters (Management)',
    department: 'Production & Planning Directorate, Coal India HQ',
    organization: 'Coal India Limited',
  },
  cmpdi: {
    id: 'usr_cmpdi_01',
    name: 'Dr. Ananya Mukherjee',
    email: 'cmpdi.nodal@demo.cmpdi.co.in',
    role: 'cmpdi',
    roleLabel: 'CMPDI (Technical Authority)',
    department: 'Mining Systems & Exploration Data Cell',
    organization: 'CMPDI',
    subsidiaryCode: 'CMPDI',
  },
  subsidiary_officer: {
    id: 'usr_field_01',
    name: 'Manoj Kumar Soren',
    email: 'rajmahal.officer@demo.ecl.gov.in',
    role: 'subsidiary_officer',
    roleLabel: 'Subsidiary / Mine Officer (ECL)',
    department: 'Rajmahal Open Cast Project, Area Operational Returns',
    organization: 'Eastern Coalfields Limited',
    subsidiaryCode: 'ECL',
    collieryName: 'Rajmahal OCP',
  },
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleCors(req, res)) return;

  // Parse the sub-route from query parameters
  // Vercel routes: /api/v1/auth/[action]
  const action = (req.query.action as string) || '';

  try {
    switch (action) {
      case 'login':
        return await handleLogin(req, res);
      case 'logout':
        return await handleLogout(req, res);
      case 'me':
        return await handleMe(req, res);
      case 'demo':
        return await handleDemoSwitch(req, res);
      default:
        return jsonError(res, `Unknown auth action: ${action}`, 404);
    }
  } catch (err) {
    return json500(res, err);
  }
}

/**
 * POST /api/v1/auth/login
 * Body: { email: string, password: string }
 * Returns: { session, user } on success.
 */
async function handleLogin(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return json405(res, ['POST']);

  const { email, password } = req.body || {};
  if (!email || !password) {
    return jsonError(res, 'Missing email or password', 400);
  }

  const supabase = getUserClient(''); // anon client for login
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return jsonError(res, error.message, 401);
  }

  return jsonOk(res, {
    session: {
      access_token: data.session?.access_token,
      refresh_token: data.session?.refresh_token,
      expires_at: data.session?.expires_at,
    },
    user: {
      id: data.user?.id,
      email: data.user?.email,
      role: data.user?.app_metadata?.role || 'subsidiary_officer',
      organization_id: data.user?.app_metadata?.organization_id || null,
      subsidiary_code: data.user?.app_metadata?.subsidiary_code || null,
      user_metadata: data.user?.user_metadata || {},
    },
  });
}

/**
 * POST /api/v1/auth/logout
 * Invalidates the current session.
 */
async function handleLogout(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return json405(res, ['POST']);

  const token = extractBearerToken(req);
  if (!token) return json401(res);

  const supabase = getUserClient(token);
  await supabase.auth.signOut();

  return jsonOk(res, { message: 'Logged out successfully' });
}

/**
 * GET /api/v1/auth/me
 * Returns the current user's profile with resolved role permissions.
 */
async function handleMe(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return json405(res, ['GET']);

  // In demo mode, check for X-Demo-Role header first
  if (IS_DEMO_MODE) {
    const demoRole = req.headers['x-demo-role'] as string;
    if (demoRole && DEMO_PERSONAS[demoRole]) {
      const persona = DEMO_PERSONAS[demoRole];
      return jsonOk(res, {
        user: {
          ...persona,
          isDemo: true,
        },
        permissions: ROLE_PERMISSIONS[persona.role] || [],
      });
    }
  }

  const authUser = await authenticateRequest(req);
  if (!authUser) return json401(res);

  return jsonOk(res, {
    user: {
      id: authUser.id,
      email: authUser.email,
      role: authUser.role,
      organization_id: authUser.organization_id,
      subsidiary_code: authUser.subsidiary_code,
      user_metadata: authUser.user_metadata,
      isDemo: false,
    },
    permissions: ROLE_PERMISSIONS[authUser.role] || [],
  });
}

/**
 * POST /api/v1/auth/demo
 * Body: { role: string }
 * Returns a demo persona profile. Only available in demo mode.
 */
async function handleDemoSwitch(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return json405(res, ['POST']);

  if (!IS_DEMO_MODE) {
    return jsonError(res, 'Demo mode is disabled', 403);
  }

  const { role } = req.body || {};
  if (!role || !DEMO_PERSONAS[role]) {
    return jsonError(
      res,
      `Invalid demo role. Available roles: ${Object.keys(DEMO_PERSONAS).join(', ')}`,
      400
    );
  }

  const persona = DEMO_PERSONAS[role];
  return jsonOk(res, {
    user: {
      ...persona,
      isDemo: true,
    },
    permissions: ROLE_PERMISSIONS[persona.role] || [],
  });
}
