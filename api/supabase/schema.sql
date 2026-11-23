-- Schema Supabase para EduMaster.ai DEMO
-- Ejecutar en el SQL Editor de Supabase. Las políticas RLS se añaden con auth real.

create extension if not exists pgcrypto;

create table if not exists certificates (
  id text primary key,
  folio text unique not null,
  student text not null,
  course text not null,
  issued_at timestamptz not null,
  grade text not null,
  hash text not null,
  status text not null default 'Emitido',
  created_at timestamptz not null default now()
);

create table if not exists audit_logs (
  id text primary key,
  correlation_id text not null,
  action text not null,
  actor text not null,
  detail jsonb not null default '{}'::jsonb,
  timestamp timestamptz not null
);

create index if not exists audit_logs_correlation_idx on audit_logs (correlation_id);
create index if not exists audit_logs_action_idx on audit_logs (action);
create index if not exists audit_logs_timestamp_idx on audit_logs (timestamp desc);

-- Fase 4: enriquecimiento de auditoría (seguro si la tabla ya existía).
alter table audit_logs add column if not exists role text not null default 'desconocido';
alter table audit_logs add column if not exists actor_id text not null default '';
alter table audit_logs add column if not exists tenant_id text not null default 'demo-tenant';
alter table audit_logs add column if not exists method text;
alter table audit_logs add column if not exists path text;
alter table audit_logs add column if not exists ip_address text;
alter table audit_logs add column if not exists status text not null default 'success';
create index if not exists audit_logs_actor_timestamp_idx on audit_logs (actor, timestamp desc);
create index if not exists audit_logs_status_idx on audit_logs (status);

create table if not exists learning_events (
  id text primary key,
  event_type text not null,
  student_id text,
  course_id text,
  payload jsonb not null default '{}'::jsonb,
  occurred_at timestamptz not null,
  idempotency_key text unique
);

create table if not exists community_threads (
  id text primary key,
  name text unique not null,
  title text not null,
  description text not null,
  members integer not null default 0,
  pinned boolean not null default false,
  created_at timestamptz not null,
  last_activity timestamptz not null
);

create table if not exists community_messages (
  id text primary key,
  thread_id text not null references community_threads(id) on delete cascade,
  author text not null,
  role text not null,
  text text not null,
  likes integer not null default 0,
  moderated boolean not null default false,
  hidden boolean not null default false,
  created_at timestamptz not null
);

create index if not exists community_messages_thread_idx on community_messages (thread_id, created_at);

create table if not exists tutor_messages (
  id text primary key,
  conversation_id text not null,
  sender text not null check (sender in ('user', 'tutor')),
  text text not null,
  confidence numeric,
  sources jsonb not null default '[]'::jsonb,
  guardrail text,
  created_at timestamptz not null
);

create index if not exists tutor_messages_conversation_idx on tutor_messages (conversation_id, created_at);

create table if not exists recommendation_feedback (
  id text primary key,
  prediction_id text not null,
  resource_id text not null,
  decision text not null,
  comment text,
  recorded_at timestamptz not null
);

-- Fase 3: cursos, rutas, evaluaciones y sandbox.
-- Las columnas en camelCase coinciden con el contrato /api/v1 y se escriben con comillas.

create table if not exists courses (
  "id" text primary key,
  "code" text not null unique,
  "title" text not null,
  "instructor" text not null,
  "level" text not null check ("level" in ('Básico', 'Intermedio', 'Avanzado')),
  "description" text not null,
  "students" integer not null default 0,
  "capacity" integer not null default 100,
  "completionRate" integer not null default 0,
  "status" text not null default 'Publicado',
  "tags" jsonb not null default '[]'::jsonb,
  "createdAt" timestamptz not null
);

create table if not exists course_enrollments (
  "id" text primary key,
  "courseId" text not null references courses("id") on delete cascade,
  "actor" text not null,
  "createdAt" timestamptz not null,
  unique ("courseId", "actor")
);

create table if not exists learning_paths (
  "id" text primary key,
  "title" text not null,
  "description" text not null,
  "duration" text not null,
  "coursesCount" integer not null default 0,
  "steps" jsonb not null default '[]'::jsonb
);

create table if not exists path_progress (
  "id" text primary key,
  "pathId" text not null references learning_paths("id") on delete cascade,
  "stepId" text not null,
  "actor" text not null,
  "completed" boolean not null default false,
  "source" text not null default 'manual',
  "updatedAt" timestamptz not null,
  unique ("pathId", "stepId", "actor")
);

create table if not exists assessments (
  "id" text primary key,
  "title" text not null,
  "course" text not null,
  "dueDate" text not null,
  "maxScore" numeric not null default 20,
  "weight" text not null,
  "attempts" integer not null default 0,
  "officialAvg" numeric,
  "predictiveEst" numeric,
  "status" text not null
);

create table if not exists submissions (
  "id" text primary key,
  "studentId" text not null,
  "studentName" text not null,
  "avatar" text,
  "course" text not null,
  "assignmentTitle" text not null,
  "submittedAt" timestamptz not null,
  "estimatedAiScore" numeric not null,
  "officialScore" numeric,
  "status" text not null default 'pending',
  "codeSnippet" text not null default '',
  "rubricScores" jsonb not null default '[]'::jsonb,
  "feedback" text not null default '',
  "signedBy" text,
  "gradedAt" timestamptz,
  "predictionId" text
);

create index if not exists submissions_status_idx on submissions ("status");

create table if not exists sandbox_attempts (
  "id" text primary key,
  "studentId" text not null,
  "code" text not null,
  "output" text not null,
  "status" text not null check ("status" in ('simulado', 'bloqueado')),
  "findings" jsonb not null default '[]'::jsonb,
  "guardrail" text not null,
  "createdAt" timestamptz not null
);

create index if not exists sandbox_attempts_student_idx on sandbox_attempts ("studentId", "createdAt");

-- Fase 4: configuración institucional (una fila por tenant).
create table if not exists settings (
  id text primary key,
  "tenantId" text not null unique,
  theme text not null default 'monochrome' check (theme in ('monochrome', 'cyber', 'light')),
  organization text not null,
  -- Informativo en DEMO: no habilita RLS real sin OIDC/PostgREST policies.
  "rlsEnabled" boolean not null default false,
  "retentionDays" integer not null default 730 check ("retentionDays" between 1 and 3650),
  "minorsProtection" boolean not null default true,
  "consentOnFirstLogin" boolean not null default true,
  "arcoPortal" boolean not null default true,
  "updatedAt" timestamptz not null,
  "updatedBy" text not null
);

-- Fase 4: preferencias de notificaciones por actor (self-service y settings).
create table if not exists notification_preferences (
  id text primary key,
  actor text not null unique,
  email boolean not null default false,
  "inApp" boolean not null default true,
  digest text not null default 'diario',
  categories jsonb not null default '[]'::jsonb
);

-- Nota: cuando se active OIDC/OAuth2, habilitar RLS y crear policies por rol/institución.
-- Hasta entonces "rlsEnabled" es solo informativo y NINGUNA tabla tiene RLS activo.
-- alter table certificates enable row level security;
-- alter table audit_logs enable row level security;
-- alter table settings enable row level security;
-- alter table notification_preferences enable row level security;
