'use client';

import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { api } from '@/lib/api';
import { ArrowRightLeft } from 'lucide-react';

export default function CurrencyPage() {
  const [amount, setAmount] = useState('100');
  const [from, setFrom] = useState('USD');
  const [to, setTo] = useState('EUR');
  const [convert, setConvert] = useState(false);

  const { data: rates } = useQuery({
    queryKey: ['rates'],
    queryFn: () => api<{ base: string; rates: Array<{ currency: string; rate: number }>; tips: string[] }>('/currency/rates'),
  });

  const { data: conversion } = useQuery({
    queryKey: ['convert', amount, from, to],
    queryFn: () =>
      api<{ converted: number; rate: number }>(
        `/currency/convert?amount=${amount}&from=${from}&to=${to}`,
      ),
    enabled: convert && Number(amount) > 0,
  });

  return (
    <div className="mx-auto max-w-3xl px-5 py-12 md:px-8">
      <p className="text-sm font-medium uppercase tracking-wider text-ocean-600">Forex</p>
      <h1 className="editorial-heading mt-2 text-3xl font-semibold text-sand-900">Currency assistant</h1>

      <div className="card-elevated mt-8 p-6">
        <h2 className="font-display font-semibold flex items-center gap-2">
          <ArrowRightLeft className="h-5 w-5 text-ocean-600" /> Convert
        </h2>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div>
            <Label>Amount</Label>
            <Input className="mt-2" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} />
          </div>
          <div>
            <Label>From</Label>
            <Input className="mt-2" value={from} onChange={(e) => setFrom(e.target.value.toUpperCase())} maxLength={3} />
          </div>
          <div>
            <Label>To</Label>
            <Input className="mt-2" value={to} onChange={(e) => setTo(e.target.value.toUpperCase())} maxLength={3} />
          </div>
        </div>
        <Button className="mt-4" onClick={() => setConvert(true)}>Convert</Button>
        {conversion && (
          <p className="mt-6 text-2xl font-semibold text-ocean-800">
            {amount} {from} = {conversion.converted} {to}
            <span className="block text-sm font-normal text-sand-800/50">Rate: {conversion.rate}</span>
          </p>
        )}
      </div>

      <div className="card-elevated mt-6 p-6">
        <h2 className="font-display font-semibold">Live rates (USD base)</h2>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {rates?.rates.map((r) => (
            <div key={r.currency} className="rounded-md bg-sand-50 p-3 text-center">
              <p className="text-xs text-sand-800/50">{r.currency}</p>
              <p className="font-medium">{r.rate}</p>
            </div>
          ))}
        </div>
        <ul className="mt-6 space-y-2 text-sm text-sand-800/60">
          {rates?.tips.map((t) => <li key={t}>· {t}</li>)}
        </ul>
      </div>
    </div>
  );
}
