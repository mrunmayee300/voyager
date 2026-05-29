'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface PlanResultsProps {
  plan: Record<string, unknown>;
}

export function PlanResults({ plan }: PlanResultsProps) {
  const [expandedBudget, setExpandedBudget] = useState(false);
  const meta = plan.meta as {
    origin?: { name: string };
    destination?: { name: string };
    purposeLabel?: string;
  };
  const visa = plan.visa as {
    requirement?: {
      label?: string;
      documents?: string[];
      purposeLabel?: string;
      purposeDescription?: string;
      visaCategoryLabel?: string;
    };
  };
  const budget = plan.budget as {
    totals?: { low: number; moderate: number; luxury: number };
    items?: Array<{ label: string; low: number; mid: number; high: number }>;
  };
  const timeline = plan.timeline as Array<{ daysBefore: number; title: string; tasks: string[] }>;
  const checklist = plan.checklist as Array<{ label: string; category: string }>;
  const passportCheck = plan.passportCheck as { status: string; message: string };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="editorial-heading text-3xl font-semibold text-sand-900">
          {meta?.origin?.name} → {meta?.destination?.name}
        </h1>
        <p className="mt-2 text-sand-800/60">
          {meta?.purposeLabel ? `${meta.purposeLabel} · ` : ''}Your personalized travel plan
        </p>
      </div>

      <div className="card-elevated p-6">
        <h2 className="font-display text-lg font-semibold">Visa requirements</h2>
        {visa?.requirement?.purposeLabel && (
          <span className="mt-2 inline-block rounded-full bg-ocean-50 px-3 py-1 text-xs font-medium text-ocean-700">
            {visa.requirement.purposeLabel}
          </span>
        )}
        <p className="mt-2 text-ocean-700 font-medium">{visa?.requirement?.label || 'Check embassy'}</p>
        {visa?.requirement?.purposeDescription && (
          <p className="mt-2 text-sm text-sand-800/60">{visa.requirement.purposeDescription}</p>
        )}
        <ul className="mt-4 space-y-1.5">
          {(visa?.requirement?.documents || []).map((d) => (
            <li key={d} className="text-sm text-sand-800/70">· {d}</li>
          ))}
        </ul>
      </div>

      <div className={`card-elevated p-6 border-l-4 ${
        passportCheck?.status === 'ok' ? 'border-green-500' :
        passportCheck?.status === 'critical' ? 'border-red-500' : 'border-amber-500'
      }`}>
        <h2 className="font-display text-lg font-semibold">Passport check</h2>
        <p className="mt-2 text-sm text-sand-800/70">{passportCheck?.message}</p>
      </div>

      <div className="card-elevated p-6">
        <button
          type="button"
          className="flex w-full items-center justify-between"
          onClick={() => setExpandedBudget(!expandedBudget)}
        >
          <h2 className="font-display text-lg font-semibold">Budget estimate</h2>
          {expandedBudget ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
        </button>
        <div className="mt-4 grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-xs text-sand-800/50">Essential</p>
            <p className="text-xl font-semibold">${budget?.totals?.low?.toLocaleString()}</p>
          </div>
          <div className="rounded-md bg-ocean-50 py-2">
            <p className="text-xs text-ocean-700">Comfort</p>
            <p className="text-xl font-semibold text-ocean-800">${budget?.totals?.moderate?.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-xs text-sand-800/50">Premium</p>
            <p className="text-xl font-semibold">${budget?.totals?.luxury?.toLocaleString()}</p>
          </div>
        </div>
        {expandedBudget && (
          <div className="mt-6 space-y-2 border-t border-sand-100 pt-4">
            {budget?.items?.map((item) => (
              <div key={item.label} className="flex justify-between text-sm">
                <span className="text-sand-800/70">{item.label}</span>
                <span>${item.mid.toLocaleString()}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="card-elevated p-6">
        <h2 className="font-display text-lg font-semibold">Timeline</h2>
        <div className="mt-6 space-y-6 border-l border-sand-200 pl-6">
          {timeline?.map((m) => (
            <div key={m.daysBefore} className="relative">
              <span className="absolute -left-[1.6rem] top-1 h-2.5 w-2.5 rounded-full bg-ocean-600" />
              <p className="text-xs font-medium text-ocean-600">{m.daysBefore} days before</p>
              <p className="font-medium text-sand-900">{m.title}</p>
              <ul className="mt-1 space-y-0.5">
                {m.tasks.map((t) => (
                  <li key={t} className="text-sm text-sand-800/60">· {t}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="card-elevated p-6">
        <h2 className="font-display text-lg font-semibold">Checklist</h2>
        <ul className="mt-4 divide-y divide-sand-100">
          {checklist?.map((item, i) => (
            <li key={i} className="flex items-center gap-3 py-3 text-sm">
              <input type="checkbox" className="h-4 w-4 rounded border-sand-300" />
              <span>{item.label}</span>
              <span className="ml-auto text-xs text-sand-300">{item.category}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
