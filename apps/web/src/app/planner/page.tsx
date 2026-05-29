'use client';

import { useQuery, useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { api } from '@/lib/api';
import { usePlannerStore } from '@/store/planner-store';
import { useAuthStore } from '@/store/auth-store';
import { PlanResults } from '@/components/planner/plan-results';
import { CheckCircle2, ChevronRight } from 'lucide-react';
import { TRAVEL_PURPOSES } from '@/lib/travel-purpose';

interface Country {
  code: string;
  name: string;
  flagEmoji: string | null;
}

const STEPS = ['Route', 'Dates & travelers', 'Budget & passport', 'Review'];

export default function PlannerPage() {
  const router = useRouter();
  const { step, form, plan, setStep, updateForm, setPlan, reset } = usePlannerStore();
  const { token, user } = useAuthStore();

  const { data: countries = [] } = useQuery({
    queryKey: ['countries'],
    queryFn: () => api<Country[]>('/countries'),
  });

  const generateMutation = useMutation({
    mutationFn: () =>
      api('/planner/generate', {
        method: 'POST',
        body: JSON.stringify({
          originCountryCode: form.originCountryCode,
          destinationCountryCode: form.destinationCountryCode,
          originCity: form.originCity,
          destinationCity: form.destinationCity,
          startDate: form.startDate,
          durationDays: form.durationDays,
          budgetTier: form.budgetTier,
          purpose: form.purpose,
          travelerCount: form.travelerCount,
          passportValidMonths: form.passportValidMonths,
        }),
      }),
    onSuccess: (data) => {
      setPlan(data);
      setStep(4);
    },
  });

  const saveMutation = useMutation({
    mutationFn: () => {
      if (!token) throw new Error('auth');
      const origin = countries.find((c) => c.code === form.originCountryCode);
      const dest = countries.find((c) => c.code === form.destinationCountryCode);
      return api('/trips', {
        method: 'POST',
        token,
        body: JSON.stringify({
          title: `${origin?.name || form.originCountryCode} to ${dest?.name || form.destinationCountryCode}`,
          ...form,
        }),
      });
    },
    onSuccess: () => router.push('/dashboard'),
  });

  if (plan && step === 4) {
    return (
      <div className="mx-auto max-w-4xl px-5 py-12 md:px-8">
        <PlanResults plan={plan as Record<string, unknown>} />
        <div className="mt-8 flex flex-wrap gap-3">
          {user && token ? (
            <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
              Save to my trips
            </Button>
          ) : (
            <Button onClick={() => router.push('/register')}>Sign up to save</Button>
          )}
          <Button variant="outline" onClick={() => { reset(); setStep(0); }}>
            Plan another trip
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-5 py-12 md:px-8">
      <p className="text-sm font-medium uppercase tracking-wider text-ocean-600">Trip planner</p>
      <h1 className="editorial-heading mt-2 text-3xl font-semibold text-sand-900">Build your travel plan</h1>

      <div className="mt-8 flex gap-2">
        {STEPS.map((s, i) => (
          <div
            key={s}
            className={`flex-1 border-b-2 pb-2 text-xs ${i <= step ? 'border-ocean-600 text-ocean-700' : 'border-sand-200 text-sand-300'}`}
          >
            {s}
          </div>
        ))}
      </div>

      <div className="card-elevated mt-8 p-6 md:p-8">
        {step === 0 && (
          <div className="space-y-6">
            <div>
              <Label>Home country</Label>
              <Select
                value={form.originCountryCode}
                onValueChange={(v) => updateForm({ originCountryCode: v })}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Select country" />
                </SelectTrigger>
                <SelectContent>
                  {countries.map((c) => (
                    <SelectItem key={c.code} value={c.code}>
                      {c.flagEmoji} {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Home city (optional)</Label>
              <Input
                className="mt-2"
                placeholder="e.g. Mumbai"
                value={form.originCity || ''}
                onChange={(e) => updateForm({ originCity: e.target.value })}
              />
            </div>
            <div>
              <Label>Destination country</Label>
              <Select
                value={form.destinationCountryCode}
                onValueChange={(v) => updateForm({ destinationCountryCode: v })}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Select destination" />
                </SelectTrigger>
                <SelectContent>
                  {countries.map((c) => (
                    <SelectItem key={c.code} value={c.code}>
                      {c.flagEmoji} {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Destination city (optional)</Label>
              <Input
                className="mt-2"
                placeholder="e.g. Paris"
                value={form.destinationCity || ''}
                onChange={(e) => updateForm({ destinationCity: e.target.value })}
              />
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-6">
            <div>
              <Label>Departure date</Label>
              <Input
                type="date"
                className="mt-2"
                value={form.startDate || ''}
                onChange={(e) => updateForm({ startDate: e.target.value })}
              />
            </div>
            <div>
              <Label>Trip duration (days)</Label>
              <Input
                type="number"
                min={1}
                className="mt-2"
                value={form.durationDays || ''}
                onChange={(e) => updateForm({ durationDays: Number(e.target.value) })}
              />
            </div>
            <div>
              <Label>Number of travelers</Label>
              <Input
                type="number"
                min={1}
                className="mt-2"
                value={form.travelerCount || 1}
                onChange={(e) => updateForm({ travelerCount: Number(e.target.value) })}
              />
            </div>
            <div>
              <Label>Travel purpose</Label>
              <Select
                value={form.purpose || 'TOURISM'}
                onValueChange={(v) => updateForm({ purpose: v })}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TRAVEL_PURPOSES.map((p) => (
                    <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div>
              <Label>Budget style</Label>
              <Select
                value={form.budgetTier || 'MODERATE'}
                onValueChange={(v) => updateForm({ budgetTier: v as 'LOW' | 'MODERATE' | 'LUXURY' })}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="LOW">Essential</SelectItem>
                  <SelectItem value="MODERATE">Comfort</SelectItem>
                  <SelectItem value="LUXURY">Premium</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Passport validity remaining (months)</Label>
              <Input
                type="number"
                min={0}
                className="mt-2"
                placeholder="e.g. 8"
                value={form.passportValidMonths ?? ''}
                onChange={(e) => updateForm({ passportValidMonths: Number(e.target.value) })}
              />
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4 text-sm">
            <p className="font-medium text-sand-900">Review your trip</p>
            <ul className="space-y-2 text-sand-800/70">
              <li className="flex gap-2"><CheckCircle2 className="h-4 w-4 text-ocean-600" /> {form.originCountryCode} → {form.destinationCountryCode}</li>
              {form.startDate && <li>Departure: {form.startDate}</li>}
              {form.durationDays && <li>Duration: {form.durationDays} days</li>}
              <li>Purpose: {TRAVEL_PURPOSES.find((p) => p.value === form.purpose)?.label || form.purpose || 'Tourism'}</li>
              <li>Budget: {form.budgetTier || 'MODERATE'}</li>
            </ul>
          </div>
        )}

        <div className="mt-8 flex justify-between">
          {step > 0 ? (
            <Button variant="ghost" onClick={() => setStep(step - 1)}>Back</Button>
          ) : (
            <span />
          )}
          {step < 3 ? (
            <Button
              onClick={() => setStep(step + 1)}
              disabled={step === 0 && (!form.originCountryCode || !form.destinationCountryCode)}
            >
              Continue <ChevronRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={() => generateMutation.mutate()} disabled={generateMutation.isPending}>
              {generateMutation.isPending ? 'Generating...' : 'Generate plan'}
            </Button>
          )}
        </div>

        {generateMutation.isError && (
          <p className="mt-4 text-sm text-red-600">Could not generate plan. Is the API running?</p>
        )}
      </div>
    </div>
  );
}
