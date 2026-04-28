export type ReliabilityBand = "A" | "B" | "C" | "watch";

export type Caregiver = {
  id: number;
  name: string;
  zone: string;
  hire_date: string;
  preferred_weekly_hours: number;
  ot_ceiling_hours: number;
  no_show_count_30d: number;
  shifts_completed_30d: number;
  hours_this_week: number;
  consecutive_days_worked: number;
  phone: string;
  reliability_band: ReliabilityBand;
};

export type Client = {
  id: number;
  name: string;
  zone: string;
  care_plan: string;
  primary_caregiver_id: number;
  notes: string;
};

export type ShiftStatus =
  | "scheduled"
  | "completed"
  | "callout"
  | "no_show"
  | "late"
  | "reassigned";

export type Shift = {
  id: number;
  caregiver_id: number;
  client_id: number;
  starts_at: string;
  ends_at: string;
  status: ShiftStatus;
  zone: string;
  is_continuity: number;
  prewarmed: number;
};

export type PreWarmEntry = {
  id: number;
  shift_id: number;
  caregiver_id: number;
  position: number;
  channel: "sms" | "voice";
  pinged_at: string | null;
  responded_at: string | null;
  response: "available" | "unavailable" | "no_response" | null;
};

export type RiskFactor = {
  key:
    | "no_show_history"
    | "hours_vs_ceiling"
    | "distance"
    | "continuity_break"
    | "days_since_off"
    | "weather_transit";
  label: string;
  weight: number;
  contribution: number; // 0..weight
  evidence: string;
};

export type ScoredShift = {
  shift: Shift;
  caregiver: Caregiver;
  client: Client;
  risk: number; // 0..100
  band: "low" | "med" | "high" | "crit";
  factors: RiskFactor[];
  prewarm: Array<PreWarmEntry & { caregiver: Caregiver }>;
};
