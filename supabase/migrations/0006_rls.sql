-- =========================================================
-- BABI SWIPE IMMO — 0006 : RLS (deny by default)
-- Toute table est protégée ; aucun accès n'existe sans policy explicite.
-- =========================================================

-- Helpers SECURITY DEFINER : évitent la récursion des policies sur profiles.
create or replace function auth_role()
returns user_role
language sql
stable
security definer
set search_path = public
as $$
  select coalesce((select p.role from profiles p where p.id = auth.uid()), 'user'::user_role);
$$;

create or replace function is_staff()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select auth_role() in ('admin', 'moderator');
$$;

create or replace function my_advertiser_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select a.id from advertisers a where a.user_id = auth.uid();
$$;

create or replace function is_agency_member(p_agency_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select p_agency_id is not null and exists (
    select 1 from agency_members m
    where m.agency_id = p_agency_id and m.user_id = auth.uid()
  );
$$;

create or replace function owns_property(p_property_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from properties pr
    where pr.id = p_property_id
      and (pr.advertiser_id = my_advertiser_id() or is_agency_member(pr.agency_id))
  );
$$;

do $$
declare t text;
begin
  foreach t in array array[
    'profiles', 'user_preferences', 'user_locations', 'user_anchor_points',
    'cities', 'communes', 'neighborhoods',
    'agencies', 'agency_members', 'advertisers', 'verifications',
    'properties', 'property_images',
    'swipes', 'favorites', 'saved_searches', 'contacts', 'visits', 'reviews',
    'notifications', 'notification_preferences', 'reports', 'risk_events', 'crm_leads',
    'offers', 'coin_wallets', 'coin_ledger', 'orders', 'payment_events',
    'entitlements', 'boosts', 'subscriptions', 'idempotency_keys', 'audit_logs'
  ]
  loop
    execute format('alter table %I enable row level security', t);
    execute format('alter table %I force row level security', t);
  end loop;
end $$;

-- ---------- Identité ----------
create policy profiles_select_self on profiles
  for select using (id = auth.uid() or is_staff());

-- Le rôle ne peut pas être modifié par son porteur.
create policy profiles_update_self on profiles
  for update using (id = auth.uid())
  with check (id = auth.uid() and role = auth_role() and is_suspended = false);

create policy profiles_staff_all on profiles
  for all using (is_staff()) with check (is_staff());

create policy user_preferences_own on user_preferences
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy user_locations_own on user_locations
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy user_anchor_points_own on user_anchor_points
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ---------- Référentiel géographique : lecture publique ----------
create policy cities_read on cities for select using (true);
create policy communes_read on communes for select using (true);
create policy neighborhoods_read on neighborhoods for select using (true);
create policy cities_staff on cities for all using (is_staff()) with check (is_staff());
create policy communes_staff on communes for all using (is_staff()) with check (is_staff());
create policy neighborhoods_staff on neighborhoods for all using (is_staff()) with check (is_staff());

-- ---------- Agences et annonceurs ----------
create policy agencies_read on agencies
  for select using (true);
create policy agencies_manage on agencies
  for all using (owner_id = auth.uid() or is_staff())
  with check (owner_id = auth.uid() or is_staff());

create policy agency_members_read on agency_members
  for select using (user_id = auth.uid() or is_agency_member(agency_id) or is_staff());
create policy agency_members_manage on agency_members
  for all using (
    is_staff() or exists (select 1 from agencies a where a.id = agency_id and a.owner_id = auth.uid())
  )
  with check (
    is_staff() or exists (select 1 from agencies a where a.id = agency_id and a.owner_id = auth.uid())
  );

-- Fiche annonceur publique : ne contient aucune donnée personnelle sensible
-- au-delà du contact professionnel volontairement publié.
create policy advertisers_read on advertisers for select using (true);
create policy advertisers_manage_self on advertisers
  for all using (user_id = auth.uid() or is_staff())
  with check (user_id = auth.uid() or is_staff());

-- Les pièces justificatives ne sont jamais lisibles publiquement.
create policy verifications_read_self on verifications
  for select using (
    subject_user_id = auth.uid() or owns_property(subject_property_id) or is_staff()
  );
create policy verifications_insert_self on verifications
  for insert with check (
    (subject_user_id = auth.uid() or owns_property(subject_property_id))
    and status = 'pending'
  );
create policy verifications_staff on verifications
  for all using (is_staff()) with check (is_staff());

-- ---------- Annonces ----------
create policy properties_read_published on properties
  for select using (status = 'published' or owns_property(id) or is_staff());

create policy properties_insert_own on properties
  for insert with check (
    advertiser_id = my_advertiser_id()
    and status in ('draft', 'pending_review')
  );

-- Un annonceur ne publie pas lui-même : la modération fait passer en 'published'.
create policy properties_update_own on properties
  for update using (owns_property(id))
  with check (owns_property(id) and status in ('draft', 'pending_review', 'rented', 'sold', 'archived'));

create policy properties_staff on properties
  for all using (is_staff()) with check (is_staff());

create policy property_images_read on property_images
  for select using (
    exists (select 1 from properties p where p.id = property_id and p.status = 'published')
    or owns_property(property_id) or is_staff()
  );
create policy property_images_manage on property_images
  for all using (owns_property(property_id) or is_staff())
  with check (owns_property(property_id) or is_staff());

-- ---------- Interactions ----------
create policy swipes_own on swipes
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy favorites_own on favorites
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy saved_searches_own on saved_searches
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Le demandeur et le propriétaire de l'annonce, personne d'autre.
create policy contacts_read on contacts
  for select using (user_id = auth.uid() or owns_property(property_id) or is_staff());
create policy contacts_insert on contacts
  for insert with check (user_id = auth.uid());

create policy visits_read on visits
  for select using (
    visitor_id = auth.uid() or advertiser_id = my_advertiser_id()
    or owns_property(property_id) or is_staff()
  );
create policy visits_insert on visits
  for insert with check (visitor_id = auth.uid() and status = 'requested');
create policy visits_update on visits
  for update using (visitor_id = auth.uid() or owns_property(property_id) or is_staff())
  with check (visitor_id = auth.uid() or owns_property(property_id) or is_staff());

create policy reviews_read on reviews
  for select using (is_published or author_id = auth.uid() or is_staff());
create policy reviews_insert on reviews
  for insert with check (
    author_id = auth.uid()
    and exists (
      select 1 from visits v
      where v.id = visit_id and v.visitor_id = auth.uid() and v.status = 'completed'
    )
  );
create policy reviews_update_own on reviews
  for update using (author_id = auth.uid() or is_staff())
  with check (author_id = auth.uid() or is_staff());

create policy notifications_own on notifications
  for select using (user_id = auth.uid());
create policy notifications_mark_read on notifications
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy notification_preferences_own on notification_preferences
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy reports_insert on reports
  for insert with check (reporter_id = auth.uid());
create policy reports_read on reports
  for select using (reporter_id = auth.uid() or is_staff());
create policy reports_staff on reports
  for all using (is_staff()) with check (is_staff());

-- Signaux de risque : strictement internes (service role / staff).
create policy risk_events_staff on risk_events
  for all using (is_staff()) with check (is_staff());

create policy crm_leads_scope on crm_leads
  for all using (advertiser_id = my_advertiser_id() or is_agency_member(agency_id) or is_staff())
  with check (advertiser_id = my_advertiser_id() or is_agency_member(agency_id) or is_staff());

-- ---------- Monétisation : lecture seule côté client ----------
create policy offers_read on offers for select using (is_active or is_staff());
create policy offers_staff on offers for all using (is_staff()) with check (is_staff());

create policy coin_wallets_read_own on coin_wallets
  for select using (user_id = auth.uid() or is_staff());

create policy coin_ledger_read_own on coin_ledger
  for select using (user_id = auth.uid() or is_staff());

create policy orders_read_own on orders
  for select using (user_id = auth.uid() or is_staff());

create policy entitlements_read_own on entitlements
  for select using (user_id = auth.uid() or is_staff());

create policy boosts_read on boosts
  for select using (owns_property(property_id) or is_staff());

create policy subscriptions_read on subscriptions
  for select using (user_id = auth.uid() or is_agency_member(agency_id) or is_staff());

create policy audit_logs_staff on audit_logs
  for select using (is_staff());

-- payment_events et idempotency_keys : aucune policy => service role uniquement.

-- Création automatique du profil et du portefeuille à l'inscription.
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, phone, email, display_name)
  values (new.id, new.phone, new.email, coalesce(new.raw_user_meta_data->>'display_name', null))
  on conflict (id) do nothing;

  insert into public.coin_wallets (user_id, balance)
  values (new.id, 0)
  on conflict (user_id) do nothing;

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();
