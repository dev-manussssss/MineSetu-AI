import type { Role, Permission, User } from '../types';

export interface NavItem {
  id: string;
  label: string;
  iconName: string; // Lucide icon identifier
  path: string;
  permission?: Permission;
  badge?: string;
}

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  ministry_exec: [
    'documents.view',
    'analytics.national',
    'analytics.subsidiary',
    'queries.execute',
    'parliamentary.draft',
    'parliamentary.approve',
    'reports.generate',
    'topic.analyze',
  ],
  cil_exec: [
    'documents.view',
    'documents.approve',
    'analytics.national',
    'analytics.subsidiary',
    'queries.execute',
    'reports.generate',
    'topic.analyze',
  ],
  cmpdi_nodal: [
    'documents.upload',
    'documents.view',
    'documents.verify',
    'documents.approve',
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
    'documents.approve',
    'analytics.subsidiary',
    'queries.execute',
    'reports.generate',
    'topic.analyze',
  ],
  parliamentary_cell: [
    'documents.view',
    'queries.execute',
    'parliamentary.draft',
    'topic.analyze',
  ],
  field_officer: [
    'documents.upload',
    'documents.view',
    'documents.verify',
    'queries.execute',
  ],
  sys_admin: [
    'documents.upload',
    'documents.view',
    'documents.verify',
    'documents.approve',
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
  ministry_exec: {
    id: 'usr_min_01',
    name: 'Dr. Rajeshwar Sharma, IAS',
    email: 'ministry.exec@demo.coal.gov.in',
    role: 'ministry_exec',
    roleLabel: 'Ministry Executive (MoC)',
    department: 'Ministry of Coal, Shastri Bhawan',
    isDemo: true,
  },
  cil_exec: {
    id: 'usr_cil_01',
    name: 'Er. S. N. Bhattacharya',
    email: 'cil.director@demo.coalindia.in',
    role: 'cil_exec',
    roleLabel: 'CIL Executive Management',
    department: 'Coal India HQ, Technical Operations',
    isDemo: true,
  },
  cmpdi_nodal: {
    id: 'usr_cmpdi_01',
    name: 'Dr. Ananya Mukherjee',
    email: 'cmpdi.nodal@demo.cmpdi.co.in',
    role: 'cmpdi_nodal',
    roleLabel: 'CMPDI Nodal Expert',
    department: 'CMPDI Exploration & Mining Data Cell',
    isDemo: true,
  },
  subsidiary_mgr: {
    id: 'usr_ecl_01',
    name: 'P. K. Verma',
    email: 'ecl.gm@demo.ecl.gov.in',
    role: 'subsidiary_mgr',
    roleLabel: 'Subsidiary Manager (ECL)',
    department: 'Eastern Coalfields Ltd, Area General Management',
    subsidiaryCode: 'ECL',
    isDemo: true,
  },
  parliamentary_cell: {
    id: 'usr_pq_01',
    name: 'Sunita Meena',
    email: 'parliament.cell@demo.coal.gov.in',
    role: 'parliamentary_cell',
    roleLabel: 'Parliamentary Query Cell',
    department: 'Parliamentary Section, MoC',
    isDemo: true,
  },
  field_officer: {
    id: 'usr_field_01',
    name: 'Manoj Kumar Soren',
    email: 'rajmahal.officer@demo.ecl.gov.in',
    role: 'field_officer',
    roleLabel: 'Field / Mine Data Officer',
    department: 'Rajmahal Open Cast Project, ECL',
    subsidiaryCode: 'ECL',
    collieryName: 'Rajmahal OCP',
    isDemo: true,
  },
  sys_admin: {
    id: 'usr_admin_01',
    name: 'Vikramaditya Rao',
    email: 'sysadmin@demo.cmpdi.co.in',
    role: 'sys_admin',
    roleLabel: 'System Administrator',
    department: 'ICT & Infrastructure Directorate, CMPDI',
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
 * Returns dynamic navigation items for a given role based on Section 10 of guidelines.md.
 */
export function getNavigationForRole(user: User | null | undefined): NavItem[] {
  if (!user) return [];

  const allNavItems: Record<string, NavItem> = {
    dashboard: { id: 'dashboard', label: 'Dashboard', iconName: 'LayoutDashboard', path: '/dashboard' },
    documents: { id: 'documents', label: 'Documents', iconName: 'Files', path: '/documents', permission: 'documents.view' },
    verify: { id: 'verify', label: 'Validation Workbench', iconName: 'CheckSquare', path: '/documents/verify', permission: 'documents.verify' },
    compare: { id: 'compare', label: 'Document Compare', iconName: 'GitCompare', path: '/compare', permission: 'documents.approve' },
    topics: { id: 'topics', label: 'Topic Intelligence', iconName: 'Cloud', path: '/topics', permission: 'topic.analyze' },
    query: { id: 'query', label: 'AI Query (RAG)', iconName: 'MessageSquareText', path: '/query', permission: 'queries.execute' },
    reports: { id: 'reports', label: 'Automated Reports', iconName: 'FileText', path: '/reports', permission: 'reports.generate' },
    parliamentary: { id: 'parliamentary', label: 'Parliamentary Desk', iconName: 'Landmark', path: '/parliamentary', permission: 'parliamentary.draft' },
    admin: { id: 'admin', label: 'System Admin', iconName: 'ShieldAlert', path: '/admin', permission: 'admin.users' },
  };

  // Role-specific navigation hierarchies according to Section 10
  const roleNavMap: Record<Role, string[]> = {
    ministry_exec: ['dashboard', 'topics', 'query', 'parliamentary', 'reports'],
    cil_exec: ['dashboard', 'documents', 'compare', 'topics', 'query', 'reports'],
    cmpdi_nodal: ['dashboard', 'documents', 'verify', 'compare', 'topics', 'query', 'reports'],
    subsidiary_mgr: ['dashboard', 'documents', 'verify', 'compare', 'query', 'reports', 'topics'],
    parliamentary_cell: ['dashboard', 'parliamentary', 'query', 'topics', 'reports'],
    field_officer: ['dashboard', 'documents', 'verify', 'query'],
    sys_admin: ['dashboard', 'documents', 'verify', 'compare', 'topics', 'query', 'reports', 'parliamentary', 'admin'],
  };

  const navKeys = roleNavMap[user.role] || ['dashboard'];
  return navKeys
    .map(key => allNavItems[key])
    .filter(item => Boolean(item) && (!item.permission || can(user, item.permission)));
}
