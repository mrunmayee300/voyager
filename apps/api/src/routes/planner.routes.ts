import { Router } from 'express';
import { z } from 'zod';
import { generateTravelPlan } from '../services/planner.service';

export const plannerRouter = Router();

const planSchema = z.object({
  originCountryCode: z.string().length(3),
  destinationCountryCode: z.string().length(3),
  originCity: z.string().optional(),
  destinationCity: z.string().optional(),
  startDate: z.string().optional(),
  durationDays: z.coerce.number().int().positive().optional(),
  budgetTier: z.enum(['LOW', 'MODERATE', 'LUXURY']).optional(),
  budgetAmount: z.coerce.number().optional(),
  purpose: z.enum(['TOURISM', 'BUSINESS', 'STUDY', 'FAMILY', 'TRANSIT', 'OTHER']).optional(),
  travelerCount: z.coerce.number().int().positive().optional(),
  passportValidMonths: z.coerce.number().int().optional(),
});

plannerRouter.post('/generate', async (req, res, next) => {
  try {
    const input = planSchema.parse(req.body);
    const plan = await generateTravelPlan(input);
    res.json(plan);
  } catch (e) {
    next(e);
  }
});
