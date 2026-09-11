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
  advertiser:advertisers ( id, display_name, type, phone, whatsapp, agency:agencies ( name ) ),
  images:property_images ( id, storage_path, position, is_primary, caption )
`;

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

function publicImageUrl(storagePath: string): string {
  if (/^https?:\/\//.test(storagePath)) return storagePath;
  const { url } = requireSupabasePublicEnv();
  return `${url}/storage/v1/object/public/property-images/${storagePath}`;
}

function mapProperty(row: PropertyRow, verifiedIds: Set<string>): Property {
  const price = toNumber(row.price) ?? 0;
  const images = [...(row.images ?? [])].sort(
    (a, b) => Number(b.is_primary) - Number(a.is_primary) || (a.position ?? 0) - (b.position ?? 0),
  );

  const advertiserVerifications: VerificationLevel[] = [];

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
    images: images.map((image, index) => ({
      id: image.id,
      url: publicImageUrl(image.storage_path),
      isMain: index === 0,
      isPrimary: Boolean(image.is_primary),
      caption: image.caption ?? undefined,
    })),
    advertiser: {
      id: row.advertiser?.id ?? '',
      name: row.advertiser?.display_name ?? '',
      type: row.advertiser?.type ?? 'particulier',
      agencyName: row.advertiser?.agency?.name ?? undefined,
      phone: row.advertiser?.phone ?? '',
      whatsapp: row.advertiser?.whatsapp ?? '',
      // Les vérifications annonceur sont résolues par la modération, pas déduites ici.
      verifications: advertiserVerifications,
      isVerified: false,
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

  const { data: verifications } = await supabase
    .from('verifications')
    .select('subject_property_id')
    .eq('kind', 'listing')
    .eq('status', 'verified')
    .in(
      'subject_property_id',
      rows.map((row) => row.id),
    );

  const verifiedIds = new Set(
    ((verifications ?? []) as { subject_property_id: string | null }[])
      .map((row) => row.subject_property_id)
      .filter((id): id is string => id !== null),
  );

  return rows.map((row) => mapProperty(row, verifiedIds));
}
