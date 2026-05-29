/**
 * OpenStreetMap — geocoding (Nominatim) + places (Overpass).
 * https://operations.osmfoundation.org/policies/nominatim/
 */

import { cacheGet, cacheSet } from '../lib/redis';

const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search';
const OVERPASS_ENDPOINTS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
];
const USER_AGENT = process.env.OSM_USER_AGENT || 'VoyagerTravelApp/1.0 (local-dev)';

export interface OsmCenter {
  id: string;
  name: string;
  type: 'embassy' | 'visa_center' | 'passport_office' | 'government';
  address: string;
  latitude: number;
  longitude: number;
  phone?: string;
  website?: string;
  source: 'openstreetmap';
  osmType?: string;
  osmId?: number;
}

export interface GeocodedCity {
  name: string;
  displayName: string;
  latitude: number;
  longitude: number;
  country?: string;
}

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

async function nominatimFetch(params: URLSearchParams): Promise<GeocodedCity | null> {
  const res = await fetch(`${NOMINATIM_URL}?${params}`, {
    headers: { 'User-Agent': USER_AGENT, Accept: 'application/json' },
  });

  if (!res.ok) return null;

  const data = (await res.json()) as Array<{
    lat: string;
    lon: string;
    display_name: string;
    address?: {
      city?: string;
      town?: string;
      village?: string;
      state?: string;
      country?: string;
    };
  }>;

  if (!data.length) return null;

  const hit = data[0];
  return {
    name: hit.address?.city || hit.address?.town || hit.address?.village || '',
    displayName: hit.display_name,
    latitude: parseFloat(hit.lat),
    longitude: parseFloat(hit.lon),
    country: hit.address?.country,
  };
}

export async function geocodeCity(city: string, country?: string): Promise<GeocodedCity | null> {
  const trimmedCity = city.trim();
  const trimmedCountry = country?.trim();
  const cacheKey = `osm:geocode:${trimmedCity.toLowerCase()}:${(trimmedCountry || '').toLowerCase()}`;
  const cached = await cacheGet<GeocodedCity>(cacheKey);
  if (cached) return cached;

  let result: GeocodedCity | null = null;

  // Structured search — more accurate when country is provided
  if (trimmedCountry) {
    const structured = new URLSearchParams({
      city: trimmedCity,
      country: trimmedCountry,
      format: 'json',
      limit: '1',
      addressdetails: '1',
    });
    result = await nominatimFetch(structured);
  }

  // Free-text fallback
  if (!result) {
    const q = trimmedCountry ? `${trimmedCity}, ${trimmedCountry}` : trimmedCity;
    const freeText = new URLSearchParams({
      q,
      format: 'json',
      limit: '1',
      addressdetails: '1',
    });
    result = await nominatimFetch(freeText);
  }

  if (!result) return null;

  if (!result.name) result.name = trimmedCity;

  await cacheSet(cacheKey, result, 86400);
  return result;
}

function classifyCenter(tags: Record<string, string>, name: string): OsmCenter['type'] {
  const lower = name.toLowerCase();
  if (/vfs|visa application|tlscontact|bls international|visa center|visa centre|visa service/i.test(lower)) {
    return 'visa_center';
  }
  if (/passport seva|passport office|passport agency|hm passport|passport service/i.test(lower)) {
    return 'passport_office';
  }
  if (
    tags.amenity === 'embassy' ||
    tags.amenity === 'consulate' ||
    tags.office === 'diplomatic' ||
    tags.diplomatic != null ||
    /embassy|consulate|consulate general|high commission/i.test(lower)
  ) {
    return 'embassy';
  }
  if (tags.amenity === 'public_building' && /passport/i.test(lower)) {
    return 'passport_office';
  }
  return 'government';
}

function buildAddress(tags: Record<string, string>): string {
  const parts = [
    tags['addr:housenumber'],
    tags['addr:street'],
    tags['addr:suburb'],
    tags['addr:city'] || tags['addr:town'],
    tags['addr:postcode'],
    tags['addr:country'],
  ].filter(Boolean);
  return parts.join(', ') || tags['addr:full'] || 'Address not listed — verify on OpenStreetMap';
}

function parseOverpassElement(
  el: {
    type: string;
    id: number;
    lat?: number;
    lon?: number;
    center?: { lat: number; lon: number };
    tags?: Record<string, string>;
  },
  refLat: number,
  refLng: number,
): (OsmCenter & { distanceKm: number }) | null {
  const tags = el.tags || {};
  const name = tags.name || tags['name:en'] || tags.operator;
  if (!name) return null;

  const lat = el.lat ?? el.center?.lat;
  const lon = el.lon ?? el.center?.lon;
  if (lat == null || lon == null) return null;

  const type = classifyCenter(tags, name);

  return {
    id: `osm-${el.type}-${el.id}`,
    name,
    type,
    address: buildAddress(tags),
    latitude: lat,
    longitude: lon,
    phone: tags.phone || tags['contact:phone'],
    website: tags.website || tags['contact:website'],
    source: 'openstreetmap',
    osmType: el.type,
    osmId: el.id,
    distanceKm: Math.round(haversineKm(refLat, refLng, lat, lon) * 10) / 10,
  };
}

function buildOverpassQuery(lat: number, lng: number, radiusMeters: number) {
  const r = radiusMeters;
  const around = `around:${r},${lat},${lng}`;
  return `
[out:json][timeout:45];
(
  node["amenity"~"embassy|consulate"](${around});
  way["amenity"~"embassy|consulate"](${around});
  relation["amenity"~"embassy|consulate"](${around});
  node["office"="diplomatic"](${around});
  way["office"="diplomatic"](${around});
  node["diplomatic"](${around});
  way["diplomatic"](${around});
  relation["diplomatic"](${around});
  node["name"~"embassy|consulate|consulate general|high commission",i](${around});
  way["name"~"embassy|consulate|consulate general|high commission",i](${around});
  node["name"~"VFS|visa application|TLScontact|BLS International|visa cent",i](${around});
  way["name"~"VFS|visa application|TLScontact|BLS International|visa cent",i](${around});
  node["name"~"Passport Seva|passport office|HM Passport Office|passport service",i](${around});
  way["name"~"Passport Seva|passport office|HM Passport Office|passport service",i](${around});
);
out center tags;
`;
}

async function runOverpass(query: string): Promise<Parameters<typeof parseOverpassElement>[0][]> {
  let lastError: Error | null = null;

  for (const endpoint of OVERPASS_ENDPOINTS) {
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': USER_AGENT,
        },
        body: `data=${encodeURIComponent(query)}`,
      });

      if (!res.ok) {
        lastError = new Error(`Overpass ${endpoint}: ${res.status}`);
        continue;
      }

      const json = (await res.json()) as { elements: Parameters<typeof parseOverpassElement>[0][] };
      return json.elements || [];
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
    }
  }

  throw lastError || new Error('All Overpass endpoints failed');
}

export async function findCentersNear(
  lat: number,
  lng: number,
  radiusMeters = 50000,
  typeFilter?: string,
): Promise<(OsmCenter & { distanceKm: number })[]> {
  const cacheKey = `osm:centers:v2:${lat.toFixed(4)}:${lng.toFixed(4)}:${radiusMeters}:${typeFilter || 'all'}`;
  const cached = await cacheGet<(OsmCenter & { distanceKm: number })[]>(cacheKey);
  if (cached) return cached;

  const elements = await runOverpass(buildOverpassQuery(lat, lng, radiusMeters));
  const seen = new Set<string>();
  const centers: (OsmCenter & { distanceKm: number })[] = [];

  for (const el of elements) {
    const parsed = parseOverpassElement(el, lat, lng);
    if (!parsed) continue;
    const key = `${parsed.name}-${parsed.latitude.toFixed(5)}-${parsed.longitude.toFixed(5)}`;
    if (seen.has(key)) continue;
    seen.add(key);

    if (typeFilter && typeFilter !== 'all' && parsed.type !== typeFilter) continue;
    centers.push(parsed);
  }

  centers.sort((a, b) => a.distanceKm - b.distanceKm);
  await cacheSet(cacheKey, centers, 3600);
  return centers;
}

export type CentersSearchSuccess = {
  found: true;
  source: 'openstreetmap';
  reference: {
    city: string;
    resolvedName: string;
    latitude: number;
    longitude: number;
    country?: string;
  };
  centers: (OsmCenter & { distanceKm: number })[];
  attribution: string;
  mapNote: string;
};

export type CentersSearchFailure = {
  found: false;
  error: string;
};

export type CentersSearchResult = CentersSearchSuccess | CentersSearchFailure;

export async function searchCentersByCity(options: {
  city: string;
  country?: string;
  type?: string;
  lat?: number;
  lng?: number;
}): Promise<CentersSearchResult> {
  let geo: GeocodedCity | null = null;

  if (options.lat != null && options.lng != null) {
    geo = {
      name: options.city.trim(),
      displayName: options.country
        ? `${options.city}, ${options.country}`
        : options.city,
      latitude: options.lat,
      longitude: options.lng,
    };
  } else {
    geo = await geocodeCity(options.city, options.country);
  }

  if (!geo) {
    return {
      found: false,
      error: `Could not locate "${options.city}". Add the country (e.g. London + United Kingdom).`,
    };
  }

  const centers = await findCentersNear(geo.latitude, geo.longitude, 50000, options.type);

  return {
    found: true,
    source: 'openstreetmap' as const,
    reference: {
      city: options.city.trim(),
      resolvedName: geo.displayName,
      latitude: geo.latitude,
      longitude: geo.longitude,
      country: geo.country,
    },
    centers,
    attribution: '© OpenStreetMap contributors',
    mapNote:
      centers.length === 0
        ? 'No mapped embassies or visa centers found within 50 km. Try a capital city or verify on OpenStreetMap.'
        : 'Data from OpenStreetMap. Verify addresses before visiting.',
  };
}
