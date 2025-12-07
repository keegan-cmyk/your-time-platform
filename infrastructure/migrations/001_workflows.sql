create table if not exists workflows (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  name text not null,
  description text,
  json jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table workflows enable row level security;

create policy "Users can select their workflows"
  on workflows for select
  using (auth.uid() = user_id);

create policy "Users can insert workflows"
  on workflows for insert
  with check (auth.uid() = user_id);

create policy "Users can update workflows"
  on workflows for update
  using (auth.uid() = user_id);

create policy "Users can delete workflows"
  on workflows for delete
  using (auth.uid() = user_id);
