import { BannerSummary } from "@/components/banner-summary";
import { FilterBar } from "@/components/filter-bar";
import { FramingBlock } from "@/components/framing-block";
import { RoiFooter } from "@/components/roi-footer";
import { ShiftTable } from "@/components/shift-table";
import { MorningStateSection } from "@/components/morning-state";
import { YesterdayOutcomesSection } from "@/components/yesterday-outcomes";
import { AgentLogSection } from "@/components/agent-log";
import { SectionRail } from "@/components/section-rail";
import {
  getAgencyStats,
  getTomorrowsShifts,
  getWeatherAdvisories,
  getZones,
} from "@/lib/queries";
import {
  getMorningState,
  getYesterdayOutcomes,
  getRollingStats,
  getOvernightActivity,
  getChainsForShifts,
} from "@/lib/queries-outcomes";
import { COPY } from "@/lib/copy";

export const dynamic = "force-static";

export default function DashboardPage() {
  // Time-aware surfaces — read in chronological order: morning → yesterday →
  // last night → tomorrow.
  const morning = getMorningState();
  const yesterdayOutcome = getYesterdayOutcomes();
  const rolling = getRollingStats();
  const activity = getOvernightActivity();
  const chainsByShiftId = getChainsForShifts(
    morning.needs_attention.map((r) => r.shift_id)
  );

  // Existing tomorrow surface data — repositioned as evening planning.
  const shifts = getTomorrowsShifts();
  const stats = getAgencyStats();
  const zones = getZones();
  const advisories = getWeatherAdvisories();

  return (
    <div className="space-y-12 lg:space-y-14">
      {/* 1. Morning state — the entry point. */}
      <MorningStateSection state={morning} chainsByShiftId={chainsByShiftId} />

      {/* 2. Yesterday's outcomes + last night's agent log. Stacked on small,
          two-column on large. The yesterday card carries the proof loop;
          the agent log is the audit trail behind it. */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-6 lg:gap-8 items-start">
        <YesterdayOutcomesSection outcome={yesterdayOutcome} rolling={rolling} />
        <AgentLogSection events={activity} />
      </div>

      {/* 3. Evening planning — the original tomorrow's risk surface,
          repositioned. The Scheduler will pre-warm these tonight at 9pm. */}
      <section className="space-y-5">
        <SectionRail eyebrow={COPY.eveningPlanning.eyebrow} />

        <header className="space-y-1 max-w-[60ch]">
          <h2 className="text-[22px] tracking-tightish text-ink font-medium">
            {COPY.eveningPlanning.title}
          </h2>
          <p className="text-[13px] text-ink-muted">
            {COPY.eveningPlanning.sub(stats.highRiskShifts)}
          </p>
        </header>

        <BannerSummary
          highRisk={stats.highRiskShifts}
          prewarmed={stats.prewarmedShifts}
          attention={stats.needsAttention}
          advisories={advisories}
        />

        <FramingBlock />

        <section className="rounded-xl border border-line bg-card overflow-hidden shadow-card">
          <FilterBar zones={zones} />
          <ShiftTable shifts={shifts} />
        </section>

        <RoiFooter highRiskCount={stats.highRiskShifts} />
      </section>
    </div>
  );
}
