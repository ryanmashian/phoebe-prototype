import type { RiskFactor } from "@/lib/types";
import { cn } from "@/lib/utils";

interface RiskBarProps {
  factors: RiskFactor[];
  total?: number;
  className?: string;
}

const FACTOR_COLOR: Record<string, string> = {
  no_show_history: "bg-[rgb(150_42_28)]",
  hours_vs_ceiling: "bg-[rgb(184_130_26)]",
  continuity_break: "bg-[rgb(124_75_120)]",
  days_since_off: "bg-[rgb(74_104_136)]",
  distance: "bg-[rgb(140_90_55)]",
  weather_transit: "bg-[rgb(60_120_120)]",
};

export function RiskBar({ factors, total = 100, className }: RiskBarProps) {
  const score = factors.reduce((s, f) => s + f.contribution, 0);

  return (
    <div className={cn("space-y-3", className)}>
      <div className="relative h-3 rounded-full bg-paper-deep overflow-hidden border border-line">
        <div className="absolute inset-y-0 left-0 flex">
          {factors.map((f) =>
            f.contribution > 0 ? (
              <div
                key={f.key}
                className={cn(FACTOR_COLOR[f.key], "h-full")}
                style={{ width: `${(f.contribution / total) * 100}%` }}
                title={`${f.label}: ${f.contribution.toFixed(1)} of ${f.weight}`}
              />
            ) : null
          )}
        </div>
        <div
          className="absolute top-0 bottom-0 border-r border-dashed border-ink-faint"
          style={{ left: `${(score / total) * 100}%` }}
        />
      </div>

      <ul className="space-y-2">
        {factors.map((f) => {
          const filled = f.contribution > 0;
          return (
            <li
              key={f.key}
              className={cn(
                "grid grid-cols-[10px_1fr_auto] items-baseline gap-3",
                !filled && "opacity-55"
              )}
            >
              <span
                className={cn(
                  "h-2.5 w-2.5 rounded-sm self-center",
                  FACTOR_COLOR[f.key]
                )}
              />
              <div>
                <div className="text-[13px] font-medium text-ink">{f.label}</div>
                <div className="text-[12px] text-ink-muted leading-snug">{f.evidence}</div>
              </div>
              <div className="num text-[12px] text-ink-muted">
                <span className="text-ink font-medium">+{f.contribution.toFixed(1)}</span>
                <span className="text-ink-faint"> / {f.weight}</span>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
