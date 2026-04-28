import { COPY } from "@/lib/copy";

interface RoiFooterProps {
  highRiskCount: number;
}

export function RoiFooter({ highRiskCount }: RoiFooterProps) {
  return (
    <section className="rounded-xl border border-line bg-paper-deep/40 p-5 lg:p-6">
      <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-5 items-center">
        <div>
          <div className="text-[11px] uppercase tracking-[0.12em] text-ink-faint mb-1.5">
            Why this matters
          </div>
          <div className="text-[20px] leading-snug text-ink tracking-tightish max-w-[42ch]">
            {COPY.roi.headline}:{" "}
            <span className="font-semibold">{COPY.roi.money}</span>.
          </div>
          <p className="mt-2 text-[13px] text-ink-muted max-w-[60ch]">
            {COPY.roi.contract}. Sentinel doesn’t replace the Scheduler — it aims it
            twelve hours earlier, at the {highRiskCount} shifts most likely to drop.
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
    ["Caregivers", "60", "active roster"],
    ["Monthly callout rate", "14%", "industry baseline"],
    ["Shifts / month", "1,440", "~24 / day"],
    ["Callouts prevented (1 in 4)", "50", "per month"],
    ["Avg revenue / shift", "$34", "blended"],
    ["Gross recovered", "$76,160", "/ year"],
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
