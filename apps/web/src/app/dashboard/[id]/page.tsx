'use client';

import { useQuery, useMutation } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/auth-store';
import { PlanResults } from '@/components/planner/plan-results';

export default function TripDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { token } = useAuthStore();

  const { data: trip, isLoading } = useQuery({
    queryKey: ['trip', id],
    queryFn: () => api<Record<string, unknown>>(`/trips/${id}`, { token: token! }),
    enabled: !!token && !!id,
  });

  const shareMutation = useMutation({
    mutationFn: () =>
      api<{ shareToken: string }>(`/trips/${id}/share`, { method: 'POST', token: token! }),
    onSuccess: (data) => {
      const url = `${window.location.origin}/shared/${data.shareToken}`;
      navigator.clipboard.writeText(url);
      alert('Share link copied to clipboard');
    },
  });

  if (isLoading) return <div className="p-12 text-center text-sand-800/50">Loading trip...</div>;
  if (!trip) return <div className="p-12 text-center">Trip not found</div>;

  const plan = {
    meta: {
      origin: trip.originCountry,
      destination: trip.destinationCountry,
    },
    visa: trip.visaSummary,
    budget: trip.budgetBreakdown,
    timeline: trip.timeline,
    checklist: trip.checklist,
    passportCheck: { status: 'ok', message: 'Saved trip plan' },
  };

  return (
    <div className="mx-auto max-w-4xl px-5 py-12 md:px-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="editorial-heading text-2xl font-semibold">{trip.title as string}</h1>
        <Button variant="outline" size="sm" onClick={() => shareMutation.mutate()}>
          Share trip
        </Button>
      </div>
      <PlanResults plan={plan} />
    </div>
  );
}
