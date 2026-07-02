"use client";

import { useState, type ReactNode } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCopy, faCheck, faArrowUpRightFromSquare, faCircleInfo, faTriangleExclamation,
  faCircleExclamation, faCircleCheck, faInbox,
} from "@fortawesome/free-solid-svg-icons";
import { truncateHex, explorerTx, explorerAddr, explorerContract } from "@/lib/format";

const CLAUSE: Record<string, string> = {
  draft: "border-line text-muted bg-bg",
  submitted: "border-accent/40 text-accent bg-accent/10",
  under_review: "border-accent/40 text-accent bg-accent/10",
  risk_flagged: "border-danger/40 text-danger bg-danger/10",
  approved: "border-accent/50 text-accent bg-accent/10",
  challenged: "border-warning/50 text-warning bg-warning/10",
  appealed: "border-warning/50 text-warning bg-warning/10",
  finalized: "border-accent/50 text-accent bg-accent/10",
  archived: "border-line text-muted bg-bg",
};
const REVIEW: Record<string, string> = {
  submitted: "border-line text-muted bg-bg",
  assessed: "border-accent/40 text-accent bg-accent/10",
  accepted: "border-accent/50 text-accent bg-accent/10",
  revision_requested: "border-warning/50 text-warning bg-warning/10",
  rejected: "border-danger/50 text-danger bg-danger/10",
  challenged: "border-warning/50 text-warning bg-warning/10",
  appealed: "border-warning/50 text-warning bg-warning/10",
  finalized: "border-accent/50 text-accent bg-accent/10",
};
const DECISION: Record<string, string> = {
  open: "border-warning/50 text-warning bg-warning/10",
  upheld: "border-accent/50 text-accent bg-accent/10",
  dismissed: "border-muted/40 text-muted bg-bg",
  accepted: "border-accent/50 text-accent bg-accent/10",
  denied: "border-danger/50 text-danger bg-danger/10",
};
const VERDICT: Record<string, string> = {
  approve: "border-accent/50 text-accent bg-accent/10",
  revise: "border-warning/50 text-warning bg-warning/10",
  reject: "border-danger/50 text-danger bg-danger/10",
  high_risk: "border-danger/50 text-danger bg-danger/10",
};

export function StatusChip({ status, kind }: { status: string; kind: "clause" | "review" | "decision" }) {
  const map = kind === "clause" ? CLAUSE : kind === "review" ? REVIEW : DECISION;
  const cls = map[status] ?? "border-line text-muted bg-bg";
  return <span className={`chip ${cls}`}>{(status || "-").replace(/_/g, " ")}</span>;
}

export function VerdictBadge({ verdict, risk, clarity }: { verdict?: string; risk?: number; clarity?: number }) {
  const cls = VERDICT[verdict ?? ""] ?? "border-line text-muted bg-bg";
  return (
    <span className={`chip ${cls}`}>
      {(verdict || "unreviewed").replace(/_/g, " ")}
      {typeof risk === "number" && risk > 0 ? <span className="mono opacity-80">· risk {risk}</span> : null}
      {typeof clarity === "number" && clarity > 0 ? <span className="mono opacity-80">· clr {clarity}</span> : null}
    </span>
  );
}

export function Copy({ value, className = "" }: { value: string; className?: string }) {
  const [done, setDone] = useState(false);
  return (
    <button type="button" aria-label="Copy"
      className={`inline-grid h-6 w-6 place-items-center rounded text-muted transition-colors hover:bg-bg hover:text-ink ${className}`}
      onClick={async () => { try { await navigator.clipboard.writeText(value); setDone(true); setTimeout(() => setDone(false), 1200); } catch {} }}>
      <FontAwesomeIcon icon={done ? faCheck : faCopy} className={`h-3 w-3 ${done ? "text-accent" : ""}`} />
    </button>
  );
}

export function Hex({ value, kind = "address", lead = 6, tail = 4 }: { value: string; kind?: "address" | "contract" | "tx"; lead?: number; tail?: number }) {
  if (!value) return <span className="text-muted">-</span>;
  const href = kind === "tx" ? explorerTx(value) : kind === "contract" ? explorerContract(value) : explorerAddr(value);
  return (
    <span className="inline-flex items-center gap-1">
      <a href={href} target="_blank" rel="noreferrer" className="mono text-xs text-ink/80 underline-offset-2 hover:text-primary hover:underline" title={value}>
        {truncateHex(value, lead, tail)}
      </a>
      <Copy value={value} />
    </span>
  );
}

export function ExtLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-accent hover:underline">
      {children}<FontAwesomeIcon icon={faArrowUpRightFromSquare} className="h-2.5 w-2.5" />
    </a>
  );
}

type Tone = "info" | "warn" | "danger" | "ok";
const TONE: Record<Tone, { c: string; i: typeof faCircleInfo; ic: string }> = {
  info: { c: "border-accent/30 bg-accent/5", i: faCircleInfo, ic: "text-accent" },
  warn: { c: "border-warning/30 bg-warning/5", i: faTriangleExclamation, ic: "text-warning" },
  danger: { c: "border-danger/30 bg-danger/5", i: faCircleExclamation, ic: "text-danger" },
  ok: { c: "border-accent/30 bg-accent/5", i: faCircleCheck, ic: "text-accent" },
};
export function Banner({ tone = "info", title, children, action }: { tone?: Tone; title?: string; children?: ReactNode; action?: ReactNode }) {
  const t = TONE[tone];
  return (
    <div className={`flex items-start gap-3 rounded-md border p-3 text-sm ${t.c}`}>
      <FontAwesomeIcon icon={t.i} className={`mt-0.5 h-4 w-4 ${t.ic}`} />
      <div className="flex-1">{title && <div className="font-semibold text-ink">{title}</div>}{children && <div className="text-muted">{children}</div>}</div>
      {action}
    </div>
  );
}

export function Empty({ icon, title, hint }: { icon?: typeof faInbox; title: string; hint?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-md border border-dashed border-line bg-bg/60 px-6 py-12 text-center">
      <FontAwesomeIcon icon={icon ?? faInbox} className="h-6 w-6 text-muted/50" />
      <div className="text-sm font-semibold text-ink">{title}</div>
      {hint && <div className="max-w-sm text-xs text-muted">{hint}</div>}
    </div>
  );
}

/** Redacted-document-line loading skeleton (not grey rectangles). */
export function RedactedLines({ rows = 4 }: { rows?: number }) {
  return (
    <div className="space-y-2 p-1">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-2">
          <span className="redline" style={{ width: `${30 + ((i * 17) % 45)}%` }} />
          <span className="redline" style={{ width: `${12 + ((i * 11) % 30)}%`, background: "rgba(124,45,18,0.25)" }} />
          <span className="redline" style={{ width: `${10 + ((i * 7) % 25)}%` }} />
        </div>
      ))}
    </div>
  );
}

export function Stat({ label, value, tone }: { label: string; value: ReactNode; tone?: "primary" | "accent" | "danger" | "warning" }) {
  const c = tone === "warning" ? "text-warning" : tone === "danger" ? "text-danger" : tone === "accent" ? "text-accent" : tone === "primary" ? "text-primary" : "text-ink";
  return (
    <div className="doc p-3">
      <div className="label">{label}</div>
      <div className={`mt-1 text-xl font-semibold tabular-nums ${c}`}>{value}</div>
    </div>
  );
}
