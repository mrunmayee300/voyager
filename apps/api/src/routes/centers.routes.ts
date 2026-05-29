import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { geocodeCity, searchCentersByCity } from '../services/osm.service';

export const centersRouter = Router();

const searchSchema = z.object({
  city: z.string().min(1),
  country: z.string().optional(),
  type: z.enum(['passport_office', 'visa_center', 'embassy', 'all']).optional(),
  lat: z.coerce.number().optional(),
  lng: z.coerce.number().optional(),
  source: z.enum(['osm', 'database', 'auto']).optional().default('auto'),
});

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

/** Only returns seed data when the city exists in our DB — never all centers globally */
async function getDatabaseCentersForCity(
  city: string,
  type: string | undefined,
  refLat: number,
  refLng: number,
) {
  const cityRecord = await prisma.city.findFirst({
    where: { name: { equals: city, mode: 'insensitive' } },
  });

  if (!cityRecord) {
    return { cityRecord: null, centers: [] };
  }

  const centers = await prisma.serviceCenter.findMany({
    where: {
      cityId: cityRecord.id,
      ...(type && type !== 'all' ? { type } : {}),
    },
    include: { city: { select: { name: true } } },
  });

  return {
    cityRecord,
    centers: centers
      .map((c) => ({
        id: c.id,
        name: c.name,
        type: c.type as 'embassy' | 'visa_center' | 'passport_office',
        address: c.address,
        latitude: c.latitude,
        longitude: c.longitude,
        phone: c.phone ?? undefined,
        website: c.website ?? undefined,
        waitDaysEst: c.waitDaysEst ?? undefined,
        hours: c.hours as Record<string, string> | undefined,
        source: 'database' as const,
        distanceKm: Math.round(haversineKm(refLat, refLng, c.latitude, c.longitude) * 10) / 10,
      }))
      .sort((a, b) => a.distanceKm - b.distanceKm),
  };
}

centersRouter.get('/nearby', async (req, res, next) => {
  try {
    const { city, country, type, lat, lng, source } = searchSchema.parse(req.query);
    const typeFilter = type || 'all';
    const cityTrimmed = city.trim();

    if (source === 'database') {
      const geo =
        lat != null && lng != null
          ? { latitude: lat, longitude: lng, displayName: cityTrimmed }
          : await geocodeCity(cityTrimmed, country);

      const refLat = geo?.latitude ?? 0;
      const refLng = geo?.longitude ?? 0;

      if (!geo) {
        return res.status(404).json({
          found: false,
          error: 'Could not geocode city for database lookup.',
        });
      }

      const { centers, cityRecord } = await getDatabaseCentersForCity(
        cityTrimmed,
        typeFilter,
        refLat,
        refLng,
      );

      return res.json({
        found: true,
        source: 'database',
        reference: {
          city: cityTrimmed,
          resolvedName: geo.displayName,
          latitude: refLat,
          longitude: refLng,
        },
        centers,
        mapNote: cityRecord
          ? undefined
          : `No seeded offices for ${cityTrimmed} in our database. OpenStreetMap search recommended.`,
      });
    }

    // Primary: OpenStreetMap (works for any city worldwide)
    try {
      const osmResult = await searchCentersByCity({
        city: cityTrimmed,
        country: country?.trim(),
        type: typeFilter === 'all' ? undefined : typeFilter,
        lat,
        lng,
      });

      if (!osmResult.found) {
        return res.status(404).json(osmResult);
      }

      // Merge seed data for cities we have locally (e.g. extra VFS details for Mumbai)
      if (osmResult.centers.length > 0 || source === 'osm') {
        const { centers: dbExtras } = await getDatabaseCentersForCity(
          cityTrimmed,
          typeFilter,
          osmResult.reference.latitude,
          osmResult.reference.longitude,
        );

        const osmIds = new Set(osmResult.centers.map((c) => c.name.toLowerCase()));
        const merged = [
          ...osmResult.centers,
          ...dbExtras.filter((d) => !osmIds.has(d.name.toLowerCase())),
        ].sort((a, b) => a.distanceKm - b.distanceKm);

        return res.json({ ...osmResult, centers: merged });
      }

      // OSM geocoded OK but zero results — try DB only for that exact city
      const { centers: dbCenters, cityRecord } = await getDatabaseCentersForCity(
        cityTrimmed,
        typeFilter,
        osmResult.reference.latitude,
        osmResult.reference.longitude,
      );

      if (dbCenters.length > 0) {
        return res.json({
          found: true,
          source: 'database',
          reference: osmResult.reference,
          centers: dbCenters,
          mapNote: 'Showing seeded local data. OpenStreetMap had no mapped offices nearby.',
        });
      }

      return res.json({
        ...osmResult,
        centers: [],
        mapNote: `No embassies or visa centers found within 50 km of ${osmResult.reference.resolvedName}. Try a nearby capital or check OpenStreetMap.`,
      });
    } catch (osmErr) {
      console.warn('OSM lookup failed:', osmErr);
      if (source === 'osm') throw osmErr;
    }

    // Last resort: DB only if city matches seed — never default to Mumbai
    const geo = await geocodeCity(cityTrimmed, country?.trim());
    if (!geo) {
      return res.status(404).json({
        found: false,
        error: `Could not locate "${cityTrimmed}". Please include the country name.`,
      });
    }

    const { centers: dbCenters } = await getDatabaseCentersForCity(
      cityTrimmed,
      typeFilter,
      geo.latitude,
      geo.longitude,
    );

    return res.json({
      found: true,
      source: dbCenters.length > 0 ? 'database' : 'openstreetmap',
      reference: {
        city: cityTrimmed,
        resolvedName: geo.displayName,
        latitude: geo.latitude,
        longitude: geo.longitude,
        country: geo.country,
      },
      centers: dbCenters,
      mapNote:
        dbCenters.length > 0
          ? 'OpenStreetMap unavailable — showing limited seeded data only.'
          : 'Could not load map data. Check your connection and try again with city + country.',
    });
  } catch (e) {
    next(e);
  }
});
