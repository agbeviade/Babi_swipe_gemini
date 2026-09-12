-- =========================================================
-- BABI SWIPE IMMO — 0005 : offres, paiements, ledger, entitlements
-- Aucun solde n'est piloté par le client : le grand livre fait foi.
-- =========================================================

create table offers (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  product product_type not null,
  label text not null,
  price_fcfa numeric(10, 0) not null check (price_fcfa > 0),
  coins integer check (coins > 0),
  bonus_coins integer not null default 0 check (bonus_coins >= 0),
  duration_hours integer check (duration_hours > 0),
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table coin_wallets (
  user_id uuid primary key references profiles (id) on delete cascade,
  balance integer not null default 0 check (balance >= 0),
  updated_at timestamptz not null default now()
);

-- Grand livre append-only : ni UPDATE ni DELETE (voir policies + trigger).
create table coin_ledger (
  id bigint generated always as identity primary key,
  user_id uuid not null references profiles (id) on delete cascade,
  direction ledger_direction not null,
  amount integer not null check (amount > 0),
  balance_after integer not null check (balance_after >= 0),
  reason text not null,
  reference_type text,
  reference_id uuid,
  created_at timestamptz not null default now()
);

create index coin_ledger_user_idx on coin_ledger (user_id, created_at desc);

create or replace function forbid_ledger_mutation()
returns trigger
language plpgsql
as $$
begin
  raise exception 'coin_ledger is append-only';
end;
$$;

create trigger coin_ledger_no_update
  before update or delete on coin_ledger
  for each row execute function forbid_ledger_mutation();

create table orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles (id) on delete cascade,
  offer_id uuid not null references offers (id) on delete restrict,
  target_property_id uuid references properties (id) on delete set null,
  amount_fcfa numeric(10, 0) not null check (amount_fcfa > 0),
  status payment_status not null default 'pending',
  provider payment_provider not null,
  provider_reference text,
  idempotency_key text not null unique,
  failure_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index orders_user_idx on orders (user_id, created_at desc);
create unique index orders_provider_reference_idx
  on orders (provider, provider_reference) where provider_reference is not null;

-- Journal brut des webhooks : rejouer un événement ne doit rien changer.
create table payment_events (
  id uuid primary key default gen_random_uuid(),
  provider payment_provider not null,
  event_id text not null,
  order_id uuid references orders (id) on delete set null,
  signature_valid boolean not null,
  status payment_status,
  payload jsonb not null,
  processed_at timestamptz,
  created_at timestamptz not null default now(),
  unique (provider, event_id)
);

create table entitlements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles (id) on delete cascade,
  product product_type not null,
  order_id uuid references orders (id) on delete set null,
  property_id uuid references properties (id) on delete cascade,
  granted_at timestamptz not null default now(),
  expires_at timestamptz,
  is_active boolean not null default true
);

create unique index entitlements_order_idx on entitlements (order_id) where order_id is not null;
create index entitlements_user_active_idx on entitlements (user_id, product) where is_active;

create table boosts (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references properties (id) on delete cascade,
  entitlement_id uuid not null references entitlements (id) on delete cascade,
  starts_at timestamptz not null default now(),
  ends_at timestamptz not null,
  approved_by uuid references profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  check (ends_at > starts_at)
);

create index boosts_active_idx on boosts (property_id, ends_at);

create table subscriptions (
  id uuid primary key default gen_random_uuid(),
  agency_id uuid references agencies (id) on delete cascade,
  user_id uuid references profiles (id) on delete cascade,
  offer_id uuid not null references offers (id) on delete restrict,
  status payment_status not null default 'pending',
  current_period_end timestamptz,
  created_at timestamptz not null default now(),
  check (agency_id is not null or user_id is not null)
);

create table idempotency_keys (
  key text primary key,
  scope text not null,
  user_id uuid references profiles (id) on delete cascade,
  response jsonb,
  created_at timestamptz not null default now()
);

create table audit_logs (
  id bigint generated always as identity primary key,
  actor_id uuid references profiles (id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index audit_logs_entity_idx on audit_logs (entity_type, entity_id, created_at desc);

create trigger orders_set_updated_at
  before update on orders
  for each row execute function set_updated_at();
