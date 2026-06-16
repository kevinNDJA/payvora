-- SQL to create `profiles` table and RLS policies for Supabase
-- Run this in your Supabase SQL editor or psql connected to your DB

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  avatar_url text,
  stripe_customer_id text,
  stripe_subscription_id text,
  is_pro boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable Row Level Security
alter table public.profiles enable row level security;

-- Allow authenticated users to select their own profile
create policy "Profiles: select own" on public.profiles
  for select using (auth.role() = 'authenticated' and auth.uid() = id);

-- Allow authenticated users to insert a profile for themselves
create policy "Profiles: insert own" on public.profiles
  for insert with check (auth.role() = 'authenticated' and auth.uid() = id);

-- Allow authenticated users to update their own profile
create policy "Profiles: update own" on public.profiles
  for update using (auth.role() = 'authenticated' and auth.uid() = id);

-- Optional: Create a trigger to automatically create a profile row when a new auth.user is created
create or replace function public.handle_new_auth_user() returns trigger as $$
begin
  insert into public.profiles (id, email, created_at)
  values (new.id, new.email, now())
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists create_profile on auth.users;
create trigger create_profile
  after insert on auth.users
  for each row execute procedure public.handle_new_auth_user();

-- Grant appropriate permissions to authenticated role if needed (optional)
-- grant select, update on public.profiles to authenticated;
