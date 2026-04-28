"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback } from "react";
import { cn } from "@/lib/utils";

interface FilterBarProps {
  zones: string[];
}

const RISK_FLOORS = [
  { v: "0", label: "All risk" },
  { v: "30", label: "30+" },
  { v: "40", label: "40+ (high)" },
  { v: "60", label: "60+ (urgent)" },
];

const SORTS = [
  { v: "risk", label: "Risk score" },
  { v: "time", label: "Shift time" },
  { v: "zone", label: "Zone" },
];

export function FilterBar({ zones }: FilterBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const setParam = useCallback(
    (key: string, value: string | null) => {
      const next = new URLSearchParams(params.toString());
      if (value === null || value === "" || value === "all") next.delete(key);
      else next.set(key, value);
      router.replace(`${pathname}?${next.toString()}`, { scroll: false });
    },
    [pathname, params, router]
  );

  const zone = params.get("zone") ?? "all";
  const floor = params.get("floor") ?? "0";
  const sort = params.get("sort") ?? "risk";

  return (
    <div className="flex flex-wrap items-center gap-2 px-4 py-2.5 border-b border-line bg-paper-deep/30">
      <div className="text-[12px] uppercase tracking-[0.1em] text-ink-faint">
        Tomorrow’s queue
      </div>

      <div className="ml-auto flex items-center gap-2">
        <SegmentedSelect
          label="Risk"
          value={floor}
          options={RISK_FLOORS.map((r) => ({ value: r.v, label: r.label }))}
          onChange={(v) => setParam("floor", v === "0" ? null : v)}
        />
        <SegmentedSelect
          label="Zone"
          value={zone}
          options={[
            { value: "all", label: "All zones" },
            ...zones.map((z) => ({ value: z, label: z.split("-").pop() ?? z })),
          ]}
          onChange={(v) => setParam("zone", v === "all" ? null : v)}
        />
        <SegmentedSelect
          label="Sort"
          value={sort}
          options={SORTS.map((s) => ({ value: s.v, label: s.label }))}
          onChange={(v) => setParam("sort", v === "risk" ? null : v)}
        />
      </div>
    </div>
  );
}

interface SegmentedSelectProps {
  label: string;
  value: string;
  options: Array<{ value: string; label: string }>;
  onChange: (v: string) => void;
}

function SegmentedSelect({ label, value, options, onChange }: SegmentedSelectProps) {
  return (
    <label className="inline-flex items-center gap-2">
      <span className="text-[11px] uppercase tracking-[0.1em] text-ink-faint">
        {label}
      </span>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={cn(
            "appearance-none bg-card border border-line-strong rounded-md",
            "h-7 pl-2.5 pr-7 text-[12px] text-ink hover:border-ink-faint cursor-pointer",
            "focus:border-accent focus:outline-none"
          )}
        >
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <svg
          className="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2 text-ink-faint"
          width="10"
          height="10"
          viewBox="0 0 10 10"
          fill="none"
          aria-hidden
        >
          <path d="M2 4l3 3 3-3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </label>
  );
}
