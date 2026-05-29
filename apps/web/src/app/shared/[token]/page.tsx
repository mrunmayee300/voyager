'use client';

import { useQuery } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import { api } from '@/lib/api';
import { PlanResults } from '@/components/planner/plan-results';

export default function SharedTripPage() {
  const { token } = useParams<{ token: string }>();

  const { data: trip, isLoading } = useQuery({
    queryKey: ['shared', token],
    queryFn: () => api<Record<string, unknown>>(`/trips/shared/${token}`),
    enabled: !!token,
  });

  if (isLoading) return <div className="p-12 text-center text-sand-800/50">Loading shared plan...</div>;
  if (!trip) return <div className="p-12 text-center">Shared trip not found or link expired.</div>;

  const plan = {
    meta: { origin: trip.originCountry, destination: trip.destinationCountry },
    visa: trip.visaSummary,
    budget: trip.budgetBreakdown,
    timeline: trip.timeline,
    checklist: trip.checklist,
    passportCheck: { status: 'ok', message: 'Shared travel plan' },
  };

  return (
    <div className="mx-auto max-w-4xl px-5 py-12 md:px-8">
      <p className="mb-4 text-sm text-sand-800/50">Shared travel plan</p>
      <PlanResults plan={plan} />
    </div>
  );
}
