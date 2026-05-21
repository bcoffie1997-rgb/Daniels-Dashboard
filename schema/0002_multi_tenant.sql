-- ============================================================================
-- Mise — Multi-tenant migration (Gioia Hospitality)
-- Migration: 0002_multi_tenant.sql
--
-- Adds the `restaurants` table and a `restaurant_id` foreign key to every
-- tenant-scoped table. Updates RLS so a user only sees data for restaurants
-- they belong to (via `user_restaurants`).
-- ============================================================================

-- ---- RESTAURANTS ----
create table public.restaurants (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  short_name text not null,
  city text,
  address text,
  phone text,
  concept text,
  accent_hex text,
  accent_deep_hex text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger restaurants_updated_at before update on public.restaurants
  for each row execute function public.set_updated_at();

-- ---- USER ↔ RESTAURANT MEMBERSHIP ----
create table public.user_restaurants (
  user_id uuid not null references public.users(id) on delete cascade,
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  role_at_restaurant user_role,
  primary key (user_id, restaurant_id)
);
create index user_restaurants_restaurant_idx on public.user_restaurants(restaurant_id);
create index user_restaurants_user_idx on public.user_restaurants(user_id);

-- ---- ADD restaurant_id to tenant-scoped tables ----
alter table public.stations
  add column restaurant_id uuid references public.restaurants(id) on delete restrict;
create index stations_restaurant_id_idx on public.stations(restaurant_id);

alter table public.items
  add column restaurant_id uuid references public.restaurants(id) on delete restrict;
create index items_restaurant_id_idx on public.items(restaurant_id);

alter table public.count_sessions
  add column restaurant_id uuid references public.restaurants(id) on delete restrict;
create index count_sessions_restaurant_id_idx on public.count_sessions(restaurant_id);

-- Note: count_entries inherits restaurant_id via session_id; we do NOT denormalize.

-- After data has been backfilled into restaurant_id, lock the columns as NOT NULL.
-- Do this in a follow-up migration once seed data is in (or inline if a clean DB):
-- alter table public.stations alter column restaurant_id set not null;
-- alter table public.items alter column restaurant_id set not null;
-- alter table public.count_sessions alter column restaurant_id set not null;

-- ============================================================================
-- HELPERS
-- ============================================================================
create or replace function public.user_belongs_to_restaurant(rest_id uuid)
returns boolean language sql stable security definer as $$
  select exists (
    select 1 from public.user_restaurants
    where user_id = auth.uid() and restaurant_id = rest_id
  );
$$;

create or replace function public.current_user_restaurant_ids()
returns setof uuid language sql stable security definer as $$
  select restaurant_id from public.user_restaurants where user_id = auth.uid();
$$;

-- ============================================================================
-- RLS — RESTAURANTS
-- ============================================================================
alter table public.restaurants enable row level security;
alter table public.user_restaurants enable row level security;

create policy "members read their restaurants" on public.restaurants
  for select using (
    public.current_user_role() = 'admin'
    or public.user_belongs_to_restaurant(id)
  );
create policy "admins write restaurants" on public.restaurants
  for all using (public.current_user_role() = 'admin');

create policy "users read own memberships" on public.user_restaurants
  for select using (user_id = auth.uid() or public.current_user_role() = 'admin');
create policy "admins write memberships" on public.user_restaurants
  for all using (public.current_user_role() = 'admin');

-- ============================================================================
-- RLS — SCOPE EXISTING TABLES BY restaurant_id
-- ============================================================================

-- Drop old open-for-authenticated policies in favor of membership-scoped ones.
drop policy if exists "authenticated read active stations" on public.stations;
drop policy if exists "admins read all stations" on public.stations;
drop policy if exists "admins write stations" on public.stations;

create policy "members read stations at their restaurants" on public.stations
  for select using (
    active = true and (
      public.current_user_role() = 'admin'
      or public.user_belongs_to_restaurant(restaurant_id)
    )
  );
create policy "admins read all stations" on public.stations
  for select using (public.current_user_role() = 'admin');
create policy "admins write stations" on public.stations
  for all using (public.current_user_role() = 'admin');

drop policy if exists "authenticated read active items" on public.items;
drop policy if exists "admins read all items" on public.items;
drop policy if exists "admins write items" on public.items;

create policy "members read items at their restaurants" on public.items
  for select using (
    active = true and (
      public.current_user_role() = 'admin'
      or public.user_belongs_to_restaurant(restaurant_id)
    )
  );
create policy "admins read all items" on public.items
  for select using (public.current_user_role() = 'admin');
create policy "admins write items" on public.items
  for all using (public.current_user_role() = 'admin');

drop policy if exists "users read own sessions" on public.count_sessions;
drop policy if exists "managers read all sessions" on public.count_sessions;
drop policy if exists "users insert own sessions" on public.count_sessions;
drop policy if exists "users update own in-progress sessions" on public.count_sessions;
drop policy if exists "managers approve/reject sessions" on public.count_sessions;

create policy "users read own sessions at member restaurants" on public.count_sessions
  for select using (
    user_id = auth.uid()
    and public.user_belongs_to_restaurant(restaurant_id)
  );
create policy "managers read sessions at their restaurants" on public.count_sessions
  for select using (
    public.current_user_role() in ('manager', 'admin')
    and (
      public.current_user_role() = 'admin'
      or public.user_belongs_to_restaurant(restaurant_id)
    )
  );
create policy "users insert sessions at member restaurants" on public.count_sessions
  for insert with check (
    user_id = auth.uid()
    and public.user_belongs_to_restaurant(restaurant_id)
  );
create policy "users update own in-progress sessions at member restaurants" on public.count_sessions
  for update using (
    user_id = auth.uid()
    and status = 'in_progress'
    and public.user_belongs_to_restaurant(restaurant_id)
  );
create policy "managers approve/reject sessions at their restaurants" on public.count_sessions
  for update using (
    public.current_user_role() in ('manager', 'admin')
    and (
      public.current_user_role() = 'admin'
      or public.user_belongs_to_restaurant(restaurant_id)
    )
  );

-- count_entries policies already gate via session ownership; no direct
-- restaurant_id needed there.
