-- =========================================================
-- BABI SWIPE IMMO — 0002 : identité, agences, référentiel géographique
-- =========================================================

-- Profils : le rôle vit ici, jamais dans le client ni dans user_metadata.
create table profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  phone text unique,
  email text unique,
  avatar_url text,
  role user_role not null default 'user',
  locale text not null default 'fr',
  is_suspended boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index profiles_role_idx on profiles (role);

-- Préférences de recherche persistées (onboarding, filtres).
create table user_preferences (
  user_id uuid primary key references profiles (id) on delete cascade,
  transaction transaction_type not null default 'location',
  property_types property_type[] not null default '{}',
  budget_min numeric(12, 0),
  budget_max numeric(12, 0),
  bedrooms smallint,
  features text[] not null default '{}',
  city_id uuid,
  commune_ids uuid[] not null default '{}',
  radius_km smallint not null default 10 check (radius_km between 1 and 100),
  monthly_income numeric(12, 0),
  only_verified boolean not null default false,
  updated_at timestamptz not null default now()
);

-- Position approximative consentie (jamais la position précise brute).
create table user_locations (
  user_id uuid primary key references profiles (id) on delete cascade,
  approx_geom geography(point, 4326) not null,
  precision_m integer not null default 500,
  consent_given_at timestamptz not null default now(),
  expires_at timestamptz,
  updated_at timestamptz not null default now()
);

-- Points d'ancrage : travail, école, famille…
create table user_anchor_points (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles (id) on delete cascade,
  label text not null,
  geom geography(point, 4326) not null,
  created_at timestamptz not null default now()
);

create index user_anchor_points_user_idx on user_anchor_points (user_id);

-- Référentiel géographique (à alimenter avec la source officielle — décision B7).
create table cities (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  region text,
  center geography(point, 4326),
  created_at timestamptz not null default now()
);

create table communes (
  id uuid primary key default gen_random_uuid(),
  city_id uuid not null references cities (id) on delete cascade,
  name text not null,
  center geography(point, 4326),
  unique (city_id, name)
);

create table neighborhoods (
  id uuid primary key default gen_random_uuid(),
  commune_id uuid not null references communes (id) on delete cascade,
  name text not null,
  center geography(point, 4326),
  unique (commune_id, name)
);

alter table user_preferences
  add constraint user_preferences_city_fk foreign key (city_id) references cities (id) on delete set null;

-- Agences et annonceurs.
create table agencies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  legal_id text,
  phone text,
  email text,
  logo_url text,
  owner_id uuid not null references profiles (id) on delete restrict,
  created_at timestamptz not null default now()
);

create table agency_members (
  agency_id uuid not null references agencies (id) on delete cascade,
  user_id uuid not null references profiles (id) on delete cascade,
  role user_role not null default 'agent',
  created_at timestamptz not null default now(),
  primary key (agency_id, user_id)
);

create table advertisers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles (id) on delete cascade,
  agency_id uuid references agencies (id) on delete set null,
  type advertiser_type not null default 'particulier',
  display_name text not null,
  phone text not null,
  whatsapp text,
  created_at timestamptz not null default now(),
  unique (user_id)
);

create index advertisers_agency_idx on advertisers (agency_id);

-- Vérifications : un badge n'est affiché que si une ligne 'verified' non expirée existe.
create table verifications (
  id uuid primary key default gen_random_uuid(),
  subject_user_id uuid references profiles (id) on delete cascade,
  subject_property_id uuid,
  kind verification_kind not null,
  status verification_status not null default 'not_started',
  evidence_path text,
  reviewed_by uuid references profiles (id) on delete set null,
  reviewed_at timestamptz,
  rejection_reason text,
  valid_until timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index verifications_subject_user_idx on verifications (subject_user_id, kind, status);
create index verifications_subject_property_idx on verifications (subject_property_id, kind, status);
