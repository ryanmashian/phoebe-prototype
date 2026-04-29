#!/usr/bin/env node
/**
 * Seed Sentinel's SQLite db with synthetic but realistic data.
 * Writes data/sentinel.db.
 */

import Database from "better-sqlite3";
import { mkdirSync, rmSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const DATA_DIR = join(ROOT, "data");
const DB_PATH = join(DATA_DIR, "sentinel.db");

if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
if (existsSync(DB_PATH)) rmSync(DB_PATH);

const db = new Database(DB_PATH);
db.pragma("journal_mode = WAL");
const runSql = (sql) => db["exec"](sql);

runSql(`
CREATE TABLE caregivers (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  zone TEXT NOT NULL,
  hire_date TEXT NOT NULL,
  preferred_weekly_hours INTEGER NOT NULL,
  ot_ceiling_hours INTEGER NOT NULL,
  no_show_count_30d INTEGER NOT NULL,
  shifts_completed_30d INTEGER NOT NULL,
  hours_this_week INTEGER NOT NULL,
  consecutive_days_worked INTEGER NOT NULL,
  phone TEXT NOT NULL,
  reliability_band TEXT NOT NULL
);

CREATE TABLE clients (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  zone TEXT NOT NULL,
  care_plan TEXT NOT NULL,
  primary_caregiver_id INTEGER REFERENCES caregivers(id),
  notes TEXT
);

CREATE TABLE shifts (
  id INTEGER PRIMARY KEY,
  caregiver_id INTEGER NOT NULL REFERENCES caregivers(id),
  client_id INTEGER NOT NULL REFERENCES clients(id),
  starts_at TEXT NOT NULL,
  ends_at TEXT NOT NULL,
  status TEXT NOT NULL,
  zone TEXT NOT NULL,
  is_continuity INTEGER NOT NULL,
  prewarmed INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE prewarm_chains (
  id INTEGER PRIMARY KEY,
  shift_id INTEGER NOT NULL REFERENCES shifts(id),
  caregiver_id INTEGER NOT NULL REFERENCES caregivers(id),
  position INTEGER NOT NULL,
  channel TEXT NOT NULL,
  pinged_at TEXT,
  responded_at TEXT,
  response TEXT,
  chain_status TEXT,
  settled_at TEXT
);

CREATE TABLE callout_history (
  id INTEGER PRIMARY KEY,
  caregiver_id INTEGER NOT NULL REFERENCES caregivers(id),
  shift_date TEXT NOT NULL,
  reason TEXT,
  was_predicted INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE weather_advisories (
  id INTEGER PRIMARY KEY,
  for_date TEXT NOT NULL,
  zone TEXT NOT NULL,
  type TEXT NOT NULL,
  detail TEXT NOT NULL
);

CREATE TABLE daily_outcomes (
  for_date TEXT PRIMARY KEY,
  prewarmed_count INTEGER NOT NULL,
  callout_count INTEGER NOT NULL,
  filled_under_5min INTEGER NOT NULL,
  missed INTEGER NOT NULL,
  baseline_fill_minutes_no_prewarm INTEGER NOT NULL,
  notes TEXT
);

CREATE TABLE agent_log (
  id INTEGER PRIMARY KEY,
  ts TEXT NOT NULL,
  shift_id INTEGER REFERENCES shifts(id),
  caregiver_id INTEGER REFERENCES caregivers(id),
  event_type TEXT NOT NULL,
  detail TEXT NOT NULL
);

CREATE INDEX idx_shifts_starts ON shifts(starts_at);
CREATE INDEX idx_shifts_caregiver ON shifts(caregiver_id);
CREATE INDEX idx_callouts_caregiver ON callout_history(caregiver_id);
CREATE INDEX idx_callouts_date ON callout_history(shift_date);
CREATE INDEX idx_prewarm_shift ON prewarm_chains(shift_id);
CREATE INDEX idx_agent_log_ts ON agent_log(ts);
`);

const ZONES = [
  "Brooklyn-Crown Heights",
  "Brooklyn-Bed Stuy",
  "Brooklyn-Flatbush",
  "Brooklyn-East New York",
  "Bronx-East",
  "Bronx-Fordham",
  "Bronx-Mott Haven",
  "Manhattan-Inwood",
  "Queens-Jamaica",
];

const FIRSTS = [
  "Maria","Yara","Rosalyn","Aisha","Fatou","Beatrice","Imelda","Carmen",
  "Kadiatu","Leticia","Nadia","Olufunmi","Patrice","Renita","Sade","Tasha",
  "Verónica","Wilma","Xiomara","Yolanda","Zenaida","Marisol","Esperanza",
  "Adwoa","Hortense","Joelle","Latoya","Mireille","Naïma","Odette","Priscille",
  "Quiana","Ramatoulaye","Sandrine","Tiana","Ujwala","Veerle","Wynter",
  "Anatasia","Bibi","Chinwe","Dolores","Earlene","Geneva","Hyacinth","Inès",
  "Junie","Krishna","Lourdes","Mariama","Nia","Oluwakemi","Petra","Rashida",
  "Suzette","Tamika","Ursula","Velma","Walda","Mireya",
];

const LASTS = [
  "Reyes","Okonkwo","Hernández","Diallo","Pierre","Joseph","Okafor",
  "Saint-Louis","Mensah","Castillo","Sylla","Adebayo","Charles","Bernard",
  "Williams","Persaud","Boateng","Almonte","Thiam","Núñez","Lemaire",
  "Ramirez","Kone","Lubin","Polanco","Touré","Étienne","Singh","Paul","Forde",
];

const CLIENT_FIRSTS = [
  "Eleanor","Harold","Beatrice","Mordecai","Estelle","Solomon","Constance",
  "Reginald","Gloria","Bernard","Marlene","Joseph","Cecilia","Stanley",
  "Geraldine","Frederick","Wanda","Alvin","Henrietta","Eugene","Lillian",
  "Vincent","Dorothea","Norman","Frances","Calvin","Rosalind","Walter",
  "Yvette","Theodore","Mabel","Bertha","Sidney","Hattie","Arthur",
];

const CLIENT_LASTS = [
  "Goldfarb","Washington","Sullivan","Rosenberg","Cohen","O'Sullivan",
  "Ferraro","Greenstein","DiNapoli","Hayes","Levine","Brown","Caruso",
  "Kowalski","Mancini","Park","Davis","Rivera","Schwartz","Robinson",
  "Bianchi","Murphy","Greene","Lewis",
];

const CARE_PLANS = [
  "HHA 4hr daily","HHA 6hr daily","HHA 8hr Mon-Fri",
  "Companion 4hr Mon/Wed/Fri","Live-in support 6 days","PCA 5hr daily",
  "Post-acute 8hr daily, 30 days","Hospice support 4hr Tue/Thu/Sat",
  "Dementia care 8hr daily",
];

const CLIENT_NOTES = [
  "Daughter checks in Sundays. Prefers female caregiver.",
  "Walker assist. No stairs.",
  "Diabetic — meal log required.",
  "Recent hospital discharge. Watching wound site.",
  "Hard of hearing. Speak from line of sight.",
  "Late-stage Alzheimer's. Routine matters.",
  "Spouse is primary contact. Building has unreliable buzzer.",
  "Cat-friendly home. Prefers caregivers who are too.",
  "Needs help with bathing and grocery runs.",
  "Family does Wednesdays. We cover the rest.",
];

let seed = 1718;
function rand() { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; }
function pick(arr) { return arr[Math.floor(rand() * arr.length)]; }
function pickN(arr, n) {
  const copy = [...arr];
  const out = [];
  for (let i = 0; i < n && copy.length; i++) {
    out.push(copy.splice(Math.floor(rand() * copy.length), 1)[0]);
  }
  return out;
}
function randInt(min, max) { return Math.floor(rand() * (max - min + 1)) + min; }
function phone() {
  return `(${randInt(212, 929)}) ${randInt(100, 999)}-${String(randInt(0, 9999)).padStart(4, "0")}`;
}

// Tuned so the 8 high-risk shifts in tomorrow's view all clear the 40-point
// threshold under the new weights (no_show 25, hours 25, days 20, cont 15,
// dist 10, weather 5). Headline drivers are hours-this-week and days-since-off,
// not weather. See LOOM_SCRIPT.md and /about for narrative arc.
const NAMED_CAREGIVERS = [
  // Cluster A — Bronx burnout (transit just nudges them over)
  { name: "Yara Diallo",     zone: "Bronx-East",        no_show_30d: 2, completed_30d: 22, hours_week: 44, days_streak: 6, band: "B",     hire: "2022-08-14" },
  { name: "Patrice Lemaire", zone: "Bronx-Fordham",     no_show_30d: 2, completed_30d: 19, hours_week: 42, days_streak: 5, band: "B",     hire: "2023-02-03" },
  { name: "Rosalyn Pierre",  zone: "Bronx-Mott Haven",  no_show_30d: 3, completed_30d: 24, hours_week: 41, days_streak: 6, band: "watch", hire: "2021-11-22" },
  // Cluster B — Brooklyn primaries deep into OT
  { name: "Maria Reyes",     zone: "Brooklyn-Crown Heights", no_show_30d: 1, completed_30d: 28, hours_week: 47, days_streak: 7, band: "A", hire: "2020-03-10" },
  { name: "Aisha Okonkwo",   zone: "Brooklyn-Bed Stuy",      no_show_30d: 2, completed_30d: 26, hours_week: 49, days_streak: 6, band: "B", hire: "2021-06-29" },
  { name: "Beatrice Joseph", zone: "Brooklyn-Flatbush",      no_show_30d: 0, completed_30d: 24, hours_week: 46, days_streak: 8, band: "A", hire: "2019-09-04" },
  // Cluster C — Continuity break: backups assigned with weak prior relationships
  { name: "Imelda Castillo", zone: "Brooklyn-East New York", no_show_30d: 2, completed_30d: 18, hours_week: 38, days_streak: 5, band: "B", hire: "2023-04-15" },
  { name: "Carmen Hernández",zone: "Manhattan-Inwood",       no_show_30d: 3, completed_30d: 20, hours_week: 36, days_streak: 5, band: "B", hire: "2022-12-01" },
  // Backup pool — used in pre-warm chains, low-risk so they're plausibly available
  { name: "Fatou Sylla",     zone: "Bronx-East",        no_show_30d: 0, completed_30d: 22, hours_week: 30, days_streak: 2, band: "A", hire: "2021-05-18" },
  { name: "Leticia Almonte", zone: "Brooklyn-Crown Heights", no_show_30d: 0, completed_30d: 25, hours_week: 26, days_streak: 1, band: "A", hire: "2019-08-30" },
  { name: "Nadia Boateng",   zone: "Brooklyn-Bed Stuy",      no_show_30d: 1, completed_30d: 20, hours_week: 24, days_streak: 2, band: "A", hire: "2022-01-08" },
  { name: "Sade Adebayo",    zone: "Brooklyn-East New York", no_show_30d: 0, completed_30d: 23, hours_week: 28, days_streak: 1, band: "A", hire: "2020-10-12" },
];

const insertCaregiver = db.prepare(`
  INSERT INTO caregivers (id, name, zone, hire_date, preferred_weekly_hours, ot_ceiling_hours,
    no_show_count_30d, shifts_completed_30d, hours_this_week, consecutive_days_worked, phone, reliability_band)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

NAMED_CAREGIVERS.forEach((c, i) => {
  insertCaregiver.run(
    i + 1, c.name, c.zone, c.hire, 35, 48,
    c.no_show_30d, c.completed_30d, c.hours_week, c.days_streak,
    phone(), c.band
  );
});

const usedNames = new Set(NAMED_CAREGIVERS.map((c) => c.name));
let nextCaregiverId = NAMED_CAREGIVERS.length + 1;
while (nextCaregiverId <= 60) {
  const name = `${pick(FIRSTS)} ${pick(LASTS)}`;
  if (usedNames.has(name)) continue;
  usedNames.add(name);
  const r = rand();
  const band = r < 0.5 ? "A" : r < 0.8 ? "B" : r < 0.95 ? "C" : "watch";
  const noShows = band === "A" ? 0 : band === "B" ? randInt(0, 1) : band === "C" ? randInt(1, 2) : randInt(2, 4);
  insertCaregiver.run(
    nextCaregiverId++, name, pick(ZONES),
    `${randInt(2018, 2024)}-${String(randInt(1, 12)).padStart(2, "0")}-${String(randInt(1, 28)).padStart(2, "0")}`,
    pick([30, 35, 40]), 48, noShows, randInt(16, 28), randInt(18, 36), randInt(1, 4),
    phone(), band
  );
}

const insertClient = db.prepare(`
  INSERT INTO clients (id, name, zone, care_plan, primary_caregiver_id, notes)
  VALUES (?, ?, ?, ?, ?, ?)
`);

const NAMED_CLIENTS = [
  { name: "Eleanor Goldfarb",  zone: "Bronx-East",       plan: "HHA 6hr daily",            primary: 1,  note: "Walker assist. Building elevator broken since Tuesday." },
  { name: "Harold Sullivan",   zone: "Bronx-Fordham",    plan: "Companion 4hr Mon/Wed/Fri",primary: 2,  note: "Daughter calls Sundays. Hard of hearing." },
  { name: "Beatrice Rosenberg",zone: "Bronx-Mott Haven", plan: "PCA 5hr daily",            primary: 3,  note: "Recent hospital discharge. Watching wound site." },
  { name: "Mordecai Cohen",    zone: "Brooklyn-Crown Heights", plan: "HHA 8hr Mon-Fri",    primary: 4,  note: "Late-stage Alzheimer's. Routine matters." },
  { name: "Estelle DiNapoli",  zone: "Brooklyn-Bed Stuy",      plan: "Dementia care 8hr daily", primary: 5,  note: "Spouse is primary contact." },
  { name: "Solomon Hayes",     zone: "Brooklyn-Flatbush",      plan: "HHA 6hr daily",      primary: 6,  note: "Diabetic — meal log required." },
  { name: "Constance Levine",  zone: "Bronx-East",             plan: "HHA 4hr daily",      primary: 13, note: "Primary on PTO Wed-Fri. Backup pulled from Brooklyn — long commute, no prior relationship." },
  { name: "Reginald Brown",    zone: "Manhattan-Inwood",       plan: "Live-in support 6 days", primary: 14, note: "Primary out sick. Backup needed." },
];

NAMED_CLIENTS.forEach((c, i) => {
  insertClient.run(i + 1, c.name, c.zone, c.plan, c.primary, c.note);
});

const usedClientNames = new Set(NAMED_CLIENTS.map((c) => c.name));
// Pre-register the today-named-client full names so the procedural pool below
// doesn't randomly land on one of them. KEEP IN SYNC with TODAY_NAMED_CLIENTS.
[
  "Frederick Mancini", "Henrietta Park", "Reginald Pierre", "Calvin Murphy",
  "Geraldine Cohen", "Cecilia Núñez", "Theodore Rivera", "Bertha Schwartz",
].forEach((n) => usedClientNames.add(n));

let nextClientId = NAMED_CLIENTS.length + 1;
while (nextClientId <= 200) {
  const name = `${pick(CLIENT_FIRSTS)} ${pick(CLIENT_LASTS)}`;
  if (usedClientNames.has(name)) continue;
  usedClientNames.add(name);
  const cgId = randInt(1, 60);
  const cgZone = db.prepare("SELECT zone FROM caregivers WHERE id = ?").get(cgId).zone;
  insertClient.run(nextClientId++, name, cgZone, pick(CARE_PLANS), cgId, pick(CLIENT_NOTES));
}

// MUST stay in sync with src/lib/clock.ts NOW_ANCHOR.
// Wednesday, April 29, 2026 — 7:14 AM EDT (UTC-4).
const NOW_ANCHOR_ISO = "2026-04-29T11:14:00.000Z";
const NOW = new Date(NOW_ANCHOR_ISO);

function isoAt(daysFromNow, hour, minute = 0) {
  // Generates ISO timestamps in NYC local time (EDT, UTC-4 in late April).
  // Used for shift starts_at and other wall-clock-anchored events.
  const base = new Date(NOW);
  base.setUTCDate(base.getUTCDate() + daysFromNow);
  // EDT offset: hour 0 NY = hour 4 UTC.
  base.setUTCHours(hour + 4, minute, 0, 0);
  return base.toISOString();
}

function isoLastNight(hour, minute = 0) {
  // Helper for agent log timestamps the night before NOW.
  return isoAt(-1, hour, minute);
}

const insertShift = db.prepare(`
  INSERT INTO shifts (id, caregiver_id, client_id, starts_at, ends_at, status, zone, is_continuity, prewarmed)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

let shiftId = 1;
const TOMORROW_SHIFTS = [
  { caregiver: 1, client: 1, hour: 7,  duration: 6, continuity: 1, prewarmed: 1 },
  { caregiver: 2, client: 2, hour: 9,  duration: 4, continuity: 1, prewarmed: 0 },
  { caregiver: 3, client: 3, hour: 8,  duration: 5, continuity: 1, prewarmed: 0 },
  { caregiver: 4, client: 4, hour: 8,  duration: 8, continuity: 1, prewarmed: 1 },
  { caregiver: 5, client: 5, hour: 7,  duration: 8, continuity: 1, prewarmed: 0 },
  { caregiver: 6, client: 6, hour: 10, duration: 6, continuity: 1, prewarmed: 0 },
  { caregiver: 7, client: 7, hour: 9,  duration: 4, continuity: 0, prewarmed: 1 },
  { caregiver: 8, client: 8, hour: 8,  duration: 6, continuity: 0, prewarmed: 0 },
];

const safeCaregivers = [9, 10, 11, 12];
const procIds = [];
for (let i = 15; i <= 60; i++) procIds.push(i);
const procPool = pickN(procIds, 12);
const fillPool = [...safeCaregivers, ...procPool];

fillPool.forEach((id) => {
  const cg = db.prepare("SELECT zone FROM caregivers WHERE id = ?").get(id);
  let client = db.prepare("SELECT id FROM clients WHERE zone = ? AND id > 8 ORDER BY id LIMIT 1").get(cg.zone);
  if (!client) client = db.prepare("SELECT id FROM clients WHERE id > 8 ORDER BY id LIMIT 1").get();
  TOMORROW_SHIFTS.push({
    caregiver: id,
    client: client.id,
    hour: pick([7, 8, 9, 10, 11, 13, 14, 16]),
    duration: pick([4, 4, 6, 6, 8]),
    continuity: 1,
    prewarmed: 0,
  });
});

TOMORROW_SHIFTS.forEach((s) => {
  const cg = db.prepare("SELECT zone FROM caregivers WHERE id = ?").get(s.caregiver);
  insertShift.run(
    shiftId++, s.caregiver, s.client,
    isoAt(1, s.hour), isoAt(1, s.hour + s.duration),
    "scheduled", cg.zone, s.continuity, s.prewarmed
  );
});

const insertPrewarm = db.prepare(`
  INSERT INTO prewarm_chains
    (shift_id, caregiver_id, position, channel, pinged_at, responded_at, response, chain_status, settled_at)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

// ─── Tomorrow's pre-warm chains (illustrative — fire tonight at 9pm) ───
// chain_status = "scheduled" means the Scheduler has these queued but they
// haven't actually fired yet. The response data here is a forward-looking
// projection used for the drill-down illustration; settled_at is null.
insertPrewarm.run(1, 9,  1, "sms",   isoAt(0, 21, 14), isoAt(0, 21, 17), "available",   "scheduled", null);
insertPrewarm.run(1, 11, 2, "sms",   isoAt(0, 21, 14), isoAt(0, 21, 22), "unavailable", "scheduled", null);
insertPrewarm.run(1, 12, 3, "voice", isoAt(0, 21, 30), null,             "no_response", "scheduled", null);

insertPrewarm.run(4, 10, 1, "sms",   isoAt(0, 19, 47), isoAt(0, 19, 51), "available",   "scheduled", null);
insertPrewarm.run(4, 11, 2, "sms",   isoAt(0, 19, 47), isoAt(0, 20, 12), "unavailable", "scheduled", null);
insertPrewarm.run(4, 12, 3, "voice", isoAt(0, 20, 5),  isoAt(0, 20, 9),  "available",   "scheduled", null);

insertPrewarm.run(7, 12, 1, "sms",   isoAt(0, 18, 32), isoAt(0, 18, 36), "available",   "scheduled", null);
insertPrewarm.run(7, 10, 2, "voice", isoAt(0, 18, 50), isoAt(0, 18, 54), "available",   "scheduled", null);

// ─── Today's shifts (Wednesday AM) — pre-warm fired LAST NIGHT ───
// These power the morning state. Eight Wednesday shifts with chain outcomes
// from Tuesday evening: 6 confirmed, 1 partial (last-position confirmed
// late), 1 failed (chain came back empty → "needs you").
// Names below are deliberately picked to avoid first-name overlap with the
// caregiver pool (FIRSTS) — earlier seed iterations had Imelda/Carmen/Patrice/
// Marisol clients colliding with caregivers of the same first name, which
// muddied the agent log narrative ("Pinged X for Imelda's shift" vs. an
// equally-named backup caregiver). Frederick/Henrietta/Calvin/Geraldine come
// from CLIENT_FIRSTS only.
const TODAY_NAMED_CLIENTS = [
  { name: "Frederick Mancini", zone: "Brooklyn-Crown Heights", plan: "HHA 6hr daily",      note: "Recent hospital discharge. Watch for fatigue." },
  { name: "Henrietta Park",    zone: "Brooklyn-Bed Stuy",      plan: "Companion 4hr Mon/Wed/Fri", note: "Mild cognitive impairment. Needs same caregiver if possible." },
  { name: "Reginald Pierre",   zone: "Bronx-East",             plan: "HHA 8hr Mon-Fri",    note: "Diabetic — meal log required by 11am." },
  { name: "Calvin Murphy",     zone: "Brooklyn-Flatbush",      plan: "PCA 5hr daily",      note: "Daughter calls Sundays. Hard of hearing." },
  { name: "Geraldine Cohen",   zone: "Bronx-Mott Haven",       plan: "HHA 4hr daily",      note: "Walker assist. Building elevator broken since Tuesday." },
  { name: "Cecilia Núñez",     zone: "Brooklyn-Crown Heights", plan: "Dementia care 8hr daily", note: "Spouse is primary contact." },
  { name: "Theodore Rivera",   zone: "Bronx-Fordham",          plan: "HHA 6hr daily",      note: "Routine matters. Recent hospital readmission scare." },
  { name: "Bertha Schwartz",   zone: "Manhattan-Inwood",       plan: "Live-in support 6 days", note: "Primary caregiver out indefinitely. Backup-only coverage this week." },
];
const TODAY_FIRST_CLIENT_ID = nextClientId;
TODAY_NAMED_CLIENTS.forEach((c) => {
  insertClient.run(nextClientId++, c.name, c.zone, c.plan, null, c.note);
});

// 8 today shifts. Caregivers 13–20 are the Wed AM roster (separate from
// tomorrow's 1–8 hand-tuned set so the dataset reads as two real days).
// Order: 6 confirmed-chain shifts, then partial, then failed (the latter
// two are the morning-state "needs you" rows).
const TODAY_SHIFTS = [
  { caregiver: 13, hour: 7,  duration: 6, continuity: 1, chain_status: "confirmed" },
  { caregiver: 14, hour: 8,  duration: 4, continuity: 1, chain_status: "confirmed" },
  { caregiver: 15, hour: 8,  duration: 8, continuity: 1, chain_status: "confirmed" },
  { caregiver: 16, hour: 9,  duration: 6, continuity: 1, chain_status: "confirmed" },
  { caregiver: 17, hour: 9,  duration: 4, continuity: 0, chain_status: "confirmed" },
  { caregiver: 18, hour: 10, duration: 6, continuity: 1, chain_status: "confirmed" },
  { caregiver: 19, hour: 10, duration: 8, continuity: 1, chain_status: "partial"   },
  { caregiver: 20, hour: 11, duration: 4, continuity: 0, chain_status: "failed"    },
];

const TODAY_FIRST_SHIFT_ID = shiftId;
TODAY_SHIFTS.forEach((s, i) => {
  const cg = db.prepare("SELECT zone FROM caregivers WHERE id = ?").get(s.caregiver);
  const clientId = TODAY_FIRST_CLIENT_ID + i;
  insertShift.run(
    shiftId++, s.caregiver, clientId,
    isoAt(0, s.hour), isoAt(0, s.hour + s.duration),
    "scheduled", cg.zone, s.continuity, 1
  );
});

// Pre-warm chains for today shifts. Each shift has a 3-deep chain pinged
// last night between 9:30pm and 10:50pm. Outcomes per shift:
//   - confirmed: position-1 said yes → chain confirmed at that response time
//   - partial:   p1 unavailable, p2 unavailable, p3 available (late)
//   - failed:    all three unavailable / no_response
//
// Backup-pool caregivers (50–60) are used so they don't collide with primaries.
const BACKUP_POOL = [50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60];

function pingTime(baseHour, baseMinute, offsetMin) {
  // baseHour is local NY hour (e.g., 21 = 9pm). Returns ISO with EDT offset.
  const totalMin = baseMinute + offsetMin;
  const addedHours = Math.floor(totalMin / 60);
  const finalMin = totalMin % 60;
  return isoLastNight(baseHour + addedHours, finalMin);
}

TODAY_SHIFTS.forEach((s, i) => {
  const shiftIdNum = TODAY_FIRST_SHIFT_ID + i;
  const [b1, b2, b3] = pickN(BACKUP_POOL.filter((id) => id !== s.caregiver), 3);
  const baseHour = 21 + Math.floor(i / 3); // 21, 21, 21, 22, 22, 22, 23, 23
  const baseMinute = (i % 3) * 17 + 4;

  if (s.chain_status === "confirmed") {
    // Sequential: position-1 pinged, said yes, chain settled. Position 2/3
    // never reached (rows exist for the visual chain depth, no ping data).
    const settle = pingTime(baseHour, baseMinute, 4);
    insertPrewarm.run(shiftIdNum, b1, 1, "sms",
      pingTime(baseHour, baseMinute, 0),
      settle, "available", "confirmed", settle);
    insertPrewarm.run(shiftIdNum, b2, 2, "sms",
      null, null, null, "confirmed", settle);
    insertPrewarm.run(shiftIdNum, b3, 3, "voice",
      null, null, null, "confirmed", settle);
  } else if (s.chain_status === "partial") {
    // Sequential: p1 unavailable → p2 unavailable → p3 (voice) available late.
    const settle = pingTime(baseHour, baseMinute, 31);
    insertPrewarm.run(shiftIdNum, b1, 1, "sms",
      pingTime(baseHour, baseMinute, 0),
      pingTime(baseHour, baseMinute, 5), "unavailable", "partial", settle);
    insertPrewarm.run(shiftIdNum, b2, 2, "sms",
      pingTime(baseHour, baseMinute, 8),
      pingTime(baseHour, baseMinute, 14), "unavailable", "partial", settle);
    insertPrewarm.run(shiftIdNum, b3, 3, "voice",
      pingTime(baseHour, baseMinute, 19),
      pingTime(baseHour, baseMinute, 31), "available", "partial", settle);
  } else { // failed
    // Sequential: p1 unavailable → p2 unavailable → p3 voice no-response → escalation.
    const settle = pingTime(baseHour, baseMinute, 38);
    insertPrewarm.run(shiftIdNum, b1, 1, "sms",
      pingTime(baseHour, baseMinute, 0),
      pingTime(baseHour, baseMinute, 6), "unavailable", "failed", settle);
    insertPrewarm.run(shiftIdNum, b2, 2, "sms",
      pingTime(baseHour, baseMinute, 9),
      pingTime(baseHour, baseMinute, 16), "unavailable", "failed", settle);
    insertPrewarm.run(shiftIdNum, b3, 3, "voice",
      pingTime(baseHour, baseMinute, 22),
      null, "no_response", "failed", settle);
  }
});

// ─── Agent log (Tuesday evening overnight) ───
// Derived directly from the today-shift chain rows so the log is the
// audit trail that makes the morning state and yesterday's outcomes
// verifiable. Every log row maps to a real chain event.
const insertAgentLog = db.prepare(`
  INSERT INTO agent_log (ts, shift_id, caregiver_id, event_type, detail)
  VALUES (?, ?, ?, ?, ?)
`);

// Kickoff event — Scheduler began the overnight pass.
insertAgentLog.run(
  isoLastNight(21, 0),
  null,
  null,
  "kickoff",
  "Sentinel ranked tomorrow's queue. 8 shifts flagged for pre-warm tonight."
);

// Pull all chain rows for today shifts (settled last night) ordered by ping time.
const todayChainRows = db.prepare(`
  SELECT pw.id, pw.shift_id, pw.caregiver_id, pw.position, pw.channel,
         pw.pinged_at, pw.responded_at, pw.response, pw.chain_status, pw.settled_at,
         cg.name as cg_name, cl.name as cl_name, s.starts_at
  FROM prewarm_chains pw
  JOIN caregivers cg ON cg.id = pw.caregiver_id
  JOIN shifts s ON s.id = pw.shift_id
  JOIN clients cl ON cl.id = s.client_id
  WHERE pw.shift_id >= ?
  ORDER BY pw.shift_id, pw.position
`).all(TODAY_FIRST_SHIFT_ID);

function shortFirst(name) {
  return name.split(" ")[0];
}

// Walk each chain in shift order and emit log events.
let currentShiftId = null;
let currentChain = [];
const settledByShift = new Map();

for (const row of todayChainRows) {
  if (row.shift_id !== currentShiftId) {
    if (currentShiftId !== null) flushChain(currentShiftId, currentChain);
    currentShiftId = row.shift_id;
    currentChain = [];
  }
  currentChain.push(row);
  if (row.settled_at) settledByShift.set(row.shift_id, { settled_at: row.settled_at, status: row.chain_status });
}
if (currentShiftId !== null) flushChain(currentShiftId, currentChain);

function flushChain(shiftIdNum, rows) {
  const settled = settledByShift.get(shiftIdNum);
  for (const r of rows) {
    if (r.pinged_at) {
      insertAgentLog.run(
        r.pinged_at, r.shift_id, r.caregiver_id, "ping",
        `Pinged ${shortFirst(r.cg_name)} for ${shortFirst(r.cl_name)}'s shift via ${r.channel === "sms" ? "SMS" : "voice"}.`
      );
    }
    if (r.responded_at) {
      const eventType = r.response === "available" ? "response_available" : "response_unavailable";
      const detailMap = {
        available: `${shortFirst(r.cg_name)}: "yes I can take it" — available.`,
        unavailable: `${shortFirst(r.cg_name)}: "can't make it tomorrow."`,
      };
      insertAgentLog.run(
        r.responded_at, r.shift_id, r.caregiver_id, eventType,
        detailMap[r.response] ?? `${shortFirst(r.cg_name)} responded ${r.response}.`
      );
    } else if (r.pinged_at && r.response === "no_response") {
      // Add a "no response" event 8 minutes after ping for narrative pacing.
      const t = new Date(r.pinged_at);
      t.setMinutes(t.getMinutes() + 8);
      insertAgentLog.run(
        t.toISOString(), r.shift_id, r.caregiver_id, "no_response",
        `${shortFirst(r.cg_name)} did not respond.`
      );
    }
  }
  // Settlement event at chain close.
  if (settled) {
    if (settled.status === "confirmed") {
      const winner = rows.find((r) => r.response === "available");
      if (winner) {
        insertAgentLog.run(
          settled.settled_at, shiftIdNum, winner.caregiver_id, "confirmed",
          `${shortFirst(winner.cg_name)} confirmed. Chain handed to Scheduler.`
        );
      }
    } else if (settled.status === "partial") {
      const winner = rows.find((r) => r.response === "available");
      if (winner) {
        insertAgentLog.run(
          settled.settled_at, shiftIdNum, winner.caregiver_id, "confirmed",
          `${shortFirst(winner.cg_name)} confirmed at position ${winner.position}. Coordinator alert: chain went deep.`
        );
      }
    } else if (settled.status === "failed") {
      insertAgentLog.run(
        settled.settled_at, shiftIdNum, null, "escalation",
        `Chain came back empty. Escalating to coordinator before shift start.`
      );
    }
  }
}

const PAST_REASONS = ["illness", "transit", "family", "no_reason_given"];
const insertCallout = db.prepare(`
  INSERT INTO callout_history (caregiver_id, shift_date, reason, was_predicted)
  VALUES (?, ?, ?, ?)
`);

const clientIds = db.prepare("SELECT id FROM clients").all().map((r) => r.id);

for (let day = 90; day >= 1; day--) {
  for (let i = 0; i < 18; i++) {
    const cgId = randInt(1, 60);
    const clientId = clientIds[Math.floor(rand() * clientIds.length)];
    const cg = db.prepare("SELECT zone FROM caregivers WHERE id = ?").get(cgId);
    const startHour = pick([7, 8, 9, 10, 13, 14, 16]);
    const dur = pick([4, 6, 8]);
    let status = "completed";
    const r = rand();
    if (r < 0.04) status = "no_show";
    else if (r < 0.08) status = "callout";
    else if (r < 0.10) status = "late";
    insertShift.run(
      shiftId++, cgId, clientId,
      isoAt(-day, startHour), isoAt(-day, startHour + dur),
      status, cg.zone, 1, 0
    );
    if (status === "no_show" || status === "callout") {
      insertCallout.run(cgId, isoAt(-day, startHour).slice(0, 10), pick(PAST_REASONS), 0);
    }
  }
}

const insertWeather = db.prepare(`
  INSERT INTO weather_advisories (for_date, zone, type, detail) VALUES (?, ?, ?, ?)
`);
const tomorrowDate = isoAt(1, 0).slice(0, 10);
insertWeather.run(tomorrowDate, "Bronx-East",       "rain",    "0.4in expected, 6am–10am");
insertWeather.run(tomorrowDate, "Bronx-Fordham",    "rain",    "0.4in expected, 6am–10am");
insertWeather.run(tomorrowDate, "Bronx-Mott Haven", "rain",    "0.4in expected, 6am–10am");
insertWeather.run(tomorrowDate, "Bronx-East",       "transit", "1 train weekend service change — shuttle Dyckman → 242");
insertWeather.run(tomorrowDate, "Bronx-Fordham",    "transit", "D train running on 4 line below 161");

// ─── Daily outcomes (yesterday + 13 prior days) ───
// callout_count is derived from the seeded callout_history per date.
// prewarmed_count, filled_under_5min, missed, and baseline_fill_minutes
// are tuned to match what the existing seed implies — pre-warm tends to
// surface 6–9 risky shifts a night and catches roughly 60% of the
// callouts that fire. Some days are uneven; they should be.
const insertOutcome = db.prepare(`
  INSERT INTO daily_outcomes
    (for_date, prewarmed_count, callout_count, filled_under_5min, missed,
     baseline_fill_minutes_no_prewarm, notes)
  VALUES (?, ?, ?, ?, ?, ?, ?)
`);

const dailyCalloutsRows = db.prepare(`
  SELECT shift_date, COUNT(*) as n FROM callout_history
  WHERE shift_date >= date(?, '-14 days') AND shift_date < date(?)
  GROUP BY shift_date
`).all(isoAt(0, 0).slice(0, 10), isoAt(0, 0).slice(0, 10));

const calloutsByDate = new Map(dailyCalloutsRows.map((r) => [r.shift_date, r.n]));

// Yesterday is the load-bearing row for the proof loop. Tuned to a believable
// outcome that aligns with the morning-state copy.
const yesterday = isoAt(-1, 0).slice(0, 10);
insertOutcome.run(
  yesterday,
  7,                                           // prewarmed
  calloutsByDate.get(yesterday) ?? 5,          // callouts (real or fallback)
  Math.min(calloutsByDate.get(yesterday) ?? 5, 5), // filled <5min
  0,                                           // missed
  12,                                          // baseline minutes
  "Quiet morning. Two of three pre-warm escalations cleared at the second backup."
);

// Prior 13 days. Variance is real — some days every callout was caught,
// others one slipped. Baseline drifts 11–14 min depending on weather.
const PRIOR_NOTES = [
  null,
  "Light rain in the Bronx. Two backups confirmed before the chain even reached p3.",
  null,
  "1-train service change pulled fill times up; pre-warm still caught all four.",
  null,
  null,
  "One miss — Constance's primary called out at 6:55 AM; chain hadn't refreshed.",
  null,
  null,
  null,
  "Heavy callouts (8). Pre-warm pool held — only one needed manual reassignment.",
  null,
  null,
];

for (let d = 2; d <= 14; d++) {
  const date = isoAt(-d, 0).slice(0, 10);
  const callouts = calloutsByDate.get(date) ?? randInt(2, 6);
  // pre-warm tends to slightly outpace callouts on most days
  const prewarmed = Math.max(callouts + randInt(0, 3), 5);
  const filled = Math.max(0, callouts - (rand() < 0.15 ? 1 : 0));
  const missed = callouts - filled;
  const baseline = 11 + randInt(0, 3);
  insertOutcome.run(date, prewarmed, callouts, filled, missed, baseline, PRIOR_NOTES[d - 2]);
}

const counts = {
  caregivers: db.prepare("SELECT COUNT(*) as n FROM caregivers").get().n,
  clients: db.prepare("SELECT COUNT(*) as n FROM clients").get().n,
  shifts: db.prepare("SELECT COUNT(*) as n FROM shifts").get().n,
  tomorrow: db.prepare("SELECT COUNT(*) as n FROM shifts WHERE date(starts_at) = date(?)").get(isoAt(1, 0)).n,
  today: db.prepare("SELECT COUNT(*) as n FROM shifts WHERE date(starts_at) = date(?)").get(isoAt(0, 0)).n,
  prewarm: db.prepare("SELECT COUNT(*) as n FROM prewarm_chains").get().n,
  callouts: db.prepare("SELECT COUNT(*) as n FROM callout_history").get().n,
  outcomes: db.prepare("SELECT COUNT(*) as n FROM daily_outcomes").get().n,
};

console.log("Seeded sentinel.db:");
console.log(`  ${counts.caregivers} caregivers`);
console.log(`  ${counts.clients} clients`);
console.log(`  ${counts.shifts} shifts (${counts.today} today, ${counts.tomorrow} tomorrow)`);
console.log(`  ${counts.prewarm} pre-warm entries`);
console.log(`  ${counts.callouts} historical callouts`);
console.log(`  ${counts.outcomes} daily outcomes`);

db.close();
