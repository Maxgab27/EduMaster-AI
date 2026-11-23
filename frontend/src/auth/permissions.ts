import type { NavTab, UserRole } from '../types';

/**
 * Frontend-only RBAC map. This improves the demo UX but is NOT security:
 * the backend must re-validate every permission with RBAC + ABAC.
 */

export type Permission =
  | 'dashboard:view'
  | 'learning-paths:view'
  | 'courses:view'
  | 'analytics:view'
  | 'ai-tutor:use'
  | 'assessments:view'
  | 'certificates:view'
  | 'neural-inspector:view'
  | 'governance:view'
  | 'community:view'
  | 'settings:view'
  | 'settings:edit'
  | 'grades:confirm'
  | 'mlops:control'
  | 'audit:read';

const ALL_PERMISSIONS: Permission[] = [
  'dashboard:view', 'learning-paths:view', 'courses:view', 'analytics:view',
  'ai-tutor:use', 'assessments:view', 'certificates:view',
  'neural-inspector:view', 'governance:view', 'community:view',
  'settings:view', 'settings:edit', 'grades:confirm', 'mlops:control', 'audit:read'
];

const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  superadmin: ALL_PERMISSIONS,
  admin: ALL_PERMISSIONS,
  coordinador: [
    'dashboard:view', 'learning-paths:view', 'courses:view', 'analytics:view',
    'ai-tutor:use', 'assessments:view', 'certificates:view', 'community:view',
    'governance:view', 'audit:read', 'settings:view'
  ],
  docente: [
    'dashboard:view', 'courses:view', 'analytics:view', 'ai-tutor:use',
    'assessments:view', 'certificates:view', 'community:view', 'grades:confirm'
  ],
  estudiante: [
    'dashboard:view', 'learning-paths:view', 'courses:view', 'ai-tutor:use',
    'assessments:view', 'certificates:view', 'community:view'
  ],
  analista: [
    'dashboard:view', 'analytics:view', 'neural-inspector:view',
    'governance:view', 'audit:read'
  ],
  mle: [
    'dashboard:view', 'analytics:view', 'neural-inspector:view',
    'mlops:control', 'governance:view'
  ],
  auditor: [
    'dashboard:view', 'analytics:view', 'neural-inspector:view',
    'governance:view', 'audit:read'
  ]
};

export const PERMISSION_BY_TAB: Record<NavTab, Permission> = {
  dashboard: 'dashboard:view',
  'learning-paths': 'learning-paths:view',
  courses: 'courses:view',
  analytics: 'analytics:view',
  'ai-tutor': 'ai-tutor:use',
  assessments: 'assessments:view',
  certificates: 'certificates:view',
  community: 'community:view',
  'neural-inspector': 'neural-inspector:view',
  governance: 'governance:view',
  settings: 'settings:view'
};

export const ROLE_LABELS: Record<UserRole, string> = {
  superadmin: 'Superadministrador',
  admin: 'Administrador',
  coordinador: 'Coordinador',
  docente: 'Docente / Instructor',
  estudiante: 'Estudiante',
  analista: 'Analista de Datos',
  mle: 'ML Engineer',
  auditor: 'Auditor'
};

export function can(role: UserRole, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role].includes(permission);
}

export function canViewTab(role: UserRole, tab: NavTab): boolean {
  return can(role, PERMISSION_BY_TAB[tab]);
}
