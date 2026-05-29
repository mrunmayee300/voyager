import Link from 'next/link';

export function SiteFooter() {
  return (
    <footer className="border-t border-sand-200 bg-sand-100/50">
      <div className="mx-auto max-w-7xl section-padding">
        <div className="grid gap-12 md:grid-cols-4">
          <div className="md:col-span-2">
            <p className="font-display text-xl font-semibold text-sand-900">Voyager</p>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-sand-800/70">
              International travel planning with clarity — visas, budgets, timelines, and guidance
              in one calm place.
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-sand-800/50">Product</p>
            <ul className="mt-4 space-y-2 text-sm text-sand-800/80">
              <li><Link href="/planner" className="hover:text-ocean-700">Trip planner</Link></li>
              <li><Link href="/visa" className="hover:text-ocean-700">Visa requirements</Link></li>
              <li><Link href="/assistant" className="hover:text-ocean-700">AI assistant</Link></li>
            </ul>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-sand-800/50">Resources</p>
            <ul className="mt-4 space-y-2 text-sm text-sand-800/80">
              <li><Link href="/centers" className="hover:text-ocean-700">Visa centers</Link></li>
              <li><Link href="/currency" className="hover:text-ocean-700">Currency tools</Link></li>
              <li><Link href="/dashboard" className="hover:text-ocean-700">Saved trips</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-12 flex flex-col gap-3 border-t border-sand-200 pt-8 text-xs text-sand-800/50 md:flex-row md:items-center md:justify-between">
          <p>© {new Date().getFullYear()} Voyager. Visa data is indicative — verify with official sources.</p>
          <p className="text-sand-800/60">
            Designed & built by{' '}
            <span className="font-medium text-sand-800">Mrunmayee</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
