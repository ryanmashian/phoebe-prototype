import { cn } from "@/lib/utils";
import { bandFor } from "@/lib/risk-config";

interface RiskBadgeProps {
  score: number;
  size?: "sm" | "md";
  className?: string;
}

const BAND_STYLES: Record<ReturnType<typeof bandFor>, string> = {
  low: "bg-risk-low-bg text-risk-low-fg",
  med: "bg-risk-med-bg text-risk-med-fg",
  high: "bg-risk-high-bg text-risk-high-fg",
  crit: "bg-risk-crit-bg text-risk-crit-fg",
};

export function RiskBadge({ score, size = "md", className }: RiskBadgeProps) {
  const band = bandFor(score);
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-md num font-medium tracking-tightish tabular-nums",
        BAND_STYLES[band],
        size === "sm" ? "h-5 min-w-[28px] px-1.5 text-[11px]" : "h-7 min-w-[40px] px-2 text-[13px]",
        className
      )}
      title={`Sentinel risk score: ${score} / 100`}
    >
      {score}
    </span>
  );
}

export function bandLabel(band: ReturnType<typeof bandFor>): string {
  return { low: "low", med: "watch", high: "high", crit: "critical" }[band];
}
