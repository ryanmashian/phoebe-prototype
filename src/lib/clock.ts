/**
 * Single source of truth for "when" across the prototype.
 *
 * The dashboard is statically built — there is no real "now". To keep the
 * morning-state copy ("Wednesday, 7:14 AM"), the agent log timestamps, the
 * yesterday-outcomes window, and the tomorrow-planning view all consistent,
 * every date computation reads from NOW_ANCHOR. Never call `new Date()` in
 * application code.
 *
 * The anchor is set in NYC local time (EDT in late April). The agency in the
 * synthetic data is in Brooklyn & Bronx, so this is the right wall-clock for
 * anything user-visible.
 */

/** Wednesday, April 29, 2026 — 7:14 AM EDT (UTC-4) */
export const NOW_ANCHOR = "2026-04-29T11:14:00.000Z";

/** Returns the anchor as a Date. */
export function now(): Date {
  return new Date(NOW_ANCHOR);
}

function shiftDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setUTCDate(d.getUTCDate() + days);
  return d;
}

/** YYYY-MM-DD slice of the anchor in UTC. */
export function todayDate(): string {
  return now().toISOString().slice(0, 10);
}

/** YYYY-MM-DD for the day before the anchor. */
export function yesterdayDate(): string {
  return shiftDays(now(), -1).toISOString().slice(0, 10);
}

/** YYYY-MM-DD for the day after the anchor. */
export function tomorrowDate(): string {
  return shiftDays(now(), 1).toISOString().slice(0, 10);
}

/** YYYY-MM-DD for n days before the anchor. */
export function daysAgoDate(n: number): string {
  return shiftDays(now(), -n).toISOString().slice(0, 10);
}

/**
 * The window covering "last night" — from 9:00 PM yesterday to 7:14 AM today
 * (the anchor itself). Used to filter agent log entries and pre-warm
 * settlement timestamps for the morning state.
 */
export function lastNightWindow(): { start: string; end: string } {
  const anchor = now();
  const yesterday7pm = shiftDays(anchor, -1);
  yesterday7pm.setUTCHours(yesterday7pm.getUTCHours() - (anchor.getUTCHours() - 21));
  // Use a simple, explicit calculation: 9 PM EDT = 01:00 UTC the next day
  const start = `${yesterdayDate()}T21:00:00-04:00`;
  const end = NOW_ANCHOR;
  return { start, end };
}

/**
 * Pretty-formatted anchor for display: "Wednesday, April 29 · 7:14 AM"
 * Used in the morning-state headline.
 */
export function anchorPretty(): string {
  const d = now();
  const weekday = d.toLocaleDateString("en-US", {
    weekday: "long",
    timeZone: "America/New_York",
  });
  const month = d.toLocaleDateString("en-US", {
    month: "long",
    timeZone: "America/New_York",
  });
  const day = d.toLocaleDateString("en-US", {
    day: "numeric",
    timeZone: "America/New_York",
  });
  const time = d.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    timeZone: "America/New_York",
  });
  return `${weekday}, ${month} ${day} · ${time}`;
}

/** Just the weekday name in NY time. */
export function anchorWeekday(): string {
  return now().toLocaleDateString("en-US", {
    weekday: "long",
    timeZone: "America/New_York",
  });
}

/** Tomorrow's weekday name in NY time. */
export function tomorrowWeekday(): string {
  const d = shiftDays(now(), 1);
  return d.toLocaleDateString("en-US", {
    weekday: "long",
    timeZone: "America/New_York",
  });
}

/** Yesterday's weekday name in NY time. */
export function yesterdayWeekday(): string {
  const d = shiftDays(now(), -1);
  return d.toLocaleDateString("en-US", {
    weekday: "long",
    timeZone: "America/New_York",
  });
}
