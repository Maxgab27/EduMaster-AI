"""Autoridad RBAC/ABAC del backend (modo DEMO con headers validados).

Importante: NO es autenticación real. En Fase 4 la API valida roles y
permisos en servidor en vez de confiar solo en el frontend, pero la identidad
sigue viniendo de `X-Actor`/`X-Role` para el entorno DEMO. Para producción se
necesita OIDC/JWT y una tabla de usuarios; hasta entonces `/health` lo anuncia.
"""

from __future__ import annotations

import os
from dataclasses import dataclass
from enum import Enum
from typing import Callable

from fastapi import HTTPException, Request

from app.services.audit import audit_denied


TENANT_ID = os.getenv("TENANT_ID", "org-ute-peru-2026")
DEFAULT_ROLE = os.getenv("DEMO_DEFAULT_ROLE", "estudiante")
RBAC_ENFORCE = os.getenv("RBAC_ENFORCE", "1").strip().lower() not in {"0", "false", "no", "off"}


class Role(str, Enum):
    SUPERADMIN = "superadmin"
    ADMIN = "admin"
    COORDINADOR = "coordinador"
    DOCENTE = "docente"
    ESTUDIANTE = "estudiante"
    ANALISTA = "analista"
    MLE = "mle"
    AUDITOR = "auditor"


class Permission(str, Enum):
    DASHBOARD_VIEW = "dashboard:view"
    LEARNING_PATHS_VIEW = "learning-paths:view"
    LEARNING_PATHS_PROGRESS = "learning-paths:progress"
    COURSES_VIEW = "courses:view"
    COURSES_EDIT = "courses:edit"
    COURSES_ENROLL = "courses:enroll"
    ANALYTICS_VIEW = "analytics:view"
    TUTOR_USE = "ai-tutor:use"
    ASSESSMENTS_VIEW = "assessments:view"
    SUBMISSIONS_VIEW = "submissions:view"
    GRADES_CONFIRM = "grades:confirm"
    CERTIFICATES_VIEW = "certificates:view"
    NEURAL_INSPECTOR_VIEW = "neural-inspector:view"
    GOVERNANCE_VIEW = "governance:view"
    COMMUNITY_VIEW = "community:view"
    MODERATION_EXECUTE = "moderation:execute"
    SETTINGS_VIEW = "settings:view"
    SETTINGS_EDIT = "settings:edit"
    MLOPS_CONTROL = "mlops:control"
    AUDIT_READ = "audit:read"
    AUDIT_WRITE = "audit:write"
    SANDBOX_USE = "sandbox:use"


ALL_PERMISSIONS = frozenset(permission.value for permission in Permission)

ROLE_PERMISSIONS: dict[Role, frozenset[str]] = {
    Role.SUPERADMIN: frozenset(ALL_PERMISSIONS),
    Role.ADMIN: frozenset(ALL_PERMISSIONS),
    Role.COORDINADOR: frozenset({
        "dashboard:view", "learning-paths:view", "learning-paths:progress",
        "courses:view", "courses:edit", "analytics:view", "ai-tutor:use",
        "assessments:view", "submissions:view", "certificates:view",
        "community:view", "governance:view", "moderation:execute",
        "settings:view", "sandbox:use", "audit:read", "audit:write",
    }),
    Role.DOCENTE: frozenset({
        "dashboard:view", "courses:view", "courses:edit", "analytics:view",
        "ai-tutor:use", "assessments:view", "submissions:view", "grades:confirm",
        "certificates:view", "community:view", "moderation:execute",
        "sandbox:use", "audit:write",
    }),
    Role.ESTUDIANTE: frozenset({
        "dashboard:view", "learning-paths:view", "learning-paths:progress",
        "courses:view", "courses:enroll", "ai-tutor:use", "assessments:view",
        "certificates:view", "community:view", "sandbox:use", "audit:write",
    }),
    Role.ANALISTA: frozenset({
        "dashboard:view", "analytics:view", "neural-inspector:view",
        "governance:view", "audit:read", "audit:write",
    }),
    Role.MLE: frozenset({
        "dashboard:view", "analytics:view", "neural-inspector:view",
        "mlops:control", "governance:view", "moderation:execute", "audit:write",
    }),
    Role.AUDITOR: frozenset({
        "dashboard:view", "analytics:view", "neural-inspector:view",
        "governance:view", "audit:read", "audit:write",
    }),
}


@dataclass(frozen=True)
class Actor:
    id: str
    name: str
    role: Role
    tenantId: str = TENANT_ID
    authMode: str = "demo-header"


def _parse_role(raw: str | None) -> Role:
    value = (raw or "").strip().lower()
    try:
        return Role(value)
    except ValueError:
        return Role(DEFAULT_ROLE) if DEFAULT_ROLE in Role._value2member_map_ else Role.ESTUDIANTE


def current_actor(request: Request) -> Actor:
    """Actor validado contra la allowlist; nunca confía en un rol arbitrario."""
    cached = getattr(request.state, "actor", None)
    if isinstance(cached, Actor):
        return cached

    name = (request.headers.get("X-Actor") or "demo-user").strip() or "demo-user"
    actor = Actor(
        # Se mantiene el nombre como id para no romper inscripciones/progreso Fase 3.
        id=name,
        name=name,
        role=_parse_role(request.headers.get("X-Role")),
    )
    request.state.actor = actor
    return actor


def can(role: Role | str, permission: Permission | str) -> bool:
    try:
        parsed_role = role if isinstance(role, Role) else Role(role)
    except ValueError:
        return False
    value = permission.value if isinstance(permission, Permission) else permission
    return value in ROLE_PERMISSIONS[parsed_role]


def require(permission: Permission) -> Callable[[Request], Actor]:
    """Dependencia FastAPI: RBAC server-side con auditoría de denegación."""

    def dependency(request: Request) -> Actor:
        actor = current_actor(request)
        if can(actor.role, permission):
            return actor
        audit_denied(request, actor, permission.value)
        if RBAC_ENFORCE:
            raise HTTPException(
                status_code=403,
                detail=f"Acceso denegado: se requiere {permission.value}",
            )
        return actor

    return dependency


def require_signature(request: Request, actor: Actor, signed_by: str | None) -> str:
    """ABAC: la firma oficial debe corresponder al actor autenticado."""
    value = (signed_by or "").strip()
    if not value:
        raise HTTPException(status_code=422, detail="signedBy es obligatorio")
    if value.casefold() != actor.name.casefold():
        audit_denied(request, actor, "grades:confirm", reason="firma no coincide con el actor")
        raise HTTPException(
            status_code=403,
            detail="La firma docente debe coincidir con el actor autenticado",
        )
    return value
