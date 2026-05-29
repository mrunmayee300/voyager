import { randomBytes } from 'crypto';
import { BudgetTier, TravelPurpose, TripStatus } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { AppError } from '../lib/errors';
import { generateTravelPlan } from './planner.service';

export async function createTrip(
  userId: string,
  data: {
    title: string;
    originCountryCode: string;
    destinationCountryCode: string;
    originCity?: string;
    destinationCity?: string;
    startDate?: string;
    endDate?: string;
    durationDays?: number;
    budgetTier?: BudgetTier;
    budgetAmount?: number;
    purpose?: TravelPurpose;
    travelerCount?: number;
    passportValidMonths?: number;
  },
) {
  const origin = await prisma.country.findUnique({
    where: { code: data.originCountryCode.toUpperCase() },
  });
  const destination = await prisma.country.findUnique({
    where: { code: data.destinationCountryCode.toUpperCase() },
  });
  if (!origin || !destination) throw new AppError('Invalid country', 400);

  const plan = await generateTravelPlan({
    originCountryCode: origin.code,
    destinationCountryCode: destination.code,
    originCity: data.originCity,
    destinationCity: data.destinationCity,
    startDate: data.startDate,
    durationDays: data.durationDays,
    budgetTier: data.budgetTier,
    purpose: data.purpose,
    travelerCount: data.travelerCount,
    passportValidMonths: data.passportValidMonths,
  });

  const trip = await prisma.trip.create({
    data: {
      userId,
      title: data.title,
      status: 'PLANNING',
      purpose: data.purpose || 'TOURISM',
      originCountryId: origin.id,
      destinationCountryId: destination.id,
      startDate: data.startDate ? new Date(data.startDate) : null,
      endDate: data.endDate ? new Date(data.endDate) : null,
      durationDays: data.durationDays,
      budgetTier: data.budgetTier || 'MODERATE',
      budgetAmount: data.budgetAmount,
      travelerCount: data.travelerCount || 1,
      passportValidMonths: data.passportValidMonths,
      checklist: plan.checklist,
      timeline: plan.timeline,
      visaSummary: plan.visa,
      budgetBreakdown: plan.budget,
      weatherSnapshot: plan.weather,
      safetyNotices: plan.safety,
      culturalTips: plan.culturalTips,
    },
    include: tripInclude,
  });

  if (plan.budget?.items) {
    await prisma.budgetItem.createMany({
      data: plan.budget.items.map(
        (item: { category: string; label: string; low: number; mid: number; high: number; currency: string }) => ({
          tripId: trip.id,
          category: item.category,
          label: item.label,
          amountLow: item.low,
          amountMid: item.mid,
          amountHigh: item.high,
          currency: item.currency,
        }),
      ),
    });
  }

  return getTripById(userId, trip.id);
}

export async function getUserTrips(userId: string, status?: TripStatus) {
  return prisma.trip.findMany({
    where: { userId, ...(status ? { status } : {}) },
    orderBy: { updatedAt: 'desc' },
    include: tripInclude,
  });
}

export async function getTripById(userId: string, tripId: string) {
  const trip = await prisma.trip.findFirst({
    where: { id: tripId, userId },
    include: {
      ...tripInclude,
      budgetItems: true,
      documents: true,
      itinerary: { orderBy: { sortOrder: 'asc' } },
    },
  });
  if (!trip) throw new AppError('Trip not found', 404);
  return trip;
}

export async function updateTrip(
  userId: string,
  tripId: string,
  data: Partial<{ title: string; status: TripStatus; checklist: unknown }>,
) {
  const existing = await prisma.trip.findFirst({ where: { id: tripId, userId } });
  if (!existing) throw new AppError('Trip not found', 404);

  return prisma.trip.update({
    where: { id: tripId },
    data,
    include: tripInclude,
  });
}

export async function deleteTrip(userId: string, tripId: string) {
  const existing = await prisma.trip.findFirst({ where: { id: tripId, userId } });
  if (!existing) throw new AppError('Trip not found', 404);
  await prisma.trip.delete({ where: { id: tripId } });
  return { success: true };
}

export async function enableTripSharing(userId: string, tripId: string) {
  const trip = await prisma.trip.findFirst({ where: { id: tripId, userId } });
  if (!trip) throw new AppError('Trip not found', 404);

  const shareToken = trip.shareToken || randomBytes(16).toString('hex');
  return prisma.trip.update({
    where: { id: tripId },
    data: { shareToken, isPublic: true },
    select: { id: true, shareToken: true, isPublic: true },
  });
}

export async function getSharedTrip(shareToken: string) {
  const trip = await prisma.trip.findFirst({
    where: { shareToken, isPublic: true },
    include: tripInclude,
  });
  if (!trip) throw new AppError('Shared trip not found', 404);
  return trip;
}

const tripInclude = {
  originCountry: { select: { code: true, name: true, flagEmoji: true, currency: true } },
  destinationCountry: { select: { code: true, name: true, flagEmoji: true, currency: true } },
  originCity: { select: { name: true } },
  destinationCity: { select: { name: true } },
};
