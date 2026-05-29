import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { cacheGet, cacheSet } from '../lib/redis';

export const currencyRouter = Router();

currencyRouter.get('/rates', async (req, res, next) => {
  try {
    const base = (req.query.base as string)?.toUpperCase() || 'USD';
    const cacheKey = `rates:${base}`;
    const cached = await cacheGet<unknown>(cacheKey);
    if (cached) return res.json(cached);

    const rates = await prisma.currencyRate.findMany({
      where: { base },
      orderBy: { target: 'asc' },
    });

    const payload = {
      base,
      rates: rates.map((r) => ({ currency: r.target, rate: r.rate, updatedAt: r.fetchedAt })),
      tips: [
        'Multi-currency forex cards often beat airport exchange rates',
        'Withdraw from bank ATMs affiliated with major networks',
        'Keep receipts for expense tracking and VAT refunds where applicable',
      ],
    };

    await cacheSet(cacheKey, payload, 300);
    res.json(payload);
  } catch (e) {
    next(e);
  }
});

const convertSchema = z.object({
  amount: z.coerce.number().positive(),
  from: z.string().length(3),
  to: z.string().length(3),
});

currencyRouter.get('/convert', async (req, res, next) => {
  try {
    const { amount, from, to } = convertSchema.parse(req.query);
    const fromU = from.toUpperCase();
    const toU = to.toUpperCase();

    if (fromU === toU) {
      return res.json({ amount, from: fromU, to: toU, rate: 1, converted: amount });
    }

    let rate: number | null = null;

    if (fromU === 'USD') {
      const r = await prisma.currencyRate.findUnique({
        where: { base_target: { base: 'USD', target: toU } },
      });
      rate = r?.rate ?? null;
    } else if (toU === 'USD') {
      const r = await prisma.currencyRate.findUnique({
        where: { base_target: { base: 'USD', target: fromU } },
      });
      rate = r ? 1 / r.rate : null;
    } else {
      const fromRate = await prisma.currencyRate.findUnique({
        where: { base_target: { base: 'USD', target: fromU } },
      });
      const toRate = await prisma.currencyRate.findUnique({
        where: { base_target: { base: 'USD', target: toU } },
      });
      if (fromRate && toRate) rate = toRate.rate / fromRate.rate;
    }

    if (!rate) return res.status(404).json({ error: 'Rate not available' });

    const converted = Math.round(amount * rate * 100) / 100;
    res.json({ amount, from: fromU, to: toU, rate, converted });
  } catch (e) {
    next(e);
  }
});

currencyRouter.post('/spending-estimate', async (req, res, next) => {
  try {
    const { days = 7, tier = 'MODERATE', destinationCurrency = 'EUR' } = req.body;
    const daily = { LOW: 45, MODERATE: 95, LUXURY: 220 };
    const perDay = daily[tier as keyof typeof daily] || daily.MODERATE;
    const totalUsd = perDay * days;

    res.json({
      days,
      tier,
      dailyUsd: perDay,
      totalUsd,
      destinationCurrency,
      categories: [
        { name: 'Food', percent: 35 },
        { name: 'Transport', percent: 20 },
        { name: 'Activities', percent: 25 },
        { name: 'Shopping', percent: 20 },
      ],
      warnings: ['Airport exchange counters typically charge 8–15% more than ATMs'],
    });
  } catch (e) {
    next(e);
  }
});
