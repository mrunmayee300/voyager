import { Calendar, FileCheck, MapPin, Wallet } from 'lucide-react';

const steps = [
  {
    icon: MapPin,
    title: 'Tell us where you\'re going',
    description: 'Home city, destination, dates, and travel purpose — we handle the complexity.',
  },
  {
    icon: FileCheck,
    title: 'Understand visa requirements',
    description: 'Clear checklists, processing timelines, and document lists — not walls of text.',
  },
  {
    icon: Wallet,
    title: 'See realistic costs',
    description: 'Budget tiers with expandable breakdowns for flights, stay, food, and forex.',
  },
  {
    icon: Calendar,
    title: 'Follow your timeline',
    description: 'A calm roadmap from 60 days out to departure day.',
  },
];

export function HowItWorks() {
  return (
    <section className="section-padding bg-white">
      <div className="mx-auto max-w-7xl">
        <p className="text-sm font-medium uppercase tracking-wider text-ocean-600">How it works</p>
        <h2 className="editorial-heading mt-3 max-w-xl text-3xl font-semibold text-sand-900 md:text-4xl">
          From uncertainty to a clear plan in minutes
        </h2>

        <div className="mt-14 grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, i) => (
            <div key={step.title} className="group">
              <div className="flex h-11 w-11 items-center justify-center rounded-md bg-sand-100 text-ocean-700">
                <step.icon className="h-5 w-5" />
              </div>
              <p className="mt-1 text-xs font-medium text-sand-300">0{i + 1}</p>
              <h3 className="mt-3 font-display text-lg font-semibold text-sand-900">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-sand-800/70">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
