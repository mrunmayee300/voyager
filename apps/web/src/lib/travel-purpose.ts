export const TRAVEL_PURPOSES = [
  { value: 'TOURISM', label: 'Tourism / Leisure' },
  { value: 'BUSINESS', label: 'Business' },
  { value: 'STUDY', label: 'Study' },
  { value: 'FAMILY', label: 'Family visit' },
  { value: 'TRANSIT', label: 'Transit' },
  { value: 'OTHER', label: 'Other' },
] as const;

export type TravelPurposeValue = (typeof TRAVEL_PURPOSES)[number]['value'];
