import type { PreWarmEntry, Caregiver } from "@/lib/types";
import { shortTime, relativeTime } from "@/lib/format";
import { Check, X, Clock, MessageSquare, Phone } from "lucide-react";
import { cn } from "@/lib/utils";

type ChainEntry = PreWarmEntry & { caregiver: Caregiver };

interface PreWarmChainProps {
  entries: ChainEntry[];
  variant?: "full" | "compact";
}

const RESPONSE_STYLE: Record<
  string,
  { icon: React.ReactNode; cls: string; label: string; dot: string }
> = {
  available: {
    icon: <Check className="size-3.5" />,
    cls: "text-ok bg-risk-low-bg/60 border-risk-low-bg",
    label: "available",
    dot: "bg-ok",
  },
  unavailable: {
    icon: <X className="size-3.5" />,
    cls: "text-ink-muted bg-paper-deep border-line",
    label: "unavailable",
    dot: "bg-ink-faint",
  },
  no_response: {
    icon: <Clock className="size-3.5" />,
    cls: "text-warn bg-risk-med-bg/60 border-risk-med-bg",
    label: "no response yet",
    dot: "bg-warn",
  },
  pending: {
    icon: <Clock className="size-3.5" />,
    cls: "text-ink-faint bg-paper-deep/60 border-line",
    label: "not reached",
    dot: "bg-line-strong",
  },
};

function compactStatus(e: ChainEntry): string {
  if (e.response === "available") return "confirmed";
  if (e.response === "unavailable") return "unavailable";
  if (e.response === "no_response") return "no response";
  return "not reached";
}

function compactStatusKey(e: ChainEntry): keyof typeof RESPONSE_STYLE {
  if (!e.response) return "pending";
  return e.response;
}

export function PreWarmChain({ entries, variant = "full" }: PreWarmChainProps) {
  if (entries.length === 0) {
    if (variant === "compact") {
      return (
        <div className="text-[12px] text-ink-faint">
          No chain yet — Scheduler will queue at 9pm.
        </div>
      );
    }
    return (
      <div className="rounded-lg border border-dashed border-line p-4 text-[13px] text-ink-muted">
        No backups pre-warmed for this shift yet. Sentinel can hand a 3-deep chain to
        the Scheduler — three named backups, in priority order, no mass blast.
      </div>
    );
  }

  if (variant === "compact") {
    return (
      <ol className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px]">
        {entries.map((e, i) => {
          const key = compactStatusKey(e);
          const style = RESPONSE_STYLE[key];
          const status = compactStatus(e);
          return (
            <li key={e.id} className="inline-flex items-center gap-1.5">
              {i > 0 && (
                <span className="text-ink-faint mr-1.5" aria-hidden>
                  ·
                </span>
              )}
              <span
                className={cn("size-1.5 rounded-full inline-block", style.dot)}
                aria-hidden
              />
              <span className="text-ink">{e.caregiver.name.split(" ")[0]}</span>
              <span className="text-ink-faint">{status}</span>
            </li>
          );
        })}
      </ol>
    );
  }

  return (
    <ol className="space-y-2">
      {entries.map((e) => {
        const isScheduled = e.chain_status === "scheduled";
        const respKey = isScheduled ? "pending" : e.response ?? "no_response";
        const style = RESPONSE_STYLE[respKey];
        return (
          <li
            key={e.id}
            className={cn(
              "flex items-start gap-3 rounded-lg border p-3",
              isScheduled
                ? "border-line border-dashed bg-paper-deep/30"
                : "border-line bg-card"
            )}
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
                {isScheduled ? (
                  e.pinged_at && (
                    <span className="num text-ink-faint">
                      queues {shortTime(e.pinged_at)} tonight
                    </span>
                  )
                ) : (
                  <>
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
                  </>
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
              {isScheduled ? "scheduled" : style.label}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
