export function FramingBlock() {
  return (
    <section className="rounded-xl border border-line bg-card shadow-card px-5 py-4 lg:px-6 lg:py-5">
      <div className="grid grid-cols-1 lg:grid-cols-[auto_1fr] gap-x-5 gap-y-2 items-start">
        <div className="text-[11px] uppercase tracking-[0.12em] text-ink-faint pt-0.5 lg:min-w-[120px]">
          What Sentinel does
        </div>
        <p className="text-[14px] leading-relaxed text-ink max-w-[78ch]">
          This isn’t a replacement for the reactive Scheduler — it’s a multiplier.
          Pre-warm three backups for each flagged shift the night before, and when
          the callout fires the Scheduler chases pre-confirmed people instead of
          cold-paging fifty.{" "}
          <span className="text-ink-muted">
            Warmer pool. Higher fill rate. Shorter time-to-fill.
          </span>
        </p>
      </div>
    </section>
  );
}
