-- =========================================================
-- BABI SWIPE IMMO — 0003 : annonces, images, coût d'entrée
-- =========================================================

create table properties (
  id uuid primary key default gen_random_uuid(),
  advertiser_id uuid not null references advertisers (id) on delete cascade,
  agency_id uuid references agencies (id) on delete set null,
  status listing_status not null default 'draft',

  title text not null check (char_length(title) between 10 and 140),
  description text not null check (char_length(description) between 20 and 5000),
  transaction transaction_type not null,
  type property_type not null,

  price numeric(12, 0) not null check (price > 0),
  currency char(3) not null default 'XOF',

  city_id uuid references cities (id) on delete set null,
  commune_id uuid references communes (id) on delete set null,
  neighborhood_id uuid references neighborhoods (id) on delete set null,
  landmark text,
  latitude double precision not null check (latitude between -90 and 90),
  longitude double precision not null check (longitude between -180 and 180),
  geom geography(point, 4326) generated always as
    (st_setsrid(st_makepoint(longitude, latitude), 4326)::geography) stored,

  bedrooms smallint not null default 0 check (bedrooms >= 0),
  bathrooms smallint not null default 0 check (bathrooms >= 0),
  area_sqm numeric(8, 2) check (area_sqm > 0),
  features text[] not null default '{}',

  -- Coût d'entrée : chaque montant inconnu reste NULL et s'affiche
  -- « Non renseigné ». Aucun frais n'est inventé côté serveur ni client.
  deposit_months smallint check (deposit_months >= 0),
  advance_months smallint check (advance_months >= 0),
  agency_fees numeric(12, 0) check (agency_fees >= 0),
  other_fees numeric(12, 0) check (other_fees >= 0),
  other_fees_label text,

  available_from date,
  is_available boolean not null default true,

  published_at timestamptz,
  rejected_reason text,
  moderated_by uuid references profiles (id) on delete set null,

  views_count integer not null default 0,
  likes_count integer not null default 0,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table verifications
  add constraint verifications_property_fk
  foreign key (subject_property_id) references properties (id) on delete cascade;

create index properties_geom_idx on properties using gist (geom);
create index properties_status_published_idx on properties (status, published_at desc);
create index properties_search_idx on properties (transaction, type, price) where status = 'published';
create index properties_commune_idx on properties (commune_id) where status = 'published';
create index properties_advertiser_idx on properties (advertiser_id);

create table property_images (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references properties (id) on delete cascade,
  storage_path text not null,
  position smallint not null default 0,
  is_primary boolean not null default false,
  caption text,
  width integer,
  height integer,
  checksum text,
  created_at timestamptz not null default now()
);

create unique index property_images_primary_idx
  on property_images (property_id) where is_primary;
create index property_images_property_idx on property_images (property_id, position);

-- Coût d'entrée connu, sans extrapolation : NULL dès qu'un poste est inconnu.
create or replace function known_entry_cost(p properties)
returns numeric
language sql
immutable
as $$
  select case
    when p.transaction <> 'location' then null
    when p.deposit_months is null or p.advance_months is null then null
    else p.price * (p.deposit_months + p.advance_months)
         + coalesce(p.agency_fees, 0)
         + coalesce(p.other_fees, 0)
  end;
$$;

-- Un annonceur ne peut pas se certifier lui-même : le badge dérive des vérifications.
create or replace function property_is_verified(p_property_id uuid)
returns boolean
language sql
stable
as $$
  select exists (
    select 1 from verifications v
    where v.subject_property_id = p_property_id
      and v.kind = 'listing'
      and v.status = 'verified'
      and (v.valid_until is null or v.valid_until > now())
  );
$$;

create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger properties_set_updated_at
  before update on properties
  for each row execute function set_updated_at();

create trigger profiles_set_updated_at
  before update on profiles
  for each row execute function set_updated_at();
