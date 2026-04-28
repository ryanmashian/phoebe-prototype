import { COPY } from "@/lib/copy";

interface RoiFooterProps {
  highRiskCount: number;
}

export function RoiFooter({ highRiskCount }: RoiFooterProps) {
  return (
    <section className="rounded-xl border border-line bg-paper-deep/40 p-5 lg:p-6">
      <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-5 items-start">
        <div>
          <div className="text-[11px] uppercase tracking-[0.12em] text-ink-faint mb-1.5">
            Why this matters
          </div>
          <div className="text-[20px] leading-snug text-ink tracking-tightish max-w-[44ch]">
            {COPY.roi.headline}: reactive fill rate{" "}
            <span className="font-semibold">75% → 90%+</span>, median time-to-fill{" "}
            <span className="font-semibold">below 5 min</span>.
          </div>
          <p className="mt-2 text-[13px] text-ink-muted max-w-[60ch]">
            Sentinel multiplies the existing Scheduler. By pre-warming three backups
            for the {highRiskCount} highest-risk shifts each night, the Scheduler
            fills from a warmer pool when callouts fire — net{" "}
            <span className="font-medium text-ink">{COPY.roi.money}</span>,{" "}
            {COPY.roi.contract}.
          </p>
          <p className="mt-3 text-[11px] text-ink-faint num leading-relaxed">
            {COPY.roi.fineprint}
          </p>
        </div>

        <RoiCalc />
      </div>
    </section>
  );
}

function RoiCalc() {
  const rows: Array<[string, string, string]> = [
    ["Reactive fill rate", "~75% → 90%+", "before / after pre-warm"],
    ["Monthly callout rate", "10%", "industry baseline"],
    ["Predictable subset", "30%", "Sentinel flags night before"],
    ["Pre-warm conversion", "60%", "of flagged shifts confirmed"],
    ["Median time-to-fill", "< 5 min", "down from ~12 min"],
    ["Net recovered revenue", "$40–60K", "/ year"],
  ];

  return (
    <dl className="rounded-lg border border-line bg-card divide-y divide-line text-[12px]">
      {rows.map(([k, v, sub], i) => (
        <div
          key={k}
          className="flex items-baseline justify-between gap-3 px-3.5 py-2"
        >
          <dt className="text-ink-muted">
            {k}
            {sub && (
              <span className="text-ink-faint text-[11px] ml-1.5">
                · {sub}
              </span>
            )}
          </dt>
          <dd
            className={
              "num text-ink " +
              (i === rows.length - 1 ? "font-semibold text-accent text-[14px]" : "")
            }
          >
            {v}
          </dd>
        </div>
      ))}
    </dl>
  );
}
