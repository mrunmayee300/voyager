'use client';

import Link from 'next/link';
import { CheckCircle2, Clock, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function VisaDemo() {
  return (
    <section className="section-padding bg-sand-100/50">
      <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-2">
        <div>
          <p className="text-sm font-medium uppercase tracking-wider text-ocean-600">Visa engine</p>
          <h2 className="editorial-heading mt-3 text-3xl font-semibold text-sand-900 md:text-4xl">
            Know exactly what you need before you apply
          </h2>
          <p className="mt-4 text-sand-800/70 leading-relaxed">
            Country-to-country rules, document checklists, processing estimates, and embassy links —
            presented as a timeline you can actually follow.
          </p>
          <Link href="/visa" className="mt-8 inline-block">
            <Button>Explore visa planner</Button>
          </Link>
        </div>

        <div className="card-elevated p-6 md:p-8">
          <div className="flex items-center justify-between border-b border-sand-100 pb-4">
            <div>
              <p className="text-xs text-sand-800/50">Route</p>
              <p className="font-display text-lg font-semibold">India → France</p>
            </div>
            <span className="rounded-full bg-ocean-50 px-3 py-1 text-xs font-medium text-ocean-700">
              Schengen visa
            </span>
          </div>

          <div className="mt-6 space-y-4">
            <div className="flex gap-3">
              <Clock className="h-5 w-5 shrink-0 text-ocean-600" />
              <div>
                <p className="text-sm font-medium">Processing: 15–30 days</p>
                <p className="text-xs text-sand-800/60">Apply at least 45 days before departure</p>
              </div>
            </div>
            <div className="flex gap-3">
              <FileText className="h-5 w-5 shrink-0 text-ocean-600" />
              <div>
                <p className="text-sm font-medium">7 documents required</p>
                <ul className="mt-2 space-y-1.5">
                  {['Valid passport (6+ months)', 'Schengen application form', 'Travel insurance €30k+'].map((d) => (
                    <li key={d} className="flex items-start gap-2 text-xs text-sand-800/70">
                      <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 text-ocean-500" />
                      {d}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <p className="mt-6 text-xs text-sand-800/40">
            Confidence: 90% · Source: official embassy guidelines
          </p>
        </div>
      </div>
    </section>
  );
}
