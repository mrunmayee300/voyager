import { TravelPurpose } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { cacheGet, cacheSet } from '../lib/redis';
import { AppError } from '../lib/errors';
import {
  applyPurposeToRequirement,
  type VisaRequirementShape,
} from './visa-purpose.service';

export interface VisaRequirementResponse {
  found: boolean;
  requirement: VisaRequirementShape;
  purpose?: string;
  message?: string;
}

export async function getVisaRequirement(
  originCode: string,
  destinationCode: string,
  purpose?: TravelPurpose | string | null,
): Promise<VisaRequirementResponse> {
  const purposeKey = (purpose?.toString().toUpperCase() || 'TOURISM') as TravelPurpose;
  const cacheKey = `visa:${originCode}:${destinationCode}:${purposeKey}`;
  const cached = await cacheGet<VisaRequirementResponse>(cacheKey);
  if (cached) return cached;

  const origin = await prisma.country.findUnique({ where: { code: originCode.toUpperCase() } });
  const destination = await prisma.country.findUnique({
    where: { code: destinationCode.toUpperCase() },
  });

  if (!origin || !destination) {
    throw new AppError('Country not found', 404);
  }

  const rule = await prisma.visaRule.findUnique({
    where: {
      originCountryId_destinationCountryId: {
        originCountryId: origin.id,
        destinationCountryId: destination.id,
      },
    },
    include: {
      originCountry: { select: { code: true, name: true, flagEmoji: true } },
      destinationCountry: { select: { code: true, name: true, flagEmoji: true, currency: true } },
    },
  });

  const baseRequirement = rule
    ? formatVisaRule(rule)
    : generateFallbackRequirement(origin, destination);

  const tailored = applyPurposeToRequirement(baseRequirement, purposeKey);

  const result: VisaRequirementResponse = rule
    ? { found: true, requirement: tailored, purpose: purposeKey }
    : {
        found: false,
        requirement: tailored,
        purpose: purposeKey,
        message: 'No verified rule in database. Purpose-specific guidance applied — confirm with embassy.',
      };

  await cacheSet(cacheKey, result, 600);
  return result;
}

function formatVisaRule(rule: {
  requirementType: string;
  maxStayDays: number | null;
  processingDaysMin: number | null;
  processingDaysMax: number | null;
  feeUsdApprox: number | null;
  validityMonths: number | null;
  notes: string | null;
  documentsRequired: unknown;
  applicationSteps: unknown;
  interviewRequired: boolean;
  sourceUrl: string | null;
  confidenceScore: number;
  originCountry: { code: string; name: string; flagEmoji: string | null };
  destinationCountry: { code: string; name: string; flagEmoji: string | null; currency: string };
}): VisaRequirementShape {
  return {
    type: rule.requirementType,
    label: requirementLabel(rule.requirementType),
    maxStayDays: rule.maxStayDays,
    processing: {
      minDays: rule.processingDaysMin,
      maxDays: rule.processingDaysMax,
    },
    feeUsd: rule.feeUsdApprox,
    validityMonths: rule.validityMonths,
    notes: rule.notes,
    documents: (rule.documentsRequired as string[]) || [],
    steps: (rule.applicationSteps as string[]) || [],
    interviewRequired: rule.interviewRequired,
    sourceUrl: rule.sourceUrl,
    confidence: rule.confidenceScore,
    origin: rule.originCountry,
    destination: rule.destinationCountry,
    successFactors: [],
    interviewTips: rule.interviewRequired
      ? [
          'Arrive 15 minutes early with originals',
          'Explain itinerary clearly',
          'Be concise about employment and finances',
        ]
      : [],
  };
}

function requirementLabel(type: string) {
  const labels: Record<string, string> = {
    VISA_FREE: 'No visa required',
    VISA_ON_ARRIVAL: 'Visa on arrival',
    E_VISA: 'E-visa available',
    EMBASSY_VISA: 'Embassy visa required',
    TRANSIT_VISA: 'Transit visa required',
    NOT_PERMITTED: 'Travel not permitted',
  };
  return labels[type] || type;
}

function generateFallbackRequirement(
  origin: { name: string; code: string },
  destination: { name: string; code: string },
): VisaRequirementShape {
  return {
    type: 'EMBASSY_VISA',
    label: 'Verify with embassy',
    maxStayDays: null,
    processing: { minDays: 14, maxDays: 30 },
    feeUsd: null,
    documents: ['Valid passport', 'Application form', 'Proof of funds', 'Travel itinerary'],
    steps: [
      `Check ${destination.name} embassy website for ${origin.name} citizens`,
      'Gather required documents',
      'Submit application',
      'Track status online',
    ],
    interviewRequired: false,
    sourceUrl: null,
    confidence: 0.5,
    origin: { code: origin.code, name: origin.name },
    destination: { code: destination.code, name: destination.name },
    successFactors: [],
    interviewTips: [],
  };
}
