/**
 * Morning state — the entry point of the page.
 *
 * "Wednesday, 7:14 AM. Last night, 8 shifts pre-warmed. 6 chains
 *  confirmed. 2 need you."
 *
 * Surfaces the named "needs you" rows below the headline. Each row is
 * a specific shift where the chain came back partial or empty. The
 * coordinator should be able to scan, decide, and link into the shift
 * detail in under 5 seconds.
 */

import Link from "next/link";
import { ChevronRight } from "lucide-react";

import type { MorningState, NeedsAttentionRow } from "@/lib/types";
import { COPY } from "@/lib/copy";
import {
  anchorWeekday,
  now as anchorNow,
} from "@/lib/clock";
import { shortTime } from "@/lib/format";
import { SectionRail } from "./section-rail";
import { PreWarmChain } from "./pre-warm-chain";

interface MorningStateProps {
  state: MorningState;
  /**
   * The chain entries for each "needs you" row, keyed by shift_id.
   * Lifted up from the page so we can fetch all data in one pass.
   */
  chainsByShiftId: Record<number, Parameters<typeof PreWarmChain>[0]["entries"]>;
}

function formatAnchorTime(): string {
  return anchorNow().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "America/New_York",
  });
}

export function MorningStateSection({ state, chainsByShiftId }: MorningStateProps) {
  const weekday = anchorWeekday();
  const time = formatAnchorTime();
  const needsCount = state.needs_attention.length;

  return (
    <section className="space-y-5">
      <SectionRail eyebrow={COPY.morning.eyebrow} live />

      <header className="space-y-3 max-w-[860px]">
        <h1 className="text-[34px] sm:text-[40px] tracking-tightish leading-[1.05] text-ink font-medium">
          {COPY.morning.headline(weekday, time, state.prewarmed_count, state.confirmed_count, needsCount)}
        </h1>
        {needsCount > 0 ? (
          <p className="text-[14px] leading-relaxed text-ink-muted max-w-[60ch]">
            {COPY.morning.sub}
          </p>
        ) : (
          <p className="text-[14px] leading-relaxed text-ink-muted max-w-[60ch]">
            {COPY.morning.emptyCleanSub}
          </p>
        )}
      </header>

      {needsCount > 0 ? (
        <div className="space-y-3">
          {state.needs_attention.map((row) => (
            <NeedsRow
              key={row.shift_id}
              row={row}
              chain={chainsByShiftId[row.shift_id] ?? []}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-line bg-card px-5 py-4 text-[14px] text-ink-muted">
          {COPY.morning.emptyClean}
        </div>
      )}
    </section>
  );
}

function NeedsRow({
  row,
  chain,
}: {
  row: NeedsAttentionRow;
  chain: Parameters<typeof PreWarmChain>[0]["entries"];
}) {
  const reason =
    row.chain_status === "partial" && row.late_winner_name
      ? COPY.morning.rowPartial(row.late_winner_name.split(" ")[0])
      : COPY.morning.rowFailed;

  const accentLabel = row.chain_status === "failed" ? "empty" : "deep";
  const accentCls =
    row.chain_status === "failed"
      ? "text-risk-high-fg bg-risk-high-bg/60 border-risk-high-bg"
      : "text-warn bg-risk-med-bg/60 border-risk-med-bg";

  return (
    <article className="rounded-xl border border-line bg-card overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-4 p-4 lg:p-5 items-start">
        <div className="space-y-2.5 min-w-0">
          <div className="flex items-baseline gap-2 flex-wrap">
            <span
              className={
                "text-[10px] uppercase tracking-[0.12em] px-1.5 h-5 inline-flex items-center rounded-md border " +
                accentCls
              }
            >
              chain {accentLabel}
            </span>
            <span className="num text-[12px] text-ink-faint">
              {shortTime(row.starts_at)}
            </span>
            <span className="text-[12px] text-ink-faint">
              {row.zone.split("-").pop()}
            </span>
          </div>

          <h3 className="text-[20px] tracking-tightish text-ink leading-tight">
            <span className="text-ink-muted">{row.caregiver_name.split(" ")[0]} →</span>{" "}
            <span className="font-medium">{row.client_name}</span>
          </h3>

          <p className="text-[13px] text-ink-muted leading-relaxed max-w-[60ch]">
            {reason}
          </p>

          {chain.length > 0 && (
            <div className="pt-1">
              <PreWarmChain entries={chain} variant="compact" />
            </div>
          )}
        </div>

        <div className="flex flex-row lg:flex-col gap-2 lg:items-end shrink-0">
          <Link
            href={`/shifts/${row.shift_id}`}
            className="inline-flex items-center gap-1 px-3 h-9 rounded-lg bg-accent text-accent-fg text-[13px] font-medium hover:opacity-90 transition-opacity"
          >
            {COPY.morning.rowOpenShift}
            <ChevronRight className="size-3.5" />
          </Link>
          <button
            type="button"
            className="inline-flex items-center px-3 h-9 rounded-lg border border-line bg-paper text-ink-muted text-[13px] hover:text-ink hover:border-line-strong transition-colors"
          >
            {COPY.morning.rowMarkResolved}
          </button>
        </div>
      </div>
    </article>
  );
}
