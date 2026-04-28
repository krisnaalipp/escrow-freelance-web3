import Link from "next/link";

import { HERO_STATS } from "../../data/landing";
import EscrowStatusCard from "../EscrowStatusCard";

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden px-0 pb-20 pt-14 lg:pt-20">
      <div className="app-container grid items-center gap-10 lg:grid-cols-[1.2fr_1fr]">
        <div className="reveal-up">
          <h1 className="text-hero-title max-w-3xl text-2xl font-extrabold leading-tight md:text-4xl lg:text-6xl">
            Secure freelance work with trustless escrow built for Web3 teams
          </h1>

          <p className="text-hero-copy mt-5 max-w-2xl text-base md:text-lg">
            A production-ready escrow protocol for clients and freelancers.
            Funds stay protected until milestones are accepted, with transparent
            payout history and an optional dispute flow.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/jobs" className="btn btn-primary">
              Explore jobs
            </Link>
            <Link href="/jobs?compose=1" className="btn btn-secondary">
              Post a job
            </Link>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {HERO_STATS.map((stat, index) => (
              <div
                key={stat.label}
                className={`surface-card reveal-up rounded-xl p-4 backdrop-blur-sm reveal-delay-${Math.min(index + 1, 4)}`}
              >
                <p className="text-primary text-center text-xl font-bold">
                  {stat.value}
                </p>
                <p className="text-secondary text-center text-xs uppercase tracking-wide">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="reveal-up reveal-delay-2">
          <EscrowStatusCard />
        </div>
      </div>
    </section>
  );
}
