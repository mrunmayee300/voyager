import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { cacheGet, cacheSet } from '../lib/redis';

export const countriesRouter = Router();

countriesRouter.get('/', async (_req, res, next) => {
  try {
    const cached = await cacheGet<unknown[]>('countries:all');
    if (cached) return res.json(cached);

    const countries = await prisma.country.findMany({
      orderBy: { name: 'asc' },
      select: {
        id: true,
        code: true,
        name: true,
        region: true,
        currency: true,
        flagEmoji: true,
      },
    });
    await cacheSet('countries:all', countries, 3600);
    res.json(countries);
  } catch (e) {
    next(e);
  }
});

countriesRouter.get('/:code/cities', async (req, res, next) => {
  try {
    const country = await prisma.country.findUnique({
      where: { code: req.params.code.toUpperCase() },
    });
    if (!country) return res.status(404).json({ error: 'Country not found' });

    const cities = await prisma.city.findMany({
      where: { countryId: country.id },
      orderBy: { name: 'asc' },
    });
    res.json(cities);
  } catch (e) {
    next(e);
  }
});
