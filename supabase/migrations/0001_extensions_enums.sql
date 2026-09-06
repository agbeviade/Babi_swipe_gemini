-- =========================================================
-- BABI SWIPE IMMO — 0001 : extensions et énumérations
-- =========================================================

create extension if not exists "uuid-ossp";
create extension if not exists postgis;
create extension if not exists pgcrypto;

create type user_role as enum (
  'user', 'owner', 'agent', 'agency_admin', 'moderator', 'admin'
);

create type advertiser_type as enum ('particulier', 'agence');

create type transaction_type as enum ('location', 'vente');

create type property_type as enum (
  'studio', 'appartement', 'maison', 'villa', 'chambre',
  'terrain', 'bureau', 'commerce', 'autre'
);

-- Cycle de vie d'une annonce : la publication passe obligatoirement par la modération.
create type listing_status as enum (
  'draft', 'pending_review', 'published', 'rejected', 'suspended', 'rented', 'sold', 'archived'
);

create type swipe_direction as enum ('left', 'right', 'super');

create type visit_status as enum (
  'requested', 'accepted', 'confirmed', 'completed', 'cancelled', 'no_show'
);

create type contact_channel as enum ('whatsapp', 'phone', 'in_app');

create type lead_status as enum (
  'nouveau', 'contacte', 'visite_programmee', 'visite_effectuee', 'negociation', 'conclu', 'perdu'
);

create type report_reason as enum (
  'arnaque', 'faux_prix', 'fausse_photo', 'indisponible',
  'mauvaise_localisation', 'inapproprie', 'autre'
);

create type report_status as enum ('pending', 'under_review', 'resolved', 'dismissed');

create type verification_kind as enum (
  'phone', 'identity', 'owner', 'agency', 'listing'
);

create type verification_status as enum (
  'not_started', 'pending', 'under_review', 'verified', 'rejected', 'expired'
);

create type payment_provider as enum ('wave', 'orange_money', 'mtn_momo', 'moov_money');

create type payment_status as enum ('pending', 'success', 'failed', 'cancelled', 'refunded');

create type product_type as enum (
  'babi_coins', 'babi_priority', 'listing_boost', 'listing_featured', 'pro_subscription'
);

create type ledger_direction as enum ('credit', 'debit');

create type notification_channel as enum ('in_app', 'push', 'sms', 'email');
