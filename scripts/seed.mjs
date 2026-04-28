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
  response TEXT
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

CREATE INDEX idx_shifts_starts ON shifts(starts_at);
CREATE INDEX idx_shifts_caregiver ON shifts(caregiver_id);
CREATE INDEX idx_callouts_caregiver ON callout_history(caregiver_id);
CREATE INDEX idx_prewarm_shift ON prewarm_chains(shift_id);
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

const NAMED_CAREGIVERS = [
  { name: "Yara Diallo",     zone: "Bronx-East",        no_show_30d: 2, completed_30d: 22, hours_week: 38, days_streak: 5, band: "B",     hire: "2022-08-14" },
  { name: "Patrice Lemaire", zone: "Bronx-Fordham",     no_show_30d: 1, completed_30d: 19, hours_week: 32, days_streak: 4, band: "B",     hire: "2023-02-03" },
  { name: "Rosalyn Pierre",  zone: "Bronx-Mott Haven",  no_show_30d: 3, completed_30d: 24, hours_week: 41, days_streak: 6, band: "watch", hire: "2021-11-22" },
  { name: "Maria Reyes",     zone: "Brooklyn-Crown Heights", no_show_30d: 1, completed_30d: 28, hours_week: 47, days_streak: 7, band: "A", hire: "2020-03-10" },
  { name: "Aisha Okonkwo",   zone: "Brooklyn-Bed Stuy",      no_show_30d: 2, completed_30d: 26, hours_week: 49, days_streak: 6, band: "B", hire: "2021-06-29" },
  { name: "Beatrice Joseph", zone: "Brooklyn-Flatbush",      no_show_30d: 0, completed_30d: 24, hours_week: 44, days_streak: 8, band: "A", hire: "2019-09-04" },
  { name: "Imelda Castillo", zone: "Brooklyn-East New York", no_show_30d: 1, completed_30d: 18, hours_week: 28, days_streak: 3, band: "B", hire: "2023-04-15" },
  { name: "Carmen Hernández",zone: "Manhattan-Inwood",       no_show_30d: 2, completed_30d: 20, hours_week: 30, days_streak: 4, band: "B", hire: "2022-12-01" },
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
  { name: "Constance Levine",  zone: "Brooklyn-East New York", plan: "HHA 4hr daily",      primary: 13, note: "Primary on PTO Wed-Fri. Backup needed." },
  { name: "Reginald Brown",    zone: "Manhattan-Inwood",       plan: "Live-in support 6 days", primary: 14, note: "Primary out sick. Backup needed." },
];

NAMED_CLIENTS.forEach((c, i) => {
  insertClient.run(i + 1, c.name, c.zone, c.plan, c.primary, c.note);
});

const usedClientNames = new Set(NAMED_CLIENTS.map((c) => c.name));
let nextClientId = NAMED_CLIENTS.length + 1;
while (nextClientId <= 200) {
  const name = `${pick(CLIENT_FIRSTS)} ${pick(CLIENT_LASTS)}`;
  if (usedClientNames.has(name)) continue;
  usedClientNames.add(name);
  const cgId = randInt(1, 60);
  const cgZone = db.prepare("SELECT zone FROM caregivers WHERE id = ?").get(cgId).zone;
  insertClient.run(nextClientId++, name, cgZone, pick(CARE_PLANS), cgId, pick(CLIENT_NOTES));
}

const NOW = new Date();

function isoAt(daysFromNow, hour, minute = 0) {
  const d = new Date(NOW);
  d.setDate(NOW.getDate() + daysFromNow);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
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
  INSERT INTO prewarm_chains (shift_id, caregiver_id, position, channel, pinged_at, responded_at, response)
  VALUES (?, ?, ?, ?, ?, ?, ?)
`);

insertPrewarm.run(1, 9,  1, "sms",   isoAt(0, 21, 14), isoAt(0, 21, 17), "available");
insertPrewarm.run(1, 11, 2, "sms",   isoAt(0, 21, 14), isoAt(0, 21, 22), "unavailable");
insertPrewarm.run(1, 12, 3, "voice", isoAt(0, 21, 30), null,             "no_response");

insertPrewarm.run(4, 10, 1, "sms",   isoAt(0, 19, 47), isoAt(0, 19, 51), "available");
insertPrewarm.run(4, 11, 2, "sms",   isoAt(0, 19, 47), isoAt(0, 20, 12), "unavailable");
insertPrewarm.run(4, 12, 3, "voice", isoAt(0, 20, 5),  isoAt(0, 20, 9),  "available");

insertPrewarm.run(7, 12, 1, "sms",   isoAt(0, 18, 32), isoAt(0, 18, 36), "available");
insertPrewarm.run(7, 10, 2, "voice", isoAt(0, 18, 50), isoAt(0, 18, 54), "available");

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

const counts = {
  caregivers: db.prepare("SELECT COUNT(*) as n FROM caregivers").get().n,
  clients: db.prepare("SELECT COUNT(*) as n FROM clients").get().n,
  shifts: db.prepare("SELECT COUNT(*) as n FROM shifts").get().n,
  tomorrow: db.prepare("SELECT COUNT(*) as n FROM shifts WHERE date(starts_at) = date(?)").get(isoAt(1, 0)).n,
  prewarm: db.prepare("SELECT COUNT(*) as n FROM prewarm_chains").get().n,
  callouts: db.prepare("SELECT COUNT(*) as n FROM callout_history").get().n,
};

console.log("Seeded sentinel.db:");
console.log(`  ${counts.caregivers} caregivers`);
console.log(`  ${counts.clients} clients`);
console.log(`  ${counts.shifts} shifts (${counts.tomorrow} tomorrow)`);
console.log(`  ${counts.prewarm} pre-warm entries`);
console.log(`  ${counts.callouts} historical callouts`);

db.close();
