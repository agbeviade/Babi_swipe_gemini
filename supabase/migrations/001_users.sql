-- DEFACT FACILE migration: 001_users
-- Global identity mirrored from auth.users + shared helpers.


create extension if not exists "pgcrypto";
create extension if not exists "citext";

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- One account per human. Profile data lives here; credentials live in auth.users.
create table public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email citext unique,
  phone text,
  full_name text,
  avatar_url text,
  locale text not null default 'fr',
  timezone text not null default 'Africa/Abidjan',
  last_active_workspace_kind text check (last_active_workspace_kind in ('personal', 'organization')),
  last_active_workspace_id uuid,
  is_platform_admin boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger set_users_updated_at
  before update on public.users
  for each row execute function public.set_updated_at();

-- Auto-provision the profile row when Supabase Auth creates an account.
create or replace function public.handle_new_auth_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.users (id, email, phone, full_name, avatar_url)
  values (
    new.id,
    new.email,
    new.phone,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'),
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_auth_user();
