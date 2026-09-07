create table if not exists public.student_data (
  username text primary key,
  data jsonb not null default '{"schedules":[],"homeworks":[],"todos":[],"notes":[]}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.student_data enable row level security;

create policy "Public student data access"
  on public.student_data
  for all
  using (true)
  with check (true);

insert into storage.buckets (id, name, public)
values ('task-files', 'task-files', true)
on conflict (id) do update set public = true;

create policy "Public task file access"
  on storage.objects
  for select
  using (bucket_id = 'task-files');

create policy "Public task file upload"
  on storage.objects
  for insert
  with check (bucket_id = 'task-files');
