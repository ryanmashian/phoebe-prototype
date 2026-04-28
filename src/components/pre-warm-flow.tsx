"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles, MessageSquare, Check, X, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { COPY } from "@/lib/copy";
import type { ScoredShift } from "@/lib/types";

interface PreWarmFlowProps {
  scored: ScoredShift;
}

type LogLine = {
  id: string;
  ts: string;
  kind: "sentinel" | "ping" | "response" | "confirm" | "next";
  text: React.ReactNode;
  variant?: "ok" | "muted" | "warn";
};

const PROPOSED_BACKUPS = [
  { name: "Fatou Sylla",     band: "A", channel: "sms" as const,   response: "I can cover if needed. What time start?",          status: "available" as const },
  { name: "Leticia Almonte", band: "A", channel: "sms" as const,   response: "Out tomorrow — daughter's recital.",               status: "unavailable" as const },
  { name: "Nadia Boateng",   band: "A", channel: "voice" as const, response: "Yes, I'm free. Confirm by 6am?",                   status: "available" as const },
];

function nowStr(offsetSec = 0): string {
  const d = new Date(Date.now() + offsetSec * 1000);
  return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true }).toLowerCase().replace(" ", "");
}

export function PreWarmFlow({ scored }: PreWarmFlowProps) {
  const alreadyPrewarmed = scored.shift.prewarmed === 1;
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);
  const [lines, setLines] = useState<LogLine[]>([]);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => () => {
    timersRef.current.forEach(clearTimeout);
  }, []);

  function start() {
    setRunning(true);
    setDone(false);
    setLines([]);
    const queue: LogLine[] = [
      {
        id: "init",
        ts: nowStr(),
        kind: "sentinel",
        text: COPY.agentLog.init(PROPOSED_BACKUPS.length),
      },
      ...PROPOSED_BACKUPS.flatMap((b, i) => {
        const seq: LogLine[] = [
          {
            id: `ping-${i}`,
            ts: nowStr(2 + i * 4),
            kind: "ping",
            text: COPY.agentLog.pinging(b.name, b.channel === "sms" ? "SMS" : "voice"),
          },
          {
            id: `resp-${i}`,
            ts: nowStr(4 + i * 4),
            kind: "response",
            variant: b.status === "available" ? "ok" : "muted",
            text: COPY.agentLog.response(b.name, b.response),
          },
        ];
        return seq;
      }),
      {
        id: "confirm",
        ts: nowStr(2 + PROPOSED_BACKUPS.length * 4 + 2),
        kind: "confirm",
        variant: "ok",
        text: COPY.agentLog.confirmed(PROPOSED_BACKUPS.find((b) => b.status === "available")!.name),
      },
      {
        id: "next",
        ts: nowStr(2 + PROPOSED_BACKUPS.length * 4 + 3),
        kind: "next",
        variant: "muted",
        text: COPY.agentLog.nextStep,
      },
    ];

    queue.forEach((l, i) => {
      const t = setTimeout(() => {
        setLines((prev) => [...prev, l]);
        if (i === queue.length - 1) {
          setDone(true);
          setRunning(false);
        }
      }, 600 + i * 700);
      timersRef.current.push(t);
    });
  }

  function reset() {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
    setLines([]);
    setRunning(false);
    setDone(false);
  }

  if (alreadyPrewarmed) {
    return (
      <div className="rounded-lg border border-line bg-paper-deep/40 p-4 text-[13px] text-ink-muted">
        This shift was pre-warmed earlier tonight. Backup chain shown above.
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-line bg-card overflow-hidden">
      <header className="flex items-center justify-between gap-3 px-4 py-3 border-b border-line">
        <div>
          <div className="text-[13px] font-medium text-ink">{COPY.prewarm.cta}</div>
          <p className="text-[12px] text-ink-muted leading-snug max-w-[52ch]">
            {COPY.prewarm.rationale}
          </p>
        </div>
        {done ? (
          <Button size="sm" variant="secondary" onClick={reset}>
            Run again
          </Button>
        ) : (
          <Button size="sm" onClick={start} disabled={running}>
            <Sparkles className="size-3.5" />
            {running ? COPY.prewarm.inflight : COPY.prewarm.ctaShort}
          </Button>
        )}
      </header>

      {(running || lines.length > 0) && (
        <div className="bg-[#fdfaf3] font-mono text-[12px] p-3 max-h-[420px] overflow-y-auto space-y-0">
          {lines.map((l) => (
            <LogRow key={l.id} line={l} />
          ))}
          {running && (
            <div className="log-line text-ink-faint pl-12 pt-1">
              <span className="inline-block w-2 h-3 align-middle bg-ink-faint animate-pulse" />
            </div>
          )}
        </div>
      )}

      {done && (
        <footer className="px-4 py-2.5 border-t border-line bg-risk-low-bg/40 text-[12px] text-risk-low-fg flex items-center gap-2">
          <Check className="size-3.5" />
          {COPY.prewarm.confirmed}: Sentinel handed off two confirmed backups to the Scheduler.
        </footer>
      )}
    </div>
  );
}

function LogRow({ line }: { line: LogLine }) {
  const icon = {
    sentinel: <Sparkles className="size-3 text-accent" />,
    ping: <MessageSquare className="size-3 text-ink-muted" />,
    response: line.variant === "ok" ? <Check className="size-3 text-ok" /> : <X className="size-3 text-ink-muted" />,
    confirm: <Check className="size-3 text-ok" />,
    next: <Clock className="size-3 text-ink-faint" />,
  }[line.kind];

  return (
    <div
      className={cn(
        "log-line grid grid-cols-[64px_16px_1fr] items-start gap-2 py-1",
        line.variant === "ok" && "text-ok",
        line.variant === "muted" && "text-ink-muted",
        line.variant === "warn" && "text-warn"
      )}
    >
      <span className="num text-ink-faint">{line.ts}</span>
      <span className="mt-0.5">{icon}</span>
      <span className={cn("leading-relaxed", !line.variant && "text-ink")}>
        {line.text}
      </span>
    </div>
  );
}
