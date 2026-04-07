import type { PricingPlan } from "../../src/types/landing";

import { PRICING_PLANS } from "../../src/data/landing";

function PricingCard({ plan }: { plan: PricingPlan }) {
  return (
    <article
      className={
        plan.featured
          ? "surface-card-strong rounded-2xl border-2 border-cyan-300 p-7 shadow-xl"
          : "surface-card rounded-2xl p-7"
      }
    >
      <p className="text-sm uppercase tracking-widest text-cyan-300">{plan.name}</p>
      <p className="text-primary mt-3 text-3xl font-bold">{plan.price}</p>
      <p className="text-secondary mt-2 text-sm">{plan.description}</p>
      <p className="mt-4 text-sm font-semibold text-cyan-200">{plan.fee}</p>

      <ul className="text-secondary mt-6 space-y-2 text-sm">
        {plan.highlights.map((highlight) => (
          <li key={highlight}>• {highlight}</li>
        ))}
      </ul>

      <button
        type="button"
        className={
          plan.featured ? "btn btn-primary mt-8" : "btn btn-secondary mt-8"
        }
      >
        {plan.cta}
      </button>
    </article>
  );
}

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-app-gradient py-16">
      <div className="app-container">
        <header className="mb-12 max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">
            Pricing
          </p>
          <h1 className="text-primary mt-4 text-4xl font-bold">Simple, transparent pricing</h1>
          <p className="text-secondary mt-4">
            Pick the plan that fits your freelance volume and payout needs.
          </p>
        </header>

        <section className="grid gap-6 md:grid-cols-3">
          {PRICING_PLANS.map((plan) => (
            <PricingCard key={plan.name} plan={plan} />
          ))}
        </section>
      </div>
    </main>
  );
}
