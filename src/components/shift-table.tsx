"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronRight, MapPin, ShieldCheck, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ScoredShift } from "@/lib/types";
import { RiskBadge } from "@/components/risk-badge";
import { shortTime, timeRange, lastInitial } from "@/lib/format";

interface ShiftTableProps {
  shifts: ScoredShift[];
}

type SortKey = "risk" | "time" | "zone";

function applyFilters(
  shifts: ScoredShift[],
  zone: string,
  floor: number,
  sort: SortKey
): ScoredShift[] {
  let out = shifts;
  if (zone !== "all") out = out.filter((s) => s.shift.zone === zone);
  if (floor > 0) out = out.filter((s) => s.risk >= floor);
  return [...out].sort((a, b) => {
    if (sort === "time") return a.shift.starts_at.localeCompare(b.shift.starts_at);
    if (sort === "zone") return a.shift.zone.localeCompare(b.shift.zone);
    return b.risk - a.risk; // default: risk desc
  });
}

export function ShiftTable({ shifts }: ShiftTableProps) {
  const params = useSearchParams();
  const router = useRouter();
  const zone = params.get("zone") ?? "all";
  const floor = parseInt(params.get("floor") ?? "0", 10);
  const sort = (params.get("sort") ?? "risk") as SortKey;

  const filtered = useMemo(
    () => applyFilters(shifts, zone, floor, sort),
    [shifts, zone, floor, sort]
  );

  const [activeIdx, setActiveIdx] = useState<number>(-1);
  const tbodyRef = useRef<HTMLTableSectionElement>(null);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      // Don't intercept when typing in form fields
      const target = e.target as HTMLElement;
      if (target.tagName === "SELECT" || target.tagName === "INPUT" || target.tagName === "TEXTAREA") {
        return;
      }
      if (filtered.length === 0) return;
      if (e.key === "ArrowDown" || e.key === "j") {
        e.preventDefault();
        setActiveIdx((i) => Math.min(i + 1, filtered.length - 1));
      } else if (e.key === "ArrowUp" || e.key === "k") {
        e.preventDefault();
        setActiveIdx((i) => Math.max(i - 1, 0));
      } else if (e.key === "Enter" && activeIdx >= 0) {
        e.preventDefault();
        router.push(`/shifts/${filtered[activeIdx].shift.id}`);
      } else if (e.key === "Escape") {
        setActiveIdx(-1);
      }
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [filtered, activeIdx, router]);

  useEffect(() => {
    if (activeIdx < 0 || !tbodyRef.current) return;
    const row = tbodyRef.current.children[activeIdx] as HTMLElement | undefined;
    row?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [activeIdx]);

  if (filtered.length === 0) {
    return (
      <div className="px-6 py-16 text-center">
        <div className="text-ink-muted text-sm">
          Nothing matches that filter. Loosen it or check tomorrow’s full board.
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-[13px]">
        <thead>
          <tr className="text-[11px] uppercase tracking-[0.1em] text-ink-faint">
            <th className="text-left font-medium px-4 py-2">Risk</th>
            <th className="text-left font-medium px-2 py-2">Shift</th>
            <th className="text-left font-medium px-2 py-2">Caregiver</th>
            <th className="text-left font-medium px-2 py-2">Client</th>
            <th className="text-left font-medium px-2 py-2">Zone</th>
            <th className="text-left font-medium px-2 py-2">Status</th>
            <th className="px-2 py-2" />
          </tr>
        </thead>
        <tbody ref={tbodyRef} className="divide-y divide-line">
          {filtered.map((s, idx) => (
            <ShiftRow
              key={s.shift.id}
              scored={s}
              active={idx === activeIdx}
              onMouseEnter={() => setActiveIdx(idx)}
            />
          ))}
        </tbody>
      </table>

      <div className="px-4 py-3 text-[12px] text-ink-faint border-t border-line bg-paper-deep/30 flex items-center gap-3">
        <KbdHint k="↑↓" desc="navigate" />
        <KbdHint k="↵" desc="open shift" />
        <KbdHint k="esc" desc="clear" />
      </div>
    </div>
  );
}

interface ShiftRowProps {
  scored: ScoredShift;
  active: boolean;
  onMouseEnter: () => void;
}

function ShiftRow({ scored, active, onMouseEnter }: ShiftRowProps) {
  const { shift, caregiver, client, prewarm } = scored;
  const isPrewarmed = shift.prewarmed === 1;
  const needsAttention = scored.risk >= 40 && !isPrewarmed;
  const confirmedBackup = prewarm.find((p) => p.response === "available");

  return (
    <tr
      className={cn(
        "row-hover transition-colors group",
        active && "row-active",
        scored.risk >= 60 && "bg-paper-deep/50"
      )}
      onMouseEnter={onMouseEnter}
    >
      <td className="px-4 py-2.5 align-middle">
        <RiskBadge score={scored.risk} />
      </td>
      <td className="px-2 py-2.5 align-middle">
        <div className="num text-ink font-medium">
          {shortTime(shift.starts_at)}
        </div>
        <div className="num text-[11px] text-ink-faint">
          {timeRange(shift.starts_at, shift.ends_at)}
        </div>
      </td>
      <td className="px-2 py-2.5 align-middle">
        <div className="text-ink font-medium leading-tight">{caregiver.name}</div>
        <div className="text-[11px] text-ink-muted flex items-center gap-2">
          <span>band {caregiver.reliability_band}</span>
          <span className="text-ink-faint">·</span>
          <span className="num">{caregiver.hours_this_week}h this week</span>
        </div>
      </td>
      <td className="px-2 py-2.5 align-middle">
        <div className="text-ink leading-tight">{lastInitial(client.name)}</div>
        <div className="text-[11px] text-ink-muted truncate max-w-[24ch]">
          {client.care_plan}
        </div>
      </td>
      <td className="px-2 py-2.5 align-middle">
        <div className="inline-flex items-center gap-1 text-[12px] text-ink-muted">
          <MapPin className="size-3 text-ink-faint" />
          {shift.zone.replace("Brooklyn-", "Bk · ").replace("Bronx-", "Bx · ").replace("Manhattan-", "Mn · ").replace("Queens-", "Qn · ")}
        </div>
      </td>
      <td className="px-2 py-2.5 align-middle">
        {isPrewarmed && confirmedBackup ? (
          <span className="inline-flex items-center gap-1 text-[12px] text-ok">
            <ShieldCheck className="size-3.5" />
            backup confirmed
          </span>
        ) : isPrewarmed ? (
          <span className="inline-flex items-center gap-1 text-[12px] text-warn">
            <ShieldCheck className="size-3.5" />
            pre-warming
          </span>
        ) : needsAttention ? (
          <span className="inline-flex items-center gap-1 text-[12px] text-danger">
            <AlertCircle className="size-3.5" />
            needs attention
          </span>
        ) : scored.risk >= 30 ? (
          <span className="inline-flex items-center gap-1 text-[12px] text-ink-muted">
            watching
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-[12px] text-ink-faint">
            scheduled
          </span>
        )}
      </td>
      <td className="px-2 py-2.5 align-middle text-right">
        <Link
          href={`/shifts/${shift.id}`}
          className="inline-flex items-center gap-0.5 text-[12px] text-ink-muted hover:text-accent group-hover:text-accent"
        >
          open
          <ChevronRight className="size-3" />
        </Link>
      </td>
    </tr>
  );
}

function KbdHint({ k, desc }: { k: string; desc: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <kbd className="num inline-flex items-center justify-center min-w-[20px] h-5 px-1 rounded bg-card border border-line-strong text-[11px] text-ink-muted">
        {k}
      </kbd>
      <span>{desc}</span>
    </span>
  );
}
