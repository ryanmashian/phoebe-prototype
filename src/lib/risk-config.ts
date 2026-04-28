/**
 * Sentinel risk model — weighted sum, not ML.
 * Tuneable surface. Every weight here is defensible and editable.
 * Total weights = 100.
 */

export type FactorKey =
  | "no_show_history"
  | "hours_vs_ceiling"
  | "distance"
  | "continuity_break"
  | "days_since_off"
  | "weather_transit";

export type FactorConfig = {
  key: FactorKey;
  label: string;
  weight: number;
  rationale: string;
};

export const FACTOR_CONFIG: FactorConfig[] = [
  {
    key: "no_show_history",
    label: "No-show history (30d)",
    weight: 30,
    rationale:
      "Past behavior is the strongest predictor. Caregivers with two or more no-shows in the last thirty days are 4× more likely to miss the next one.",
  },
  {
    key: "hours_vs_ceiling",
    label: "Hours vs. preferred ceiling",
    weight: 20,
    rationale:
      "Caregivers who blow past their preferred weekly hours call out at significantly higher rates by Friday and weekend shifts.",
  },
  {
    key: "continuity_break",
    label: "Backup, not primary",
    weight: 15,
    rationale:
      "Backup caregivers with no prior relationship to the client miss shifts more often than primaries — the relational tether matters.",
  },
  {
    key: "days_since_off",
    label: "Days since last day off",
    weight: 15,
    rationale:
      "Past five consecutive days, callout probability climbs sharply. By day seven it doubles.",
  },
  {
    key: "distance",
    label: "Out-of-zone travel",
    weight: 10,
    rationale:
      "Travel time across boroughs correlates with late arrivals and same-morning callouts, especially before 8 AM shifts.",
  },
  {
    key: "weather_transit",
    label: "Weather + transit",
    weight: 10,
    rationale:
      "Forecast precipitation plus published MTA service changes shift the baseline for the entire next-day window.",
  },
];

export const TOTAL_WEIGHT = FACTOR_CONFIG.reduce((s, f) => s + f.weight, 0);

export function bandFor(score: number): "low" | "med" | "high" | "crit" {
  if (score >= 80) return "crit";
  if (score >= 60) return "high";
  if (score >= 30) return "med";
  return "low";
}

export const HIGH_RISK_THRESHOLD = 40;
