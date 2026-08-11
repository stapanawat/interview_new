-- Run this once in Supabase: SQL Editor > New query.
create table if not exists public.app_state (
  id integer primary key check (id = 1),
  data jsonb not null default '{"users":[],"auditLogs":[],"applicants":[],"interviews":[],"employees":[],"lineMessages":[]}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.app_state enable row level security;
-- The server uses SUPABASE_SERVICE_ROLE_KEY, which bypasses RLS. Do not expose that key to the browser.
