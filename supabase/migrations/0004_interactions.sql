-- =========================================================
-- BABI SWIPE IMMO — 0004 : swipes, favoris, contacts, visites,
-- avis, recherches, notifications, signalements, risque
-- =========================================================

create table swipes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles (id) on delete cascade,
  property_id uuid not null references properties (id) on delete cascade,
  direction swipe_direction not null,
  created_at timestamptz not null default now(),
  unique (user_id, property_id)
);

create index swipes_user_created_idx on swipes (user_id, created_at desc);

create table favorites (
  user_id uuid not null references profiles (id) on delete cascade,
  property_id uuid not null references properties (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, property_id)
);

create table saved_searches (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles (id) on delete cascade,
  title text not null,
  criteria jsonb not null,
  notify boolean not null default true,
  last_notified_at timestamptz,
  created_at timestamptz not null default now()
);

create index saved_searches_user_idx on saved_searches (user_id);

create table contacts (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references properties (id) on delete cascade,
  user_id uuid references profiles (id) on delete set null,
  channel contact_channel not null,
  message text,
  created_at timestamptz not null default now()
);

create index contacts_property_idx on contacts (property_id, created_at desc);

create table visits (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references properties (id) on delete cascade,
  visitor_id uuid not null references profiles (id) on delete cascade,
  advertiser_id uuid not null references advertisers (id) on delete cascade,
  status visit_status not null default 'requested',
  requested_date date not null,
  requested_slot text not null,
  confirmed_at timestamptz,
  note text,
  cancel_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index visits_visitor_idx on visits (visitor_id, created_at desc);
create index visits_advertiser_idx on visits (advertiser_id, status);

-- Un avis n'est possible qu'après une interaction éligible (visite effectuée).
create table reviews (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references profiles (id) on delete cascade,
  advertiser_id uuid not null references advertisers (id) on delete cascade,
  visit_id uuid not null references visits (id) on delete cascade,
  rating smallint not null check (rating between 1 and 5),
  comment text check (char_length(comment) <= 1000),
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  unique (visit_id)
);

create table notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles (id) on delete cascade,
  channel notification_channel not null default 'in_app',
  title text not null,
  body text not null,
  payload jsonb not null default '{}'::jsonb,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index notifications_user_idx on notifications (user_id, created_at desc);

create table notification_preferences (
  user_id uuid primary key references profiles (id) on delete cascade,
  in_app boolean not null default true,
  push boolean not null default true,
  sms boolean not null default false,
  email boolean not null default false,
  quiet_hours_start smallint check (quiet_hours_start between 0 and 23),
  quiet_hours_end smallint check (quiet_hours_end between 0 and 23),
  updated_at timestamptz not null default now()
);

create table reports (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references properties (id) on delete cascade,
  reporter_id uuid references profiles (id) on delete set null,
  reason report_reason not null,
  description text,
  status report_status not null default 'pending',
  resolved_by uuid references profiles (id) on delete set null,
  resolution_note text,
  resolved_at timestamptz,
  created_at timestamptz not null default now()
);

create index reports_status_idx on reports (status, created_at desc);

-- Signaux de risque internes : jamais un verdict public de fraude.
create table risk_events (
  id uuid primary key default gen_random_uuid(),
  property_id uuid references properties (id) on delete cascade,
  user_id uuid references profiles (id) on delete cascade,
  signal text not null,
  weight smallint not null default 1,
  details jsonb not null default '{}'::jsonb,
  requires_review boolean not null default false,
  created_at timestamptz not null default now()
);

create index risk_events_property_idx on risk_events (property_id, created_at desc);

create table crm_leads (
  id uuid primary key default gen_random_uuid(),
  agency_id uuid references agencies (id) on delete cascade,
  advertiser_id uuid not null references advertisers (id) on delete cascade,
  property_id uuid references properties (id) on delete set null,
  contact_id uuid references contacts (id) on delete set null,
  status lead_status not null default 'nouveau',
  budget numeric(12, 0),
  notes text,
  assigned_to uuid references profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index crm_leads_agency_idx on crm_leads (agency_id, status);

create trigger visits_set_updated_at
  before update on visits
  for each row execute function set_updated_at();

create trigger crm_leads_set_updated_at
  before update on crm_leads
  for each row execute function set_updated_at();
