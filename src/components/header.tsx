import Link from "next/link";
import { COPY } from "@/lib/copy";

export function SiteHeader() {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowLabel = tomorrow.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <header className="border-b border-line bg-paper/95 backdrop-blur supports-[backdrop-filter]:bg-paper/85 sticky top-0 z-30">
      <div className="max-w-[1200px] mx-auto flex items-center gap-6 px-6 py-3">
        <Link href="/" className="flex items-center gap-2.5 group">
          <BrandMark />
          <div className="leading-tight">
            <div className="text-[15px] font-semibold tracking-tightish text-ink">
              {COPY.brand.product}
            </div>
            <div className="text-[11px] text-ink-faint -mt-0.5">
              for {COPY.brand.company}
            </div>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-1 text-[13px] ml-2">
          <NavLink href="/" label={COPY.nav.tomorrow} />
          <NavLink href="/about" label={COPY.nav.about} />
        </nav>

        <div className="ml-auto flex items-center gap-3">
          <div className="hidden sm:flex flex-col items-end leading-tight">
            <div className="text-[12px] text-ink-muted">{COPY.brand.agency}</div>
            <div className="text-[11px] text-ink-faint num">
              looking ahead to {tomorrowLabel}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

function NavLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="px-2.5 py-1.5 rounded-md text-ink-muted hover:text-ink hover:bg-paper-deep transition-colors"
    >
      {label}
    </Link>
  );
}

function BrandMark() {
  return (
    <div className="relative size-8 rounded-md bg-ink flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bloom opacity-90" />
      <svg
        viewBox="0 0 24 24"
        className="relative size-5 text-paper"
        fill="none"
        aria-hidden
      >
        <circle cx="12" cy="12" r="2.4" fill="currentColor" />
        <ellipse cx="12" cy="6.4" rx="2.6" ry="3.4" fill="currentColor" opacity="0.85" />
        <ellipse cx="17.5" cy="9.5" rx="2.6" ry="3.4" fill="currentColor" opacity="0.7" transform="rotate(60 17.5 9.5)" />
        <ellipse cx="17.5" cy="14.5" rx="2.6" ry="3.4" fill="currentColor" opacity="0.55" transform="rotate(120 17.5 14.5)" />
        <ellipse cx="12" cy="17.6" rx="2.6" ry="3.4" fill="currentColor" opacity="0.7" />
        <ellipse cx="6.5" cy="14.5" rx="2.6" ry="3.4" fill="currentColor" opacity="0.55" transform="rotate(60 6.5 14.5)" />
        <ellipse cx="6.5" cy="9.5" rx="2.6" ry="3.4" fill="currentColor" opacity="0.85" transform="rotate(120 6.5 9.5)" />
      </svg>
    </div>
  );
}
