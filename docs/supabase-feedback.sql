create table if not exists public.yidu_feedback_events (
  id text primary key,
  received_at timestamptz not null,
  schema_version integer not null default 3,
  event text not null,
  task text not null,
  mode text,
  route text,
  weapon text,
  batch_id text,
  reply_id text,
  reply_index integer,
  prompt_version text,
  verdict text,
  reason text,
  title text,
  summary text,
  source_text text,
  source_hash text,
  reply_text text,
  client_ts bigint,
  record jsonb not null default '{}'::jsonb
);

create index if not exists yidu_feedback_events_received_at_idx
  on public.yidu_feedback_events (received_at desc);

create index if not exists yidu_feedback_events_task_event_idx
  on public.yidu_feedback_events (task, event);

alter table public.yidu_feedback_events enable row level security;

drop policy if exists "service role can manage feedback events"
  on public.yidu_feedback_events;

create policy "service role can manage feedback events"
  on public.yidu_feedback_events
  for all
  to service_role
  using (true)
  with check (true);
