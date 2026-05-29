'use client';

import * as Accordion from '@radix-ui/react-accordion';
import { ChevronDown } from 'lucide-react';
const faqs = [
  {
    q: 'Is visa information guaranteed to be accurate?',
    a: 'We aggregate verified rules and cite sources, but immigration policies change. Always confirm with the official embassy or consulate before applying.',
  },
  {
    q: 'Do I need an account to plan a trip?',
    a: 'You can generate a travel plan without signing in. Create an account to save trips, share plans, and use the AI assistant with history.',
  },
  {
    q: 'Which countries are supported?',
    a: 'Our seed database includes major routes (US, UK, India, France, Japan, UAE, Singapore, and more). The architecture supports expanding the visa matrix continuously.',
  },
  {
    q: 'How does the AI assistant work?',
    a: 'It uses retrieval-augmented generation over travel knowledge chunks, with OpenAI when configured. Without an API key, it provides helpful fallback guidance.',
  },
];

export function FAQ() {
  return (
    <section className="section-padding bg-white">
      <div className="mx-auto max-w-3xl">
        <h2 className="editorial-heading text-center text-3xl font-semibold text-sand-900">
          Common questions
        </h2>
        <Accordion.Root type="single" collapsible className="mt-12 space-y-2">
          {faqs.map((faq, i) => (
            <Accordion.Item
              key={faq.q}
              value={`item-${i}`}
              className="rounded-lg border border-sand-200 px-5"
            >
              <Accordion.Header>
                <Accordion.Trigger className="group flex w-full items-center justify-between py-4 text-left text-sm font-medium text-sand-900">
                  {faq.q}
                  <ChevronDown className="h-4 w-4 shrink-0 transition-transform group-data-[state=open]:rotate-180" />
                </Accordion.Trigger>
              </Accordion.Header>
              <Accordion.Content className="overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
                <p className="pb-4 text-sm leading-relaxed text-sand-800/70">{faq.a}</p>
              </Accordion.Content>
            </Accordion.Item>
          ))}
        </Accordion.Root>
      </div>
    </section>
  );
}
