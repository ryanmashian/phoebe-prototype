import { COPY } from "@/lib/copy";
import { CloudDrizzle, TrainFront, AlertTriangle } from "lucide-react";

interface BannerSummaryProps {
  highRisk: number;
  prewarmed: number;
  attention: number;
  advisories: Array<{ zone: string; type: string; detail: string }>;
}

export function BannerSummary({
  highRisk,
  prewarmed,
  attention,
  advisories,
}: BannerSummaryProps) {
  const rain = advisories.filter((a) => a.type === "rain");
  const transit = advisories.filter((a) => a.type === "transit");

  return (
    <section className="rounded-xl bg-card border border-line shadow-card overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px]">
        <div className="p-6 space-y-3">
          <div className="space-y-2">
            <h2 className="text-[22px] leading-[1.15] tracking-tightish font-medium text-ink max-w-[26ch]">
              <span className="num">{highRisk}</span>{" "}
              {highRisk === 1 ? "shift" : "shifts"} at high callout risk tomorrow.
            </h2>
            <p className="text-ink-muted text-[14px] max-w-[60ch]">
              <span className="num text-ink font-medium">{prewarmed}</span> pre-warmed.{" "}
              <span className="num text-ink font-medium">{attention}</span>{" "}
              {attention === 1 ? "needs" : "need"} attention.{" "}
              {COPY.banner.sub}
            </p>
          </div>
        </div>

        <aside className="border-t lg:border-t-0 lg:border-l border-line bg-paper-deep/40 p-6 space-y-3">
          <div className="text-[11px] uppercase tracking-[0.12em] text-ink-faint">
            Tomorrow’s signals
          </div>
          <ul className="space-y-2.5 text-[13px] text-ink">
            {rain.length > 0 && (
              <li className="flex items-start gap-2">
                <CloudDrizzle className="size-4 text-ink-muted mt-0.5 shrink-0" />
                <span>
                  Rain in <span className="font-medium">{rain.length}</span> Bronx zones, 6am–10am.
                </span>
              </li>
            )}
            {transit.map((t, i) => (
              <li key={i} className="flex items-start gap-2">
                <TrainFront className="size-4 text-ink-muted mt-0.5 shrink-0" />
                <span>{t.detail}</span>
              </li>
            ))}
            {attention > 0 && (
              <li className="flex items-start gap-2">
                <AlertTriangle className="size-4 text-warn mt-0.5 shrink-0" />
                <span>
                  <span className="num font-medium">{attention}</span> high-risk{" "}
                  {attention === 1 ? "shift has" : "shifts have"} no backup chain yet.
                </span>
              </li>
            )}
          </ul>
        </aside>
      </div>
    </section>
  );
}
