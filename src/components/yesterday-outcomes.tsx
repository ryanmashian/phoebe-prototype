/**
 * Yesterday's outcomes — the proof loop.
 *
 * One sentence with all four numbers in mono: pre-warmed → callouts →
 * filled in <5 min → missed. Plus a baseline line ("without pre-warm,
 * average fill was ~12 min") and a methodology footnote so the numbers
 * trace back to seeded data.
 *
 * Subdued visual weight relative to the morning state — this is proof
 * the system worked, not the entry-point hero.
 */

import type { DailyOutcome } from "@/lib/types";
import { COPY } from "@/lib/copy";
import { SectionRail } from "./section-rail";

interface YesterdayOutcomesProps {
  outcome: DailyOutcome | null;
  rolling: {
    avg_prewarmed_per_night: number;
    total_callouts: number;
    total_missed: number;
    median_baseline_minutes: number;
  };
}

export function YesterdayOutcomesSection({
  outcome,
  rolling,
}: YesterdayOutcomesProps) {
  if (!outcome) {
    return (
      <section className="space-y-3">
        <SectionRail eyebrow={COPY.yesterday.eyebrow} />
        <div className="rounded-lg border border-dashed border-line p-4 text-[13px] text-ink-muted">
          No outcome record for yesterday yet.
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-3">
      <SectionRail eyebrow={COPY.yesterday.eyebrow} />

      <div className="rounded-xl border border-line bg-card p-5 space-y-4">
        {/* Primary outcome line — the four numbers, in mono. */}
        <p className="text-[18px] leading-snug text-ink tracking-tightish">
          <span className="num">{outcome.prewarmed_count}</span>{" "}
          <span className="text-ink-muted">pre-warmed →</span>{" "}
          <span className="num">{outcome.callout_count}</span>{" "}
          <span className="text-ink-muted">
            callout{outcome.callout_count === 1 ? "" : "s"} fired →
          </span>{" "}
          <span className="num">{outcome.filled_under_5min}</span>{" "}
          <span className="text-ink-muted">filled in &lt;5 min →</span>{" "}
          <span className="num font-semibold">{outcome.missed}</span>{" "}
          <span className="text-ink-muted">missed.</span>
        </p>

        <p className="text-[13px] text-ink-muted leading-relaxed max-w-[64ch]">
          {COPY.yesterday.baseline(outcome.baseline_fill_minutes_no_prewarm)}
        </p>

        {outcome.notes && (
          <p className="text-[13px] text-ink-muted leading-relaxed border-l-2 border-line-strong pl-3 max-w-[64ch] italic">
            {outcome.notes}
          </p>
        )}

        {/* 14-day rolling subhead — small, supportive. */}
        <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1 pt-1 border-t border-line">
          <span className="text-[11px] uppercase tracking-[0.12em] text-ink-faint">
            {COPY.yesterday.rollingLabel}
          </span>
          <span className="text-[12px] text-ink-muted">
            <span className="num text-ink">{rolling.avg_prewarmed_per_night}</span>
            /night pre-warmed
          </span>
          <span className="text-[12px] text-ink-muted">
            <span className="num text-ink">{rolling.total_callouts}</span> callouts
          </span>
          <span className="text-[12px] text-ink-muted">
            <span className="num text-ink">{rolling.total_missed}</span> missed total
          </span>
          <span className="text-[12px] text-ink-muted">
            baseline ~<span className="num text-ink">{rolling.median_baseline_minutes}</span>
            m
          </span>
        </div>

        {/* Methodology footnote — small, faint, but present. */}
        <p className="text-[11px] text-ink-faint leading-relaxed">
          {COPY.yesterday.methodology}
        </p>
      </div>
    </section>
  );
}
