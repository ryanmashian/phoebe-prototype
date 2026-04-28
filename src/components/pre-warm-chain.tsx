import type { PreWarmEntry, Caregiver } from "@/lib/types";
import { shortTime, relativeTime } from "@/lib/format";
import { Check, X, Clock, MessageSquare, Phone } from "lucide-react";
import { cn } from "@/lib/utils";

interface PreWarmChainProps {
  entries: Array<PreWarmEntry & { caregiver: Caregiver }>;
}

const RESPONSE_STYLE: Record<string, { icon: React.ReactNode; cls: string; label: string }> = {
  available: {
    icon: <Check className="size-3.5" />,
    cls: "text-ok bg-risk-low-bg/60 border-risk-low-bg",
    label: "available",
  },
  unavailable: {
    icon: <X className="size-3.5" />,
    cls: "text-ink-muted bg-paper-deep border-line",
    label: "unavailable",
  },
  no_response: {
    icon: <Clock className="size-3.5" />,
    cls: "text-warn bg-risk-med-bg/60 border-risk-med-bg",
    label: "no response yet",
  },
};

export function PreWarmChain({ entries }: PreWarmChainProps) {
  if (entries.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-line p-4 text-[13px] text-ink-muted">
        No backups pre-warmed for this shift yet. Sentinel can hand a 3-deep chain to
        the Scheduler — three named backups, in priority order, no mass blast.
      </div>
    );
  }

  return (
    <ol className="space-y-2">
      {entries.map((e) => {
        const respKey = e.response ?? "no_response";
        const style = RESPONSE_STYLE[respKey];
        return (
          <li
            key={e.id}
            className="flex items-start gap-3 rounded-lg border border-line bg-card p-3"
          >
            <span className="num text-[11px] text-ink-faint w-5 mt-0.5">#{e.position}</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline gap-2 flex-wrap">
                <span className="font-medium text-ink">{e.caregiver.name}</span>
                <span className="text-[11px] text-ink-faint">band {e.caregiver.reliability_band}</span>
                <span className="text-[11px] text-ink-faint">{e.caregiver.zone.split("-").pop()}</span>
              </div>
              <div className="mt-1 text-[12px] text-ink-muted flex items-center gap-2 flex-wrap">
                {e.channel === "sms" ? (
                  <span className="inline-flex items-center gap-1">
                    <MessageSquare className="size-3" /> SMS
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1">
                    <Phone className="size-3" /> voice
                  </span>
                )}
                {e.pinged_at && (
                  <span className="num text-ink-faint">
                    pinged {shortTime(e.pinged_at)}
                  </span>
                )}
                {e.responded_at && (
                  <span className="num text-ink-faint">
                    · responded {relativeTime(e.responded_at)}
                  </span>
                )}
              </div>
            </div>
            <span
              className={cn(
                "inline-flex items-center gap-1 px-2 h-6 rounded-md border text-[11px] font-medium",
                style.cls
              )}
            >
              {style.icon}
              {style.label}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
