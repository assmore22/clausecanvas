"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFileCirclePlus, faFileLines, faMagnifyingGlassChart, faScaleBalanced, faGavel,
  faCircleCheck, faBoxArchive, faRotateLeft, faCircleDot,
} from "@fortawesome/free-solid-svg-icons";
import type { AuditRecord } from "@/lib/types";
import { Hex } from "./ui";

const ICON: Record<string, typeof faFileLines> = {
  create_clause_set: faFileCirclePlus,
  submit_review: faFileLines,
  assess_review: faMagnifyingGlassChart,
  challenge_review: faGavel,
  resolve_challenge: faGavel,
  file_appeal: faScaleBalanced,
  resolve_appeal: faScaleBalanced,
  finalize_clause_set: faCircleCheck,
  archive_clause_set: faBoxArchive,
  reopen_for_revision: faRotateLeft,
};

export function AuditTimeline({ records }: { records: AuditRecord[] }) {
  const ref = useRef<HTMLOListElement>(null);
  const sorted = [...records].sort((a, b) => Number(a.at) - Number(b.at));

  useEffect(() => {
    if (!ref.current) return;
    const items = ref.current.querySelectorAll("li");
    gsap.fromTo(items, { opacity: 0, y: 6 }, { opacity: 1, y: 0, duration: 0.28, stagger: 0.04, ease: "power1.out" });
  }, [records]);

  return (
    <ol ref={ref} className="relative ml-2 space-y-4 border-l border-line pl-5">
      {sorted.map((r) => (
        <li key={r.auditId} className="relative">
          <span className="absolute -left-[27px] grid h-5 w-5 place-items-center rounded-full border border-line bg-document text-primary">
            <FontAwesomeIcon icon={ICON[r.action] ?? faCircleDot} className="h-2.5 w-2.5" />
          </span>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="text-sm font-semibold text-ink">{r.action.replace(/_/g, " ")}</span>
            <span className="chip border-line bg-bg text-muted">{r.statusAfter.replace(/_/g, " ")}</span>
            <span className="mono text-[11px] text-muted">tick {r.at}</span>
          </div>
          {r.summary && <div className="mt-0.5 text-xs text-muted">{r.summary}</div>}
          <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-muted">
            by <Hex value={r.actor} lead={6} tail={4} />
            {r.reviewId && <span>· review #{r.reviewId}</span>}
            {r.challengeId && <span>· challenge #{r.challengeId}</span>}
            {r.appealId && <span>· appeal #{r.appealId}</span>}
          </div>
        </li>
      ))}
    </ol>
  );
}

/** Compact horizontal audit strip for the workspace bottom. */
export function AuditStrip({ records }: { records: AuditRecord[] }) {
  const sorted = [...records].sort((a, b) => Number(b.at) - Number(a.at)).slice(0, 8);
  if (sorted.length === 0) return <div className="px-3 py-4 text-center text-xs text-muted">No audit activity yet.</div>;
  return (
    <div className="flex gap-2 overflow-x-auto p-3">
      {sorted.map((r) => (
        <div key={r.auditId} className="shrink-0 rounded-md border border-line bg-document px-2.5 py-1.5">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-ink">
            <FontAwesomeIcon icon={ICON[r.action] ?? faCircleDot} className="h-3 w-3 text-primary" /> {r.action.replace(/_/g, " ")}
          </div>
          <div className="mt-0.5 text-[10px] text-muted">tick {r.at} · {r.statusAfter.replace(/_/g, " ")}</div>
        </div>
      ))}
    </div>
  );
}
