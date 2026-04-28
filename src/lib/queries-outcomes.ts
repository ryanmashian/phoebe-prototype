/**
 * Query layer for the time-aware workflow surfaces.
 *
 * Each function reads its date window from clock.ts. No new Date() calls.
 * The morning state, yesterday's outcomes, and the agent log all derive
 * from the same seeded data — they should never disagree with each other.
 */

import { getDb } from "./db";
import { yesterdayDate, todayDate, daysAgoDate } from "./clock";
import type {
  AgentLogEvent,
  Caregiver,
  DailyOutcome,
  MorningState,
  NeedsAttentionRow,
  PreWarmEntry,
} from "./types";

type ChainEntry = PreWarmEntry & { caregiver: Caregiver };

/**
 * Reads pre-warm chain outcomes that settled overnight for shifts starting
 * today. Returns counts plus the named "needs you" rows the morning state
 * surfaces for one-tap resolution.
 */
export function getMorningState(): MorningState {
  const db = getDb();
  const today = todayDate();

  // One row per shift: the chain_status (taken from any of its rows; they all
  // share the same status) plus the late-winner name if it was a partial.
  const shiftRows = db
    .prepare(
      `
        SELECT
          s.id              AS shift_id,
          s.starts_at       AS starts_at,
          s.zone            AS zone,
          cl.name           AS client_name,
          cg.name           AS caregiver_name,
          (
            SELECT pw.chain_status
            FROM prewarm_chains pw
            WHERE pw.shift_id = s.id
            LIMIT 1
          )                 AS chain_status,
          (
            SELECT cg2.name
            FROM prewarm_chains pw2
            JOIN caregivers cg2 ON cg2.id = pw2.caregiver_id
            WHERE pw2.shift_id = s.id
              AND pw2.position = 3
              AND pw2.response = 'available'
            LIMIT 1
          )                 AS late_winner_name
        FROM shifts s
        JOIN caregivers cg ON cg.id = s.caregiver_id
        JOIN clients cl    ON cl.id = s.client_id
        WHERE date(s.starts_at) = date(?)
          AND s.prewarmed = 1
        ORDER BY s.starts_at, s.id
      `
    )
    .all(today) as Array<{
      shift_id: number;
      starts_at: string;
      zone: string;
      client_name: string;
      caregiver_name: string;
      chain_status: string | null;
      late_winner_name: string | null;
    }>;

  const prewarmedCount = shiftRows.length;
  const confirmedCount = shiftRows.filter((r) => r.chain_status === "confirmed").length;

  const needsAttention: NeedsAttentionRow[] = shiftRows
    .filter((r) => r.chain_status === "partial" || r.chain_status === "failed")
    .map((r) => ({
      shift_id: r.shift_id,
      starts_at: r.starts_at,
      client_name: r.client_name,
      caregiver_name: r.caregiver_name,
      zone: r.zone,
      chain_status: r.chain_status as "partial" | "failed",
      late_winner_name: r.late_winner_name,
    }));

  return {
    prewarmed_count: prewarmedCount,
    confirmed_count: confirmedCount,
    needs_attention: needsAttention,
  };
}

/** Yesterday's row from daily_outcomes — the proof loop. */
export function getYesterdayOutcomes(): DailyOutcome | null {
  const db = getDb();
  const row = db
    .prepare(
      `SELECT for_date, prewarmed_count, callout_count, filled_under_5min,
              missed, baseline_fill_minutes_no_prewarm, notes
       FROM daily_outcomes
       WHERE for_date = ?`
    )
    .get(yesterdayDate()) as DailyOutcome | undefined;
  return row ?? null;
}

/**
 * 14-day rolling stats for the yesterday-outcomes section subhead.
 * Aggregates daily_outcomes from yesterday back to 14 days ago.
 */
export function getRollingStats(): {
  avg_prewarmed_per_night: number;
  total_callouts: number;
  total_missed: number;
  median_baseline_minutes: number;
} {
  const db = getDb();
  const cutoff = daysAgoDate(14);
  const rows = db
    .prepare(
      `SELECT prewarmed_count, callout_count, missed, baseline_fill_minutes_no_prewarm
       FROM daily_outcomes
       WHERE for_date >= ?
       ORDER BY for_date`
    )
    .all(cutoff) as Array<{
      prewarmed_count: number;
      callout_count: number;
      missed: number;
      baseline_fill_minutes_no_prewarm: number;
    }>;

  if (rows.length === 0) {
    return {
      avg_prewarmed_per_night: 0,
      total_callouts: 0,
      total_missed: 0,
      median_baseline_minutes: 0,
    };
  }

  const totalPrewarmed = rows.reduce((s, r) => s + r.prewarmed_count, 0);
  const totalCallouts = rows.reduce((s, r) => s + r.callout_count, 0);
  const totalMissed = rows.reduce((s, r) => s + r.missed, 0);
  const sortedBaselines = rows
    .map((r) => r.baseline_fill_minutes_no_prewarm)
    .sort((a, b) => a - b);
  const medianBaseline =
    sortedBaselines[Math.floor(sortedBaselines.length / 2)];

  return {
    avg_prewarmed_per_night: Math.round(totalPrewarmed / rows.length),
    total_callouts: totalCallouts,
    total_missed: totalMissed,
    median_baseline_minutes: medianBaseline,
  };
}

/**
 * Pull pre-warm chain entries for a given set of shift ids. Used by the
 * morning state to render compact chains inline with each "needs you" row.
 */
export function getChainsForShifts(
  shiftIds: number[]
): Record<number, ChainEntry[]> {
  if (shiftIds.length === 0) return {};
  const db = getDb();
  const placeholders = shiftIds.map(() => "?").join(",");
  const rows = db
    .prepare(
      `SELECT pw.id, pw.shift_id, pw.caregiver_id, pw.position, pw.channel,
              pw.pinged_at, pw.responded_at, pw.response, pw.chain_status,
              pw.settled_at,
              cg.name as cg_name, cg.zone as cg_zone, cg.phone,
              cg.reliability_band, cg.hire_date, cg.preferred_weekly_hours,
              cg.ot_ceiling_hours, cg.no_show_count_30d,
              cg.shifts_completed_30d, cg.hours_this_week,
              cg.consecutive_days_worked
       FROM prewarm_chains pw
       JOIN caregivers cg ON cg.id = pw.caregiver_id
       WHERE pw.shift_id IN (${placeholders})
       ORDER BY pw.shift_id, pw.position`
    )
    .all(...shiftIds) as Array<Record<string, unknown>>;

  const out: Record<number, ChainEntry[]> = {};
  for (const r of rows) {
    const entry: ChainEntry = {
      id: r.id as number,
      shift_id: r.shift_id as number,
      caregiver_id: r.caregiver_id as number,
      position: r.position as number,
      channel: r.channel as ChainEntry["channel"],
      pinged_at: r.pinged_at as string | null,
      responded_at: r.responded_at as string | null,
      response: r.response as ChainEntry["response"],
      chain_status: r.chain_status as ChainEntry["chain_status"],
      settled_at: r.settled_at as string | null,
      caregiver: {
        id: r.caregiver_id as number,
        name: r.cg_name as string,
        zone: r.cg_zone as string,
        hire_date: r.hire_date as string,
        preferred_weekly_hours: r.preferred_weekly_hours as number,
        ot_ceiling_hours: r.ot_ceiling_hours as number,
        no_show_count_30d: r.no_show_count_30d as number,
        shifts_completed_30d: r.shifts_completed_30d as number,
        hours_this_week: r.hours_this_week as number,
        consecutive_days_worked: r.consecutive_days_worked as number,
        phone: r.phone as string,
        reliability_band: r.reliability_band as Caregiver["reliability_band"],
      },
    };
    (out[entry.shift_id] ??= []).push(entry);
  }
  return out;
}

/** Last night's agent log events, ordered chronologically. */
export function getOvernightActivity(): AgentLogEvent[] {
  const db = getDb();
  // Last night = 9pm yesterday → 7:14am today (the anchor). The seed inserts
  // events between Tuesday 21:00 EDT and Wednesday 00:00 EDT — we filter
  // generously: anything from yesterday or before-anchor today.
  const yest = yesterdayDate();
  const today = todayDate();
  return db
    .prepare(
      `SELECT id, ts, shift_id, caregiver_id, event_type, detail
       FROM agent_log
       WHERE date(ts) IN (?, ?)
       ORDER BY ts, id`
    )
    .all(yest, today) as AgentLogEvent[];
}
