-- Migration SQL for Payvora
-- Creates invoices, invoice_items, clients, settings tables with RLS, indexes and triggers

-- Helper: set updated_at on update
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- invoices table
create table if not exists public.invoices (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  invoice_number text,
  client_id uuid references public.clients(id) on delete set null,
  issue_date date,
  due_date date,
  subtotal numeric(12,2) default 0,
  tax numeric(12,2) default 0,
  total numeric(12,2) default 0,
  status text default 'draft',
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.invoices enable row level security;

create index if not exists idx_invoices_user_created on public.invoices (user_id, created_at desc);
create index if not exists idx_invoices_user_number on public.invoices (user_id, invoice_number);

create trigger invoices_set_updated_at before update on public.invoices for each row execute procedure public.set_updated_at();

-- invoice items
create table if not exists public.invoice_items (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null references public.invoices(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  description text,
  quantity integer default 1,
  unit_price numeric(12,2) default 0,
  total numeric(12,2) default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.invoice_items enable row level security;
create index if not exists idx_invoice_items_invoice on public.invoice_items (invoice_id);
create trigger invoice_items_set_updated_at before update on public.invoice_items for each row execute procedure public.set_updated_at();

-- clients
create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text,
  email text,
  phone text,
  address text,
  company text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.clients enable row level security;
create index if not exists idx_clients_user_name on public.clients (user_id, name);
create trigger clients_set_updated_at before update on public.clients for each row execute procedure public.set_updated_at();

-- settings (one row per user; id = auth.users.id)
create table if not exists public.settings (
  id uuid primary key references auth.users(id) on delete cascade,
  company_name text,
  company_email text,
  phone text,
  address text,
  website text,
  currency text default 'EUR',
  language text default 'fr',
  logo_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.settings enable row level security;
create trigger settings_set_updated_at before update on public.settings for each row execute procedure public.set_updated_at();

-- RLS policies: allow authenticated users to access only their own rows
-- invoices policies
create policy if not exists "Invoices: select own" on public.invoices
  for select using (auth.role() = 'authenticated' and user_id = auth.uid());
create policy if not exists "Invoices: insert own" on public.invoices
  for insert with check (auth.role() = 'authenticated' and user_id = auth.uid());
create policy if not exists "Invoices: update own" on public.invoices
  for update using (auth.role() = 'authenticated' and user_id = auth.uid());
create policy if not exists "Invoices: delete own" on public.invoices
  for delete using (auth.role() = 'authenticated' and user_id = auth.uid());

-- invoice_items policies
create policy if not exists "InvoiceItems: select own" on public.invoice_items
  for select using (auth.role() = 'authenticated' and user_id = auth.uid());
create policy if not exists "InvoiceItems: insert own" on public.invoice_items
  for insert with check (auth.role() = 'authenticated' and user_id = auth.uid());
create policy if not exists "InvoiceItems: update own" on public.invoice_items
  for update using (auth.role() = 'authenticated' and user_id = auth.uid());
create policy if not exists "InvoiceItems: delete own" on public.invoice_items
  for delete using (auth.role() = 'authenticated' and user_id = auth.uid());

-- clients policies
create policy if not exists "Clients: select own" on public.clients
  for select using (auth.role() = 'authenticated' and user_id = auth.uid());
create policy if not exists "Clients: insert own" on public.clients
  for insert with check (auth.role() = 'authenticated' and user_id = auth.uid());
create policy if not exists "Clients: update own" on public.clients
  for update using (auth.role() = 'authenticated' and user_id = auth.uid());
create policy if not exists "Clients: delete own" on public.clients
  for delete using (auth.role() = 'authenticated' and user_id = auth.uid());

-- settings policies (id == auth.uid())
create policy if not exists "Settings: select own" on public.settings
  for select using (auth.role() = 'authenticated' and id = auth.uid());
create policy if not exists "Settings: upsert own" on public.settings
  for insert with check (auth.role() = 'authenticated' and id = auth.uid());
create policy if not exists "Settings: update own" on public.settings
  for update using (auth.role() = 'authenticated' and id = auth.uid());

-- Auto-create settings/profile row on new auth.user (re-use handle_new_auth_user if present)
create or replace function public.handle_new_auth_user_extended() returns trigger as $$
begin
  insert into public.settings (id, created_at)
    values (new.id, now())
    on conflict (id) do nothing;
  insert into public.profiles (id, email, created_at)
    values (new.id, new.email, now())
    on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists create_profile_extended on auth.users;
create trigger create_profile_extended
  after insert on auth.users
  for each row execute procedure public.handle_new_auth_user_extended();
