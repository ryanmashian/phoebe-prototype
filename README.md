# Sentinel — pre-shift risk for the Phoebe scheduling agent

A portfolio prototype. Twelve hours ahead of the callout, not after it.

## The wedge

[Phoebe](https://phoebe.work) automates *reactive* callout coverage today: when a
caregiver calls out, the Scheduler agent texts and calls a chain of backups in seconds.
Sentinel extends the same agent stack into *prevention*. It scores every shift the
night before for callout risk, then hands the Scheduler a 3-deep chain of pre-warmed
backups for the highest-risk shifts — quietly, before the call comes in.

Same agents. New aim. No new product surface.

## What's in here

- **Coordinator dashboard** — tomorrow's 24-hour view, every shift scored 0–100, sortable and filterable, keyboard-navigable.
- **Per-shift drill-down** — six contributing factors, plain-English evidence, pre-warm chain with response state.
- **Pre-warm flow** — animated, stylized agent log showing the Scheduler pinging three named backups in priority order.
- **/about** — the risk model documented in plain English. No ML. Six weights, all defensible, all editable in `src/lib/risk-config.ts`.
- **ROI footer** — unit economics for the wedge.

## Stack

Next 14 (app router) · TypeScript · Tailwind · better-sqlite3 · Vercel.

Pages render statically at build time against a seed SQLite database — no runtime
DB calls, no auth, no PHI. All data is synthetic.

## Run it

```bash
npm install
npm run dev
# http://localhost:3000
```

`predev` and `prebuild` regenerate `data/sentinel.db` from the seed script.

## Project layout

```
scripts/seed.mjs           # synthetic agency, 60 caregivers, 200 clients, 90d history
src/lib/risk-config.ts     # six weighted factors — the model
src/lib/risk-score.ts      # pure scoring function
src/lib/queries.ts         # joined queries + scoring application
src/lib/copy.ts            # centralized coordinator-voice strings
src/app/page.tsx           # dashboard
src/app/shifts/[id]        # drill-down (statically generated per shift)
src/app/about              # methodology page
```

## Tuning the model

`src/lib/risk-config.ts` is the contribution surface. Six factors, six weights,
each with a one-line rationale. Re-run `npm run seed && npm run build` after edits.

## Voice rules

- Never say "AI", "automation", "smart", "intelligent", or "powered by".
- Sentinel is a *signal*. The Scheduler is the existing Phoebe agent.
- First names. Coordinators know their roster.
- Numbers in mono. Short sentences. No dashboard-by-numbers stock copy.

## Disclaimer

Synthetic data on a fictional agency. Not affiliated with Phoebe. Built as a
portfolio piece exploring the prevention layer that sits naturally on top of
their existing reactive coverage stack.
