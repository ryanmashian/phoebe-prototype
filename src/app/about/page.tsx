import { COPY } from "@/lib/copy";
import { FACTOR_CONFIG, TOTAL_WEIGHT } from "@/lib/risk-config";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export const metadata = {
  title: "How Sentinel scores — Sentinel for Phoebe",
};

export default function AboutPage() {
  return (
    <div className="space-y-8 max-w-[760px]">
      <div>
        <Link href="/" className="inline-flex items-center gap-1 text-[13px] text-ink-muted hover:text-accent">
          <ChevronLeft className="size-3.5" />
          back to tomorrow
        </Link>
      </div>

      <header className="space-y-2">
        <div className="text-[12px] uppercase tracking-[0.12em] text-ink-faint">
          methodology
        </div>
        <h1 className="text-[34px] tracking-tightish leading-[1.1] text-ink font-medium">
          {COPY.about.title}
        </h1>
      </header>

      <section className="space-y-4 text-[15px] leading-relaxed text-ink-muted">
        <p>{COPY.about.intro}</p>
        <p>{COPY.about.notMl}</p>
      </section>

      <section className="space-y-4">
        <h2 className="text-[18px] tracking-tightish font-medium text-ink">
          {COPY.about.weightsTitle}
        </h2>
        <div className="rounded-xl border border-line bg-card divide-y divide-line shadow-card overflow-hidden">
          {FACTOR_CONFIG.map((f) => (
            <article key={f.key} className="p-5 grid grid-cols-[60px_1fr] gap-5 items-start">
              <div className="num text-[28px] tracking-tightish text-accent font-medium leading-none pt-1">
                {f.weight}
              </div>
              <div className="space-y-1">
                <h3 className="text-[15px] font-medium text-ink">{f.label}</h3>
                <p className="text-[13px] text-ink-muted leading-relaxed">{f.rationale}</p>
              </div>
            </article>
          ))}
          <footer className="px-5 py-3 bg-paper-deep/40 flex items-center justify-between text-[12px]">
            <span className="text-ink-muted">Total weight</span>
            <span className="num font-medium text-ink">{TOTAL_WEIGHT} / 100</span>
          </footer>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-[18px] tracking-tightish font-medium text-ink">
          {COPY.about.methodologyTitle}
        </h2>
        <ul className="space-y-3 text-[14px] leading-relaxed text-ink-muted">
          <li className="pl-5 relative">
            <span className="absolute left-0 top-2.5 size-1.5 rounded-full bg-accent" />
            <strong className="text-ink font-medium">No model training.</strong>{" "}
            Each factor is a hand-tuned weight. The whole config sits in one
            file (<code className="text-[12px] text-accent">src/lib/risk-config.ts</code>) — eight lines per
            factor, edited by a coordinator who knows their roster.
          </li>
          <li className="pl-5 relative">
            <span className="absolute left-0 top-2.5 size-1.5 rounded-full bg-accent" />
            <strong className="text-ink font-medium">Multiplier on reactive, not replacement.</strong>{" "}
            The Scheduler still does the work — Sentinel just hands it a warmer pool.
            When the callout fires, the Scheduler is chasing pre-confirmed backups
            instead of cold-paging fifty cold caregivers. Higher fill rate.
            Shorter time-to-fill.
          </li>
          <li className="pl-5 relative">
            <span className="absolute left-0 top-2.5 size-1.5 rounded-full bg-accent" />
            <strong className="text-ink font-medium">Pre-warm, not mass-blast.</strong>{" "}
            For every flagged shift, Sentinel hands the Scheduler a 3-deep chain of named
            backups in priority order. The Scheduler pings them at 9pm the night before,
            in sequence, the same way it does today for live callouts — only earlier.
          </li>
          <li className="pl-5 relative">
            <span className="absolute left-0 top-2.5 size-1.5 rounded-full bg-accent" />
            <strong className="text-ink font-medium">Same agents, same surface.</strong>{" "}
            No new product for the Phoebe team to support. Sentinel is a signal
            that lives in the same coordinator dashboard, fires the same Scheduler,
            and routes through the same SMS/voice infrastructure. The reactive
            coverage Phoebe ships today gets meaningfully better with a warmer pool
            behind it.
          </li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-[18px] tracking-tightish font-medium text-ink">
          What this isn’t
        </h2>
        <ul className="space-y-2 text-[14px] text-ink-muted">
          <li>— Not a chatbot.</li>
          <li>— Not a forecaster you act on alone.</li>
          <li>— Not a replacement for the reactive Scheduler. It’s a multiplier — the Scheduler still does the work, just from a warmer pool.</li>
          <li>— Not running off real PHI. This prototype uses synthetic data on a fictional agency.</li>
        </ul>
      </section>

      <section className="rounded-lg border border-line bg-paper-deep/40 p-5 text-[13px] text-ink-muted">
        <div className="text-[11px] uppercase tracking-[0.12em] text-ink-faint mb-2">
          For Phoebe
        </div>
        <p className="leading-relaxed">
          This prototype is a portfolio piece, not a product pitch. The wedge is the part
          worth keeping: the reactive coverage Phoebe ships today gets meaningfully better
          when it has a pre-confirmed backup pool waiting. Same Scheduler. Same Receptionist.
          Same Timekeeper. Same SMS and voice stack. Higher fill rate. Shorter time-to-fill.
        </p>
      </section>
    </div>
  );
}
