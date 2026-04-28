/**
 * Agent activity log — the audit trail.
 *
 * Vertical timeline of overnight events: ping, response, confirm,
 * escalation. Each line is a moment the Scheduler did something.
 * Density matters — this should read like an on-call log, not a
 * notification feed.
 *
 * Disproportionately important for Justin Woodbridge's audience: he
 * publicly writes about evaluating AI product reliability. This is
 * the surface that lets a coordinator (or a CEO) verify any claim the
 * morning state above is making.
 */

import type { AgentLogEvent } from "@/lib/types";
import { COPY } from "@/lib/copy";
import { shortTime } from "@/lib/format";
import { SectionRail } from "./section-rail";

interface AgentLogProps {
  events: AgentLogEvent[];
}

const EVENT_DOT: Record<AgentLogEvent["event_type"], string> = {
  kickoff: "bg-accent",
  ping: "bg-line-strong",
  response_available: "bg-ok",
  response_unavailable: "bg-ink-faint",
  no_response: "bg-warn",
  confirmed: "bg-ok",
  escalation: "bg-danger",
};

const EVENT_KIND: Record<AgentLogEvent["event_type"], string> = {
  kickoff: "kickoff",
  ping: "ping",
  response_available: "available",
  response_unavailable: "unavailable",
  no_response: "no response",
  confirmed: "confirmed",
  escalation: "escalation",
};

export function AgentLogSection({ events }: AgentLogProps) {
  if (events.length === 0) {
    return (
      <section className="space-y-3">
        <SectionRail eyebrow={COPY.activityLog.eyebrow} />
        <div className="rounded-lg border border-dashed border-line p-4 text-[13px] text-ink-muted">
          {COPY.activityLog.emptyState}
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-3">
      <SectionRail eyebrow={COPY.activityLog.eyebrow} />

      <div className="rounded-xl border border-line bg-card overflow-hidden">
        <header className="border-b border-line px-5 py-3">
          <h2 className="text-[15px] font-medium text-ink">
            {COPY.activityLog.title}
          </h2>
          <p className="text-[12px] text-ink-muted mt-0.5 max-w-[60ch]">
            {COPY.activityLog.sub}
          </p>
        </header>

        <ol className="divide-y divide-line">
          {events.map((evt, i) => {
            const isFirstOfShift =
              i > 0 && events[i - 1].shift_id !== evt.shift_id;
            return (
              <li
                key={evt.id}
                className={
                  "grid grid-cols-[64px_14px_1fr] gap-3 items-baseline px-5 py-2 hover:bg-paper-deep/40 transition-colors " +
                  (isFirstOfShift ? "border-t-2 border-t-line" : "")
                }
              >
                <span className="num text-[11px] text-ink-faint">
                  {shortTime(evt.ts)}
                </span>
                <span className="flex justify-center pt-1.5">
                  <span
                    className={
                      "size-1.5 rounded-full inline-block " +
                      EVENT_DOT[evt.event_type]
                    }
                    aria-hidden
                  />
                </span>
                <div className="min-w-0">
                  <span className="text-[13px] text-ink leading-snug">
                    {evt.detail}
                  </span>
                  <span className="ml-2 text-[10px] uppercase tracking-[0.1em] text-ink-faint">
                    {EVENT_KIND[evt.event_type]}
                  </span>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
