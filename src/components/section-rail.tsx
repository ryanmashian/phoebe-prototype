/**
 * Visual through-line for the time-aware homepage.
 *
 * Each top-level section ("This morning", "Yesterday", "Last night",
 * "Evening planning") sits below a SectionRail. Same eyebrow treatment,
 * same scale, same color across all four — that's what makes the page
 * read as one continuous day rather than four widgets stacked on each
 * other.
 */

interface SectionRailProps {
  eyebrow: string;
  /** Optional anchor stamp shown to the right of the eyebrow. e.g. "Wed 7:14 AM" */
  anchor?: string;
  /** When set, the rail's accent dot pulses softly — used for the morning state. */
  live?: boolean;
}

export function SectionRail({ eyebrow, anchor, live }: SectionRailProps) {
  return (
    <div className="flex items-center gap-3 mb-3">
      <span
        className={
          "size-1.5 rounded-full bg-accent inline-block " +
          (live ? "live-dot" : "")
        }
        aria-hidden
      />
      <span className="text-[11px] uppercase tracking-[0.14em] text-ink-faint">
        {eyebrow}
      </span>
      {anchor && (
        <span className="num text-[11px] text-ink-faint ml-auto">{anchor}</span>
      )}
    </div>
  );
}
