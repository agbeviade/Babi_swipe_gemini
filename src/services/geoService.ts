/**
 * Geolocation service providing PostGIS-compatible ST_Distance calculations,
 * radius queries, and browser geolocation wrappers.
 */

// Abidjan default coordinate (Cocody center)
export const DEFAULT_ABIDJAN_CENTER = {
  latitude: 5.3485,
  longitude: -4.0040,
  label: 'Cocody, Abidjan'
};

/**
 * Calculates great-circle distance between two points on Earth using Haversine formula
 * (Mirrors PostGIS ST_Distance(geography, geography) / 1000)
 */
export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((R * c).toFixed(2));
}

/**
 * Formats distance into friendly local copy
 * Examples: "À 600 m de vous", "À 2,4 km de vous"
 */
export function formatDistance(distanceKm?: number): string {
  if (distanceKm === undefined || isNaN(distanceKm)) {
    return 'Distance non calculée';
  }
  if (distanceKm < 1) {
    const meters = Math.round(distanceKm * 1000);
    return `À ${meters} m de vous`;
  }
  return `À ${distanceKm.toLocaleString('fr-FR', { maximumFractionDigits: 1 })} km de vous`;
}

export interface GeolocationResult {
  latitude: number;
  longitude: number;
  accuracy: number;
  isFallback?: boolean;
}

/**
 * Requests user location using browser navigator.geolocation
 * Never bypasses user permissions.
 */
export async function getCurrentPosition(): Promise<GeolocationResult> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve({
        latitude: DEFAULT_ABIDJAN_CENTER.latitude,
        longitude: DEFAULT_ABIDJAN_CENTER.longitude,
        accuracy: 100,
        isFallback: true
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          isFallback: false
        });
      },
      (_error) => {
        // Fallback to Abidjan default without failing
        resolve({
          latitude: DEFAULT_ABIDJAN_CENTER.latitude,
          longitude: DEFAULT_ABIDJAN_CENTER.longitude,
          accuracy: 500,
          isFallback: true
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 8000,
        maximumAge: 60000
      }
    );
  });
}
