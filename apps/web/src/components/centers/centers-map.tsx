'use client';

import { useEffect, useRef } from 'react';
import type { Map as LeafletMap, Marker } from 'leaflet';

export interface MapCenter {
  id: string;
  name: string;
  type: string;
  latitude: number;
  longitude: number;
  address: string;
}

interface CentersMapProps {
  centers: MapCenter[];
  center: { lat: number; lng: number };
  selectedId?: string;
  onSelect?: (id: string) => void;
}

const TYPE_COLORS: Record<string, string> = {
  embassy: '#3d6679',
  visa_center: '#c4704a',
  passport_office: '#2f4f5f',
  government: '#8a8178',
};

export function CentersMap({ centers, center, selectedId, onSelect }: CentersMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const markersRef = useRef<Marker[]>([]);

  useEffect(() => {
    if (!containerRef.current || typeof window === 'undefined') return;

    let cancelled = false;

    (async () => {
      const L = await import('leaflet');

      if (cancelled || !containerRef.current) return;

      if (!mapRef.current) {
        mapRef.current = L.map(containerRef.current, {
          scrollWheelZoom: true,
        }).setView([center.lat, center.lng], 12);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
          maxZoom: 19,
        }).addTo(mapRef.current);
      } else {
        mapRef.current.setView([center.lat, center.lng], 12);
      }

      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];

      const bounds = L.latLngBounds([[center.lat, center.lng]]);

      centers.forEach((c) => {
        const color = TYPE_COLORS[c.type] || TYPE_COLORS.government;
        const icon = L.divIcon({
          className: 'custom-marker',
          html: `<span style="background:${color};width:12px;height:12px;border-radius:50%;border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,0.3);display:block;"></span>`,
          iconSize: [12, 12],
          iconAnchor: [6, 6],
        });

        const marker = L.marker([c.latitude, c.longitude], { icon })
          .addTo(mapRef.current!)
          .bindPopup(`<strong>${c.name}</strong><br/><span style="font-size:12px">${c.address}</span>`);

        marker.on('click', () => onSelect?.(c.id));
        markersRef.current.push(marker);
        bounds.extend([c.latitude, c.longitude]);
      });

      if (centers.length > 0) {
        mapRef.current!.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [centers, center.lat, center.lng, onSelect]);

  useEffect(() => {
    if (!selectedId || !mapRef.current) return;
    const c = centers.find((x) => x.id === selectedId);
    if (c) {
      mapRef.current.setView([c.latitude, c.longitude], 15);
      markersRef.current[centers.indexOf(c)]?.openPopup();
    }
  }, [selectedId, centers]);

  useEffect(() => {
    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="h-[360px] w-full rounded-lg border border-sand-200 z-0"
      aria-label="Map showing visa and passport centers"
    />
  );
}
