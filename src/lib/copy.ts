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
    sub: "Pre-warming backups for tomorrow’s high-risk shifts — so when callouts fire, the reactive agent fills faster.",
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
      "Sentinel doesn’t replace the reactive Scheduler. It pre-warms the same backup chain twelve hours earlier — so when the callout fires, the Scheduler is filling from a pool of already-confirmed people instead of cold-paging fifty caregivers from scratch. Same agents. Warmer pool. Higher fill rate. Shorter time-to-fill.",
    notMl:
      "There is no model training here. The score is a weighted sum of six factors a coordinator already tracks in their head. It’s a queue ranker, not a forecaster — its job is to surface which shifts are worth pre-warming tonight, not to predict callouts in absolute terms.",
    weightsTitle: "The six factors",
    methodologyTitle: "Methodology in plain English",
  },
  roi: {
    headline: "What pre-warming changes",
    money: "tighter time-to-fill",
    contract: "on the shifts the Scheduler is already going to chase hardest",
    fineprint:
      "Industry callout rate runs ~10% / month (Activated Insights, 2024). Phoebe's reactive fill is 75% in <15 min today. Sentinel's open question: how much of the remaining 25% is predictable enough the night before to be worth pre-warming? Two assumptions drive the math — predictable subset and pre-warm conversion — and only Phoebe's own data answers either.",
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
