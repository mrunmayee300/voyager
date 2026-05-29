import { Router } from 'express';
import { z } from 'zod';
import * as visaService from '../services/visa.service';

export const visaRouter = Router();

const querySchema = z.object({
  origin: z.string().length(3),
  destination: z.string().length(3),
  purpose: z
    .enum(['TOURISM', 'BUSINESS', 'STUDY', 'FAMILY', 'TRANSIT', 'OTHER'])
    .optional()
    .default('TOURISM'),
});

visaRouter.get('/requirements', async (req, res, next) => {
  try {
    const { origin, destination, purpose } = querySchema.parse(req.query);
    const result = await visaService.getVisaRequirement(origin, destination, purpose);
    res.json(result);
  } catch (e) {
    next(e);
  }
});
