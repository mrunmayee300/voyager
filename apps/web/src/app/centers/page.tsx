'use client';

import dynamic from 'next/dynamic';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { api } from '@/lib/api';
import { MapPin, Phone, Globe, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';

const CentersMap = dynamic(
  () => import('@/components/centers/centers-map').then((m) => m.CentersMap),
  { ssr: false, loading: () => <div className="h-[360px] animate-pulse rounded-lg bg-sand-100" /> },
);

interface Center {
  id: string;
  name: string;
  type: string;
  address: string;
  latitude: number;
  longitude: number;
  distanceKm: number;
  phone?: string;
  website?: string;
  source?: string;
}

interface CentersResponse {
  source: string;
  reference: {
    city: string;
    resolvedName?: string;
    latitude: number;
    longitude: number;
    country?: string;
  };
  centers: Center[];
  attribution?: string;
  mapNote?: string;
}

const typeLabel: Record<string, string> = {
  passport_office: 'Passport office',
  visa_center: 'Visa application center',
  embassy: 'Embassy / Consulate',
  government: 'Government office',
};

export default function CentersPage() {
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [searchParams, setSearchParams] = useState<{
    city: string;
    country: string;
    type: string;
  } | null>(null);
  const [selectedId, setSelectedId] = useState<string | undefined>();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['centers', searchParams],
    queryFn: () =>
      api<CentersResponse>(
        `/centers/nearby?city=${encodeURIComponent(searchParams!.city)}&country=${encodeURIComponent(searchParams!.country)}&type=${searchParams!.type}&source=auto`,
      ),
    enabled: !!searchParams?.city.trim(),
    retry: 1,
  });

  const runSearch = () => {
    if (!city.trim()) return;
    setSelectedId(undefined);
    setSearchParams({
      city: city.trim(),
      country: country.trim(),
      type: filterType,
    });
  };

  return (
    <div className="mx-auto max-w-5xl px-5 py-12 md:px-8">
      <p className="text-sm font-medium uppercase tracking-wider text-ocean-600">Locator</p>
      <h1 className="editorial-heading mt-2 text-3xl font-semibold text-sand-900">
        Passport & visa centers
      </h1>
      <p className="mt-3 max-w-2xl text-sand-800/70">
        Real locations from OpenStreetMap — no Mapbox key required. Include country for accurate
        results (e.g. Paris + France).
      </p>

      <div className="card-elevated mt-8 grid gap-4 p-4 md:grid-cols-4">
        <div className="md:col-span-2">
          <Label>City</Label>
          <Input
            className="mt-2"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="e.g. London"
            onKeyDown={(e) => e.key === 'Enter' && runSearch()}
          />
        </div>
        <div>
          <Label>Country</Label>
          <Input
            className="mt-2"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            placeholder="e.g. United Kingdom"
            onKeyDown={(e) => e.key === 'Enter' && runSearch()}
          />
        </div>
        <div>
          <Label>Type</Label>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="mt-2">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All types</SelectItem>
              <SelectItem value="embassy">Embassy / Consulate</SelectItem>
              <SelectItem value="visa_center">Visa center</SelectItem>
              <SelectItem value="passport_office">Passport office</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="md:col-span-4">
          <Button onClick={runSearch} disabled={isLoading} className="w-full md:w-auto">
            {isLoading ? 'Searching OpenStreetMap...' : 'Find centers'}
          </Button>
        </div>
      </div>

      {searchParams && data && (
        <>
          <p className="mt-6 text-sm text-sand-800/60">
            Showing results near{' '}
            <strong className="text-sand-900">{data.reference.resolvedName || data.reference.city}</strong>
            <span className="ml-2 rounded-full bg-sand-100 px-2 py-0.5 text-[10px] uppercase tracking-wide text-sand-800/50">
              {data.source === 'openstreetmap' ? 'OpenStreetMap' : 'Local data'}
            </span>
            {data.attribution && <> · {data.attribution}</>}
          </p>
          {data.mapNote && data.centers.length > 0 && (
            <p className="mt-2 text-xs text-sand-800/50">{data.mapNote}</p>
          )}

          {data.centers.length > 0 && (
            <div className="mt-4 overflow-hidden rounded-lg border border-sand-200">
              <CentersMap
                centers={data.centers}
                center={{ lat: data.reference.latitude, lng: data.reference.longitude }}
                selectedId={selectedId}
                onSelect={setSelectedId}
              />
            </div>
          )}

          <div className="mt-6 flex flex-wrap gap-3 text-xs text-sand-800/50">
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-ocean-600" /> Embassy
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-accent" /> Visa center
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-ocean-800" /> Passport office
            </span>
          </div>
        </>
      )}

      {searchParams && isError && (
        <p className="mt-6 text-sm text-red-600">
          {(error as Error)?.message?.includes('404') || (error as Error)?.message?.includes('Could not')
            ? `Could not find "${searchParams.city}". Enter the country too (e.g. Paris + France).`
            : 'Search failed. Check your connection and restart the API, then try again.'}
        </p>
      )}

      {searchParams && data?.centers.length === 0 && !isLoading && !isError && (
        <p className="mt-6 text-sm text-sand-800/60">
          No centers found in OpenStreetMap for this area. Try a larger city or check spelling.
          {data.mapNote && ` ${data.mapNote}`}
        </p>
      )}

      {searchParams && data && data.centers.length > 0 && (
        <div className="mt-8 space-y-3">
          {data.centers.map((center) => (
            <button
              key={center.id}
              type="button"
              onClick={() => setSelectedId(center.id)}
              className={cn(
                'card-elevated w-full p-5 text-left transition-shadow hover:shadow-md',
                selectedId === center.id && 'ring-2 ring-ocean-500/40',
              )}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span className="text-xs font-medium uppercase tracking-wider text-ocean-600">
                    {typeLabel[center.type] || center.type}
                  </span>
                  <h2 className="font-display text-lg font-semibold text-sand-900">{center.name}</h2>
                </div>
                <span className="text-sm text-sand-800/50">{center.distanceKm} km</span>
              </div>
              <p className="mt-2 flex items-start gap-2 text-sm text-sand-800/70">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
                {center.address}
              </p>
              <div className="mt-3 flex flex-wrap gap-4 text-sm">
                {center.phone && (
                  <a
                    href={`tel:${center.phone}`}
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center gap-1 text-ocean-700 hover:underline"
                  >
                    <Phone className="h-3.5 w-3.5" /> {center.phone}
                  </a>
                )}
                {center.website && (
                  <a
                    href={center.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center gap-1 text-ocean-700 hover:underline"
                  >
                    <Globe className="h-3.5 w-3.5" /> Website
                  </a>
                )}
                <a
                  href={`https://www.openstreetmap.org/?mlat=${center.latitude}&mlon=${center.longitude}#map=17/${center.latitude}/${center.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="flex items-center gap-1 text-sand-800/50 hover:text-ocean-700"
                >
                  <ExternalLink className="h-3.5 w-3.5" /> View on OSM
                </a>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
