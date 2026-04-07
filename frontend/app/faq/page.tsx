import { FAQ_ITEMS } from "../../src/data/landing";

export default function FaqPage() {
  return (
    <main className="min-h-screen bg-app-gradient py-16">
      <div className="app-container">
        <header className="mb-12 max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">
            FAQ
          </p>
          <h1 className="text-primary mt-4 text-4xl font-bold">Frequently asked questions</h1>
          <p className="text-secondary mt-4">
            Common answers about escrow flow, disputes, and wallet support.
          </p>
        </header>

        <section className="space-y-4">
          {FAQ_ITEMS.map((item) => (
            <article
              key={item.question}
              className="surface-card rounded-2xl p-6"
            >
              <h2 className="text-primary text-lg font-semibold">{item.question}</h2>
              <p className="text-secondary mt-3 text-sm">{item.answer}</p>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}
