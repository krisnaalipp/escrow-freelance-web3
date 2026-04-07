import Link from "next/link";

export default function BottomCta() {
  return (
    <section className="pb-20">
      <div className="app-container">
        <div className="surface-card-strong reveal-up rounded-3xl p-10 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-300">
            Ready To Launch
          </p>
          <h2 className="text-primary mx-auto mt-4 max-w-2xl text-3xl font-bold md:text-4xl">
            Start your next freelance deal with escrow-first trust.
          </h2>
          <p className="text-secondary mx-auto mt-4 max-w-2xl">
            Move faster with clear milestones, instant payouts, and a workflow
            both sides can rely on.
          </p>

          <div className="mt-8 flex justify-center gap-3">
            <Link href="/jobs" className="btn btn-primary">
              Open jobs
            </Link>
            <Link href="/jobs?compose=1" className="btn btn-secondary">
              Post your role
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
