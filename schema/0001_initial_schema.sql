-- ============================================================================
-- Mise — Initial schema
-- Migration: 0001_initial_schema.sql
-- LOCKED: Do not modify this file. Schema changes go in new migration files.
-- ============================================================================

-- ---- ENUMS ----
create type user_role as enum ('counter', 'manager', 'admin');
create type session_status as enum ('in_progress', 'submitted', 'approved', 'rejected');
create type unit_type as enum ('lb', 'oz', 'each', 'bottle', 'case', 'gal', 'qt', 'l', 'ml', 'kg', 'g');

-- ---- USERS (mirror of auth.users + app metadata) ----
create table public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  full_name text,
  role user_role not null default 'counter',
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---- STATIONS ----
create table public.stations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  sort_order int not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---- ITEMS ----
create table public.items (
  id uuid primary key default gen_random_uuid(),
  station_id uuid not null references public.stations(id) on delete restrict,
  name text not null,
  unit unit_type not null,
  sort_order int not null default 0,
  par_level numeric(10,2),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index items_station_id_idx on public.items(station_id);

-- ---- COUNT SESSIONS ----
create table public.count_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete restrict,
  station_id uuid not null references public.stations(id) on delete restrict,
  status session_status not null default 'in_progress',
  started_at timestamptz not null default now(),
  submitted_at timestamptz,
  approved_at timestamptz,
  approved_by uuid references public.users(id),
  rejection_reason text,
  notes text,
  client_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(client_id)
);
create index count_sessions_user_id_idx on public.count_sessions(user_id);
create index count_sessions_station_id_idx on public.count_sessions(station_id);
create index count_sessions_status_idx on public.count_sessions(status);

-- ---- COUNT ENTRIES ----
create table public.count_entries (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.count_sessions(id) on delete cascade,
  item_id uuid not null references public.items(id) on delete restrict,
  quantity numeric(10,3) not null,
  previous_quantity numeric(10,3),
  variance_pct numeric(6,2),
  entered_at timestamptz not null default now(),
  device_id text,
  unique(session_id, item_id)
);
create index count_entries_session_id_idx on public.count_entries(session_id);
create index count_entries_item_id_idx on public.count_entries(item_id);

-- ---- AUDIT LOG ----
create table public.audit_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id),
  action text not null,
  entity_type text not null,
  entity_id uuid,
  payload jsonb,
  created_at timestamptz not null default now()
);
create index audit_log_entity_idx on public.audit_log(entity_type, entity_id);
create index audit_log_user_id_idx on public.audit_log(user_id);

-- ============================================================================
-- TRIGGERS
-- ============================================================================
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

create trigger users_updated_at before update on public.users
  for each row execute function public.set_updated_at();
create trigger stations_updated_at before update on public.stations
  for each row execute function public.set_updated_at();
create trigger items_updated_at before update on public.items
  for each row execute function public.set_updated_at();
create trigger count_sessions_updated_at before update on public.count_sessions
  for each row execute function public.set_updated_at();

-- New auth user → mirror into public.users
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.users (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name');
  return new;
end $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================
alter table public.users enable row level security;
alter table public.stations enable row level security;
alter table public.items enable row level security;
alter table public.count_sessions enable row level security;
alter table public.count_entries enable row level security;
alter table public.audit_log enable row level security;

-- Helper: current user's role
create or replace function public.current_user_role()
returns user_role language sql stable security definer as $$
  select role from public.users where id = auth.uid();
$$;

-- ---- USERS policies ----
create policy "users can read self" on public.users
  for select using (auth.uid() = id);
create policy "admins read all users" on public.users
  for select using (public.current_user_role() = 'admin');
create policy "admins update users" on public.users
  for update using (public.current_user_role() = 'admin');

-- ---- STATIONS policies ----
create policy "authenticated read active stations" on public.stations
  for select using (auth.role() = 'authenticated' and active = true);
create policy "admins read all stations" on public.stations
  for select using (public.current_user_role() = 'admin');
create policy "admins write stations" on public.stations
  for all using (public.current_user_role() = 'admin');

-- ---- ITEMS policies ----
create policy "authenticated read active items" on public.items
  for select using (auth.role() = 'authenticated' and active = true);
create policy "admins read all items" on public.items
  for select using (public.current_user_role() = 'admin');
create policy "admins write items" on public.items
  for all using (public.current_user_role() = 'admin');

-- ---- COUNT SESSIONS policies ----
create policy "users read own sessions" on public.count_sessions
  for select using (user_id = auth.uid());
create policy "managers read all sessions" on public.count_sessions
  for select using (public.current_user_role() in ('manager', 'admin'));
create policy "users insert own sessions" on public.count_sessions
  for insert with check (user_id = auth.uid());
create policy "users update own in-progress sessions" on public.count_sessions
  for update using (user_id = auth.uid() and status = 'in_progress');
create policy "managers approve/reject sessions" on public.count_sessions
  for update using (public.current_user_role() in ('manager', 'admin'));

-- ---- COUNT ENTRIES policies ----
create policy "users read entries for visible sessions" on public.count_entries
  for select using (
    exists (
      select 1 from public.count_sessions s
      where s.id = session_id
      and (s.user_id = auth.uid() or public.current_user_role() in ('manager', 'admin'))
    )
  );
create policy "users write entries for own in-progress sessions" on public.count_entries
  for all using (
    exists (
      select 1 from public.count_sessions s
      where s.id = session_id and s.user_id = auth.uid() and s.status = 'in_progress'
    )
  );

-- ---- AUDIT LOG policies ----
create policy "admins read audit log" on public.audit_log
  for select using (public.current_user_role() = 'admin');
create policy "authenticated insert audit" on public.audit_log
  for insert with check (auth.uid() = user_id);
