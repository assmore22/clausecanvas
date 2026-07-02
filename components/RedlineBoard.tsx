"use client";

import { Component, useEffect, useRef, useState, type ReactNode } from "react";
import dynamic from "next/dynamic";
import { diffTerms, tokenize } from "@/lib/format";
import { RedactedLines } from "./ui";
import type { VerdictTone } from "@/lib/types";

const RedlineCanvas = dynamic(() => import("./RedlineCanvas").then((m) => m.RedlineCanvas), {
  ssr: false,
  loading: () => <div className="p-4"><div className="mb-2 text-xs text-muted">Konva canvas loading…</div><RedactedLines rows={5} /></div>,
});

class CanvasBoundary extends Component<{ fallback: ReactNode; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() { return this.state.failed ? this.props.fallback : this.props.children; }
}

/** Clean static HTML redline (mobile / Konva-unavailable fallback). */
function StaticDiff({ oldText, newText, tone }: { oldText: string; newText: string; tone: VerdictTone }) {
  const { added, removed } = diffTerms(oldText, newText);
  const accent = tone === "approve" ? "text-accent" : tone === "revise" ? "text-warning" : tone === "risk" ? "text-danger" : "text-muted";
  return (
    <div className="grid gap-3 p-3 sm:grid-cols-2">
      <div className="doc p-3">
        <div className="label mb-1.5">Old clause</div>
        <p className="serif text-sm leading-relaxed text-ink">
          {tokenize(oldText, removed).map((t, i) => (t.changed ? <span key={i} className="rounded-sm bg-danger/10 text-danger line-through">{t.text}</span> : <span key={i}>{t.text}</span>))}
        </p>
      </div>
      <div className="doc p-3">
        <div className={`label mb-1.5 ${accent}`}>New clause</div>
        <p className="serif text-sm leading-relaxed text-ink">
          {tokenize(newText, added).map((t, i) => (t.changed ? <span key={i} className="rounded-sm bg-accent/15 font-semibold text-accent">{t.text}</span> : <span key={i}>{t.text}</span>))}
        </p>
      </div>
    </div>
  );
}

export function RedlineBoard({
  oldText, newText, tone = "neutral", riskTags = [], height = 340,
}: {
  oldText: string; newText: string; tone?: VerdictTone; riskTags?: string[]; height?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [w, setW] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => setW(entries[0].contentRect.width));
    ro.observe(el);
    setW(el.clientWidth);
    return () => ro.disconnect();
  }, []);

  const fallback = <StaticDiff oldText={oldText} newText={newText} tone={tone} />;
  const tooSmall = w > 0 && w < 480;

  return (
    <div ref={ref} className="w-full overflow-hidden rounded-md border border-line bg-bg">
      {w === 0 ? (
        <div className="p-4"><RedactedLines rows={5} /></div>
      ) : tooSmall ? (
        fallback
      ) : (
        <CanvasBoundary fallback={fallback}>
          <RedlineCanvas oldText={oldText} newText={newText} tone={tone} riskTags={riskTags} width={w} height={height} />
        </CanvasBoundary>
      )}
    </div>
  );
}
