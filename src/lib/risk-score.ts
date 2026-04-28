import type { Caregiver, Shift, RiskFactor } from "./types";
import { FACTOR_CONFIG, bandFor, type FactorKey } from "./risk-config";

const ZONE_DISTANCE: Record<string, Record<string, number>> = {
  "Brooklyn-Crown Heights": {
    "Brooklyn-Crown Heights": 0,
    "Brooklyn-Bed Stuy": 0.2,
    "Brooklyn-Flatbush": 0.3,
    "Bronx-East": 0.95,
    "Bronx-Fordham": 0.95,
    "Bronx-Mott Haven": 0.85,
    "Manhattan-Inwood": 0.7,
    "Queens-Jamaica": 0.55,
  },
};

function distanceFactor(caregiverZone: string, clientZone: string): number {
  if (caregiverZone === clientZone) return 0;
  const map = ZONE_DISTANCE[caregiverZone];
  if (map && map[clientZone] !== undefined) return map[clientZone];
  // Default: same borough = 0.3, cross-borough = 0.7
  const cgBorough = caregiverZone.split("-")[0];
  const clBorough = clientZone.split("-")[0];
  return cgBorough === clBorough ? 0.3 : 0.7;
}

export type ScoringContext = {
  weather: {
    /** zones expected to see precipitation tomorrow */
    rainZones: Set<string>;
    /** zones impacted by published MTA service changes */
    transitImpactedZones: Set<string>;
  };
};

export function scoreShift(
  shift: Shift,
  caregiver: Caregiver,
  clientZone: string,
  ctx: ScoringContext
): { score: number; factors: RiskFactor[] } {
  const factors: RiskFactor[] = [];

  // 1. No-show history (30d) — rate scaled to 30% cap
  const completed = Math.max(caregiver.shifts_completed_30d, 1);
  const noShowRate = caregiver.no_show_count_30d / completed;
  const noShowNorm = Math.min(noShowRate / 0.3, 1);
  pushFactor("no_show_history", noShowNorm, factors,
    caregiver.no_show_count_30d === 0
      ? "No misses in the last 30 days."
      : `${caregiver.no_show_count_30d} no-show${caregiver.no_show_count_30d > 1 ? "s" : ""} of ${completed} scheduled shifts (${Math.round(noShowRate * 100)}%).`
  );

  // 2. Hours vs preferred ceiling
  const hoursOverPreferred = Math.max(0, caregiver.hours_this_week - caregiver.preferred_weekly_hours);
  const hoursNorm = Math.min(hoursOverPreferred / 12, 1); // 12h over preferred = max
  pushFactor("hours_vs_ceiling", hoursNorm, factors,
    hoursOverPreferred === 0
      ? `${caregiver.hours_this_week}h this week. Within preferred (${caregiver.preferred_weekly_hours}h).`
      : `${caregiver.hours_this_week}h this week against a ${caregiver.preferred_weekly_hours}h preferred ceiling.`
  );

  // 3. Continuity break
  const continuityNorm = shift.is_continuity ? 0 : 1;
  pushFactor("continuity_break", continuityNorm, factors,
    shift.is_continuity
      ? "Primary caregiver. Existing relationship with client."
      : "Backup assignment. No prior relationship with this client."
  );

  // 4. Days since last day off
  const daysNorm = Math.min(Math.max(0, caregiver.consecutive_days_worked - 2) / 5, 1);
  pushFactor("days_since_off", daysNorm, factors,
    caregiver.consecutive_days_worked <= 2
      ? `Day ${caregiver.consecutive_days_worked}. Rested.`
      : `Day ${caregiver.consecutive_days_worked} consecutive. ${caregiver.consecutive_days_worked >= 6 ? "Past the rest threshold." : ""}`.trim()
  );

  // 5. Distance
  const distNorm = distanceFactor(caregiver.zone, clientZone);
  pushFactor("distance", distNorm, factors,
    distNorm === 0
      ? "Same zone as client."
      : distNorm < 0.5
        ? "Same borough, different neighborhood."
        : "Cross-borough commute before shift."
  );

  // 6. Weather + transit
  let weatherNorm = 0;
  const weatherEvidence: string[] = [];
  if (ctx.weather.rainZones.has(clientZone)) {
    weatherNorm += 0.5;
    weatherEvidence.push("Rain forecast.");
  }
  if (ctx.weather.transitImpactedZones.has(caregiver.zone) || ctx.weather.transitImpactedZones.has(clientZone)) {
    weatherNorm += 0.6;
    weatherEvidence.push("Published MTA delays on the route.");
  }
  weatherNorm = Math.min(weatherNorm, 1);
  pushFactor("weather_transit", weatherNorm, factors,
    weatherEvidence.length === 0 ? "Clear forecast. No transit advisories." : weatherEvidence.join(" ")
  );

  const score = factors.reduce((s, f) => s + f.contribution, 0);
  return { score: Math.round(score), factors };
}

function pushFactor(
  key: FactorKey,
  norm: number,
  out: RiskFactor[],
  evidence: string
) {
  const cfg = FACTOR_CONFIG.find((f) => f.key === key)!;
  out.push({
    key,
    label: cfg.label,
    weight: cfg.weight,
    contribution: Math.round(norm * cfg.weight * 10) / 10,
    evidence,
  });
}

export { bandFor };
