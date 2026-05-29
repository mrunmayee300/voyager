import { create } from 'zustand';

export interface PlannerFormData {
  originCountryCode: string;
  destinationCountryCode: string;
  originCity?: string;
  destinationCity?: string;
  startDate?: string;
  durationDays?: number;
  budgetTier?: 'LOW' | 'MODERATE' | 'LUXURY';
  purpose?: string;
  travelerCount?: number;
  passportValidMonths?: number;
}

interface PlannerState {
  step: number;
  form: Partial<PlannerFormData>;
  plan: unknown | null;
  setStep: (step: number) => void;
  updateForm: (data: Partial<PlannerFormData>) => void;
  setPlan: (plan: unknown) => void;
  reset: () => void;
}

export const usePlannerStore = create<PlannerState>((set) => ({
  step: 0,
  form: {},
  plan: null,
  setStep: (step) => set({ step }),
  updateForm: (data) => set((s) => ({ form: { ...s.form, ...data } })),
  setPlan: (plan) => set({ plan }),
  reset: () => set({ step: 0, form: {}, plan: null }),
}));
