import { Router } from 'express';
import { z } from 'zod';
import * as tripsService from '../services/trips.service';
import { requireAuth } from '../middleware/auth';

export const tripsRouter = Router();

const createTripSchema = z.object({
  title: z.string().min(1),
  originCountryCode: z.string().length(3),
  destinationCountryCode: z.string().length(3),
  originCity: z.string().optional(),
  destinationCity: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  durationDays: z.coerce.number().int().positive().optional(),
  budgetTier: z.enum(['LOW', 'MODERATE', 'LUXURY']).optional(),
  budgetAmount: z.coerce.number().optional(),
  purpose: z.enum(['TOURISM', 'BUSINESS', 'STUDY', 'FAMILY', 'TRANSIT', 'OTHER']).optional(),
  travelerCount: z.coerce.number().int().positive().optional(),
  passportValidMonths: z.coerce.number().int().optional(),
});

tripsRouter.get('/shared/:token', async (req, res, next) => {
  try {
    const trip = await tripsService.getSharedTrip(req.params.token);
    res.json(trip);
  } catch (e) {
    next(e);
  }
});

tripsRouter.use(requireAuth);

tripsRouter.get('/', async (req, res, next) => {
  try {
    const trips = await tripsService.getUserTrips(req.user!.userId);
    res.json(trips);
  } catch (e) {
    next(e);
  }
});

tripsRouter.post('/', async (req, res, next) => {
  try {
    const data = createTripSchema.parse(req.body);
    const trip = await tripsService.createTrip(req.user!.userId, data);
    res.status(201).json(trip);
  } catch (e) {
    next(e);
  }
});

tripsRouter.get('/:id', async (req, res, next) => {
  try {
    const trip = await tripsService.getTripById(req.user!.userId, req.params.id);
    res.json(trip);
  } catch (e) {
    next(e);
  }
});

tripsRouter.patch('/:id', async (req, res, next) => {
  try {
    const trip = await tripsService.updateTrip(req.user!.userId, req.params.id, req.body);
    res.json(trip);
  } catch (e) {
    next(e);
  }
});

tripsRouter.delete('/:id', async (req, res, next) => {
  try {
    await tripsService.deleteTrip(req.user!.userId, req.params.id);
    res.json({ success: true });
  } catch (e) {
    next(e);
  }
});

tripsRouter.post('/:id/share', async (req, res, next) => {
  try {
    const result = await tripsService.enableTripSharing(req.user!.userId, req.params.id);
    res.json(result);
  } catch (e) {
    next(e);
  }
});
