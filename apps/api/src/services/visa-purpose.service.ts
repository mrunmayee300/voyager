import { TravelPurpose } from '@prisma/client';

export type PurposeKey = TravelPurpose;

export interface PurposeProfile {
  key: PurposeKey;
  label: string;
  visaCategoryLabel: string;
  description: string;
  extraDocuments: string[];
  extraSteps: string[];
  checklistItems: Array<{ id: string; label: string; category: string }>;
  timelineTasks: Record<string, string[]>;
  interviewTips: string[];
  successFactors: string[];
  insuranceNote: string;
  processingBufferDays: number;
  budgetAdjustments: { visaFeeMultiplier: number; insuranceMultiplier: number };
}

const PROFILES: Record<PurposeKey, PurposeProfile> = {
  TOURISM: {
    key: 'TOURISM',
    label: 'Tourism / Leisure',
    visaCategoryLabel: 'Tourist visa (short stay)',
    description: 'Holiday, sightseeing, and personal travel without employment.',
    extraDocuments: [
      'Detailed day-by-day travel itinerary',
      'Hotel or accommodation bookings for full stay',
      'Proof of sufficient funds for trip duration',
      'Travel insurance covering medical emergencies',
    ],
    extraSteps: [
      'Prepare leisure-focused itinerary (dates must match application)',
      'Book refundable accommodation where possible until visa is approved',
    ],
    checklistItems: [
      { id: 'itinerary', label: 'Day-by-day travel itinerary', category: 'visa' },
      { id: 'hotel-proof', label: 'Hotel / accommodation confirmations', category: 'bookings' },
      { id: 'funds', label: 'Bank statements showing trip funds', category: 'finance' },
      { id: 'leave-letter', label: 'Employer leave approval (if employed)', category: 'documents' },
    ],
    timelineTasks: {
      'Start visa process': ['Confirm tourist visa category with embassy', 'List attractions and travel dates for itinerary'],
      'Submit visa application': ['Attach leisure itinerary and hotel proof', 'Include travel insurance certificate'],
    },
    interviewTips: [
      'Explain your travel plan clearly — where you will go and for how long',
      'Show strong reasons to return home (job, family, property)',
      'Do not mention work or study unless it matches your visa type',
    ],
    successFactors: [
      'Consistent itinerary dates across all documents',
      'Proof of ties to home country',
      'Adequate funds for entire trip',
    ],
    insuranceNote: 'Travel medical insurance required for Schengen and many destinations (typically €30,000+ coverage).',
    processingBufferDays: 0,
    budgetAdjustments: { visaFeeMultiplier: 1, insuranceMultiplier: 1 },
  },

  BUSINESS: {
    key: 'BUSINESS',
    label: 'Business',
    visaCategoryLabel: 'Business visa',
    description: 'Meetings, conferences, client visits, or short-term professional activities (not local employment).',
    extraDocuments: [
      'Invitation letter from host company (letterhead, signed)',
      'Company registration / business license of inviting party',
      'Cover letter from your employer stating purpose and sponsorship',
      'Conference registration or meeting agenda (if applicable)',
      'Proof company will cover expenses (if sponsored)',
    ],
    extraSteps: [
      'Obtain signed invitation on company letterhead with your details and dates',
      'Request employer letter confirming business purpose and return to work',
      'Verify business visa allows your activities (no paid work locally unless permitted)',
    ],
    checklistItems: [
      { id: 'invitation', label: 'Business invitation letter', category: 'visa' },
      { id: 'employer-letter', label: 'Employer sponsorship / cover letter', category: 'documents' },
      { id: 'company-reg', label: 'Host company registration copy', category: 'visa' },
      { id: 'agenda', label: 'Meeting agenda or event registration', category: 'visa' },
      { id: 'business-cards', label: 'Business cards and company ID', category: 'packing' },
    ],
    timelineTasks: {
      'Start visa process': ['Coordinate invitation letter dates with host company', 'Confirm business visa category'],
      'Submit visa application': ['Include invitation + employer letter + agenda', 'Highlight short stay and return employment'],
    },
    interviewTips: [
      'State exact business purpose, host company name, and meeting dates',
      'Clarify who pays for travel — you or your employer',
      'Emphasize you will not take local employment',
    ],
    successFactors: [
      'Credible invitation from established company',
      'Alignment between invitation dates and travel bookings',
      'Ongoing employment or business in home country',
    ],
    insuranceNote: 'Business travel insurance with medical and trip cancellation coverage recommended.',
    processingBufferDays: 7,
    budgetAdjustments: { visaFeeMultiplier: 1.1, insuranceMultiplier: 1.2 },
  },

  STUDY: {
    key: 'STUDY',
    label: 'Study',
    visaCategoryLabel: 'Student visa',
    description: 'Degree programs, exchange semesters, language courses, or accredited study abroad.',
    extraDocuments: [
      'Letter of admission from recognized institution',
      'Proof of tuition payment or scholarship letter',
      'Financial proof for tuition + living costs (1 year typical)',
      'Academic transcripts and prior qualifications',
      'Student accommodation confirmation or housing contract',
      'Statement of purpose / study plan',
      'Police clearance certificate (if required by destination)',
    ],
    extraSteps: [
      'Apply to institution first — obtain official admission before visa',
      'Pay SEVIS / CAS / equivalent fees where applicable (US, UK, etc.)',
      'Book biometrics and interview early — student visas often have peak seasons',
      'Prepare for questions on post-study return plans',
    ],
    checklistItems: [
      { id: 'admission', label: 'Official admission / enrollment letter', category: 'visa' },
      { id: 'tuition', label: 'Tuition payment receipt or scholarship award', category: 'finance' },
      { id: 'sop', label: 'Statement of purpose', category: 'documents' },
      { id: 'transcripts', label: 'Academic transcripts and certificates', category: 'documents' },
      { id: 'housing', label: 'Student housing confirmation', category: 'bookings' },
      { id: 'language-test', label: 'Language test scores (IELTS/TOEFL/etc.) if required', category: 'documents' },
      { id: 'sevis-cas', label: 'SEVIS / CAS / COE fee payment proof (if applicable)', category: 'visa' },
    ],
    timelineTasks: {
      'Start visa process': ['Secure admission letter', 'Pay institution deposit', 'Research student visa category and SEVIS/CAS requirements'],
      'Submit visa application': ['Submit financial proof for full program duration', 'Include SOP and all academic documents'],
      'Book flights & stay': ['Book housing near campus', 'Arrange orientation week dates'],
    },
    interviewTips: [
      'Explain why you chose this program and institution',
      'Show how you will fund entire course of study',
      'Be ready to discuss career plans after graduation and ties to home country',
    ],
    successFactors: [
      'Genuine admission to accredited institution',
      'Sufficient funds for tuition and living expenses',
      'Clear academic progression and study intent',
    ],
    insuranceNote: 'Student health insurance is often mandatory — check institution and embassy requirements.',
    processingBufferDays: 21,
    budgetAdjustments: { visaFeeMultiplier: 1.25, insuranceMultiplier: 1.5 },
  },

  FAMILY: {
    key: 'FAMILY',
    label: 'Family visit',
    visaCategoryLabel: 'Family / visitor visa',
    description: 'Visiting relatives, spouse, or close family members abroad.',
    extraDocuments: [
      'Invitation letter from family host with address and contact',
      "Host's proof of residence (utility bill, lease, or ID)",
      'Proof of relationship (birth/marriage certificates, photos)',
      'Host financial support letter (if they sponsor your stay)',
      'Your proof of ties to home country',
    ],
    extraSteps: [
      'Ask host to provide signed invitation with copy of their status document',
      'Gather certified translations for relationship documents if not in local language',
      'Clarify who covers expenses — you or your host',
    ],
    checklistItems: [
      { id: 'family-invite', label: 'Family invitation letter', category: 'visa' },
      { id: 'relationship', label: 'Relationship proof (certificates)', category: 'documents' },
      { id: 'host-status', label: "Host's residence / status proof", category: 'visa' },
      { id: 'host-support', label: 'Sponsorship letter (if host pays)', category: 'finance' },
    ],
    timelineTasks: {
      'Start visa process': ['Confirm visitor/family visa type with embassy', 'Collect relationship documents'],
      'Submit visa application': ['Include host invitation and relationship proof', 'Show intent to return home'],
    },
    interviewTips: [
      'Explain who you are visiting and your relationship clearly',
      'Describe where you will stay during the visit',
      'Reassure officer you will return home after the visit',
    ],
    successFactors: [
      'Credible host and documented relationship',
      'Clear visit duration matching invitation',
      'Strong ties to home country',
    ],
    insuranceNote: 'Visitor medical insurance recommended; host country may require minimum coverage.',
    processingBufferDays: 7,
    budgetAdjustments: { visaFeeMultiplier: 1, insuranceMultiplier: 1.1 },
  },

  TRANSIT: {
    key: 'TRANSIT',
    label: 'Transit',
    visaCategoryLabel: 'Transit visa (if required)',
    description: 'Passing through a country to reach a final destination — short airport or land transit.',
    extraDocuments: [
      'Confirmed onward ticket to final destination',
      'Visa for final destination (if required)',
      'Proof transit duration is within allowed limit',
      'Brief itinerary showing entry and exit dates',
    ],
    extraSteps: [
      'Check if transit country requires visa for your nationality — many do not for airside transit',
      'Ensure layover time fits transit visa rules (often under 24–48 hours for airside)',
      'If leaving airport, transit visa is usually required',
    ],
    checklistItems: [
      { id: 'onward-ticket', label: 'Onward flight ticket to final country', category: 'bookings' },
      { id: 'final-visa', label: 'Visa for final destination (if needed)', category: 'visa' },
      { id: 'layover-proof', label: 'Layover duration within allowed limits', category: 'documents' },
    ],
    timelineTasks: {
      'Start visa process': ['Verify transit visa requirement on embassy site', 'Book onward ticket first'],
      'Submit visa application': ['Submit onward ticket and final destination visa copy'],
    },
    interviewTips: [
      'Show onward travel proof immediately',
      'Explain you will not leave transit area unless visa permits',
    ],
    successFactors: [
      'Valid onward ticket within permitted timeframe',
      'Valid visa for final destination when required',
    ],
    insuranceNote: 'Short-term transit insurance optional; check airline and transit country rules.',
    processingBufferDays: -7,
    budgetAdjustments: { visaFeeMultiplier: 0.6, insuranceMultiplier: 0.5 },
  },

  OTHER: {
    key: 'OTHER',
    label: 'Other purpose',
    visaCategoryLabel: 'Purpose-specific visa',
    description: 'Medical treatment, cultural programs, volunteering, or other non-standard travel.',
    extraDocuments: [
      'Cover letter explaining exact purpose of travel',
      'Supporting documents from organizing institution or hospital',
      'Proof of funds and return arrangements',
      'Any permits or approvals specific to your activity',
    ],
    extraSteps: [
      'Contact embassy to confirm correct visa category before applying',
      'Prepare detailed cover letter — vague purposes are often rejected',
    ],
    checklistItems: [
      { id: 'cover-letter', label: 'Cover letter explaining travel purpose', category: 'documents' },
      { id: 'supporting-org', label: 'Supporting letter from relevant organization', category: 'visa' },
      { id: 'embassy-confirm', label: 'Embassy confirmation of correct visa category', category: 'visa' },
    ],
    timelineTasks: {
      'Start visa process': ['Email or call embassy to confirm visa type for your activity'],
      'Submit visa application': ['Include cover letter and all activity-specific documents'],
    },
    interviewTips: [
      'Be specific and honest about your purpose',
      'Bring all supporting letters from institutions involved',
    ],
    successFactors: [
      'Correct visa category selected',
      'Complete documentation for unusual purpose',
    ],
    insuranceNote: 'Match insurance to activity — medical travel may need specialized coverage.',
    processingBufferDays: 14,
    budgetAdjustments: { visaFeeMultiplier: 1.15, insuranceMultiplier: 1.3 },
  },
};

export function getPurposeProfile(purpose?: string | null): PurposeProfile {
  const key = (purpose?.toUpperCase() || 'TOURISM') as PurposeKey;
  return PROFILES[key] ?? PROFILES.TOURISM;
}

export interface VisaRequirementShape {
  type: string;
  label: string;
  maxStayDays?: number | null;
  processing?: { minDays?: number | null; maxDays?: number | null };
  feeUsd?: number | null;
  validityMonths?: number | null;
  notes?: string | null;
  documents: string[];
  steps: string[];
  interviewRequired?: boolean;
  sourceUrl?: string | null;
  confidence?: number;
  origin?: { code: string; name: string; flagEmoji?: string | null };
  destination?: { code: string; name: string; flagEmoji?: string | null; currency?: string };
  successFactors: string[];
  interviewTips: string[];
  purpose?: PurposeKey;
  purposeLabel?: string;
  visaCategoryLabel?: string;
  purposeDescription?: string;
}

export function applyPurposeToRequirement(
  base: VisaRequirementShape,
  purpose?: string | null,
): VisaRequirementShape {
  const profile = getPurposeProfile(purpose);

  const documents = dedupeStrings([
    ...base.documents,
    ...profile.extraDocuments,
  ]);

  const steps = dedupeStrings([
    `Confirm you are applying for: ${profile.visaCategoryLabel}`,
    ...base.steps,
    ...profile.extraSteps,
  ]);

  const minDays = (base.processing?.minDays ?? 0) + Math.max(0, profile.processingBufferDays);
  const maxDays = (base.processing?.maxDays ?? 21) + profile.processingBufferDays;

  const feeUsd =
    base.feeUsd != null
      ? Math.round(base.feeUsd * profile.budgetAdjustments.visaFeeMultiplier)
      : base.feeUsd;

  const interviewTips = dedupeStrings([
    ...base.interviewTips,
    ...profile.interviewTips,
  ]);

  const successFactors = dedupeStrings([
    ...profile.successFactors,
    ...base.successFactors,
  ]);

  let label = base.label;
  if (base.type !== 'VISA_FREE' && base.type !== 'VISA_ON_ARRIVAL') {
    label = `${profile.visaCategoryLabel} — ${base.label}`;
  }

  return {
    ...base,
    label,
    documents,
    steps,
    feeUsd,
    processing: {
      minDays: Math.max(0, minDays),
      maxDays: Math.max(minDays, maxDays),
    },
    interviewTips,
    successFactors,
    purpose: profile.key,
    purposeLabel: profile.label,
    visaCategoryLabel: profile.visaCategoryLabel,
    purposeDescription: profile.description,
    notes: [base.notes, profile.description].filter(Boolean).join(' '),
  };
}

export function generatePurposeChecklist(
  visa: { requirement?: VisaRequirementShape },
  destinationName: string,
  purpose?: string | null,
) {
  const profile = getPurposeProfile(purpose);
  const req = visa.requirement;

  const base = [
    { id: 'passport', label: 'Valid passport (6+ months validity)', category: 'documents', done: false },
    {
      id: 'purpose-confirm',
      label: `Visa type confirmed: ${profile.visaCategoryLabel}`,
      category: 'visa',
      done: false,
    },
    { id: 'photos', label: 'Passport-size photos per embassy specs', category: 'documents', done: false },
    { id: 'application-form', label: 'Completed visa application form', category: 'visa', done: false },
    { id: 'insurance', label: profile.insuranceNote.slice(0, 80) + (profile.insuranceNote.length > 80 ? '…' : ''), category: 'documents', done: false },
    { id: 'copies', label: 'Document copies (digital + printed)', category: 'documents', done: false },
  ];

  const purposeItems = profile.checklistItems.map((item) => ({ ...item, done: false }));

  const visaDocs = (req?.documents || []).map((d, i) => ({
    id: `visa-doc-${i}`,
    label: d,
    category: 'visa',
    done: false,
  }));

  const travelItems =
    purpose === 'TRANSIT'
      ? [
          { id: 'onward', label: 'Onward ticket confirmed', category: 'bookings', done: false },
        ]
      : purpose === 'STUDY'
        ? [
            { id: 'flights', label: 'Flight booking (after visa approval if advised)', category: 'bookings', done: false },
          ]
        : [
            { id: 'flights', label: 'Flight reservations or tickets', category: 'bookings', done: false },
            { id: 'accommodation', label: 'Accommodation proof', category: 'bookings', done: false },
          ];

  const connectivity = [
    { id: 'forex', label: 'Forex / international payment method', category: 'finance', done: false },
    ...(purpose !== 'TRANSIT'
      ? [{ id: 'sim', label: 'Travel eSIM or roaming plan', category: 'connectivity', done: false }]
      : []),
  ];

  if (req?.type === 'VISA_FREE') {
    return [
      ...base.filter((b) => !b.id.startsWith('application')),
      ...purposeItems,
      { id: 'return', label: `Proof of return from ${destinationName}`, category: 'documents', done: false },
      ...travelItems,
      ...connectivity,
    ];
  }

  return [...base, ...purposeItems, ...visaDocs, ...travelItems, ...connectivity];
}

export function generatePurposeTimeline(
  visa: { requirement?: VisaRequirementShape },
  startDate: string | undefined,
  purpose?: string | null,
) {
  const profile = getPurposeProfile(purpose);
  const visaDays = visa.requirement?.processing?.maxDays || 21;
  const buffer = profile.processingBufferDays;
  const start = startDate ? new Date(startDate) : null;

  const applyTasks = (title: string, defaultTasks: string[]) => {
    const extra = profile.timelineTasks[title];
    return extra ? dedupeStrings([...defaultTasks, ...extra]) : defaultTasks;
  };

  const milestones = [
    {
      daysBefore: purpose === 'STUDY' ? 90 : 60,
      title: 'Start visa process',
      tasks: applyTasks('Start visa process', [
        'Check passport validity',
        `Research ${profile.visaCategoryLabel} requirements`,
        'Book embassy / VFS appointment if required',
      ]),
    },
    {
      daysBefore: Math.max(visaDays + 14 + buffer, purpose === 'STUDY' ? 75 : 45),
      title: 'Submit visa application',
      tasks: applyTasks('Submit visa application', [
        'Gather all purpose-specific documents',
        'Submit application and pay fees',
        'Keep receipt and tracking number',
      ]),
    },
    {
      daysBefore: purpose === 'STUDY' ? 45 : 30,
      title: purpose === 'STUDY' ? 'Arrange housing & enrollment' : 'Book flights & stay',
      tasks: applyTasks('Book flights & stay', [
        purpose === 'STUDY' ? 'Confirm student housing' : 'Compare flight options',
        purpose === 'STUDY' ? 'Complete university enrollment steps' : 'Reserve accommodation',
        'Purchase required insurance',
      ]),
    },
    {
      daysBefore: 14,
      title: 'Prepare documents',
      tasks: [
        'Organize originals and copies by embassy checklist order',
        'Print appointment confirmation',
        'Download offline maps and embassy contact info',
      ],
    },
    {
      daysBefore: 7,
      title: 'Final preparations',
      tasks: [
        'Confirm visa approval status',
        'Pack purpose-appropriate documents in carry-on',
        'Share itinerary with family or institution',
      ],
    },
    {
      daysBefore: 1,
      title: 'Departure day',
      tasks: [
        'Carry passport, visa, and purpose documents in hand luggage',
        'Arrive airport 3 hours early for international flights',
        'Keep admission / invitation / onward ticket easily accessible',
      ],
    },
  ];

  if (start) {
    return milestones.map((m) => ({
      ...m,
      dueDate: new Date(start.getTime() - m.daysBefore * 86400000).toISOString().split('T')[0],
    }));
  }

  return milestones;
}

function dedupeStrings(items: string[]): string[] {
  const seen = new Set<string>();
  return items.filter((item) => {
    const key = item.toLowerCase().trim();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
