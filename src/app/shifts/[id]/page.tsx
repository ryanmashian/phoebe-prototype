import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, MapPin, Clock, User, AlertTriangle } from "lucide-react";

import { getShiftById, getTomorrowsShifts } from "@/lib/queries";
import { RiskBadge, bandLabel } from "@/components/risk-badge";
import { RiskBar } from "@/components/risk-bar";
import { PreWarmChain } from "@/components/pre-warm-chain";
import { PreWarmFlow } from "@/components/pre-warm-flow";
import { Button } from "@/components/ui/button";
import { COPY } from "@/lib/copy";
import { timeRange, lastInitial } from "@/lib/format";

export const dynamic = "force-static";

export function generateStaticParams() {
  return getTomorrowsShifts().map((s) => ({ id: String(s.shift.id) }));
}

interface PageProps {
  params: { id: string };
}

export default function ShiftDetailPage({ params }: PageProps) {
  const id = parseInt(params.id, 10);
  if (Number.isNaN(id)) notFound();
  const scored = getShiftById(id);
  if (!scored) notFound();

  const { shift, caregiver, client, prewarm, factors, risk, band } = scored;

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-[13px] text-ink-muted hover:text-accent"
        >
          <ChevronLeft className="size-3.5" />
          back to tomorrow
        </Link>
      </div>

      <header className="rounded-xl border border-line bg-card p-6 shadow-card">
        <div className="flex flex-wrap items-start gap-x-8 gap-y-4">
          <RiskBadge score={risk} size="md" className="!h-12 !min-w-[64px] !text-[20px]" />
          <div className="flex-1 min-w-0 space-y-1">
            <div className="text-[12px] uppercase tracking-[0.12em] text-ink-faint">
              {bandLabel(band)} risk · {shift.is_continuity ? "primary caregiver" : "backup assignment"}
            </div>
            <h1 className="text-[24px] tracking-tightish text-ink leading-tight">
              <span className="font-medium">{caregiver.name}</span>{" "}
              <span className="text-ink-faint">→</span>{" "}
              <span className="font-medium">{lastInitial(client.name)}</span>
            </h1>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-[13px] text-ink-muted">
              <span className="inline-flex items-center gap-1.5">
                <Clock className="size-3.5 text-ink-faint" />
                <span className="num">{timeRange(shift.starts_at, shift.ends_at)}</span>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="size-3.5 text-ink-faint" />
                {shift.zone}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <User className="size-3.5 text-ink-faint" />
                care plan: {client.care_plan}
              </span>
            </div>
            {client.notes && (
              <p className="text-[12px] text-ink-faint pt-2 max-w-[64ch]">
                {client.notes}
              </p>
            )}
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-6">
        <section className="space-y-5">
          <Card title={COPY.drilldown.factorsTitle} subtitle="Six factors. Weighted sum to 100.">
            <RiskBar factors={factors} />
          </Card>

          <Card title={COPY.drilldown.chainTitle} subtitle="Three named backups, in priority order. No mass blast.">
            <PreWarmChain entries={prewarm} />
          </Card>
        </section>

        <aside className="space-y-5">
          <PreWarmFlow scored={scored} />

          <Card title={COPY.drilldown.actionsTitle}>
            <div className="grid gap-2">
              <Button variant="secondary" size="md" className="justify-start">
                {COPY.drilldown.reassign}
              </Button>
              <Button variant="ghost" size="md" className="justify-start">
                <AlertTriangle className="size-3.5" />
                {COPY.drilldown.escalate}
              </Button>
              <Button variant="ghost" size="md" className="justify-start">
                {COPY.drilldown.resolve}
              </Button>
            </div>
            <p className="text-[11px] text-ink-faint mt-3 leading-relaxed">
              Demo prototype — actions are illustrative. In production these route
              to the Phoebe Scheduler agent.
            </p>
          </Card>

          <Card title="Caregiver context" subtitle={`${caregiver.name} · band ${caregiver.reliability_band}`}>
            <dl className="space-y-1.5 text-[12px]">
              <Row label="Hours this week" value={`${caregiver.hours_this_week}h / ${caregiver.preferred_weekly_hours}h preferred`} />
              <Row label="Days consecutive" value={`${caregiver.consecutive_days_worked}`} />
              <Row label="No-shows (30d)" value={`${caregiver.no_show_count_30d} of ${caregiver.shifts_completed_30d} shifts`} />
              <Row label="Hire date" value={caregiver.hire_date} />
              <Row label="Phone" value={caregiver.phone} />
            </dl>
          </Card>
        </aside>
      </div>
    </div>
  );
}

function Card({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-line bg-card shadow-card overflow-hidden">
      <header className="px-5 pt-4 pb-3 border-b border-line">
        <div className="text-[12px] uppercase tracking-[0.12em] text-ink-faint">
          {title}
        </div>
        {subtitle && (
          <div className="text-[12px] text-ink-muted mt-0.5">{subtitle}</div>
        )}
      </header>
      <div className="p-5">{children}</div>
    </section>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3 border-b border-line/60 py-1">
      <dt className="text-ink-muted">{label}</dt>
      <dd className="num text-ink text-right">{value}</dd>
    </div>
  );
}
