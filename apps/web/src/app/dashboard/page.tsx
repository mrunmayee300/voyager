'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/auth-store';
import { Plus, Share2 } from 'lucide-react';

interface Trip {
  id: string;
  title: string;
  status: string;
  durationDays?: number;
  originCountry: { name: string; flagEmoji?: string };
  destinationCountry: { name: string; flagEmoji?: string };
  updatedAt: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const { token, user } = useAuthStore();

  useEffect(() => {
    if (!token) router.push('/login?redirect=/dashboard');
  }, [token, router]);

  const { data: trips = [], isLoading } = useQuery({
    queryKey: ['trips', token],
    queryFn: () => api<Trip[]>('/trips', { token: token! }),
    enabled: !!token,
  });

  if (!token) return null;

  return (
    <div className="mx-auto max-w-5xl px-5 py-12 md:px-8">
      <div className="flex items-end justify-between">
        <div>
          <p className="text-sm text-sand-800/50">Welcome back, {user?.firstName}</p>
          <h1 className="editorial-heading text-3xl font-semibold text-sand-900">Your trips</h1>
        </div>
        <Link href="/planner">
          <Button size="sm"><Plus className="h-4 w-4" /> New trip</Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="mt-12 space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 animate-pulse rounded-lg bg-sand-100" />
          ))}
        </div>
      ) : trips.length === 0 ? (
        <div className="card-elevated mt-12 p-12 text-center">
          <p className="text-sand-800/70">No saved trips yet.</p>
          <Link href="/planner" className="mt-6 inline-block">
            <Button>Plan your first trip</Button>
          </Link>
        </div>
      ) : (
        <div className="mt-10 space-y-4">
          {trips.map((trip) => (
            <Link
              key={trip.id}
              href={`/dashboard/${trip.id}`}
              className="card-elevated flex items-center justify-between p-6 transition-shadow hover:shadow-md"
            >
              <div>
                <p className="text-xs text-sand-800/50 uppercase tracking-wider">{trip.status}</p>
                <h2 className="font-display text-lg font-semibold text-sand-900">{trip.title}</h2>
                <p className="mt-1 text-sm text-sand-800/60">
                  {trip.originCountry.flagEmoji} {trip.originCountry.name} →{' '}
                  {trip.destinationCountry.flagEmoji} {trip.destinationCountry.name}
                  {trip.durationDays && ` · ${trip.durationDays} days`}
                </p>
              </div>
              <Share2 className="h-4 w-4 text-sand-300" />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
