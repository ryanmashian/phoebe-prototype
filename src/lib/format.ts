export function shortTime(iso: string): string {
  // Pinned to America/New_York. The synthetic agency is in Brooklyn/Bronx,
  // and Vercel's build server runs in UTC — without an explicit zone the
  // production output would shift four hours from what's expected.
  const d = new Date(iso);
  return d
    .toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
      timeZone: "America/New_York",
    })
    .replace(" ", "")
    .toLowerCase();
}

export function timeRange(startIso: string, endIso: string): string {
  return `${shortTime(startIso)} – ${shortTime(endIso)}`;
}

export function firstName(full: string): string {
  return full.split(" ")[0];
}

export function lastInitial(full: string): string {
  const parts = full.split(" ");
  return parts.length > 1 ? `${parts[0]} ${parts[parts.length - 1][0]}.` : full;
}

export function dollars(n: number): string {
  if (n >= 1000) return `$${(n / 1000).toFixed(0)}K`;
  return `$${n.toFixed(0)}`;
}

export function pct(n: number): string {
  return `${Math.round(n)}%`;
}

import { NOW_ANCHOR } from "./clock";

export function relativeTime(iso: string, nowIso?: string): string {
  // Default to the time-anchor, not wall clock. The prototype is statically
  // built — every relative timestamp must read against the same "now".
  const now = new Date(nowIso ?? NOW_ANCHOR);
  const t = new Date(iso);
  const diffMs = now.getTime() - t.getTime();
  const mins = Math.round(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.round(hrs / 24)}d ago`;
}
