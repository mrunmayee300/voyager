import Link from 'next/link';
import Image from 'next/image';
import { Hero } from '@/components/landing/hero';
import { HowItWorks } from '@/components/landing/how-it-works';
import { VisaDemo } from '@/components/landing/visa-demo';
import { CostPreview } from '@/components/landing/cost-preview';
import { FAQ } from '@/components/landing/faq';
import { Button } from '@/components/ui/button';

const destinations = [
  { name: 'Paris', image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=600&q=80' },
  { name: 'Tokyo', image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=600&q=80' },
  { name: 'Dubai', image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=600&q=80' },
  { name: 'Singapore', image: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=600&q=80' },
];

const testimonials = [
  {
    quote: 'Finally understood my Schengen visa checklist without reading three government PDFs.',
    author: 'Priya M.',
    route: 'Mumbai → Paris',
  },
  {
    quote: 'The timeline alone saved me from booking flights before my visa appointment.',
    author: 'James T.',
    route: 'London → Tokyo',
  },
];

export default function HomePage() {
  return (
    <>
      <Hero />
      <HowItWorks />
      <VisaDemo />
      <CostPreview />

      <section className="section-padding bg-sand-100/30">
        <div className="mx-auto max-w-7xl">
          <h2 className="editorial-heading text-3xl font-semibold text-sand-900">Destination inspiration</h2>
          <div className="mt-10 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
            {destinations.map((d) => (
              <Link
                key={d.name}
                href="/planner"
                className="group relative aspect-[4/5] overflow-hidden rounded-lg"
              >
                <Image src={d.image} alt={d.name} fill className="object-cover transition-transform duration-500 group-hover:scale-105" sizes="(max-width:768px) 50vw, 25vw" />
                <div className="absolute inset-0 bg-gradient-to-t from-sand-900/70 to-transparent" />
                <span className="absolute bottom-4 left-4 font-display text-lg font-medium text-white">{d.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section-padding">
        <div className="mx-auto max-w-7xl">
          <h2 className="editorial-heading text-center text-3xl font-semibold text-sand-900">Travelers like you</h2>
          <div className="mt-12 grid gap-6 md:grid-cols-2">
            {testimonials.map((t) => (
              <blockquote key={t.author} className="card-elevated p-8">
                <p className="text-lg leading-relaxed text-sand-800/90">&ldquo;{t.quote}&rdquo;</p>
                <footer className="mt-6 text-sm text-sand-800/60">
                  <strong className="text-sand-900">{t.author}</strong> · {t.route}
                </footer>
              </blockquote>
            ))}
          </div>
        </div>
      </section>

      <section className="section-padding bg-ocean-800 text-white">
        <div className="mx-auto max-w-7xl grid items-center gap-12 lg:grid-cols-2">
          <div>
            <p className="text-sm uppercase tracking-wider text-ocean-100/70">AI assistant</p>
            <h2 className="editorial-heading mt-3 text-3xl font-semibold md:text-4xl">
              Ask practical questions, get concise answers
            </h2>
            <p className="mt-4 text-ocean-100/80 leading-relaxed">
              Packing lists, customs rules, forex tips — with citations when we have them.
            </p>
            <Link href="/assistant" className="mt-8 inline-block">
              <Button variant="accent">Try the assistant</Button>
            </Link>
          </div>
          <div className="rounded-lg bg-ocean-700/50 p-6 font-mono text-sm">
            <p className="text-ocean-100/50">You</p>
            <p className="mt-1">What documents do I need for a tourist visa to Japan from India?</p>
            <p className="mt-6 text-ocean-100/50">Voyager</p>
            <p className="mt-1 text-ocean-50 leading-relaxed">
              You&apos;ll typically need a valid passport, completed application form, itinerary,
              financial proof, and employment letter. Processing is about 7–14 days via the embassy...
            </p>
          </div>
        </div>
      </section>

      <FAQ />

      <section className="section-padding text-center">
        <h2 className="editorial-heading text-3xl font-semibold text-sand-900">Ready when you are</h2>
        <p className="mx-auto mt-4 max-w-md text-sand-800/70">
          Start with a route. We&apos;ll build your checklist, timeline, and budget estimate.
        </p>
        <Link href="/planner" className="mt-8 inline-block">
          <Button size="lg">Plan your first trip</Button>
        </Link>
      </section>
    </>
  );
}
