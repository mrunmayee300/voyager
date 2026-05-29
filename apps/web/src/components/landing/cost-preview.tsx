const tiers = [
  { name: 'Essential', amount: '$1,840', note: 'Hostels, local eats, public transit' },
  { name: 'Comfort', amount: '$3,420', note: 'Mid-range hotels, mix of dining', active: true },
  { name: 'Premium', amount: '$6,890', note: 'Boutique stays, curated experiences' },
];

export function CostPreview() {
  return (
    <section className="section-padding">
      <div className="mx-auto max-w-7xl">
        <div className="max-w-xl">
          <p className="text-sm font-medium uppercase tracking-wider text-ocean-600">Budget insight</p>
          <h2 className="editorial-heading mt-3 text-3xl font-semibold text-sand-900 md:text-4xl">
            Realistic costs, not meaningless charts
          </h2>
        </div>

        <div className="mt-12 grid gap-4 md:grid-cols-3">
          {tiers.map((tier) => (
            <div
              key={tier.name}
              className={`rounded-lg border p-6 transition-shadow ${
                tier.active
                  ? 'border-ocean-200 bg-white shadow-[0_8px_30px_rgba(61,102,121,0.08)]'
                  : 'border-sand-200 bg-sand-50/50'
              }`}
            >
              <p className="text-sm text-sand-800/60">{tier.name}</p>
              <p className="editorial-heading mt-2 text-3xl font-semibold text-sand-900">{tier.amount}</p>
              <p className="mt-2 text-sm text-sand-800/60">7 nights · 1 traveler</p>
              <p className="mt-4 text-xs leading-relaxed text-sand-800/50">{tier.note}</p>
              {tier.active && (
                <div className="mt-6 space-y-2 border-t border-sand-100 pt-4 text-xs text-sand-800/70">
                  <div className="flex justify-between"><span>Flights</span><span>$750</span></div>
                  <div className="flex justify-between"><span>Stay</span><span>$630</span></div>
                  <div className="flex justify-between"><span>Visa & insurance</span><span>$135</span></div>
                  <div className="flex justify-between"><span>Daily spend</span><span>$665</span></div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
