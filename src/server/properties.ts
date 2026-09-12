import 'server-only';

import { createSupabaseServerClient } from '@/lib/supabase/server';
import { isSupabaseConfigured, requireSupabasePublicEnv } from '@/lib/env';
import { buildEntryCost } from '@/services/budgetService';
import type { Property, PropertyType, TransactionType, VerificationLevel } from '@/types';

const PROPERTY_SELECT = `
  id, title, description, transaction, type, price, currency,
  landmark, latitude, longitude, bedrooms, bathrooms, area_sqm, features,
  deposit_months, advance_months, agency_fees, other_fees,
  available_from, is_available, views_count, likes_count, created_at, updated_at,
  city:cities ( name ),
  commune:communes ( name ),
  neighborhood:neighborhoods ( name ),
  advertiser:advertisers ( id, user_id, display_name, type, phone, whatsapp, agency:agencies ( name ) ),
  images:property_images ( id, storage_path, position, is_primary, caption )
`;

const VERIFICATION_LEVEL_BY_KIND: Record<string, VerificationLevel | undefined> = {
  phone: 'phone_verified',
  identity: 'id_verified',
  owner: 'owner_verified',
  agency: 'agency_verified',
  listing: 'listing_verified',
};

interface NamedRow {
  name: string | null;
}

interface ImageRow {
  id: string;
  storage_path: string;
  position: number | null;
  is_primary: boolean | null;
  caption: string | null;
}

interface AdvertiserRow {
  id: string;
  user_id: string;
  display_name: string;
  type: 'particulier' | 'agence';
  phone: string;
  whatsapp: string | null;
  agency: NamedRow | null;
}

interface PropertyRow {
  id: string;
  title: string;
  description: string;
  transaction: TransactionType;
  type: PropertyType;
  price: number | string;
  landmark: string | null;
  latitude: number;
  longitude: number;
  bedrooms: number;
  bathrooms: number;
  area_sqm: number | string | null;
  features: string[] | null;
  deposit_months: number | null;
  advance_months: number | null;
  agency_fees: number | string | null;
  other_fees: number | string | null;
  available_from: string | null;
  is_available: boolean;
  views_count: number;
  likes_count: number;
  created_at: string;
  updated_at: string | null;
  city: NamedRow | null;
  commune: NamedRow | null;
  neighborhood: NamedRow | null;
  advertiser: AdvertiserRow | null;
  images: ImageRow[] | null;
}

function toNumber(value: number | string | null | undefined): number | null {
  if (value === null || value === undefined) return null;
  const parsed = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

/**
 * Les images ne peuvent venir que du bucket `property-images` : un chemin absolu
 * stocké en base ne doit jamais faire sortir l'application du stockage Supabase.
 */
function publicImageUrl(storagePath: string): string | null {
  const normalized = storagePath.replace(/^\/+/, '');
  if (normalized === '' || normalized.includes('..') || /^[a-z][a-z0-9+.-]*:/i.test(normalized)) {
    return null;
  }
  const { url } = requireSupabasePublicEnv();
  return `${url}/storage/v1/object/public/property-images/${normalized}`;
}

function mapProperty(
  row: PropertyRow,
  verifiedIds: Set<string>,
  advertiserVerifications: Map<string, VerificationLevel[]>,
): Property {
  const price = toNumber(row.price) ?? 0;
  const images = [...(row.images ?? [])].sort(
    (a, b) => Number(b.is_primary) - Number(a.is_primary) || (a.position ?? 0) - (b.position ?? 0),
  );

  return {
    id: row.id,
    title: row.title,
    description: row.description,
    transaction: row.transaction,
    type: row.type,
    price,
    currency: 'XOF',
    city: row.city?.name ?? '',
    commune: row.commune?.name ?? '',
    neighborhood: row.neighborhood?.name ?? '',
    landmark: row.landmark ?? undefined,
    latitude: row.latitude,
    longitude: row.longitude,
    bedrooms: row.bedrooms,
    bathrooms: row.bathrooms,
    areaSqm: toNumber(row.area_sqm) ?? 0,
    features: row.features ?? [],
    images: images.flatMap((image, index) => {
      const url = publicImageUrl(image.storage_path);
      return url === null
        ? []
        : [
            {
              id: image.id,
              url,
              isMain: index === 0,
              isPrimary: Boolean(image.is_primary),
              caption: image.caption ?? undefined,
            },
          ];
    }),
    advertiser: {
      id: row.advertiser?.id ?? '',
      name: row.advertiser?.display_name ?? '',
      type: row.advertiser?.type ?? 'particulier',
      agencyName: row.advertiser?.agency?.name ?? undefined,
      phone: row.advertiser?.phone ?? '',
      whatsapp: row.advertiser?.whatsapp ?? '',
      // Vérifications actives accordées par la modération, jamais déclarées par l'annonceur.
      verifications: advertiserVerifications.get(row.advertiser?.id ?? '') ?? [],
      isVerified: (advertiserVerifications.get(row.advertiser?.id ?? '') ?? []).length > 0,
    },
    entryCost: buildEntryCost({
      loyer: price,
      cautionMois: row.deposit_months,
      avanceMois: row.advance_months,
      fraisAgence: toNumber(row.agency_fees),
      fraisDossier: toNumber(row.other_fees),
    }),
    availableFrom: row.available_from ?? '',
    isAvailable: row.is_available,
    isVerified: verifiedIds.has(row.id),
    createdAt: row.created_at,
    updatedAt: row.updated_at ?? undefined,
    viewsCount: row.views_count,
    likesCount: row.likes_count,
  };
}

/**
 * Annonces publiées, lues sous RLS avec la session courante.
 * Renvoie une liste vide tant que Supabase n'est pas configuré : aucune donnée
 * de démonstration n'est jamais servie comme annonce réelle.
 */
export async function getPublishedProperties(limit = 60): Promise<Property[]> {
  if (!isSupabaseConfigured()) return [];

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from('properties')
    .select(PROPERTY_SELECT)
    .eq('status', 'published')
    .eq('is_available', true)
    .order('published_at', { ascending: false })
    .limit(limit);

  if (error) throw new Error(`Lecture des annonces impossible : ${error.message}`);

  const rows = (data ?? []) as unknown as PropertyRow[];
  if (rows.length === 0) return [];

  const nowIso = new Date().toISOString();
  const advertiserUserIds = [
    ...new Set(rows.map((row) => row.advertiser?.user_id).filter((id): id is string => Boolean(id))),
  ];

  // Une vérification expirée ne vaut plus badge : `valid_until` est toujours appliqué.
  const [listingVerifications, userVerifications] = await Promise.all([
    supabase
      .from('verifications')
      .select('subject_property_id')
      .eq('kind', 'listing')
      .eq('status', 'verified')
      .or(`valid_until.is.null,valid_until.gt.${nowIso}`)
      .in(
        'subject_property_id',
        rows.map((row) => row.id),
      ),
    advertiserUserIds.length > 0
      ? supabase
          .from('verifications')
          .select('subject_user_id, kind')
          .eq('status', 'verified')
          .or(`valid_until.is.null,valid_until.gt.${nowIso}`)
          .in('subject_user_id', advertiserUserIds)
      : Promise.resolve({ data: [] as { subject_user_id: string | null; kind: string }[] }),
  ]);

  const verifiedIds = new Set(
    ((listingVerifications.data ?? []) as { subject_property_id: string | null }[])
      .map((row) => row.subject_property_id)
      .filter((id): id is string => id !== null),
  );

  const levelsByUser = new Map<string, VerificationLevel[]>();
  for (const row of (userVerifications.data ?? []) as {
    subject_user_id: string | null;
    kind: string;
  }[]) {
    const level = VERIFICATION_LEVEL_BY_KIND[row.kind];
    if (!row.subject_user_id || !level) continue;
    const levels = levelsByUser.get(row.subject_user_id) ?? [];
    if (!levels.includes(level)) levels.push(level);
    levelsByUser.set(row.subject_user_id, levels);
  }

  const levelsByAdvertiser = new Map<string, VerificationLevel[]>();
  for (const row of rows) {
    const advertiser = row.advertiser;
    if (!advertiser) continue;
    levelsByAdvertiser.set(advertiser.id, levelsByUser.get(advertiser.user_id) ?? []);
  }

  return rows.map((row) => mapProperty(row, verifiedIds, levelsByAdvertiser));
}
