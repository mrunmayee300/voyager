import { PrismaClient, VisaRequirementType } from '@prisma/client';

const prisma = new PrismaClient();

const countries = [
  { code: 'USA', name: 'United States', region: 'Americas', currency: 'USD', flagEmoji: '🇺🇸' },
  { code: 'GBR', name: 'United Kingdom', region: 'Europe', currency: 'GBP', flagEmoji: '🇬🇧' },
  { code: 'IND', name: 'India', region: 'Asia', currency: 'INR', flagEmoji: '🇮🇳' },
  { code: 'FRA', name: 'France', region: 'Europe', currency: 'EUR', flagEmoji: '🇫🇷' },
  { code: 'JPN', name: 'Japan', region: 'Asia', currency: 'JPY', flagEmoji: '🇯🇵' },
  { code: 'ARE', name: 'United Arab Emirates', region: 'Middle East', currency: 'AED', flagEmoji: '🇦🇪' },
  { code: 'SGP', name: 'Singapore', region: 'Asia', currency: 'SGD', flagEmoji: '🇸🇬' },
  { code: 'DEU', name: 'Germany', region: 'Europe', currency: 'EUR', flagEmoji: '🇩🇪' },
  { code: 'AUS', name: 'Australia', region: 'Oceania', currency: 'AUD', flagEmoji: '🇦🇺' },
  { code: 'CAN', name: 'Canada', region: 'Americas', currency: 'CAD', flagEmoji: '🇨🇦' },
];

const visaMatrix: Array<{
  origin: string;
  dest: string;
  type: VisaRequirementType;
  maxStay?: number;
  minDays?: number;
  maxDays?: number;
  fee?: number;
  docs: string[];
  steps: string[];
}> = [
  {
    origin: 'IND',
    dest: 'FRA',
    type: 'EMBASSY_VISA',
    maxStay: 90,
    minDays: 15,
    maxDays: 30,
    fee: 80,
    docs: ['Valid passport (6+ months)', 'Schengen application form', 'Travel insurance (€30k+)', 'Flight reservation', 'Hotel bookings', 'Bank statements (3 months)', 'Passport photos'],
    steps: ['Book VFS appointment', 'Complete Schengen form', 'Gather documents', 'Attend biometrics', 'Track application online'],
  },
  {
    origin: 'IND',
    dest: 'SGP',
    type: 'E_VISA',
    maxStay: 30,
    minDays: 3,
    maxDays: 5,
    fee: 30,
    docs: ['Passport scan', 'Digital photo', 'Return ticket', 'Hotel confirmation'],
    steps: ['Apply on ICA website', 'Pay fee online', 'Receive e-visa via email', 'Print for immigration'],
  },
  {
    origin: 'IND',
    dest: 'ARE',
    type: 'VISA_ON_ARRIVAL',
    maxStay: 14,
    minDays: 0,
    maxDays: 3,
    fee: 0,
    docs: ['Passport valid 6 months', 'Return/onward ticket', 'Hotel booking'],
    steps: ['Obtain visa on arrival at UAE airport', 'Present documents at immigration'],
  },
  {
    origin: 'USA',
    dest: 'GBR',
    type: 'VISA_FREE',
    maxStay: 180,
    minDays: 0,
    maxDays: 0,
    fee: 0,
    docs: ['Valid passport', 'Return ticket'],
    steps: ['Travel with valid passport', 'Complete landing card if required'],
  },
  {
    origin: 'USA',
    dest: 'JPN',
    type: 'VISA_FREE',
    maxStay: 90,
    minDays: 0,
    maxDays: 0,
    fee: 0,
    docs: ['Valid passport', 'Proof of onward travel'],
    steps: ['Enter Japan as tourist — no visa required for stays under 90 days'],
  },
  {
    origin: 'GBR',
    dest: 'IND',
    type: 'E_VISA',
    maxStay: 60,
    minDays: 3,
    maxDays: 7,
    fee: 25,
    docs: ['Passport bio page', 'Recent photograph', 'Travel itinerary'],
    steps: ['Apply on Indian e-Visa portal', 'Pay online', 'Receive ETA via email'],
  },
  {
    origin: 'IND',
    dest: 'JPN',
    type: 'EMBASSY_VISA',
    maxStay: 90,
    minDays: 7,
    maxDays: 14,
    fee: 25,
    docs: ['Passport', 'Application form', 'Itinerary', 'Financial proof', 'Employment letter'],
    steps: ['Submit to Japanese embassy/VFS', 'Attend interview if required', 'Collect passport with visa'],
  },
  {
    origin: 'IND',
    dest: 'USA',
    type: 'EMBASSY_VISA',
    maxStay: 180,
    minDays: 30,
    maxDays: 90,
    fee: 185,
    docs: ['DS-160 confirmation', 'Passport', 'Photo', 'Interview appointment', 'Financial documents', 'Ties to home country'],
    steps: ['Complete DS-160', 'Pay visa fee', 'Schedule embassy interview', 'Attend interview', 'Passport returned via courier'],
  },
];

async function main() {
  console.log('Seeding database...');

  for (const c of countries) {
    await prisma.country.upsert({
      where: { code: c.code },
      update: c,
      create: c,
    });
  }

  const countryMap = Object.fromEntries(
    (await prisma.country.findMany()).map((c) => [c.code, c.id]),
  );

  const cities = [
    { name: 'Mumbai', country: 'IND', lat: 19.076, lng: 72.8777, tz: 'Asia/Kolkata' },
    { name: 'Delhi', country: 'IND', lat: 28.6139, lng: 77.209, tz: 'Asia/Kolkata' },
    { name: 'New York', country: 'USA', lat: 40.7128, lng: -74.006, tz: 'America/New_York' },
    { name: 'London', country: 'GBR', lat: 51.5074, lng: -0.1278, tz: 'Europe/London' },
    { name: 'Paris', country: 'FRA', lat: 48.8566, lng: 2.3522, tz: 'Europe/Paris' },
    { name: 'Tokyo', country: 'JPN', lat: 35.6762, lng: 139.6503, tz: 'Asia/Tokyo' },
    { name: 'Dubai', country: 'ARE', lat: 25.2048, lng: 55.2708, tz: 'Asia/Dubai' },
    { name: 'Singapore', country: 'SGP', lat: 1.3521, lng: 103.8198, tz: 'Asia/Singapore' },
  ];

  for (const city of cities) {
    await prisma.city.upsert({
      where: { name_countryId: { name: city.name, countryId: countryMap[city.country] } },
      update: {},
      create: {
        name: city.name,
        countryId: countryMap[city.country],
        latitude: city.lat,
        longitude: city.lng,
        timezone: city.tz,
      },
    });
  }

  for (const rule of visaMatrix) {
    await prisma.visaRule.upsert({
      where: {
        originCountryId_destinationCountryId: {
          originCountryId: countryMap[rule.origin],
          destinationCountryId: countryMap[rule.dest],
        },
      },
      update: {
        requirementType: rule.type,
        maxStayDays: rule.maxStay,
        processingDaysMin: rule.minDays,
        processingDaysMax: rule.maxDays,
        feeUsdApprox: rule.fee,
        documentsRequired: rule.docs,
        applicationSteps: rule.steps,
        sourceUrl: 'https://www.iatatravelcentre.com/',
        confidenceScore: 0.9,
      },
      create: {
        originCountryId: countryMap[rule.origin],
        destinationCountryId: countryMap[rule.dest],
        requirementType: rule.type,
        maxStayDays: rule.maxStay,
        processingDaysMin: rule.minDays,
        processingDaysMax: rule.maxDays,
        feeUsdApprox: rule.fee,
        documentsRequired: rule.docs,
        applicationSteps: rule.steps,
        sourceUrl: 'https://www.iatatravelcentre.com/',
        confidenceScore: 0.9,
      },
    });
  }

  const mumbai = await prisma.city.findFirst({ where: { name: 'Mumbai' } });
  if (mumbai) {
    await prisma.serviceCenter.createMany({
      skipDuplicates: true,
      data: [
        {
          name: 'VFS Global — France Visa',
          type: 'visa_center',
          address: 'Trade Centre, Bandra Kurla Complex, Mumbai',
          cityId: mumbai.id,
          latitude: 19.0596,
          longitude: 72.8656,
          phone: '+91-22-67866006',
          website: 'https://visa.vfsglobal.com/ind/en/fra',
          hours: { mon: '09:00-17:00', tue: '09:00-17:00', wed: '09:00-17:00', thu: '09:00-17:00', fri: '09:00-17:00' },
          waitDaysEst: 5,
          documents: ['Appointment letter', 'Passport', 'Application form', 'Supporting documents'],
        },
        {
          name: 'Passport Seva Kendra — Mumbai',
          type: 'passport_office',
          address: 'Ahmed Jahaangir Road, Worli, Mumbai',
          cityId: mumbai.id,
          latitude: 18.9981,
          longitude: 72.8174,
          phone: '1800-258-1800',
          website: 'https://portal2.passportindia.gov.in',
          hours: { mon: '09:30-16:30', tue: '09:30-16:30', wed: '09:30-16:30', thu: '09:30-16:30', fri: '09:30-16:30', sat: '09:30-16:30' },
          waitDaysEst: 10,
          documents: ['Aadhaar', 'Address proof', 'Birth certificate', 'Old passport if renewal'],
        },
        {
          name: 'Consulate General of Japan — Mumbai',
          type: 'embassy',
          address: 'Maker Chambers IV, Nariman Point, Mumbai',
          cityId: mumbai.id,
          latitude: 18.9256,
          longitude: 72.8235,
          website: 'https://www.mumbai.in.emb-japan.go.jp',
          hours: { mon: '09:00-12:30', tue: '09:00-12:30', wed: '09:00-12:30', thu: '09:00-12:30', fri: '09:00-12:30' },
          waitDaysEst: 7,
          documents: ['Visa application', 'Passport', 'Photo', 'Itinerary'],
        },
      ],
    });
  }

  const rates = [
    { base: 'USD', target: 'EUR', rate: 0.92 },
    { base: 'USD', target: 'GBP', rate: 0.79 },
    { base: 'USD', target: 'INR', rate: 83.5 },
    { base: 'USD', target: 'JPY', rate: 156.2 },
    { base: 'USD', target: 'AED', rate: 3.67 },
    { base: 'USD', target: 'SGD', rate: 1.35 },
    { base: 'USD', target: 'AUD', rate: 1.54 },
    { base: 'USD', target: 'CAD', rate: 1.37 },
  ];

  for (const r of rates) {
    await prisma.currencyRate.upsert({
      where: { base_target: { base: r.base, target: r.target } },
      update: { rate: r.rate },
      create: r,
    });
  }

  await prisma.knowledgeChunk.createMany({
    data: [
      {
        category: 'visa',
        country: 'FRA',
        title: 'Schengen visa for Indian citizens',
        content:
          'Indian citizens need a Schengen Type C visa for tourism in France. Apply at least 15 days before travel. Minimum passport validity is 3 months beyond departure. Travel insurance must cover €30,000 medical expenses.',
        sourceUrl: 'https://france-visas.gouv.fr/',
      },
      {
        category: 'packing',
        country: null,
        title: 'International travel packing essentials',
        content:
          'Carry passport copies separately, universal adapter, medications in original packaging with prescriptions, digital backups of documents, and a small amount of local currency for arrival.',
        sourceUrl: null,
      },
      {
        category: 'customs',
        country: 'JPN',
        title: 'Japan customs — prohibited items',
        content:
          'Japan restricts certain medications containing stimulants. Declare cash over ¥1,000,000. Fresh fruits, meat products, and some plant materials are prohibited.',
        sourceUrl: 'https://www.customs.go.jp/',
      },
    ],
  });

  console.log('Seed completed.');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
