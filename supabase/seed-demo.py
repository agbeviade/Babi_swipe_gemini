"""Jeu de démonstration : annonceur fictif, géographie Abidjan et annonces publiées.

Usage :
    NEXT_PUBLIC_SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... python3 supabase/seed-demo.py

Les données insérées sont explicitement marquées « (démo) » dans le nom de
l'annonceur afin de rester identifiables et supprimables en production.
"""

import datetime
import json
import os
import urllib.parse
import urllib.request

URL = os.environ["NEXT_PUBLIC_SUPABASE_URL"].rstrip("/")
KEY = os.environ["SUPABASE_SERVICE_ROLE_KEY"]
DEMO_EMAIL = "demo.proprietaire@epicestock.com"
DEMO_PASSWORD = os.environ.get("DEMO_PASSWORD", "BabiDemo!2026")

HEADERS = {
    "apikey": KEY,
    "Authorization": f"Bearer {KEY}",
    "Content-Type": "application/json",
}


def request(method, path, payload=None, headers=None, raw=None):
    data = raw if raw is not None else (json.dumps(payload).encode() if payload is not None else None)
    req = urllib.request.Request(
        f"{URL}{path}", method=method, data=data, headers={**HEADERS, **(headers or {})}
    )
    try:
        with urllib.request.urlopen(req) as res:
            body = res.read()
            return res.status, (json.loads(body) if body and res.headers.get("content-type", "").startswith("application/json") else body)
    except urllib.error.HTTPError as exc:
        return exc.code, exc.read().decode()[:400]


def rest(method, table, payload=None, query="", prefer="return=representation"):
    status, body = request(method, f"/rest/v1/{table}{query}", payload, {"Prefer": prefer})
    if status >= 300:
        raise SystemExit(f"{method} {table} -> {status} {body}")
    return body


def ensure_user():
    status, body = request(
        "POST",
        "/auth/v1/admin/users",
        {
            "email": DEMO_EMAIL,
            "password": DEMO_PASSWORD,
            "email_confirm": True,
            "user_metadata": {"display_name": "Kouadio Immo (démo)"},
        },
    )
    if status < 300:
        return body["id"]
    users = rest("GET", "profiles", query=f"?email=eq.{DEMO_EMAIL}&select=id")
    if users:
        return users[0]["id"]
    raise SystemExit(f"création utilisateur démo impossible : {status} {body}")


def upsert(table, match, payload):
    query = (
        "?"
        + "&".join(f"{k}=eq.{urllib.parse.quote(str(v))}" for k, v in match.items())
        + "&select=id"
    )
    existing = rest("GET", table, query=query)
    if existing:
        return existing[0]["id"]
    return rest("POST", table, payload)[0]["id"]


LISTINGS = [
    {
        "title": "Appartement 3 pièces lumineux à Cocody Angré",
        "description": "Appartement rénové de 3 pièces au 2e étage, séjour spacieux, cuisine équipée, balcon, quartier calme proche des commerces et des écoles. Eau et électricité individuelles, gardiennage 24h/24.",
        "type": "appartement",
        "price": 250000,
        "commune": "Cocody",
        "neighborhood": "Angré",
        "landmark": "près du carrefour Angré 8e tranche",
        "lat": 5.3925,
        "lng": -3.9857,
        "bedrooms": 2,
        "bathrooms": 1,
        "area": 75,
        "features": ["climatisation", "parking", "securite"],
        "deposit_months": 2,
        "advance_months": 2,
        "agency_fees": None,
        "other_fees": None,
    },
    {
        "title": "Studio meublé moderne à Marcory Zone 4",
        "description": "Studio entièrement meublé avec kitchenette, salle d'eau moderne et climatisation. Idéal jeune actif, à cinq minutes des bureaux de la Zone 4 et des restaurants.",
        "type": "studio",
        "price": 150000,
        "commune": "Marcory",
        "neighborhood": "Zone 4",
        "landmark": "derrière la rue Pierre et Marie Curie",
        "lat": 5.2921,
        "lng": -3.9946,
        "bedrooms": 1,
        "bathrooms": 1,
        "area": 32,
        "features": ["meuble", "climatisation", "internet"],
        "deposit_months": 1,
        "advance_months": 1,
        "agency_fees": 75000,
        "other_fees": None,
    },
    {
        "title": "Villa 4 chambres avec jardin à Riviera Palmeraie",
        "description": "Belle villa basse de quatre chambres sur parcelle clôturée, grand séjour, cuisine américaine, jardin arboré et garage pour deux véhicules. Quartier résidentiel très sécurisé.",
        "type": "villa",
        "price": 650000,
        "commune": "Cocody",
        "neighborhood": "Riviera Palmeraie",
        "landmark": "à 300 m de la pharmacie de la Palmeraie",
        "lat": 5.3672,
        "lng": -3.9484,
        "bedrooms": 4,
        "bathrooms": 3,
        "area": 210,
        "features": ["jardin", "parking", "securite", "groupe_electrogene"],
        "deposit_months": 3,
        "advance_months": 3,
        "agency_fees": 650000,
        "other_fees": 50000,
        "other_fees_label": "Frais de dossier agence",
    },
    {
        "title": "Appartement 2 pièces abordable à Yopougon Niangon",
        "description": "Deux pièces au rez-de-chaussée dans une cour bien tenue, avec cour commune, eau courante et compteur individuel. Transport et marché accessibles à pied.",
        "type": "appartement",
        "price": 90000,
        "commune": "Yopougon",
        "neighborhood": "Niangon Sud",
        "landmark": "face à l'école primaire Niangon Sud",
        "lat": 5.3403,
        "lng": -4.0859,
        "bedrooms": 1,
        "bathrooms": 1,
        "area": 45,
        "features": ["cour", "eau_courante"],
        "deposit_months": 2,
        "advance_months": 1,
        "agency_fees": None,
        "other_fees": None,
    },
    {
        "title": "Appartement haut standing vue lagune au Plateau",
        "description": "Appartement de standing au 8e étage avec vue dégagée sur la lagune, ascenseur, groupe électrogène, parking sous-sol et sécurité permanente. Proche des sièges d'entreprises.",
        "type": "appartement",
        "price": 800000,
        "commune": "Plateau",
        "neighborhood": "Plateau Centre",
        "landmark": "à deux rues de la Cathédrale Saint-Paul",
        "lat": 5.3245,
        "lng": -4.0189,
        "bedrooms": 3,
        "bathrooms": 2,
        "area": 140,
        "features": ["ascenseur", "climatisation", "parking", "securite", "groupe_electrogene"],
        "deposit_months": 2,
        "advance_months": 2,
        "agency_fees": 800000,
        "other_fees": None,
    },
    {
        "title": "Chambre salon calme à Abobo Baoulé",
        "description": "Chambre salon indépendante avec douche interne, dans une maison familiale calme. Compteur d'électricité séparé, forage d'eau, entrée indépendante.",
        "type": "chambre",
        "price": 60000,
        "commune": "Abobo",
        "neighborhood": "Abobo Baoulé",
        "landmark": "non loin du marché de Baoulé",
        "lat": 5.4321,
        "lng": -4.0398,
        "bedrooms": 1,
        "bathrooms": 1,
        "area": 28,
        "features": ["eau_courante", "entree_independante"],
        "deposit_months": 2,
        "advance_months": 2,
        "agency_fees": None,
        "other_fees": None,
    },
]

PHOTO_IDS = [1077, 164, 1048, 260, 271, 106]


def main():
    user_id = ensure_user()
    print("utilisateur démo:", user_id)

    rest("PATCH", "profiles", {"display_name": "Kouadio Immo (démo)", "role": "owner"}, f"?id=eq.{user_id}")

    city_id = upsert("cities", {"name": "Abidjan"}, {"name": "Abidjan", "region": "Abidjan"})
    advertiser_id = upsert(
        "advertisers",
        {"user_id": user_id},
        {
            "user_id": user_id,
            "type": "particulier",
            "display_name": "Kouadio Immo (démo)",
            "phone": "+2250700000000",
            "whatsapp": "+2250700000000",
        },
    )

    for index, listing in enumerate(LISTINGS):
        commune_id = upsert(
            "communes",
            {"city_id": city_id, "name": listing["commune"]},
            {"city_id": city_id, "name": listing["commune"]},
        )
        neighborhood_id = upsert(
            "neighborhoods",
            {"commune_id": commune_id, "name": listing["neighborhood"]},
            {"commune_id": commune_id, "name": listing["neighborhood"]},
        )

        existing = rest("GET", "properties", query=f"?advertiser_id=eq.{advertiser_id}&title=eq.{urllib.parse.quote(listing['title'])}&select=id")
        if existing:
            print("déjà présente:", listing["title"])
            continue

        property_id = rest(
            "POST",
            "properties",
            {
                "advertiser_id": advertiser_id,
                "status": "published",
                "published_at": datetime.datetime.now(datetime.timezone.utc).isoformat(),
                "title": listing["title"],
                "description": listing["description"],
                "transaction": "location",
                "type": listing["type"],
                "price": listing["price"],
                "city_id": city_id,
                "commune_id": commune_id,
                "neighborhood_id": neighborhood_id,
                "landmark": listing["landmark"],
                "latitude": listing["lat"],
                "longitude": listing["lng"],
                "bedrooms": listing["bedrooms"],
                "bathrooms": listing["bathrooms"],
                "area_sqm": listing["area"],
                "features": listing["features"],
                "deposit_months": listing["deposit_months"],
                "advance_months": listing["advance_months"],
                "agency_fees": listing["agency_fees"],
                "other_fees": listing["other_fees"],
                "other_fees_label": listing.get("other_fees_label"),
                "is_available": True,
            },
        )[0]["id"]

        for position in range(2):
            photo = PHOTO_IDS[(index * 2 + position) % len(PHOTO_IDS)]
            with urllib.request.urlopen(f"https://picsum.photos/id/{photo}/1200/800.jpg") as res:
                image = res.read()
            path = f"{user_id}/{property_id}/{position}.jpg"
            status, body = request(
                "POST",
                f"/storage/v1/object/property-images/{path}",
                headers={"Content-Type": "image/jpeg", "x-upsert": "true"},
                raw=image,
            )
            if status >= 300:
                raise SystemExit(f"upload image -> {status} {body}")
            rest(
                "POST",
                "property_images",
                {
                    "property_id": property_id,
                    "storage_path": path,
                    "position": position,
                    "is_primary": position == 0,
                },
            )

        print("annonce publiée:", listing["title"])


if __name__ == "__main__":
    main()
