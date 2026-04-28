import { getDb } from "./db";
import { scoreShift, bandFor, type ScoringContext } from "./risk-score";
import { tomorrowDate, todayDate } from "./clock";
import type {
  Caregiver,
  Client,
  PreWarmEntry,
  ScoredShift,
  Shift,
} from "./types";

function buildScoringContext(): ScoringContext {
  const db = getDb();
  const dateStr = tomorrowDate();

  const advisories = db
    .prepare("SELECT zone, type FROM weather_advisories WHERE for_date = ?")
    .all(dateStr) as Array<{ zone: string; type: string }>;

  const rainZones = new Set<string>();
  const transitZones = new Set<string>();
  for (const a of advisories) {
    if (a.type === "rain") rainZones.add(a.zone);
    if (a.type === "transit") transitZones.add(a.zone);
  }
  return {
    weather: { rainZones, transitImpactedZones: transitZones },
  };
}

function scoredShiftFromRow(
  shift: Shift,
  caregiver: Caregiver,
  client: Client,
  ctx: ScoringContext
): Omit<ScoredShift, "prewarm"> {
  const { score, factors } = scoreShift(shift, caregiver, client.zone, ctx);
  return {
    shift,
    caregiver,
    client,
    risk: score,
    band: bandFor(score),
    factors,
  };
}

function getShiftsForDate(dateStr: string): ScoredShift[] {
  const db = getDb();
  const ctx = buildScoringContext();

  const rows = db
    .prepare(
      `
        SELECT
          s.id AS shift_id, s.caregiver_id, s.client_id, s.starts_at, s.ends_at,
          s.status, s.zone AS shift_zone, s.is_continuity, s.prewarmed,
          cg.name AS cg_name, cg.zone AS cg_zone, cg.hire_date,
          cg.preferred_weekly_hours, cg.ot_ceiling_hours,
          cg.no_show_count_30d, cg.shifts_completed_30d,
          cg.hours_this_week, cg.consecutive_days_worked,
          cg.phone, cg.reliability_band,
          cl.name AS cl_name, cl.zone AS cl_zone, cl.care_plan,
          cl.primary_caregiver_id, cl.notes
        FROM shifts s
        JOIN caregivers cg ON cg.id = s.caregiver_id
        JOIN clients cl    ON cl.id = s.client_id
        WHERE date(s.starts_at) = date(?)
        ORDER BY s.starts_at
      `
    )
    .all(`${dateStr}T00:00:00Z`) as Array<Record<string, unknown>>;

  const prewarmRows = db
    .prepare(
      `
        SELECT pw.*, cg.name as cg_name, cg.zone as cg_zone, cg.phone,
               cg.reliability_band, cg.hire_date, cg.preferred_weekly_hours,
               cg.ot_ceiling_hours, cg.no_show_count_30d, cg.shifts_completed_30d,
               cg.hours_this_week, cg.consecutive_days_worked
        FROM prewarm_chains pw
        JOIN caregivers cg ON cg.id = pw.caregiver_id
        ORDER BY pw.shift_id, pw.position
      `
    )
    .all() as Array<Record<string, unknown>>;

  const prewarmByShift = new Map<number, Array<PreWarmEntry & { caregiver: Caregiver }>>();
  for (const r of prewarmRows) {
    const entry: PreWarmEntry & { caregiver: Caregiver } = {
      id: r.id as number,
      shift_id: r.shift_id as number,
      caregiver_id: r.caregiver_id as number,
      position: r.position as number,
      channel: r.channel as "sms" | "voice",
      pinged_at: r.pinged_at as string | null,
      responded_at: r.responded_at as string | null,
      response: r.response as PreWarmEntry["response"],
      chain_status: r.chain_status as PreWarmEntry["chain_status"],
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
    const list = prewarmByShift.get(entry.shift_id) ?? [];
    list.push(entry);
    prewarmByShift.set(entry.shift_id, list);
  }

  const scored: ScoredShift[] = rows.map((r) => {
    const shift: Shift = {
      id: r.shift_id as number,
      caregiver_id: r.caregiver_id as number,
      client_id: r.client_id as number,
      starts_at: r.starts_at as string,
      ends_at: r.ends_at as string,
      status: r.status as Shift["status"],
      zone: r.shift_zone as string,
      is_continuity: r.is_continuity as number,
      prewarmed: r.prewarmed as number,
    };
    const caregiver: Caregiver = {
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
    };
    const client: Client = {
      id: r.client_id as number,
      name: r.cl_name as string,
      zone: r.cl_zone as string,
      care_plan: r.care_plan as string,
      primary_caregiver_id: r.primary_caregiver_id as number,
      notes: r.notes as string,
    };
    return {
      ...scoredShiftFromRow(shift, caregiver, client, ctx),
      prewarm: prewarmByShift.get(shift.id) ?? [],
    };
  });

  return scored;
}

export function getTomorrowsShifts(): ScoredShift[] {
  return getShiftsForDate(tomorrowDate());
}

export function getTodaysShifts(): ScoredShift[] {
  return getShiftsForDate(todayDate());
}

export function getShiftById(id: number): ScoredShift | null {
  const all = [...getTodaysShifts(), ...getTomorrowsShifts()];
  return all.find((s) => s.shift.id === id) ?? null;
}

export function getZones(): string[] {
  const db = getDb();
  const rows = db
    .prepare("SELECT DISTINCT zone FROM caregivers ORDER BY zone")
    .all() as Array<{ zone: string }>;
  return rows.map((r) => r.zone);
}

export function getWeatherAdvisories(): Array<{ zone: string; type: string; detail: string }> {
  const db = getDb();
  const dateStr = tomorrowDate();
  return db
    .prepare(
      "SELECT zone, type, detail FROM weather_advisories WHERE for_date = ? ORDER BY zone, type"
    )
    .all(dateStr) as Array<{ zone: string; type: string; detail: string }>;
}

export function getAgencyStats() {
  const all = getTomorrowsShifts();
  const high = all.filter((s) => s.risk >= 40);
  const prewarmed = high.filter((s) => s.shift.prewarmed === 1);
  const attention = high.length - prewarmed.length;
  return {
    totalShifts: all.length,
    highRiskShifts: high.length,
    prewarmedShifts: prewarmed.length,
    needsAttention: attention,
    averageRisk: Math.round(all.reduce((s, x) => s + x.risk, 0) / Math.max(all.length, 1)),
    highestRisk: Math.max(...all.map((x) => x.risk), 0),
  };
}
