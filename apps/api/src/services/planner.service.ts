import { BudgetTier, TravelPurpose } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { getVisaRequirement } from './visa.service';
import {
  generatePurposeChecklist,
  generatePurposeTimeline,
  getPurposeProfile,
} from './visa-purpose.service';

interface PlanInput {
  originCountryCode: string;
  destinationCountryCode: string;
  originCity?: string;
  destinationCity?: string;
  startDate?: string;
  durationDays?: number;
  budgetTier?: BudgetTier;
  budgetAmount?: number;
  purpose?: TravelPurpose;
  travelerCount?: number;
  passportValidMonths?: number;
}

export async function generateTravelPlan(input: PlanInput) {
  const purpose = input.purpose || 'TOURISM';
  const profile = getPurposeProfile(purpose);

  const origin = await prisma.country.findUnique({
    where: { code: input.originCountryCode.toUpperCase() },
  });
  const destination = await prisma.country.findUnique({
    where: { code: input.destinationCountryCode.toUpperCase() },
  });

  if (!origin || !destination) {
    throw new Error('Invalid country codes');
  }

  const visa = await getVisaRequirement(origin.code, destination.code, purpose);
  const tier = input.budgetTier || 'MODERATE';
  const days = input.durationDays || 7;
  const travelers = input.travelerCount || 1;

  const budget = generateBudgetBreakdown(
    destination.currency,
    tier,
    days,
    travelers,
    purpose,
    visa.requirement?.feeUsd,
  );
  const timeline = generatePurposeTimeline(visa, input.startDate, purpose);
  const checklist = generatePurposeChecklist(visa, destination.name, purpose);
  const passportCheck = checkPassportValidity(input.passportValidMonths);

  return {
    meta: {
      origin: { code: origin.code, name: origin.name, flag: origin.flagEmoji },
      destination: { code: destination.code, name: destination.name, flag: destination.flagEmoji },
      durationDays: days,
      purpose,
      purposeLabel: profile.label,
      generatedAt: new Date().toISOString(),
    },
    visa,
    passportCheck,
    budget,
    timeline,
    checklist,
    transport: getTransportGuidance(purpose, destination.name, input.destinationCity),
    insurance: {
      recommended: true,
      coverage: profile.insuranceNote,
      estimateUsd: Math.round(
        (tier === 'LOW' ? 25 : tier === 'LUXURY' ? 120 : 55) *
          profile.budgetAdjustments.insuranceMultiplier,
      ),
    },
    weather: {
      note: 'Check forecast 7 days before departure',
      packing: getPackingTips(purpose),
    },
    safety: [
      'Register with your embassy smart traveler program if available',
      'Save local emergency numbers offline',
      'Share itinerary with a trusted contact',
    ],
    culturalTips: getCulturalTips(purpose, destination.name),
    accommodation: {
      suggestion: getAccommodationSuggestion(purpose, tier),
    },
  };
}

function getTransportGuidance(purpose: TravelPurpose, destinationName: string, city?: string) {
  const base = {
    airport: `Main international airport serving ${city || destinationName}`,
    local: ['Metro / rail where available', 'Ride-hailing apps', 'Prepaid transit cards'],
    sim: 'Purchase local eSIM or airport SIM for data on arrival',
  };

  if (purpose === 'STUDY') {
    return {
      ...base,
      local: ['Student transit pass if available', 'Campus shuttle info', 'Bike-share for campus area'],
      sim: 'Set up local SIM early — needed for university registration and banking',
    };
  }
  if (purpose === 'BUSINESS') {
    return {
      ...base,
      local: ['Corporate car service receipts for expense reports', 'Airport express to business district'],
    };
  }
  if (purpose === 'TRANSIT') {
    return {
      airport: `Transit airport — confirm terminal change and minimum connection time`,
      local: ['Remain in transit zone unless visa permits entry'],
      sim: 'Usually not required for short layovers',
    };
  }
  return base;
}

function getPackingTips(purpose: TravelPurpose): string[] {
  const common = ['Travel document folder (visa, passport, insurance)', 'Universal power adapter'];
  switch (purpose) {
    case 'STUDY':
      return [...common, 'Academic credentials (originals + copies)', 'Season-appropriate clothing for long stay', 'Prescription medications (3-month supply docs)'];
    case 'BUSINESS':
      return [...common, 'Business attire for meetings', 'Laptop and presentation materials', 'Expense tracking app or notebook'];
    case 'FAMILY':
      return [...common, 'Gifts if appropriate for hosts', 'Comfortable clothing for extended visit'];
    case 'TRANSIT':
      return ['Passport, onward ticket, final destination visa', 'Items needed for layover only — check baggage through rules'];
    default:
      return [...common, 'Layered clothing', 'Comfortable walking shoes', 'Day bag for excursions'];
  }
}

function getCulturalTips(purpose: TravelPurpose, destinationName: string): string[] {
  const base = [`Research local customs in ${destinationName}`, 'Learn basic greetings'];
  if (purpose === 'STUDY') {
    return [...base, 'Join university international student orientation', 'Understand part-time work rules on student visa'];
  }
  if (purpose === 'BUSINESS') {
    return [...base, 'Learn business meeting etiquette and dress code', 'Exchange cards formally if customary'];
  }
  if (purpose === 'FAMILY') {
    return [...base, 'Confirm household customs with your hosts in advance'];
  }
  return [...base, 'Check public holiday closures for attractions'];
}

function getAccommodationSuggestion(purpose: TravelPurpose, tier: BudgetTier): string {
  if (purpose === 'STUDY') {
    return 'University dormitory or verified student housing — book through institution when possible';
  }
  if (purpose === 'FAMILY') {
    return 'Staying with family — still document address for visa application';
  }
  if (purpose === 'BUSINESS') {
    return tier === 'LUXURY'
      ? 'Business hotels near meeting venues with reliable Wi‑Fi'
      : 'Hotels near client offices or conference center';
  }
  if (purpose === 'TRANSIT') {
    return 'Airport hotel only if overnight layover — otherwise remain airside';
  }
  return tier === 'LUXURY'
    ? 'Boutique hotels in central districts'
    : tier === 'LOW'
      ? 'Well-reviewed hostels or budget hotels near transit'
      : 'Mid-range hotels with strong reviews near city center';
}

function generateBudgetBreakdown(
  currency: string,
  tier: BudgetTier,
  days: number,
  travelers: number,
  purpose: TravelPurpose,
  visaFeeHint?: number | null,
) {
  const profile = getPurposeProfile(purpose);
  const multipliers = { LOW: 0.6, MODERATE: 1, LUXURY: 1.8 };
  const m = multipliers[tier];
  const perDayFood = (purpose === 'STUDY' ? 40 : purpose === 'BUSINESS' ? 50 : 35) * m;
  const perDayTransport = 15 * m;

  const defaultVisaFee =
    visaFeeHint != null
      ? visaFeeHint
      : purpose === 'STUDY'
        ? 200
        : purpose === 'BUSINESS'
          ? 120
          : 80;

  const items = [
    { category: 'flights', label: 'Round-trip flights', low: 450 * m, mid: 750 * m, high: 1400 * m },
    {
      category: 'visa',
      label: `${profile.visaCategoryLabel} fees`,
      low: defaultVisaFee * 0.8,
      mid: defaultVisaFee,
      high: defaultVisaFee * 1.3,
    },
    {
      category: 'insurance',
      label: purpose === 'STUDY' ? 'Student health insurance' : 'Travel insurance',
      low: 25,
      mid: 55,
      high: 120,
    },
    {
      category: 'accommodation',
      label: purpose === 'STUDY' ? 'Housing (monthly equivalent)' : 'Accommodation',
      low: (purpose === 'STUDY' ? 50 : 40) * days * m,
      mid: (purpose === 'STUDY' ? 120 : 90) * days * m,
      high: (purpose === 'STUDY' ? 280 : 220) * days * m,
    },
    {
      category: 'food',
      label: 'Meals',
      low: perDayFood * 0.7 * days,
      mid: perDayFood * days,
      high: perDayFood * 1.5 * days,
    },
    {
      category: 'transport',
      label: 'Local transport',
      low: perDayTransport * 0.6 * days,
      mid: perDayTransport * days,
      high: perDayTransport * 1.4 * days,
    },
    ...(purpose === 'STUDY'
      ? [{ category: 'tuition', label: 'Tuition deposit / fees (estimate)', low: 2000, mid: 8000, high: 25000 }]
      : []),
    { category: 'forex', label: 'Forex & fees buffer', low: 30, mid: 60, high: 100 },
    { category: 'emergency', label: 'Emergency buffer', low: 100, mid: 200, high: 500 },
  ].map((i) => ({
    ...i,
    low: Math.round(i.low * travelers * (i.category === 'visa' ? 1 : 1)),
    mid: Math.round(i.mid * travelers * (i.category === 'visa' ? 1 : 1)),
    high: Math.round(i.high * travelers * (i.category === 'visa' ? 1 : 1)),
    currency: 'USD',
  }));

  const totals = {
    low: items.reduce((s, i) => s + i.low, 0),
    moderate: items.reduce((s, i) => s + i.mid, 0),
    luxury: items.reduce((s, i) => s + i.high, 0),
  };

  return {
    tier,
    purpose,
    destinationCurrency: currency,
    items,
    totals,
    paymentTips: [
      'Use no-foreign-transaction-fee cards abroad',
      purpose === 'STUDY' ? 'Set up international student banking options early' : 'Notify your bank before travel',
      'Avoid airport exchange counters for large amounts',
    ],
  };
}

function checkPassportValidity(months?: number) {
  if (months === undefined) {
    return { status: 'unknown', message: 'Enter passport validity to check requirements' };
  }
  if (months >= 6) {
    return { status: 'ok', message: 'Passport validity meets typical 6-month requirement' };
  }
  if (months >= 3) {
    return { status: 'warning', message: 'Some destinations require 6 months validity — verify before booking' };
  }
  return { status: 'critical', message: 'Renew passport before applying for visa or booking travel' };
}
