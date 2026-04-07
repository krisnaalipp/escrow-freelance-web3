import { FEATURES } from "../../data/landing";
import SectionHeading from "./SectionHeading";

export default function FeatureGrid() {
  return (
    <section id="features" className="section-dark">
      <div className="app-container">
        <SectionHeading
          eyebrow="Platform Features"
          title="Built to prove production-ready Web3 skills"
          description="Showcase scalable backend services, Solidity escrow contracts, and a seamless frontend with a focus on trust and delivery confidence."
        />

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {FEATURES.map((feature, index) => (
            <article
              key={feature.title}
              className={`surface-card reveal-up rounded-2xl p-6 reveal-delay-${(index % 4) + 1}`}
            >
              <h3 className="text-primary mb-3 text-lg font-semibold">
                {feature.title}
              </h3>
              <p className="text-secondary text-sm">{feature.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
