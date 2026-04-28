export function shortTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).replace(" ", "").toLowerCase();
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

export function relativeTime(iso: string, nowIso?: string): string {
  const now = nowIso ? new Date(nowIso) : new Date();
  const t = new Date(iso);
  const diffMs = now.getTime() - t.getTime();
  const mins = Math.round(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.round(hrs / 24)}d ago`;
}
