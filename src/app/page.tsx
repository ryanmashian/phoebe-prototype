import { BannerSummary } from "@/components/banner-summary";
import { FilterBar } from "@/components/filter-bar";
import { FramingBlock } from "@/components/framing-block";
import { RoiFooter } from "@/components/roi-footer";
import { ShiftTable } from "@/components/shift-table";
import {
  getAgencyStats,
  getTomorrowsShifts,
  getWeatherAdvisories,
  getZones,
} from "@/lib/queries";

export const dynamic = "force-static";

export default function DashboardPage() {
  const shifts = getTomorrowsShifts();
  const stats = getAgencyStats();
  const zones = getZones();
  const advisories = getWeatherAdvisories();

  return (
    <div className="space-y-6">
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
    </div>
  );
}
