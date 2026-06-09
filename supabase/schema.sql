-- Ejecutar UNA VEZ en el SQL Editor de Supabase
-- (Database → SQL Editor → New query → paste → Run)

create table if not exists public.user_data (
  id uuid references auth.users(id) on delete cascade primary key,
  profile jsonb not null default '{}'::jsonb,
  sessions jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

-- Row Level Security: cada usuario solo ve y modifica sus propios datos.
alter table public.user_data enable row level security;

create policy "user manages own data"
  on public.user_data
  for all
  using  (auth.uid() = id)
  with check (auth.uid() = id);
