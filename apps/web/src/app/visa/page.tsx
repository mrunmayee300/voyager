'use client';

import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { api } from '@/lib/api';
import { Clock, ExternalLink, FileText, Shield } from 'lucide-react';
import { TRAVEL_PURPOSES, type TravelPurposeValue } from '@/lib/travel-purpose';

interface Country {
  code: string;
  name: string;
  flagEmoji: string | null;
}

interface VisaResult {
  found: boolean;
  requirement: {
    label: string;
    type: string;
    maxStayDays?: number;
    processing?: { minDays?: number; maxDays?: number };
    feeUsd?: number;
    documents?: string[];
    steps?: string[];
    interviewRequired?: boolean;
    sourceUrl?: string;
    confidence?: number;
    interviewTips?: string[];
    successFactors?: string[];
    purposeLabel?: string;
    visaCategoryLabel?: string;
    purposeDescription?: string;
    origin?: { name: string; flagEmoji?: string };
    destination?: { name: string; flagEmoji?: string };
  };
  purpose?: string;
}

export default function VisaPage() {
  const [origin, setOrigin] = useState('IND');
  const [destination, setDestination] = useState('FRA');
  const [purpose, setPurpose] = useState<TravelPurposeValue>('TOURISM');
  const [search, setSearch] = useState(false);

  const { data: countries = [] } = useQuery({
    queryKey: ['countries'],
    queryFn: () => api<Country[]>('/countries'),
  });

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['visa', origin, destination, purpose],
    queryFn: () =>
      api<VisaResult>(
        `/visa/requirements?origin=${origin}&destination=${destination}&purpose=${purpose}`,
      ),
    enabled: search,
  });

  const req = data?.requirement;

  return (
    <div className="mx-auto max-w-3xl px-5 py-12 md:px-8">
      <p className="text-sm font-medium uppercase tracking-wider text-ocean-600">Visa engine</p>
      <h1 className="editorial-heading mt-2 text-3xl font-semibold text-sand-900">Visa requirements</h1>
      <p className="mt-3 text-sand-800/70">
        Requirements change by travel purpose — tourism, study, business, and more.
      </p>

      <div className="card-elevated mt-8 grid gap-4 p-6 md:grid-cols-2">
        <div>
          <Label>Your passport country</Label>
          <Select value={origin} onValueChange={setOrigin}>
            <SelectTrigger className="mt-2"><SelectValue /></SelectTrigger>
            <SelectContent>
              {countries.map((c) => (
                <SelectItem key={c.code} value={c.code}>{c.flagEmoji} {c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Destination</Label>
          <Select value={destination} onValueChange={setDestination}>
            <SelectTrigger className="mt-2"><SelectValue /></SelectTrigger>
            <SelectContent>
              {countries.map((c) => (
                <SelectItem key={c.code} value={c.code}>{c.flagEmoji} {c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="md:col-span-2">
          <Label>Travel purpose</Label>
          <Select value={purpose} onValueChange={(v) => setPurpose(v as TravelPurposeValue)}>
            <SelectTrigger className="mt-2"><SelectValue /></SelectTrigger>
            <SelectContent>
              {TRAVEL_PURPOSES.map((p) => (
                <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="md:col-span-2">
          <Button className="w-full" onClick={() => setSearch(true)} disabled={isLoading || isFetching}>
            Check requirements
          </Button>
        </div>
      </div>

      {search && data && (
        <div className="mt-8 space-y-6">
          <div className="card-elevated p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-sm text-sand-800/50">
                  {req?.origin?.flagEmoji} {req?.origin?.name} → {req?.destination?.flagEmoji} {req?.destination?.name}
                </p>
                {req?.purposeLabel && (
                  <span className="mt-2 inline-block rounded-full bg-ocean-50 px-3 py-1 text-xs font-medium text-ocean-700">
                    {req.purposeLabel}
                  </span>
                )}
                <h2 className="editorial-heading mt-2 text-2xl font-semibold">{req?.label}</h2>
                {req?.purposeDescription && (
                  <p className="mt-2 text-sm text-sand-800/60">{req.purposeDescription}</p>
                )}
              </div>
              {req?.confidence && (
                <span className="rounded-full bg-sand-100 px-3 py-1 text-xs">
                  {Math.round(req.confidence * 100)}% confidence
                </span>
              )}
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              <div className="flex gap-3 rounded-md bg-sand-50 p-4">
                <Clock className="h-5 w-5 text-ocean-600" />
                <div>
                  <p className="text-xs text-sand-800/50">Processing</p>
                  <p className="text-sm font-medium">
                    {req?.processing?.minDays ?? 0}–{req?.processing?.maxDays ?? '?'} days
                  </p>
                </div>
              </div>
              <div className="flex gap-3 rounded-md bg-sand-50 p-4">
                <FileText className="h-5 w-5 text-ocean-600" />
                <div>
                  <p className="text-xs text-sand-800/50">Fee (approx)</p>
                  <p className="text-sm font-medium">${req?.feeUsd ?? 0} USD</p>
                </div>
              </div>
              <div className="flex gap-3 rounded-md bg-sand-50 p-4">
                <Shield className="h-5 w-5 text-ocean-600" />
                <div>
                  <p className="text-xs text-sand-800/50">Max stay</p>
                  <p className="text-sm font-medium">{req?.maxStayDays ? `${req.maxStayDays} days` : 'Varies'}</p>
                </div>
              </div>
            </div>

            {req?.sourceUrl && (
              <a
                href={req.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center gap-1 text-sm text-ocean-700 hover:underline"
              >
                Official source <ExternalLink className="h-3.5 w-3.5" />
              </a>
            )}
          </div>

          <div className="card-elevated p-6">
            <h3 className="font-display font-semibold">Documents checklist</h3>
            <ul className="mt-4 space-y-2">
              {req?.documents?.map((d) => (
                <li key={d} className="flex items-start gap-3 text-sm">
                  <input type="checkbox" className="mt-0.5" />
                  {d}
                </li>
              ))}
            </ul>
          </div>

          <div className="card-elevated p-6">
            <h3 className="font-display font-semibold">Application steps</h3>
            <ol className="mt-4 space-y-3">
              {req?.steps?.map((s, i) => (
                <li key={s} className="flex gap-3 text-sm">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-ocean-50 text-xs font-medium text-ocean-700">
                    {i + 1}
                  </span>
                  {s}
                </li>
              ))}
            </ol>
          </div>

          {req?.successFactors && req.successFactors.length > 0 && (
            <div className="card-elevated p-6">
              <h3 className="font-display font-semibold">Approval factors for {req.purposeLabel || 'your trip'}</h3>
              <ul className="mt-3 space-y-1 text-sm text-sand-800/70">
                {req.successFactors.map((t) => <li key={t}>· {t}</li>)}
              </ul>
            </div>
          )}

          {req?.interviewTips && req.interviewTips.length > 0 && (
            <div className="card-elevated p-6">
              <h3 className="font-display font-semibold">Interview preparation</h3>
              <ul className="mt-3 space-y-1 text-sm text-sand-800/70">
                {req.interviewTips.map((t) => <li key={t}>· {t}</li>)}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
