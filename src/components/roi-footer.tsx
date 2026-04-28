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
            {COPY.roi.headline}: a warmer pool behind the existing{" "}
            <span className="font-semibold">75% reactive fill</span>, on the
            night it matters most.
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
  const rows: Array<[string, string, string, "grounded" | "assumption"]> = [
    ["Industry callout rate", "~10% / mo", "Activated Insights, 2024", "grounded"],
    ["Phoebe reactive fill", "75% in <15m", "phoebe.work, published", "grounded"],
    ["Caregiver turnover", "75% / yr", "HCAOA, 2024", "grounded"],
    ["Absenteeism profit hit", ">15%", "Activated Insights", "grounded"],
    ["Predictable subset (?)", "—", "your data answers", "assumption"],
    ["Pre-warm conversion (?)", "—", "your data answers", "assumption"],
  ];

  return (
    <dl className="rounded-lg border border-line bg-card divide-y divide-line text-[12px]">
      {rows.map(([k, v, sub, kind]) => (
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
              "num " +
              (kind === "assumption" ? "text-ink-faint" : "text-ink")
            }
          >
            {v}
          </dd>
        </div>
      ))}
    </dl>
  );
}
