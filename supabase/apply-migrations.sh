#!/usr/bin/env bash
# Applique les migrations BABI SWIPE IMMO sur un projet Supabase, dans l'ordre.
#
# Usage :
#   export DATABASE_URL='postgresql://postgres:MOT_DE_PASSE@db.<ref>.supabase.co:5432/postgres'
#   ./supabase/apply-migrations.sh
#
# Le mot de passe se trouve dans Supabase > Project Settings > Database > Connection string (URI).
# Chaque fichier est joue dans une transaction : en cas d'erreur, rien n'est applique pour ce fichier.

set -euo pipefail

if [ -z "${DATABASE_URL:-}" ]; then
  echo "DATABASE_URL manquant (chaine de connexion Postgres du projet Supabase)." >&2
  exit 1
fi

DIR="$(cd "$(dirname "$0")/migrations" && pwd)"

for file in "$DIR"/[0-9][0-9][0-9][0-9]_*.sql; do
  echo "==> $(basename "$file")"
  psql "$DATABASE_URL" --set ON_ERROR_STOP=1 --single-transaction -f "$file"
done

echo "Migrations appliquees."
