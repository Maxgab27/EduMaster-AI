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

-- Nota: cuando se active OIDC/OAuth2, habilitar RLS y crear policies por rol/institución.
-- alter table certificates enable row level security;
-- alter table audit_logs enable row level security;
