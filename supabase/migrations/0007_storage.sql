-- =========================================================
-- BABI SWIPE IMMO — 0007 : buckets de stockage et policies
-- Convention de chemin : <bucket>/<user_id>/<property_id>/<fichier>
-- =========================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('property-images', 'property-images', true, 5242880,
   array['image/jpeg', 'image/png', 'image/webp']),
  ('verification-docs', 'verification-docs', false, 10485760,
   array['image/jpeg', 'image/png', 'image/webp', 'application/pdf']),
  ('avatars', 'avatars', true, 2097152,
   array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

-- Photos d'annonces : lecture publique, écriture réservée au propriétaire du dossier.
create policy "property images are public"
  on storage.objects for select
  using (bucket_id = 'property-images');

create policy "advertiser writes own property images"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'property-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "advertiser updates own property images"
  on storage.objects for update to authenticated
  using (
    bucket_id = 'property-images'
    and ((storage.foldername(name))[1] = auth.uid()::text or is_staff())
  );

create policy "advertiser deletes own property images"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'property-images'
    and ((storage.foldername(name))[1] = auth.uid()::text or is_staff())
  );

-- Pièces de vérification : jamais publiques, lisibles par le déposant et le staff.
create policy "verification docs read restricted"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'verification-docs'
    and ((storage.foldername(name))[1] = auth.uid()::text or is_staff())
  );

create policy "verification docs upload own"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'verification-docs'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "avatars are public"
  on storage.objects for select
  using (bucket_id = 'avatars');

create policy "avatar write own"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "avatar update own"
  on storage.objects for update to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
