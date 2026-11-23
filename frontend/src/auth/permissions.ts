import type { NavTab, UserRole } from '../types';

/**
 * RBAC map usado solo para UX del DEMO. NO es seguridad: la API Fase 4
 * revalida permisos en servidor con RBAC/ABAC sobre X-Actor/X-Role.
 * Este mapa debe espejear ROLE_PERMISSIONS de api/app/auth.py.
 */

export type Permission =
  | 'dashboard:view'
  | 'learning-paths:view'
  | 'learning-paths:progress'
  | 'courses:view'
  | 'courses:edit'
  | 'courses:enroll'
  | 'analytics:view'
  | 'ai-tutor:use'
  | 'assessments:view'
  | 'submissions:view'
  | 'certificates:view'
  | 'neural-inspector:view'
  | 'governance:view'
  | 'community:view'
  | 'moderation:execute'
  | 'settings:view'
  | 'settings:edit'
  | 'grades:confirm'
  | 'mlops:control'
  | 'audit:read'
  | 'audit:write'
  | 'sandbox:use';

const ALL_PERMISSIONS: Permission[] = [
  'dashboard:view', 'learning-paths:view', 'learning-paths:progress',
  'courses:view', 'courses:edit', 'courses:enroll', 'analytics:view',
  'ai-tutor:use', 'assessments:view', 'submissions:view', 'certificates:view',
  'neural-inspector:view', 'governance:view', 'community:view',
  'moderation:execute', 'settings:view', 'settings:edit', 'grades:confirm',
  'mlops:control', 'audit:read', 'audit:write', 'sandbox:use',
];

const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  superadmin: ALL_PERMISSIONS,
  admin: ALL_PERMISSIONS,
  coordinador: [
    'dashboard:view', 'learning-paths:view', 'learning-paths:progress',
    'courses:view', 'courses:edit', 'analytics:view', 'ai-tutor:use',
    'assessments:view', 'submissions:view', 'certificates:view',
    'community:view', 'governance:view', 'moderation:execute',
    'settings:view', 'sandbox:use', 'audit:read', 'audit:write',
  ],
  docente: [
    'dashboard:view', 'courses:view', 'courses:edit', 'analytics:view',
    'ai-tutor:use', 'assessments:view', 'submissions:view', 'grades:confirm',
    'certificates:view', 'community:view', 'moderation:execute',
    'sandbox:use', 'audit:write',
  ],
  estudiante: [
    'dashboard:view', 'learning-paths:view', 'learning-paths:progress',
    'courses:view', 'courses:enroll', 'ai-tutor:use', 'assessments:view',
    'certificates:view', 'community:view', 'sandbox:use', 'audit:write',
  ],
  analista: [
    'dashboard:view', 'analytics:view', 'neural-inspector:view',
    'governance:view', 'audit:read', 'audit:write',
  ],
  mle: [
    'dashboard:view', 'analytics:view', 'neural-inspector:view',
    'mlops:control', 'governance:view', 'moderation:execute', 'audit:write',
  ],
  auditor: [
    'dashboard:view', 'analytics:view', 'neural-inspector:view',
    'governance:view', 'audit:read', 'audit:write',
  ],
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
  settings: 'settings:view',
};

export const ROLE_LABELS: Record<UserRole, string> = {
  superadmin: 'Superadministrador',
  admin: 'Administrador',
  coordinador: 'Coordinador',
  docente: 'Docente / Instructor',
  estudiante: 'Estudiante',
  analista: 'Analista de Datos',
  mle: 'ML Engineer',
  auditor: 'Auditor',
};

export function can(role: UserRole, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role].includes(permission);
}

export function canViewTab(role: UserRole, tab: NavTab): boolean {
  return can(role, PERMISSION_BY_TAB[tab]);
}
