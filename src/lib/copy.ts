/**
 * Centralized coordinator-voice strings.
 * Tone: terse, first-name basis, "we" not "the system",
 * never "AI", never "automation", never "smart".
 * Sentinel = the predictive signal. Scheduler = the existing Phoebe agent.
 */

export const COPY = {
  brand: {
    product: "Sentinel",
    tagline: "12 hours ahead of the callout",
    company: "Phoebe",
    agency: "Beacon Home Care — Brooklyn & Bronx",
  },
  nav: {
    today: "Today",
    tomorrow: "Tomorrow's risk",
    about: "How Sentinel scores",
  },
  banner: {
    headline: (high: number, prewarmed: number, attention: number) =>
      `${high} shift${high === 1 ? "" : "s"} at high callout risk tomorrow. ${prewarmed} pre-warmed. ${attention} need${attention === 1 ? "s" : ""} attention.`,
    sub: "Sentinel watches the next 24 hours and pings the Scheduler before the call comes in.",
  },
  filters: {
    all: "All zones",
    riskLabel: "Risk floor",
    sortLabel: "Sort by",
  },
  empty: {
    cleared: "Nothing flagged for tomorrow. The queue is clear.",
    sub: "We'll keep watching. If something turns, you'll see it here first.",
  },
  prewarm: {
    cta: "Pre-warm backups",
    ctaShort: "Pre-warm",
    inflight: "Pinging backups…",
    confirmed: "Backup confirmed",
    rationale:
      "Sentinel hands the chain to the Scheduler agent. No mass blast — three named backups in priority order.",
  },
  drilldown: {
    factorsTitle: "Why this shift is flagged",
    chainTitle: "Pre-warm chain",
    actionsTitle: "Actions",
    escalate: "Escalate to on-call",
    resolve: "Mark resolved",
    reassign: "Reassign now",
  },
  about: {
    title: "How Sentinel scores a shift",
    intro:
      "Sentinel is a signal — a single number between 0 and 100 — that estimates the chance a shift won't happen as scheduled. It runs the night before and feeds the Phoebe Scheduler. It is not a forecast you act on by itself; it is a queue ranker.",
    notMl:
      "There is no model training here. The score is a weighted sum of six factors a coordinator already tracks in their head. The point isn't novelty. The point is: the same Scheduler agent that fills callouts can be aimed before the callout, with a chain of named backups already pre-warmed.",
    weightsTitle: "The six factors",
    methodologyTitle: "Methodology in plain English",
  },
  roi: {
    headline: "If Sentinel prevents 1 in 4 callouts at this agency",
    money: "$76K / year recovered",
    contract: "≈ 50% of an annual Phoebe ACV at $150K",
    fineprint:
      "Beacon: 60 caregivers, 14% monthly callout rate, $34 average revenue per shift, 22 working days × 24 shifts.",
  },
  pageTitles: {
    dashboard: "Tomorrow's risk view",
    shift: "Shift detail",
    about: "How it scores",
  },
  agentLog: {
    init: (n: number) =>
      `Sentinel handed the chain to the Scheduler. ${n} backups in priority order.`,
    pinging: (name: string, channel: string) =>
      `pinging ${name} via ${channel}…`,
    response: (name: string, msg: string) =>
      `${name}: "${msg}"`,
    confirmed: (name: string) =>
      `${name} confirmed. Holding shift open as backup.`,
    nextStep: "Sentinel will only escalate if the primary actually misses check-in.",
  },
};

export const PHOEBE_VOICE_GUIDE = `
voice rules for any new copy:
- first names; coordinators know their roster
- never "AI", "automation", "smart", "intelligent", "powered by"
- "Scheduler" / "Sentinel" / "agent" — named, not generic
- short. coordinators don't read paragraphs at 6am
- frame outcomes as relief: "stop firefighting, start growing"
- numbers in mono; never spell out small numbers in tables
`;
