-- ============================================================================
-- Mise — Platform extensions (xtraCHEF parity)
-- Migration: 0002_platform_extensions.sql
-- Depends on: 0001_initial_schema.sql
-- ============================================================================

-- ---- ENUMS ----
create type invoice_status as enum (
  'draft', 'processing', 'pending_review', 'approved', 'rejected'
);
create type order_status as enum ('draft', 'submitted', 'received', 'cancelled');

-- ---- LOCATIONS (single row for MVP; multi-tenant ready) ----
create table public.locations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  timezone text not null default 'America/New_York',
  toast_restaurant_guid text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---- VENDORS ----
create table public.vendors (
  id uuid primary key default gen_random_uuid(),
  location_id uuid not null references public.locations(id) on delete restrict,
  name text not null,
  account_number text,
  contact_name text,
  contact_email text,
  contact_phone text,
  notes text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index vendors_location_id_idx on public.vendors(location_id);

-- ---- PRODUCTS (purchasable SKUs — invoice + costing source of truth) ----
create table public.products (
  id uuid primary key default gen_random_uuid(),
  location_id uuid not null references public.locations(id) on delete restrict,
  name text not null,
  category text,
  default_unit unit_type not null,
  gl_code text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index products_location_id_idx on public.products(location_id);

-- Link count items to products for dollar variance (optional)
alter table public.items
  add column product_id uuid references public.products(id) on delete set null;
create index items_product_id_idx on public.items(product_id);

-- ---- VENDOR PRODUCTS (pack sizes, SKUs, pricing) ----
create table public.product_vendors (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  vendor_id uuid not null references public.vendors(id) on delete restrict,
  vendor_sku text,
  pack_size numeric(10,3) not null default 1,
  pack_unit unit_type not null,
  last_unit_cost numeric(12,4),
  last_cost_at timestamptz,
  is_preferred boolean not null default false,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(product_id, vendor_id, vendor_sku)
);
create index product_vendors_product_id_idx on public.product_vendors(product_id);
create index product_vendors_vendor_id_idx on public.product_vendors(vendor_id);

-- ---- PRICE HISTORY ----
create table public.product_price_history (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  vendor_id uuid references public.vendors(id) on delete set null,
  unit_cost numeric(12,4) not null,
  effective_at timestamptz not null default now(),
  source text not null default 'manual', -- manual | invoice
  invoice_id uuid,
  created_at timestamptz not null default now()
);
create index product_price_history_product_id_idx on public.product_price_history(product_id);

-- ---- INVOICES ----
create table public.invoices (
  id uuid primary key default gen_random_uuid(),
  location_id uuid not null references public.locations(id) on delete restrict,
  vendor_id uuid not null references public.vendors(id) on delete restrict,
  invoice_number text,
  invoice_date date not null,
  status invoice_status not null default 'draft',
  subtotal numeric(12,2),
  tax numeric(12,2),
  total numeric(12,2),
  storage_path text,
  ocr_raw jsonb,
  submitted_by uuid references public.users(id),
  approved_by uuid references public.users(id),
  approved_at timestamptz,
  rejection_reason text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index invoices_vendor_id_idx on public.invoices(vendor_id);
create index invoices_status_idx on public.invoices(status);

-- ---- INVOICE LINES ----
create table public.invoice_lines (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null references public.invoices(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  description text not null,
  quantity numeric(10,3) not null,
  unit unit_type,
  unit_price numeric(12,4) not null,
  line_total numeric(12,2) not null,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);
create index invoice_lines_invoice_id_idx on public.invoice_lines(invoice_id);

alter table public.product_price_history
  add constraint product_price_history_invoice_fk
  foreign key (invoice_id) references public.invoices(id) on delete set null;

-- ---- MENU ITEMS (Toast sync) ----
create table public.menu_items (
  id uuid primary key default gen_random_uuid(),
  location_id uuid not null references public.locations(id) on delete restrict,
  toast_guid text not null,
  name text not null,
  menu_price numeric(10,2),
  category text,
  active boolean not null default true,
  synced_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(location_id, toast_guid)
);
create index menu_items_location_id_idx on public.menu_items(location_id);

-- ---- RECIPES ----
create table public.recipes (
  id uuid primary key default gen_random_uuid(),
  location_id uuid not null references public.locations(id) on delete restrict,
  menu_item_id uuid references public.menu_items(id) on delete set null,
  name text not null,
  yield_amount numeric(10,3) not null default 1,
  yield_unit text not null default 'portion',
  prep_loss_pct numeric(5,2) default 0,
  notes text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index recipes_menu_item_id_idx on public.recipes(menu_item_id);

-- ---- RECIPE LINES ----
create table public.recipe_lines (
  id uuid primary key default gen_random_uuid(),
  recipe_id uuid not null references public.recipes(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete restrict,
  quantity numeric(10,4) not null,
  unit unit_type not null,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);
create index recipe_lines_recipe_id_idx on public.recipe_lines(recipe_id);

-- ---- DAILY SALES (from Toast) ----
create table public.sales_daily (
  id uuid primary key default gen_random_uuid(),
  location_id uuid not null references public.locations(id) on delete restrict,
  menu_item_id uuid not null references public.menu_items(id) on delete cascade,
  business_date date not null,
  quantity_sold numeric(10,3) not null default 0,
  net_sales numeric(12,2),
  synced_at timestamptz not null default now(),
  unique(location_id, menu_item_id, business_date)
);
create index sales_daily_business_date_idx on public.sales_daily(business_date);

-- ---- ORDERS (purchase orders) ----
create table public.orders (
  id uuid primary key default gen_random_uuid(),
  location_id uuid not null references public.locations(id) on delete restrict,
  vendor_id uuid not null references public.vendors(id) on delete restrict,
  status order_status not null default 'draft',
  created_by uuid not null references public.users(id),
  submitted_at timestamptz,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index orders_vendor_id_idx on public.orders(vendor_id);

-- ---- ORDER LINES ----
create table public.order_lines (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete restrict,
  quantity numeric(10,3) not null,
  unit unit_type not null,
  suggested_qty numeric(10,3),
  notes text,
  created_at timestamptz not null default now()
);
create index order_lines_order_id_idx on public.order_lines(order_id);

-- ---- TRIGGERS ----
create trigger locations_updated_at before update on public.locations
  for each row execute function public.set_updated_at();
create trigger vendors_updated_at before update on public.vendors
  for each row execute function public.set_updated_at();
create trigger products_updated_at before update on public.products
  for each row execute function public.set_updated_at();
create trigger product_vendors_updated_at before update on public.product_vendors
  for each row execute function public.set_updated_at();
create trigger invoices_updated_at before update on public.invoices
  for each row execute function public.set_updated_at();
create trigger menu_items_updated_at before update on public.menu_items
  for each row execute function public.set_updated_at();
create trigger recipes_updated_at before update on public.recipes
  for each row execute function public.set_updated_at();
create trigger orders_updated_at before update on public.orders
  for each row execute function public.set_updated_at();

-- ---- ROW LEVEL SECURITY ----
alter table public.locations enable row level security;
alter table public.vendors enable row level security;
alter table public.products enable row level security;
alter table public.product_vendors enable row level security;
alter table public.product_price_history enable row level security;
alter table public.invoices enable row level security;
alter table public.invoice_lines enable row level security;
alter table public.menu_items enable row level security;
alter table public.recipes enable row level security;
alter table public.recipe_lines enable row level security;
alter table public.sales_daily enable row level security;
alter table public.orders enable row level security;
alter table public.order_lines enable row level security;

-- Authenticated read for operational tables
create policy "authenticated read locations" on public.locations
  for select using (auth.role() = 'authenticated' and active = true);
create policy "admins write locations" on public.locations
  for all using (public.current_user_role() = 'admin');

create policy "authenticated read active vendors" on public.vendors
  for select using (auth.role() = 'authenticated' and active = true);
create policy "admins write vendors" on public.vendors
  for all using (public.current_user_role() = 'admin');

create policy "authenticated read active products" on public.products
  for select using (auth.role() = 'authenticated' and active = true);
create policy "admins write products" on public.products
  for all using (public.current_user_role() = 'admin');

create policy "authenticated read product_vendors" on public.product_vendors
  for select using (auth.role() = 'authenticated');
create policy "admins write product_vendors" on public.product_vendors
  for all using (public.current_user_role() = 'admin');

create policy "managers read price history" on public.product_price_history
  for select using (public.current_user_role() in ('manager', 'admin'));
create policy "admins write price history" on public.product_price_history
  for all using (public.current_user_role() = 'admin');

create policy "managers read invoices" on public.invoices
  for select using (public.current_user_role() in ('manager', 'admin'));
create policy "managers write invoices" on public.invoices
  for all using (public.current_user_role() in ('manager', 'admin'));

create policy "managers read invoice_lines" on public.invoice_lines
  for select using (public.current_user_role() in ('manager', 'admin'));
create policy "managers write invoice_lines" on public.invoice_lines
  for all using (public.current_user_role() in ('manager', 'admin'));

create policy "authenticated read menu_items" on public.menu_items
  for select using (auth.role() = 'authenticated' and active = true);
create policy "admins write menu_items" on public.menu_items
  for all using (public.current_user_role() = 'admin');

create policy "authenticated read recipes" on public.recipes
  for select using (auth.role() = 'authenticated' and active = true);
create policy "admins write recipes" on public.recipes
  for all using (public.current_user_role() = 'admin');

create policy "authenticated read recipe_lines" on public.recipe_lines
  for select using (auth.role() = 'authenticated');
create policy "admins write recipe_lines" on public.recipe_lines
  for all using (public.current_user_role() = 'admin');

create policy "managers read sales_daily" on public.sales_daily
  for select using (public.current_user_role() in ('manager', 'admin'));
create policy "admins write sales_daily" on public.sales_daily
  for all using (public.current_user_role() = 'admin');

create policy "authenticated read own orders" on public.orders
  for select using (
    created_by = auth.uid()
    or public.current_user_role() in ('manager', 'admin')
  );
create policy "authenticated create orders" on public.orders
  for insert with check (created_by = auth.uid());
create policy "order owner or manager update orders" on public.orders
  for update using (
    created_by = auth.uid()
    or public.current_user_role() in ('manager', 'admin')
  );

create policy "read order_lines for visible orders" on public.order_lines
  for select using (
    exists (
      select 1 from public.orders o
      where o.id = order_id
      and (o.created_by = auth.uid() or public.current_user_role() in ('manager', 'admin'))
    )
  );
create policy "write order_lines for editable orders" on public.order_lines
  for all using (
    exists (
      select 1 from public.orders o
      where o.id = order_id
      and o.status = 'draft'
      and (o.created_by = auth.uid() or public.current_user_role() in ('manager', 'admin'))
    )
  );

-- ---- SEED: Daniel's Fort Lauderdale ----
insert into public.locations (name, timezone)
values ('Daniel''s — Fort Lauderdale', 'America/New_York');
