import type { Role, Permission, User } from '../types';

export interface NavItem {
  id: string;
  label: string;
  iconName: string; // Lucide icon identifier
  path: string;
  permission?: Permission;
  badge?: string;
  description?: string;
}

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  // 4 Approved Primary Personas
  ministry_coal: [
    'documents.view',
    'analytics.national',
    'analytics.subsidiary',
    'queries.execute',
    'requests.create',
    'submissions.review',
    'parliamentary.draft',
    'parliamentary.approve',
    'reports.generate',
    'topic.analyze',
    'audit.view',
  ],
  cil_hq: [
    'documents.view',
    'documents.approve',
    'submissions.review',
    'submissions.return',
    'requests.create',
    'requests.respond',
    'analytics.national',
    'analytics.subsidiary',
    'queries.execute',
    'reports.generate',
    'topic.analyze',
    'audit.view',
  ],
  cmpdi: [
    'documents.upload',
    'documents.view',
    'documents.verify',
    'documents.approve',
    'manual.entry',
    'submissions.review',
    'submissions.return',
    'analytics.subsidiary',
    'queries.execute',
    'reports.generate',
    'topic.analyze',
    'audit.view',
  ],
  subsidiary_officer: [
    'documents.upload',
    'documents.view',
    'documents.verify',
    'manual.entry',
    'requests.respond',
    'analytics.subsidiary',
    'queries.execute',
    'audit.view',
  ],

  // Legacy mappings for backward compatibility
  ministry_exec: [
    'documents.view',
    'analytics.national',
    'analytics.subsidiary',
    'queries.execute',
    'requests.create',
    'submissions.review',
    'parliamentary.draft',
    'parliamentary.approve',
    'reports.generate',
    'topic.analyze',
    'audit.view',
  ],
  cil_exec: [
    'documents.view',
    'documents.approve',
    'submissions.review',
    'submissions.return',
    'requests.create',
    'requests.respond',
    'analytics.national',
    'analytics.subsidiary',
    'queries.execute',
    'reports.generate',
    'topic.analyze',
    'audit.view',
  ],
  cmpdi_nodal: [
    'documents.upload',
    'documents.view',
    'documents.verify',
    'documents.approve',
    'manual.entry',
    'submissions.review',
    'submissions.return',
    'analytics.subsidiary',
    'queries.execute',
    'reports.generate',
    'topic.analyze',
    'audit.view',
  ],
  subsidiary_mgr: [
    'documents.upload',
    'documents.view',
    'documents.verify',
    'manual.entry',
    'requests.respond',
    'submissions.review',
    'analytics.subsidiary',
    'queries.execute',
    'reports.generate',
    'topic.analyze',
    'audit.view',
  ],
  parliamentary_cell: [
    'documents.view',
    'queries.execute',
    'parliamentary.draft',
    'topic.analyze',
    'reports.generate',
  ],
  field_officer: [
    'documents.upload',
    'documents.view',
    'documents.verify',
    'manual.entry',
    'requests.respond',
    'queries.execute',
  ],
  sys_admin: [
    'documents.upload',
    'documents.view',
    'documents.verify',
    'documents.approve',
    'manual.entry',
    'submissions.review',
    'submissions.return',
    'requests.create',
    'requests.respond',
    'analytics.national',
    'analytics.subsidiary',
    'queries.execute',
    'parliamentary.draft',
    'parliamentary.approve',
    'reports.generate',
    'topic.analyze',
    'admin.users',
    'audit.view',
  ],
};

export const DEMO_PERSONAS: Record<Role, User> = {
  // Primary 4 Personas
  ministry_coal: {
    id: 'usr_min_01',
    name: 'Dr. Rajeshwar Sharma, IAS',
    email: 'ministry.exec@demo.coal.gov.in',
    role: 'ministry_coal',
    roleLabel: 'Ministry of Coal (Executive)',
    department: 'Ministry of Coal, Shastri Bhawan, New Delhi',
    organization: 'Ministry of Coal',
    isDemo: true,
  },
  cil_hq: {
    id: 'usr_cil_01',
    name: 'Er. S. N. Bhattacharya',
    email: 'cil.director@demo.coalindia.in',
    role: 'cil_hq',
    roleLabel: 'CIL Headquarters (Management)',
    department: 'Production & Planning Directorate, Coal India HQ',
    organization: 'Coal India Limited',
    isDemo: true,
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
    isDemo: true,
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
    isDemo: true,
  },

  // Legacy persona aliases
  ministry_exec: {
    id: 'usr_min_01',
    name: 'Dr. Rajeshwar Sharma, IAS',
    email: 'ministry.exec@demo.coal.gov.in',
    role: 'ministry_coal',
    roleLabel: 'Ministry of Coal (Executive)',
    department: 'Ministry of Coal, Shastri Bhawan, New Delhi',
    organization: 'Ministry of Coal',
    isDemo: true,
  },
  cil_exec: {
    id: 'usr_cil_01',
    name: 'Er. S. N. Bhattacharya',
    email: 'cil.director@demo.coalindia.in',
    role: 'cil_hq',
    roleLabel: 'CIL Headquarters (Management)',
    department: 'Production & Planning Directorate, Coal India HQ',
    organization: 'Coal India Limited',
    isDemo: true,
  },
  cmpdi_nodal: {
    id: 'usr_cmpdi_01',
    name: 'Dr. Ananya Mukherjee',
    email: 'cmpdi.nodal@demo.cmpdi.co.in',
    role: 'cmpdi',
    roleLabel: 'CMPDI (Technical Authority)',
    department: 'Mining Systems & Exploration Data Cell',
    organization: 'CMPDI',
    subsidiaryCode: 'CMPDI',
    isDemo: true,
  },
  subsidiary_mgr: {
    id: 'usr_ecl_01',
    name: 'P. K. Verma',
    email: 'ecl.gm@demo.ecl.gov.in',
    role: 'subsidiary_officer',
    roleLabel: 'Subsidiary Manager (ECL)',
    department: 'Eastern Coalfields Ltd, Area General Management',
    organization: 'Eastern Coalfields Limited',
    subsidiaryCode: 'ECL',
    isDemo: true,
  },
  parliamentary_cell: {
    id: 'usr_pq_01',
    name: 'Sunita Meena',
    email: 'parliament.cell@demo.coal.gov.in',
    role: 'ministry_coal',
    roleLabel: 'Parliamentary Query Cell',
    department: 'Parliamentary Section, MoC',
    organization: 'Ministry of Coal',
    isDemo: true,
  },
  field_officer: {
    id: 'usr_field_01',
    name: 'Manoj Kumar Soren',
    email: 'rajmahal.officer@demo.ecl.gov.in',
    role: 'subsidiary_officer',
    roleLabel: 'Field / Mine Data Officer',
    department: 'Rajmahal Open Cast Project, ECL',
    organization: 'Eastern Coalfields Limited',
    subsidiaryCode: 'ECL',
    collieryName: 'Rajmahal OCP',
    isDemo: true,
  },
  sys_admin: {
    id: 'usr_admin_01',
    name: 'Vikramaditya Rao',
    email: 'sysadmin@demo.cmpdi.co.in',
    role: 'cmpdi',
    roleLabel: 'System Administrator',
    department: 'ICT & Infrastructure Directorate, CMPDI',
    organization: 'CMPDI',
    isDemo: true,
  },
};

/**
 * Evaluates whether a user holds a specific permission.
 */
export function can(user: User | null | undefined, permission: Permission): boolean {
  if (!user) return false;
  const userPerms = ROLE_PERMISSIONS[user.role];
  if (!userPerms) return false;
  return userPerms.includes(permission);
}

/**
 * Returns dynamic navigation items for a given role according to docs/frontend-page-specification.md.
 */
export function getNavigationForRole(user: User | null | undefined): NavItem[] {
  if (!user) return [];

  const allNavItems: Record<string, NavItem> = {
    dashboard: {
      id: 'dashboard',
      label: 'Dashboard',
      iconName: 'LayoutDashboard',
      path: '/dashboard',
      description: 'Operational overview & KPI monitoring',
    },
    ask: {
      id: 'ask',
      label: 'Ask MineSetu',
      iconName: 'Sparkles',
      path: '/ask',
      permission: 'queries.execute',
      badge: 'Grounded AI',
      description: 'Source-grounded inquiry & report assistant',
    },
    documents: {
      id: 'documents',
      label: 'Documents',
      iconName: 'Files',
      path: '/documents',
      permission: 'documents.view',
      description: 'Ingestion queue & digital archive',
    },
    manual: {
      id: 'manual',
      label: 'Manual Data Entry',
      iconName: 'Edit3',
      path: '/documents/manual',
      permission: 'manual.entry',
      description: 'Direct structured data entry without files',
    },
    requests: {
      id: 'requests',
      label: 'Requests',
      iconName: 'MessageSquareText',
      path: '/requests',
      description: 'Cross-organization information requests',
    },
    review: {
      id: 'review',
      label: 'Review Queue',
      iconName: 'CheckSquare',
      path: '/review',
      permission: 'submissions.review',
      description: 'Multi-stage submission verification & baseline comparison',
    },
    reports: {
      id: 'reports',
      label: 'Reports',
      iconName: 'FileText',
      path: '/reports',
      permission: 'reports.generate',
      description: 'Automated report compilation & export',
    },
    topics: {
      id: 'topics',
      label: 'Topics & Word Cloud',
      iconName: 'Cloud',
      path: '/topics',
      permission: 'topic.analyze',
      description: 'Semantic topic clustering across remarks',
    },
    activity: {
      id: 'activity',
      label: 'Activity History',
      iconName: 'Clock',
      path: '/activity',
      permission: 'audit.view',
      description: 'Demonstration event history ledger',
    },
    settings: {
      id: 'settings',
      label: 'Settings',
      iconName: 'Settings',
      path: '/settings',
      description: 'Persona preferences & dataset reset',
    },
  };

  // Role-specific navigation hierarchies
  const roleNavMap: Record<Role, string[]> = {
    ministry_coal: ['dashboard', 'ask', 'requests', 'review', 'reports', 'topics', 'activity', 'settings'],
    cil_hq: ['dashboard', 'ask', 'documents', 'requests', 'review', 'reports', 'topics', 'activity', 'settings'],
    cmpdi: ['dashboard', 'ask', 'documents', 'manual', 'review', 'reports', 'topics', 'activity', 'settings'],
    subsidiary_officer: ['dashboard', 'ask', 'documents', 'manual', 'requests', 'activity', 'settings'],

    // Legacy aliases
    ministry_exec: ['dashboard', 'ask', 'requests', 'review', 'reports', 'topics', 'activity', 'settings'],
    cil_exec: ['dashboard', 'ask', 'documents', 'requests', 'review', 'reports', 'topics', 'activity', 'settings'],
    cmpdi_nodal: ['dashboard', 'ask', 'documents', 'manual', 'review', 'reports', 'topics', 'activity', 'settings'],
    subsidiary_mgr: ['dashboard', 'ask', 'documents', 'manual', 'requests', 'review', 'reports', 'topics', 'activity', 'settings'],
    parliamentary_cell: ['dashboard', 'ask', 'requests', 'reports', 'topics', 'settings'],
    field_officer: ['dashboard', 'ask', 'documents', 'manual', 'requests', 'activity', 'settings'],
    sys_admin: ['dashboard', 'ask', 'documents', 'manual', 'requests', 'review', 'reports', 'topics', 'activity', 'settings'],
  };

  const navKeys = roleNavMap[user.role] || ['dashboard', 'ask', 'documents', 'settings'];
  return navKeys
    .map(key => allNavItems[key])
    .filter(item => Boolean(item) && (!item.permission || can(user, item.permission)));
}
